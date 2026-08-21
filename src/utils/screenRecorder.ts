import { AudioMixerEngine } from './audioMixer';
import { RecordingConfig, RecordedVideo, DrawingStroke } from '../types';

export interface RecorderCallbacks {
  onTimeUpdate: (seconds: number) => void;
  onStatusChange: (status: 'idle' | 'recording' | 'paused' | 'stopped') => void;
  onDataSizeUpdate: (bytes: number) => void;
}

export class ScreenRecorderEngine {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private displayStream: MediaStream | null = null;
  private micStream: MediaStream | null = null;
  private cameraStream: MediaStream | null = null;
  private audioMixer: AudioMixerEngine = new AudioMixerEngine();
  private timerInterval: number | null = null;
  private recordingSeconds: number = 0;
  private startTime: number = 0;
  private pausedTime: number = 0;
  private pauseStart: number = 0;
  private isPaused: boolean = false;
  private callbacks: RecorderCallbacks;

  // Offscreen canvas for compositing if needed (e.g. simulated screen, camera + drawing)
  private compositeCanvas: HTMLCanvasElement | null = null;
  private compositeCtx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;

  constructor(callbacks: RecorderCallbacks) {
    this.callbacks = callbacks;
  }

  getAudioMixer(): AudioMixerEngine {
    return this.audioMixer;
  }

  async startRecording(
    config: RecordingConfig,
    sourceMode: 'display_media' | 'camera_media' | 'canvas_media',
    canvasElement?: HTMLCanvasElement | null,
    getStrokes?: () => DrawingStroke[]
  ): Promise<boolean> {
    try {
      this.recordedChunks = [];
      this.recordingSeconds = 0;
      this.isPaused = false;

      // 1. Resolution & FrameRate constraints
      let width = 1920;
      let height = 1080;
      if (config.videoQuality === '480p') {
        width = 854;
        height = 480;
      } else if (config.videoQuality === '720p') {
        width = 1280;
        height = 720;
      } else if (config.videoQuality === '2K') {
        width = 2560;
        height = 1440;
      }

      if (config.orientation === 'portrait') {
        const temp = width;
        width = height;
        height = temp;
      }

      let combinedStream: MediaStream | null = null;

      // MODE A: Display Media (Screen Capture)
      if (sourceMode === 'display_media' && typeof navigator !== 'undefined' && navigator.mediaDevices?.getDisplayMedia) {
        try {
          this.displayStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              width: { ideal: width },
              height: { ideal: height },
              frameRate: { ideal: config.fps },
            },
            audio: config.audioSource === 'internal' || config.audioSource === 'mic_internal',
          });

          const videoTrack = this.displayStream.getVideoTracks()[0];
          if (videoTrack) {
            videoTrack.onended = () => {
              if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                this.stopRecording(config);
              }
            };
          }

