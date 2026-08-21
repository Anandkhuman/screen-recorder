import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  FileCode,
  Sparkles,
  Shield,
  Layers,
  Zap,
  Info,
  Terminal,
  Cpu
} from 'lucide-react';
import { ANDROID_KOTLIN_FILES } from '../data/androidKotlinCode';

export const AndroidCodeViewer: React.FC = () => {
  const [activeFileId, setActiveFileId] = useState<string>(ANDROID_KOTLIN_FILES[0].id);
  const [copied, setCopied] = useState<boolean>(false);

  const currentFile = ANDROID_KOTLIN_FILES.find((f) => f.id === activeFileId) || ANDROID_KOTLIN_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-white flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-emerald-500" />
            <span>Android Native Architecture & Kotlin Codebase</span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Production-ready Kotlin services for MediaProjection, Foreground Services & Overlay Controls
          </p>
        </div>

        <div className="flex items-center space-x-2 mt-3 sm:mt-0">
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
            Android 10 - 15 Ready
          </span>
        </div>
      </div>

      {/* ⭐ EXPLAINER CARD: How Floating Controls are Excluded from Video */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 text-white border border-stone-800 shadow-xl space-y-3">
        <div className="flex items-center space-x-2 text-emerald-400">
          <Shield className="w-4 h-4" />
          <h4 className="text-sm font-bold tracking-tight">
            How Floating Controls are 100% Excluded from Screen Recordings in Android
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-300">
          <div className="p-3.5 rounded-2xl bg-stone-800/60 border border-stone-700/60 space-y-1">
            <div className="font-bold text-white flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>1. SYSTEM_ALERT_WINDOW Isolation</span>
            </div>
            <p className="text-stone-400 leading-relaxed">
              Floating bubbles attach via <code className="text-amber-300">WindowManager</code> with <code className="text-amber-300">TYPE_APPLICATION_OVERLAY</code> and <code className="text-amber-300">FLAG_NOT_FOCUSABLE</code>, rendering on a separate SurfaceFlinger z-layer.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-800/60 border border-stone-700/60 space-y-1">
            <div className="font-bold text-white flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>2. VirtualDisplay MediaPipe</span>
            </div>
            <p className="text-stone-400 leading-relaxed">
              <code className="text-emerald-300">MediaProjection.createVirtualDisplay()</code> directly binds to the <code className="text-emerald-300">MediaRecorder</code> input surface, mirroring only the display viewport.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-800/60 border border-stone-700/60 space-y-1">
            <div className="font-bold text-white flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>3. Drawing Compositing</span>
            </div>
            <p className="text-stone-400 leading-relaxed">
              Real-time brush strokes are drawn on a transparent View overlay and piped to the recording Surface, while floating action buttons remain unmapped in the video canvas.
            </p>
          </div>
        </div>
      </div>

      {/* Code Editor Studio */}
      <div className="rounded-3xl border border-stone-800 bg-stone-950 overflow-hidden shadow-2xl">
        {/* Tab Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-stone-900 border-b border-stone-800 overflow-x-auto">
          <div className="flex items-center space-x-1">
            {ANDROID_KOTLIN_FILES.map((file) => (
              <button
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
                  activeFileId === file.id
                    ? 'bg-stone-800 text-white font-bold shadow-xs'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>{file.name}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-all ml-2"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 bg-stone-950 overflow-x-auto text-xs font-mono text-stone-300 max-h-[520px] overflow-y-auto leading-relaxed">
          <pre>
            <code>{currentFile.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
