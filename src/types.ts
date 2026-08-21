export type VideoQuality = '480p' | '720p' | '1080p' | '2K';
export type FPSOption = 30 | 60;
export type AudioSource = 'mic' | 'internal' | 'mic_internal' | 'none';
export type OrientationOption = 'auto' | 'portrait' | 'landscape';
export type CountdownOption = 0 | 3 | 5 | 10;
export type BitrateOption = 'auto' | '2Mbps' | '4Mbps' | '8Mbps' | '16Mbps' | '24Mbps';

export interface RecordingConfig {
  videoQuality: VideoQuality;
  fps: FPSOption;
  bitrate: BitrateOption;
  audioSource: AudioSource;
  orientation: OrientationOption;
  countdown: CountdownOption;
  showTouchIndicator: boolean;
  enableFloatingPopup: boolean;
  popupOpacity: number; // 20 to 100%
  popupSize: 'small' | 'medium' | 'large';
  saveLocation: string;
  autoSave: boolean;
  bgMusicEnabled: boolean;
  bgMusicVolume: number; // 0 to 1
  bgMusicLoop: boolean;
  bgMusicTrackName: string;
  bgMusicDataUrl: string | null;
  micVolume: number; // 0 to 1
}

export interface DrawingPoint {
  x: number;
  y: number;
  pressure?: number;
}

export interface DrawingStroke {
  id: string;
  points: DrawingPoint[];
  color: string;
  size: number;
  isEraser?: boolean;
  isHighlighter?: boolean;
}

export interface RecordedVideo {
  id: string;
  title: string;
  blobUrl: string;
  blob: Blob;
  thumbnailUrl: string;
  durationSeconds: number;
  fileSizeBytes: number;
  createdAt: number;
  quality: VideoQuality;
  fps: FPSOption;
  resolution: { width: number; height: number };
  audioSource: AudioSource;
  hasBackgroundMusic: boolean;
}

export type RecordingStatus = 'idle' | 'countdown' | 'recording' | 'paused' | 'stopping';

export interface FloatingPosition {
  x: number;
  y: number;
}

export interface AndroidPermissionState {
  screenCapture: boolean;
  microphone: boolean;
  overlayWindow: boolean;
  storage: boolean;
  notifications: boolean;
}
