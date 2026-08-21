import { RecordedVideo } from '../types';

export const SAMPLE_RECORDINGS: RecordedVideo[] = [
  {
    id: 'rec_sample_1',
    title: 'Screen_Recording_2026-08-20_14-32-10',
    blobUrl: '',
    blob: new Blob([], { type: 'video/mp4' }),
    thumbnailUrl: 'https://images.unsplash.com/photo-1616469829941-c7200edec809?w=600&auto=format&fit=crop&q=80',
    durationSeconds: 124,
    fileSizeBytes: 24650000, // ~24.6 MB
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
    quality: '1080p',
    fps: 60,
    resolution: { width: 1080, height: 2400 },
    audioSource: 'mic_internal',
    hasBackgroundMusic: true,
  },
  {
    id: 'rec_sample_2',
    title: 'PUBG_Mobile_Gameplay_60FPS',
    blobUrl: '',
    blob: new Blob([], { type: 'video/mp4' }),
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    durationSeconds: 342,
    fileSizeBytes: 68900000, // ~68.9 MB
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    quality: '2K',
    fps: 60,
    resolution: { width: 2560, height: 1440 },
    audioSource: 'internal',
    hasBackgroundMusic: false,
  },
  {
    id: 'rec_sample_3',
    title: 'App_Walkthrough_Tutorial_Portrait',
    blobUrl: '',
    blob: new Blob([], { type: 'video/mp4' }),
    thumbnailUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80',
    durationSeconds: 58,
    fileSizeBytes: 11200000, // ~11.2 MB
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    quality: '1080p',
    fps: 30,
    resolution: { width: 1080, height: 1920 },
    audioSource: 'mic',
    hasBackgroundMusic: true,
  },
];
