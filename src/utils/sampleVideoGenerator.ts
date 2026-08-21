import { RecordedVideo } from '../types';

/**
 * Generates an actual playable WebM/MP4 video blob using an offscreen canvas and AudioContext
 * so that sample videos can be played, scrubbed, trimmed, and downloaded immediately on any device.
 */
export async function createPlayableSampleVideo(
  title: string,
  durationSec: number,
  accentColor: string,
  label: string
): Promise<{ blobUrl: string; blob: Blob; thumbnailUrl: string }> {
  return new Promise((resolve) => {
    try {
      const width = 1280;
      const height = 720;
      const fps = 30;
      const totalFrames = durationSec * fps;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context unavailable');
      }

      // Render thumbnail frame first
      drawDemoFrame(ctx, width, height, 0, durationSec, accentColor, label, title);
      const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);

      // Create stream & Audio
      const canvasStream = canvas.captureStream(fps);

      let audioContext: AudioContext | null = null;
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          audioContext = new AudioCtx();
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          gain.gain.value = 0.05;
          osc.frequency.value = 440;
          const dest = audioContext.createMediaStreamDestination();
          osc.connect(gain);
          gain.connect(dest);
          osc.start();
          const audioTrack = dest.stream.getAudioTracks()[0];
          if (audioTrack) {
            canvasStream.addTrack(audioTrack);
          }
        }
      } catch (e) {
        console.warn('AudioContext generation skipped:', e);
      }

      const mimeTypes = [
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp9,opus',
        'video/webm',
        'video/mp4',
      ];
      let selectedMime = '';
      for (const m of mimeTypes) {
        if (MediaRecorder.isTypeSupported(m)) {
          selectedMime = m;
          break;
        }
      }

      const options: MediaRecorderOptions = selectedMime ? { mimeType: selectedMime } : {};
      const recorder = new MediaRecorder(canvasStream, options);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        if (audioContext && audioContext.state !== 'closed') {
          audioContext.close().catch(() => {});
        }
        const mime = recorder.mimeType || 'video/webm';
        const blob = new Blob(chunks, { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        resolve({ blobUrl, blob, thumbnailUrl });
      };

      recorder.start();

      let frame = 0;
      const interval = setInterval(() => {
        frame++;
        const currentSec = frame / fps;
        drawDemoFrame(ctx, width, height, currentSec, durationSec, accentColor, label, title);

        if (frame >= totalFrames) {
          clearInterval(interval);
          recorder.stop();
        }
      }, 1000 / fps);
    } catch (err) {
      console.warn('Sample video generator fallback:', err);
      // Fallback placeholder
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 640, 360);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(title, 40, 180);
      }
      const dataUrl = canvas.toDataURL('image/png');
      const blob = new Blob([], { type: 'video/mp4' });
      resolve({ blobUrl: dataUrl, blob, thumbnailUrl: dataUrl });
    }
  });
}

function drawDemoFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  currentSec: number,
  totalSec: number,
  accentColor: string,
  label: string,
  title: string
) {
  // Dark Background
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, width, height);

  // Subtle grid pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Header Bar
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(0, 0, width, 80);
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(45, 40, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText('Screen Recorder PRO • Playback Demo', 75, 48);

  // Timestamp
  const m = Math.floor(currentSec / 60);
  const s = Math.floor(currentSec % 60);
  const timeStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  ctx.fillStyle = '#ef4444';
  ctx.font = 'bold 24px monospace';
  ctx.fillText(`REC ${timeStr} / ${totalSec}s`, width - 260, 48);

  // Animated Waves & Shapes
  const centerX = width / 2;
  const centerY = height / 2 + 20;

  // Pulse circle
  const pulse = Math.sin(currentSec * 4) * 20;
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 90 + pulse, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, centerX, centerY + 8);

  // Title text
  ctx.fillStyle = '#f5f5f4';
  ctx.font = 'bold 28px system-ui, sans-serif';
  ctx.fillText(title, centerX, centerY - 140);

  ctx.fillStyle = '#a8a29e';
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText('Material 3 Floating Controls excluded from video capture stream', centerX, centerY + 160);

  // Moving simulated touch pointer
  const touchX = centerX + Math.cos(currentSec * 2) * 220;
  const touchY = centerY + Math.sin(currentSec * 3) * 100;
  ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
  ctx.beginPath();
  ctx.arc(touchX, touchY, 26, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(touchX, touchY, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = 'left';
}

export async function initializeSampleRecordings(): Promise<RecordedVideo[]> {
  const samples = [
    {
      id: 'rec_sample_1',
      title: 'Gameplay_Screen_Record_60FPS',
      duration: 6,
      color: '#ef4444',
      label: 'Gaming 60 FPS',
      quality: '1080p' as const,
      fps: 60 as const,
    },
    {
      id: 'rec_sample_2',
      title: 'App_Tutorial_Floating_Controls',
      duration: 5,
      color: '#3b82f6',
      label: 'App Walkthrough',
      quality: '1080p' as const,
      fps: 60 as const,
    },
    {
      id: 'rec_sample_3',
      title: 'Live_Brush_Drawing_Demo',
      duration: 5,
      color: '#10b981',
      label: 'Live Drawing Brush',
      quality: '720p' as const,
      fps: 30 as const,
    },
  ];

  const results: RecordedVideo[] = [];

  for (const s of samples) {
    try {
      const generated = await createPlayableSampleVideo(s.title, s.duration, s.color, s.label);
      results.push({
        id: s.id,
        title: s.title,
        blobUrl: generated.blobUrl,
        blob: generated.blob,
        thumbnailUrl: generated.thumbnailUrl,
        durationSeconds: s.duration,
        fileSizeBytes: generated.blob.size || 2400000,
        createdAt: Date.now() - 1000 * 60 * 30,
        quality: s.quality,
        fps: s.fps,
        resolution: { width: 1280, height: 720 },
        audioSource: 'mic_internal',
        hasBackgroundMusic: true,
      });
    } catch (e) {
      console.warn('Failed generating sample video item:', e);
    }
  }

  return results;
}
