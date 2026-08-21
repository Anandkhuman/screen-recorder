import React, { useState, useRef, useEffect } from 'react';
import {
  Music,
  Upload,
  Play,
  Pause,
  Volume2,
  Repeat,
  Sparkles,
  Check,
  X,
  FileAudio,
  Sliders,
  AudioWaveform
} from 'lucide-react';
import { RecordingConfig } from '../types';

interface BackgroundMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RecordingConfig;
  setConfig: React.Dispatch<React.SetStateAction<RecordingConfig>>;
}

const PRESET_TRACKS = [
  { id: 'lofi', name: 'Lo-Fi Chill Lounge (80 BPM)', genre: 'Lo-Fi', desc: 'Warm relaxing beats with soft Rhodes chords' },
  { id: 'electronic', name: 'Cyber Synthwave (120 BPM)', genre: 'Gaming', desc: 'Energetic rhythm for gaming and tutorials' },
  { id: 'ambient', name: 'Atmospheric Cloud (60 BPM)', genre: 'Ambient', desc: 'Subtle background pad without heavy drums' },
];

export const BackgroundMusicModal: React.FC<BackgroundMusicModalProps> = ({
  isOpen,
  onClose,
  config,
  setConfig,
}) => {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('lofi');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    setConfig((prev) => ({
      ...prev,
      bgMusicEnabled: true,
      bgMusicTrackName: file.name,
      bgMusicDataUrl: fileUrl,
    }));
  };

  const handleSelectPreset = (presetId: string, name: string) => {
    setSelectedPreset(presetId);
    setConfig((prev) => ({
      ...prev,
      bgMusicEnabled: true,
      bgMusicTrackName: name,
      bgMusicDataUrl: null, // Generates procedural synthesizer track
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800/80 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                Background Music & Audio Mixer
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Mix MP3 tracks with your screen & mic audio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Master Enable Switch */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/60">
          <div>
            <div className="text-sm font-semibold text-stone-900 dark:text-white">
              Enable Background Music
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-400">
              Blends into the recorded video stream in real-time
            </div>
          </div>
          <button
            onClick={() =>
              setConfig((prev) => ({
                ...prev,
                bgMusicEnabled: !prev.bgMusicEnabled,
              }))
            }
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              config.bgMusicEnabled ? 'bg-indigo-600' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                config.bgMusicEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Music Volume & Loop Controls */}
        <div className="space-y-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/30 border border-stone-200/80 dark:border-stone-700/60">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-700 dark:text-stone-300 flex items-center space-x-1.5">
              <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Music Volume</span>
            </span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {Math.round(config.bgMusicVolume * 100)}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={config.bgMusicVolume}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                bgMusicVolume: parseFloat(e.target.value),
              }))
            }
            className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />

          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              onClick={() =>
                setConfig((prev) => ({
                  ...prev,
                  bgMusicLoop: !prev.bgMusicLoop,
                }))
              }
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl border transition-colors ${
                config.bgMusicLoop
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'border-stone-300 dark:border-stone-700 text-stone-500'
              }`}
            >
              <Repeat className="w-3 h-3" />
              <span>Loop Background Music</span>
            </button>

            <span className="text-[11px] text-stone-400">
              Mic Ducking: <strong className="text-emerald-500">Auto</strong>
            </span>
          </div>
        </div>

        {/* Track Selection (Upload MP3 vs Presets) */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Select or Upload Audio Track
          </label>

          {/* Device MP3 Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-4 text-center cursor-pointer transition-colors group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/mp3,audio/wav,audio/ogg,audio/m4a"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Upload className="w-6 h-6 mx-auto text-stone-400 group-hover:text-indigo-500 mb-1 transition-colors" />
            <div className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              {config.bgMusicDataUrl ? (
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                  {config.bgMusicTrackName} (Custom MP3)
                </span>
              ) : (
                'Import MP3 from Device Storage'
              )}
            </div>
            <p className="text-[10px] text-stone-400 mt-0.5">
              Supports MP3, WAV, OGG & AAC audio files
            </p>
          </div>

          {/* Preset Tracks */}
          <div className="space-y-2">
            <span className="text-xs text-stone-500">Or use royalty-free presets:</span>
            <div className="grid grid-cols-1 gap-2">
              {PRESET_TRACKS.map((track) => (
                <div
                  key={track.id}
                  onClick={() => handleSelectPreset(track.id, track.name)}
                  className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                    !config.bgMusicDataUrl && selectedPreset === track.id
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500/80'
                      : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                      <Music className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900 dark:text-white">
                        {track.name}
                      </div>
                      <div className="text-[10px] text-stone-400">{track.desc}</div>
                    </div>
                  </div>

                  {!config.bgMusicDataUrl && selectedPreset === track.id && (
                    <span className="p-1 rounded-full bg-indigo-600 text-white">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Done Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
