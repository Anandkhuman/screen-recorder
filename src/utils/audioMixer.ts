/**
 * Web Audio API Engine for real-time audio routing, microphone capture,
 * background music playback, gain mixing, and visualizer frequency data.
 */

export class AudioMixerEngine {
  private ctx: AudioContext | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private bgMusicSource: AudioBufferSourceNode | null = null;
  private micGain: GainNode | null = null;
  private bgGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private destination: MediaStreamAudioDestinationNode | null = null;
  private analyser: AnalyserNode | null = null;
  private bgBuffer: AudioBuffer | null = null;
  private isPlayingMusic: boolean = false;

  private initContext() {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.masterGain) {
      this.masterGain = this.ctx.createGain();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.destination = this.ctx.createMediaStreamDestination();

      this.masterGain.connect(this.destination);
      this.masterGain.connect(this.analyser);
    }
  }

  async setupMicrophone(micStream: MediaStream, volume = 1.0) {
    this.initContext();
    if (!this.ctx) return;

    try {
      this.micSource = this.ctx.createMediaStreamSource(micStream);
      this.micGain = this.ctx.createGain();
      this.micGain.gain.setValueAtTime(volume, this.ctx.currentTime);

      this.micSource.connect(this.micGain);
      this.micGain.connect(this.masterGain!);
    } catch (e) {
      console.warn('Failed to connect microphone to audio mixer:', e);
    }
  }

  setMicVolume(volume: number) {
    if (this.micGain && this.ctx) {
      this.micGain.gain.setValueAtTime(Math.max(0, Math.min(2, volume)), this.ctx.currentTime);
    }
  }

  setBgMusicVolume(volume: number) {
    if (this.bgGain && this.ctx) {
      this.bgGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  async loadBackgroundAudioFromUrl(url: string) {
    this.initContext();
    if (!this.ctx) return;

    try {
      const res = await fetch(url);
      const arrayBuffer = await res.arrayBuffer();
      this.bgBuffer = await this.ctx.decodeAudioData(arrayBuffer);
    } catch (e) {
      console.warn('Failed to load background audio buffer:', e);
    }
  }

  async loadBackgroundAudioFromFile(file: File) {
    this.initContext();
    if (!this.ctx) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      this.bgBuffer = await this.ctx.decodeAudioData(arrayBuffer);
    } catch (e) {
      console.warn('Failed to decode uploaded audio file:', e);
    }
  }

  /**
   * Generates a pleasant synthetic Lo-Fi chill beat audio buffer when no MP3 is uploaded
   */
  generatePresetTrack(type: 'lofi' | 'electronic' | 'ambient'): void {
    this.initContext();
    if (!this.ctx) return;

    const sampleRate = this.ctx.sampleRate;
    const durationSec = 16;
    const buffer = this.ctx.createBuffer(2, sampleRate * durationSec, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    const bpm = type === 'lofi' ? 80 : type === 'electronic' ? 120 : 60;
    const beatInterval = 60 / bpm;

    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 349.23], // G7
    ];

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const barIndex = Math.floor((t / (beatInterval * 4)) % chords.length);
      const currentChord = chords[barIndex];

      let sample = 0;
      // Pad chord
      for (const freq of currentChord) {
        sample += Math.sin(2 * Math.PI * freq * t) * 0.03;
        sample += Math.sin(2 * Math.PI * (freq * 0.5) * t) * 0.04; // Bass
      }

      // Rhythm kick & snare
      const beatTime = t % beatInterval;
      const beatNum = Math.floor((t / beatInterval) % 4);
      if (beatNum === 0 || beatNum === 2) {
        // Kick
        if (beatTime < 0.15) {
          const kickFreq = 120 * Math.exp(-beatTime * 30);
          sample += Math.sin(2 * Math.PI * kickFreq * beatTime) * (1 - beatTime / 0.15) * 0.2;
        }
      }
      if (beatNum === 1 || beatNum === 3) {
        // Snare / Hi-hat noise
        if (beatTime < 0.1) {
          sample += (Math.random() * 2 - 1) * (1 - beatTime / 0.1) * 0.08;
        }
      }

      // Lo-fi warm saturation
      sample = Math.tanh(sample * 1.5);

      left[i] = sample;
      right[i] = sample * 0.95 + (Math.sin(2 * Math.PI * 440 * t) * 0.005);
    }

    this.bgBuffer = buffer;
  }

  startBackgroundMusic(volume = 0.5, loop = true) {
    if (!this.bgBuffer || !this.ctx) return;
    this.stopBackgroundMusic();

    this.bgMusicSource = this.ctx.createBufferSource();
    this.bgMusicSource.buffer = this.bgBuffer;
    this.bgMusicSource.loop = loop;

    this.bgGain = this.ctx.createGain();
    this.bgGain.gain.setValueAtTime(volume, this.ctx.currentTime);

    this.bgMusicSource.connect(this.bgGain);
    this.bgGain.connect(this.masterGain!);

    // Also connect to local speakers if needed
    try {
      this.bgGain.connect(this.ctx.destination);
    } catch {
      // Ignore
    }

    this.bgMusicSource.start(0);
    this.isPlayingMusic = true;
  }

  stopBackgroundMusic() {
    if (this.bgMusicSource) {
      try {
        this.bgMusicSource.stop();
        this.bgMusicSource.disconnect();
      } catch {
        // Ignore
      }
      this.bgMusicSource = null;
    }
    this.isPlayingMusic = false;
  }

  getMixedStream(): MediaStream | null {
    return this.destination ? this.destination.stream : null;
  }

  getVisualizerData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  cleanup() {
    this.stopBackgroundMusic();
    if (this.micSource) {
      this.micSource.disconnect();
      this.micSource = null;
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.close();
      } catch {
        // Ignore
      }
      this.ctx = null;
    }
    this.masterGain = null;
    this.analyser = null;
    this.destination = null;
  }
}
