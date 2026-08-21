import React from 'react';
import {
  ShieldCheck,
  Video,
  Mic,
  Layers,
  HardDrive,
  Bell,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles
} from 'lucide-react';
import { AndroidPermissionState } from '../types';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  permissions: AndroidPermissionState;
  setPermissions: React.Dispatch<React.SetStateAction<AndroidPermissionState>>;
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({
  isOpen,
  onClose,
  permissions,
  setPermissions,
}) => {
  if (!isOpen) return null;

  const togglePermission = (key: keyof AndroidPermissionState) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const grantAll = () => {
    setPermissions({
      screenCapture: true,
      microphone: true,
      overlayWindow: true,
      storage: true,
      notifications: true,
    });
  };

  const PERMISSION_ITEMS: {
    key: keyof AndroidPermissionState;
    title: string;
    androidName: string;
    icon: typeof Video;
    desc: string;
  }[] = [
    {
      key: 'screenCapture',
      title: 'Screen Capture',
      androidName: 'MediaProjection API (Android 10 - 15)',
      icon: Video,
      desc: 'Required to capture phone screen display in high definition (480p to 2K)',
    },
    {
      key: 'microphone',
      title: 'Microphone & Audio',
      androidName: 'RECORD_AUDIO & AudioPlaybackCapture',
      icon: Mic,
      desc: 'Enables voice commentary, gaming sounds, and background music mixing',
    },
    {
      key: 'overlayWindow',
      title: 'Display Over Other Apps',
      androidName: 'SYSTEM_ALERT_WINDOW (Floating Popup)',
      icon: Layers,
      desc: 'Renders the movable floating bubble controls while remaining hidden from video',
    },
    {
      key: 'storage',
      title: 'Photos & Videos Storage',
      androidName: 'READ_MEDIA_VIDEO / MediaStore',
      icon: HardDrive,
      desc: 'Allows saving MP4 recordings directly into the device Movies directory',
    },
    {
      key: 'notifications',
      title: 'Foreground Service Notifications',
      androidName: 'POST_NOTIFICATIONS (Android 13+)',
      icon: Bell,
      desc: 'Prevents the Android OS from killing the recording service in the background',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800/80 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                Android & System Permissions
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                MediaProjection, Overlay Window & Audio Access
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

        {/* Permission List */}
        <div className="space-y-2.5">
          {PERMISSION_ITEMS.map((item) => {
            const Icon = item.icon;
            const isGranted = permissions[item.key];
            return (
              <div
                key={item.key}
                onClick={() => togglePermission(item.key)}
                className={`flex items-start justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  isGranted
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                    : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700/60'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`p-2 rounded-xl mt-0.5 ${
                      isGranted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-stone-200 dark:bg-stone-700 text-stone-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-stone-900 dark:text-white">
                        {item.title}
                      </span>
                      {isGranted ? (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Granted</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center space-x-0.5">
                          <AlertCircle className="w-3 h-3" />
                          <span>Tap to Allow</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-stone-400 mt-0.5">
                      {item.androidName}
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                      {item.desc}
                    </div>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    isGranted
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-stone-400 dark:border-stone-600'
                  }`}
                >
                  {isGranted && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={grantAll}
            className="px-4 py-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 text-xs font-bold transition-colors"
          >
            Grant All Permissions
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
