import React from 'react';
import {
  Play,
  Square,
  Sparkles,
  Sliders,
  Smartphone,
  Monitor,
  Mic,
  Volume2,
  Layers,
  Timer,
  Fingerprint,
  Music,
  Shield,
  Gauge,
  Zap,
  Info,
  Tv,
  CheckCircle2,
  CircleDot
} from 'lucide-react';
import {
  RecordingConfig,
  RecordingStatus,
  VideoQuality,
  FPSOption,
  AudioSource,
  OrientationOption,
  CountdownOption,
} from '../types';
import { soundEffects } from '../utils/soundEffects';

interface HomeScreenProps {
  config: RecordingConfig;
  setConfig: React.Dispatch<React.SetStateAction<RecordingConfig>>;
  recordingStatus: RecordingStatus;
  recordingSeconds: number;
  onStartRecording: (sourceMode: 'display_media' | 'camera_media' | 'canvas_media') => void;
  onStopRecording: () => void;
  onOpenMusicModal: () => void;
  activeSourceMode: 'display_media' | 'camera_media' | 'canvas_media';
  setActiveSourceMode: (mode: 'display_media' | 'camera_media' | 'canvas_media') => void;
}

const QUALITY_OPTIONS: { id: VideoQuality; label: string; desc: string }[] = [
  { id: '480p', label: '480p SD', desc: '854×480 • Compact size' },
  { id: '720p', label: '720p HD', desc: '1280×720 • Fast & Smooth' },
  { id: '1080p', label: '1080p FHD', desc: '1920×1080 • Crystal Clear' },
  { id: '2K', label: '2K QHD', desc: '2560×1440 • Ultra High Res' },
];

const AUDIO_OPTIONS: { id: AudioSource; label: string; icon: typeof Mic; desc: string }[] = [
  { id: 'mic', label: 'Microphone', icon: Mic, desc: 'Voice commentary & narration' },
  { id: 'internal', label: 'Internal Audio', icon: Volume2, desc: 'In-app sounds & game audio' },
  { id: 'mic_internal', label: 'Mic + Internal', icon: Layers, desc: 'Mixed voice and game audio' },
  { id: 'none', label: 'No Audio', icon: Tv, desc: 'Muted video recording' },
];

const ORIENTATION_OPTIONS: { id: OrientationOption; label: string }[] = [
  { id: 'auto', label: 'Auto Detect' },
  { id: 'portrait', label: 'Portrait (9:16)' },
  { id: 'landscape', label: 'Landscape (16:9)' },
];