          if (canvasElement && getStrokes) {
            combinedStream = this.setupCompositeCanvas(this.displayStream, canvasElement, getStrokes, width, height, config.fps);
          } else {
            combinedStream = new MediaStream([this.displayStream.getVideoTracks()[0]]);
          }
        } catch (err) {
          console.warn('getDisplayMedia was canceled or not supported on this mobile device. Trying canvas fallback:', err);
          return this.startRecording(config, 'canvas_media', canvasElement, getStrokes);
        }
      } 
      // MODE B: Camera / Live Video Mode
      else if (sourceMode === 'camera_media') {
        try {
          this.cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: width },
              height: { ideal: height },
              facingMode: 'user',
            },
            audio: config.audioSource === 'mic' || config.audioSource === 'mic_internal',
          });

          if (canvasElement && getStrokes) {
            combinedStream = this.setupCompositeCanvas(this.cameraStream, canvasElement, getStrokes, width, height, config.fps);
          } else {
            combinedStream = new MediaStream([this.cameraStream.getVideoTracks()[0]]);
          }
        } catch (camErr) {
          console.warn('Camera stream failed, falling back to canvas media:', camErr);
          return this.startRecording(config, 'canvas_media', canvasElement, getStrokes);
        }
      }
      
      // MODE C: Live High-Performance Interactive Canvas Screen
      if (!combinedStream) {
        if (!canvasElement) {
          canvasElement = document.createElement('canvas');
          canvasElement.width = width;
          canvasElement.height = height;
          const ctx = canvasElement.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#0c0a09';
            ctx.fillRect(0, 0, width, height);
          }
        }
        const canvasStream = canvasElement.captureStream ? canvasElement.captureStream(config.fps) : (canvasElement as any).mozCaptureStream(config.fps);
        combinedStream = new MediaStream([canvasStream.getVideoTracks()[0]]);
      }

      // 2. Setup Audio
      if (config.audioSource === 'mic' || config.audioSource === 'mic_internal') {
        try {
          if (!this.micStream) {
            this.micStream = await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              },
            });
          }
          await this.audioMixer.setupMicrophone(this.micStream, config.micVolume);
        } catch (micErr) {
          console.warn('Microphone permission not granted or unavailable:', micErr);
        }
      }

      // 3. Background Music
      if (config.bgMusicEnabled) {
        if (config.bgMusicDataUrl) {
          await this.audioMixer.loadBackgroundAudioFromUrl(config.bgMusicDataUrl);
        } else {
          this.audioMixer.generatePresetTrack('lofi');
        }
        this.audioMixer.startBackgroundMusic(config.bgMusicVolume, config.bgMusicLoop);
      }

      // Mix audio tracks into stream
      const mixedAudioStream = this.audioMixer.getMixedStream();
      if (mixedAudioStream && mixedAudioStream.getAudioTracks().length > 0) {
        combinedStream.addTrack(mixedAudioStream.getAudioTracks()[0]);
      } else if (this.displayStream && this.displayStream.getAudioTracks().length > 0) {
        combinedStream.addTrack(this.displayStream.getAudioTracks()[0]);
      } else if (this.cameraStream && this.cameraStream.getAudioTracks().length > 0) {
        combinedStream.addTrack(this.cameraStream.getAudioTracks()[0]);
      }

      // 4. Bitrate calculation
      let videoBitsPerSecond = 8000000; // 8 Mbps default
      if (config.bitrate === '2Mbps') videoBitsPerSecond = 2000000;
      else if (config.bitrate === '4Mbps') videoBitsPerSecond = 4000000;
      else if (config.bitrate === '8Mbps') videoBitsPerSecond = 8000000;
      else if (config.bitrate === '16Mbps') videoBitsPerSecond = 16000000;
      else if (config.bitrate === '24Mbps') videoBitsPerSecond = 24000000;
      else {
        // Auto
        videoBitsPerSecond = config.videoQuality === '2K' ? 16000000 : config.videoQuality === '1080p' ? 8000000 : 4000000;
      }

      // 5. Select compatible mime type
      const mimeTypes = [
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=h264,opus',
        'video/webm',
        'video/mp4;codecs=avc1',
        'video/mp4',
      ];
      let selectedMimeType = '';
      for (const mime of mimeTypes) {
        if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(mime)) {
          selectedMimeType = mime;
          break;
        }
      }

      const recorderOptions: MediaRecorderOptions = {
        videoBitsPerSecond,
      };
      if (selectedMimeType) {
        recorderOptions.mimeType = selectedMimeType;
      }

      this.mediaRecorder = new MediaRecorder(combinedStream, recorderOptions);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
          const totalBytes = this.recordedChunks.reduce((acc, chunk) => acc + chunk.size, 0);
          this.callbacks.onDataSizeUpdate(totalBytes);
        }
      };

      this.mediaRecorder.start(1000); // 1-second timeslices
      this.startTime = Date.now();
      this.pausedTime = 0;
      this.startTimer();
      this.callbacks.onStatusChange('recording');
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.cleanup();
      return false;
    }
  }

  private setupCompositeCanvas(
    videoStream: MediaStream,
    drawingCanvas: HTMLCanvasElement,
    getStrokes: () => DrawingStroke[],
    width: number,
    height: number,
    fps: number
  ): MediaStream {
    this.compositeCanvas = document.createElement('canvas');
    this.compositeCanvas.width = width;
    this.compositeCanvas.height = height;
    this.compositeCtx = this.compositeCanvas.getContext('2d');

    const videoEl = document.createElement('video');
    videoEl.srcObject = videoStream;
    videoEl.muted = true;
    videoEl.play();

    const drawFrame = () => {
      if (!this.compositeCtx || !this.compositeCanvas) return;
      // Draw screen video
      this.compositeCtx.drawImage(videoEl, 0, 0, width, height);

      // Composite drawing strokes directly
      const strokes = getStrokes();
      if (strokes.length > 0) {
        this.compositeCtx.drawImage(drawingCanvas, 0, 0, width, height);
      }

      this.animationFrameId = requestAnimationFrame(drawFrame);
    };

    drawFrame();
    return this.compositeCanvas.captureStream(fps);
  }

  pauseRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.isPaused = true;
      this.pauseStart = Date.now();
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.callbacks.onStatusChange('paused');
    }
  }

  resumeRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.isPaused = false;
      this.pausedTime += Date.now() - this.pauseStart;
      this.startTimer();
      this.callbacks.onStatusChange('recording');
    }
  }

  async stopRecording(config: RecordingConfig): Promise<RecordedVideo | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this.cleanup();
        this.callbacks.onStatusChange('stopped');
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = async () => {
        const mimeType = this.mediaRecorder?.mimeType || 'video/webm';
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);

        // Generate thumbnail from recording
        const thumbnailUrl = await this.generateThumbnail(blobUrl);

        const duration = Math.max(1, this.recordingSeconds);
        const recordedVideo: RecordedVideo = {
          id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          title: `Screen_Recording_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`,
          blobUrl,
          blob,
          thumbnailUrl,
          durationSeconds: duration,
          fileSizeBytes: blob.size,
          createdAt: Date.now(),
          quality: config.videoQuality,
          fps: config.fps,
          resolution: {
            width: config.orientation === 'portrait' ? 1080 : 1920,
            height: config.orientation === 'portrait' ? 1920 : 1080,
          },
          audioSource: config.audioSource,
          hasBackgroundMusic: config.bgMusicEnabled,
        };

        this.cleanup();
        this.callbacks.onStatusChange('stopped');
        resolve(recordedVideo);
      };

      this.mediaRecorder.stop();
    });
  }

  private async generateThumbnail(videoUrl: string): Promise<string> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.crossOrigin = 'anonymous';
      video.currentTime = 0.5;

      video.onloadeddata = () => {
        video.currentTime = Math.min(video.duration * 0.25, 1);
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 480;
          canvas.height = 270;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          } else {
            resolve('');
          }
        } catch {
          resolve('');
        }
      };

      video.onerror = () => {
        resolve('');
      };

      setTimeout(() => resolve(''), 3000);
    });
  }

  private startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = window.setInterval(() => {
      if (!this.isPaused) {
        const elapsed = Math.floor((Date.now() - this.startTime - this.pausedTime) / 1000);
        this.recordingSeconds = Math.max(0, elapsed);
        this.callbacks.onTimeUpdate(this.recordingSeconds);
      }
    }, 500);
  }

  private cleanup() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.displayStream) {
      this.displayStream.getTracks().forEach((t) => t.stop());
      this.displayStream = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    this.audioMixer.cleanup();
    this.compositeCanvas = null;
    this.compositeCtx = null;
  }
}
