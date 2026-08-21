import React from 'react';
import {
  Sliders,
  Video,
  Gauge,
  CircleDot,
  Timer,
  Folder,
  Save,
  Zap,
  Battery,
  Shield,
  Layers,
  Sparkles,
  Volume2
} from 'lucide-react';
import { RecordingConfig, BitrateOption } from '../types';

interface ConfigSettingsProps {
  config: RecordingConfig;
  setConfig: React.Dispatch<React.SetStateAction<RecordingConfig>>;
}

const BITRATE_OPTIONS: { id: BitrateOption; label: string; desc: string }[] = [
  { id: 'auto', label: 'Auto (Recommended)', desc: 'Adaptive bitrate based on resolution' },
  { id: '2Mbps', label: '2 Mbps', desc: 'Low bandwidth • Small file size' },
  { id: '4Mbps', label: '4 Mbps', desc: 'Standard definition capture' },
  { id: '8Mbps', label: '8 Mbps', desc: 'High definition 1080p quality' },
  { id: '16Mbps', label: '16 Mbps', desc: 'Crisp 60 FPS gaming quality' },
  { id: '24Mbps', label: '24 Mbps', desc: 'Ultra 2K lossless bitrate' },
];

export const ConfigSettings: React.FC<ConfigSettingsProps> = ({
  config,
  setConfig,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-white flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-rose-500" />
          <span>Recording Configuration & Preferences</span>
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Fine-tune resolution, bitrates, floating overlay styles, and storage paths
        </p>
      </div>

      {/* 1. Bitrate & Encoder Settings */}
      <div className="p-6 rounded-3xl bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-2xl bg-rose-500/10 text-rose-500">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white">
              Video Bitrate & Compression
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Higher bitrate provides cleaner motion without pixelation
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {BITRATE_OPTIONS.map((b) => {
            const isSelected = config.bitrate === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setConfig((prev) => ({ ...prev, bitrate: b.id }))}
                className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-rose-500/10 border-rose-500 text-stone-900 dark:text-white ring-2 ring-rose-500/20'
                    : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                <div className="text-xs font-bold mb-0.5">{b.label}</div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400">{b.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Floating Popup Controls Customization */}
      <div className="p-6 rounded-3xl bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 space-y-5">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-500">
            <CircleDot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white">
              Floating Popup Controls (Overlay)
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Configure overlay transparency, sizing, and screen edge snapping
            </p>
          </div>
        </div>

        {/* Opacity Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-700 dark:text-stone-300">
              Popup Opacity / Transparency
            </span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {Math.round(config.popupOpacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.3"
            max="1.0"
            step="0.05"
            value={config.popupOpacity}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                popupOpacity: parseFloat(e.target.value),
              }))
            }
            className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <p className="text-[11px] text-stone-400">
            Allows you to see through the controls while you play games or navigate apps
          </p>
        </div>
      </div>

      {/* 3. Storage & Auto-Save */}
      <div className="p-6 rounded-3xl bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-500">
            <Save className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white">
              Storage & Save Destination
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Target folder on device for exported MP4 video files
            </p>
          </div>
        </div>

        {/* Path Input */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Android Movies Directory
          </label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Folder className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={config.saveLocation}
                onChange={(e) => setConfig((prev) => ({ ...prev, saveLocation: e.target.value }))}
                className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Auto Save Toggle */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <div className="text-xs font-bold text-stone-900 dark:text-white">
              Auto-Save on Recording Stop
            </div>
            <div className="text-[11px] text-stone-500">
              Immediately triggers download to Movies folder without prompt
            </div>
          </div>
          <button
            onClick={() => setConfig((prev) => ({ ...prev, autoSave: !prev.autoSave }))}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              config.autoSave ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                config.autoSave ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