const COUNTDOWN_OPTIONS: { id: CountdownOption; label: string }[] = [
  { id: 0, label: 'Off (0s)' },
  { id: 3, label: '3 Seconds' },
  { id: 5, label: '5 Seconds' },
  { id: 10, label: '10 Seconds' },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  config,
  setConfig,
  recordingStatus,
  recordingSeconds,
  onStartRecording,
  onStopRecording,
  onOpenMusicModal,
  activeSourceMode,
  setActiveSourceMode,
}) => {
  const isRecording = recordingStatus === 'recording' || recordingStatus === 'paused';

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Banner Notice: Overlay Invisible Guarantee */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 text-stone-800 dark:text-stone-200 shadow-sm">
        <div className="flex items-center space-x-3 mb-2 sm:mb-0">
          <div className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold">Floating Popup Overlay Protection Enabled</div>
            <div className="text-xs text-stone-500 dark:text-stone-400">
              The floating controls are isolated in DOM / SYSTEM_ALERT_WINDOW and <strong>will NOT appear in your recorded video</strong>.
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700/60 shadow-xs">
            Clean Capture Engine
          </span>
        </div>
      </div>

      {/* Hero Action Center: Big Start/Stop Recording Button */}
      <div className="flex flex-col items-center justify-center p-8 sm:p-10 rounded-3xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/90 dark:border-stone-800 shadow-xl relative overflow-hidden text-center">
        {/* Background glow orb */}
        <div className={`absolute w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700 ${
          isRecording ? 'bg-rose-500 scale-125' : 'bg-red-500'
        }`} />

        {/* Source Mode Toggle */}
        <div className="flex flex-wrap items-center justify-center gap-1 p-1 bg-stone-200/80 dark:bg-stone-800 rounded-full mb-8 border border-stone-300 dark:border-stone-700/60 shadow-inner">
          <button
            onClick={() => setActiveSourceMode('display_media')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeSourceMode === 'display_media'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-blue-500" />
            <span>Screen Capture</span>
          </button>

          <button
            onClick={() => setActiveSourceMode('camera_media')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeSourceMode === 'camera_media'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
            <span>Camera / Mobile Feed</span>
          </button>

          <button
            onClick={() => setActiveSourceMode('canvas_media')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeSourceMode === 'canvas_media'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>Live Interactive Board</span>
          </button>
        </div>

        {/* HERO START / STOP BUTTON */}
        {!isRecording ? (
          <div className="flex flex-col items-center">
            <button
              onClick={() => {
                soundEffects.playTap();
                onStartRecording(activeSourceMode);
              }}
              className="relative group flex items-center justify-center w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-red-600 via-rose-500 to-rose-600 text-white shadow-2xl shadow-rose-500/40 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              {/* Outer pulsing ring */}
              <span className="absolute inset-0 rounded-full bg-rose-500/20 group-hover:animate-ping opacity-75 pointer-events-none" />
              
              <div className="flex flex-col items-center justify-center space-y-2 z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Play className="w-8 h-8 sm:w-9 sm:h-9 fill-white translate-x-0.5" />
                </div>
                <span className="text-base sm:text-lg font-extrabold tracking-wide uppercase">
                  REC
                </span>
              </div>
            </button>
            <span className="mt-4 text-xs font-bold uppercase tracking-wider text-stone-400">
              Tap to Start Screen Recording
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <button
              onClick={() => {
                soundEffects.playStopSound();
                onStopRecording();
              }}
              className="relative group flex items-center justify-center w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-stone-900 dark:bg-black text-rose-500 border-4 border-rose-500 shadow-2xl shadow-rose-500/50 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <span className="absolute inset-0 rounded-full border-2 border-rose-500/60 animate-ping pointer-events-none" />
              <div className="flex flex-col items-center justify-center space-y-2 z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-md">
                  <Square className="w-8 h-8 fill-white" />
                </div>
                <span className="text-base sm:text-lg font-mono font-extrabold text-white">
                  {formatTime(recordingSeconds)}
                </span>
              </div>
            </button>
            <span className="mt-4 text-xs font-bold uppercase tracking-wider text-rose-500 animate-pulse">
              Recording in Progress • Tap to Stop
            </span>
          </div>
        )}

        {/* Floating Popup Controls hint */}
        <div className="mt-6 flex items-center space-x-2 text-xs text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800/80 px-4 py-2 rounded-full border border-stone-200 dark:border-stone-700/60">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>
            Floating draggable popup will activate immediately upon recording.
          </span>
        </div>
      </div>

      {/* SECTION 1: VIDEO QUALITY & FPS (Material 3 Cards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-white">
              Video Quality & Frame Rate
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Configure resolution and target frame rate (30 or 60 FPS)
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800/50">
            {config.videoQuality} • {config.fps} FPS
          </span>
        </div>

        {/* Quality Presets Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUALITY_OPTIONS.map((q) => {
            const isSelected = config.videoQuality === q.id;
            return (
              <button
                key={q.id}
                onClick={() => setConfig((prev) => ({ ...prev, videoQuality: q.id }))}
                className={`flex flex-col text-left p-4 rounded-3xl border transition-all ${
                  isSelected
                    ? 'bg-rose-500/10 border-rose-500 text-stone-900 dark:text-white shadow-sm ring-2 ring-rose-500/20'
                    : 'bg-white dark:bg-stone-900/60 border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 text-stone-700 dark:text-stone-300'
                }`}
              >
                <div className="text-sm font-bold mb-1 flex items-center justify-between">
                  <span>{q.label}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-rose-500" />}
                </div>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">{q.desc}</span>
              </button>
            );
          })}
        </div>

        {/* FPS Selector Pills */}
        <div className="flex items-center space-x-3 pt-1">
          <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">Frame Rate:</span>
          <div className="flex items-center space-x-2">
            {[30, 60].map((f) => (
              <button
                key={f}
                onClick={() => setConfig((prev) => ({ ...prev, fps: f as FPSOption }))}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  config.fps === f
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-200'
                }`}
              >
                {f} FPS {f === 60 && '🔥 Ultra Smooth'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: AUDIO OPTIONS */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-white">
            Audio Source Configuration
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Select what sound channels to include in the video output
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {AUDIO_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = config.audioSource === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setConfig((prev) => ({ ...prev, audioSource: opt.id }))}
                className={`flex items-start space-x-3.5 p-4 rounded-3xl border text-left transition-all ${
                  isSelected
                    ? 'bg-rose-500/10 border-rose-500 text-stone-900 dark:text-white shadow-sm ring-2 ring-rose-500/20'
                    : 'bg-white dark:bg-stone-900/60 border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 text-stone-700 dark:text-stone-300'
                }`}
              >
                <div
                  className={`p-2.5 rounded-2xl ${
                    isSelected
                      ? 'bg-rose-500 text-white'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold mb-0.5">{opt.label}</div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight">
                    {opt.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Background Music Quick Launcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/50">
          <div className="flex items-center space-x-3 mb-2 sm:mb-0">
            <div className="p-2 rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900 dark:text-white">
                Background Music Mixer
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400">
                {config.bgMusicEnabled
                  ? `Active: ${config.bgMusicTrackName} (${Math.round(config.bgMusicVolume * 100)}% vol)`
                  : 'Import custom MP3 or add Lo-Fi / Synthwave backing music'}
              </div>
            </div>
          </div>

          <button
            onClick={onOpenMusicModal}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Configure Music ({config.bgMusicEnabled ? 'ON' : 'OFF'})</span>
          </button>
        </div>
      </div>

      {/* SECTION 3: ORIENTATION & COUNTDOWN TIMER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Orientation */}
        <div className="p-5 rounded-3xl bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 space-y-3">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-stone-500" />
            <h4 className="text-sm font-bold text-stone-900 dark:text-white">Orientation</h4>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {ORIENTATION_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setConfig((prev) => ({ ...prev, orientation: opt.id }))}
                className={`py-2 px-3 rounded-2xl text-xs font-semibold border text-center transition-all ${
                  config.orientation === opt.id
                    ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Countdown */}
        <div className="p-5 rounded-3xl bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 space-y-3">
          <div className="flex items-center space-x-2">
            <Timer className="w-4 h-4 text-stone-500" />
            <h4 className="text-sm font-bold text-stone-900 dark:text-white">Countdown Timer</h4>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {COUNTDOWN_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setConfig((prev) => ({ ...prev, countdown: opt.id }))}
                className={`py-2 px-2 rounded-2xl text-xs font-semibold border text-center transition-all ${
                  config.countdown === opt.id
                    ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: QUICK TOGGLES (Touch Indicator, Floating Bubble) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Touch Indicator Toggle */}
        <div className="flex items-center justify-between p-4 rounded-3xl bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-500">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900 dark:text-white">
                Show Touch Indicator
              </div>
              <div className="text-[11px] text-stone-400">
                Visual circular ripples on tap/click
              </div>
            </div>
          </div>
          <button
            onClick={() =>
              setConfig((prev) => ({
                ...prev,
                showTouchIndicator: !prev.showTouchIndicator,
              }))
            }
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              config.showTouchIndicator ? 'bg-amber-500' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                config.showTouchIndicator ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Floating Bubble Widget Toggle */}
        <div className="flex items-center justify-between p-4 rounded-3xl bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-2xl bg-rose-500/10 text-rose-500">
              <CircleDot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900 dark:text-white">
                Floating Overlay Controls
              </div>
              <div className="text-[11px] text-stone-400">
                Movable on-screen control bubble
              </div>
            </div>
          </div>
          <button
            onClick={() =>
              setConfig((prev) => ({
                ...prev,
                enableFloatingPopup: !prev.enableFloatingPopup,
              }))
            }
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              config.enableFloatingPopup ? 'bg-rose-500' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                config.enableFloatingPopup ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
