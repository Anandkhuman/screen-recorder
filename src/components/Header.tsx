import React from 'react';
import {
  Video,
  Moon,
  Sun,
  ShieldCheck,
  Code2,
  Film,
  Smartphone,
  Sliders,
  Sparkles,
  CircleDot
} from 'lucide-react';
import { RecordingStatus, AndroidPermissionState } from '../types';

interface HeaderProps {
  currentTab: 'home' | 'recordings' | 'settings' | 'code';
  setCurrentTab: (tab: 'home' | 'recordings' | 'settings' | 'code') => void;
  recordingStatus: RecordingStatus;
  recordingSeconds: number;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  permissions: AndroidPermissionState;
  onOpenPermissions: () => void;
  recordingsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  recordingStatus,
  recordingSeconds,
  isDarkMode,
  setIsDarkMode,
  permissions,
  onOpenPermissions,
  recordingsCount,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const allPermissionsGranted = Object.values(permissions).every(Boolean);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 dark:border-stone-800/80 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* App Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('home')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/20">
              <Video className="w-5 h-5" />
              {recordingStatus === 'recording' && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-stone-900 dark:text-white">
                  Screen Recorder <span className="text-rose-600 dark:text-rose-400 text-sm font-semibold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/50">PRO</span>
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 hidden sm:block">
                Material 3 • Invisible Floating Controls
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 p-1 bg-stone-100 dark:bg-stone-800/60 rounded-full border border-stone-200/70 dark:border-stone-700/50">
            <button
              onClick={() => setCurrentTab('home')}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                currentTab === 'home'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Recorder</span>
            </button>

            <button
              onClick={() => setCurrentTab('recordings')}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all relative ${
                currentTab === 'recordings'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Recordings</span>
              {recordingsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                  {recordingsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('settings')}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                currentTab === 'settings'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Config</span>
            </button>

            <button
              onClick={() => setCurrentTab('code')}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                currentTab === 'code'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Kotlin Architecture</span>
            </button>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center space-x-2">
            {/* Live recording status chip if active */}
            {recordingStatus === 'recording' && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/30 rounded-full animate-pulse">
                <CircleDot className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300 font-mono">
                  REC {formatTime(recordingSeconds)}
                </span>
              </div>
            )}

            {/* Permissions Button */}
            <button
              onClick={onOpenPermissions}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                allPermissionsGranted
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
              }`}
              title="Manage Android & Browser Permissions"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {allPermissionsGranted ? 'Permissions OK' : 'Grant Perms'}
              </span>
            </button>

            {/* Dark/Light Mode Switch */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors border border-stone-200 dark:border-stone-700/60"
              title="Toggle Dark / Light Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-stone-200/60 dark:border-stone-800/60 overflow-x-auto text-xs">
          <button
            onClick={() => setCurrentTab('home')}
            className={`px-3 py-1 rounded-full whitespace-nowrap ${currentTab === 'home' ? 'bg-rose-500 text-white font-bold' : 'text-stone-600 dark:text-stone-400'}`}
          >
            Recorder
          </button>
          <button
            onClick={() => setCurrentTab('recordings')}
            className={`px-3 py-1 rounded-full whitespace-nowrap ${currentTab === 'recordings' ? 'bg-rose-500 text-white font-bold' : 'text-stone-600 dark:text-stone-400'}`}
          >
            Recordings ({recordingsCount})
          </button>
          <button
            onClick={() => setCurrentTab('settings')}
            className={`px-3 py-1 rounded-full whitespace-nowrap ${currentTab === 'settings' ? 'bg-rose-500 text-white font-bold' : 'text-stone-600 dark:text-stone-400'}`}
          >
            Settings
          </button>
          <button
            onClick={() => setCurrentTab('code')}
            className={`px-3 py-1 rounded-full whitespace-nowrap ${currentTab === 'code' ? 'bg-rose-500 text-white font-bold' : 'text-stone-600 dark:text-stone-400'}`}
          >
            Kotlin Code
          </button>
        </div>
      </div>
    </header>
  );
};
