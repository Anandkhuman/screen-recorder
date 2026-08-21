import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Square,
  Mic,
  MicOff,
  PenTool,
  Eraser,
  Undo,
  Trash2,
  X,
  Sparkles,
  Camera,
  Volume2,
  Move,
  ChevronRight,
  Highlighter,
  Sliders,
  Check,
  EyeOff
} from 'lucide-react';
import { RecordingStatus, FloatingPosition } from '../types';
import { soundEffects } from '../utils/soundEffects';

interface RecordingOverlayProps {
  status: RecordingStatus;
  recordingSeconds: number;
  dataSizeBytes: number;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  isMicMuted: boolean;
  onToggleMic: () => void;
  // Drawing props
  isDrawingActive: boolean;
  setIsDrawingActive: (active: boolean) => void;
  brushColor: string;
  setBrushColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  isEraser: boolean;
  setIsEraser: (eraser: boolean) => void;
  isHighlighter: boolean;
  setIsHighlighter: (hl: boolean) => void;
  onUndoDrawing: () => void;
  onClearDrawing: () => void;
  onTakeScreenshot?: () => void;
  bgMusicVolume: number;
  setBgMusicVolume: (vol: number) => void;
  hasBgMusic: boolean;
  opacity: number; // 0.2 to 1.0
  position: FloatingPosition;
  setPosition: React.Dispatch<React.SetStateAction<FloatingPosition>>;
}

const COLOR_PRESETS = [
  { name: 'Neon Red', hex: '#EF4444' },
  { name: 'Electric Yellow', hex: '#FACC15' },
  { name: 'Cyan Blue', hex: '#06B6D4' },
  { name: 'Emerald Green', hex: '#10B981' },
  { name: 'Vibrant Purple', hex: '#8B5CF6' },
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Deep Black', hex: '#18181B' },
];

export const RecordingOverlay: React.FC<RecordingOverlayProps> = ({
  status,
  recordingSeconds,
  dataSizeBytes,
  onPause,
  onResume,
  onStop,
  isMicMuted,
  onToggleMic,
  isDrawingActive,
  setIsDrawingActive,
  brushColor,
  setBrushColor,
  brushSize,
  setBrushSize,
  isEraser,
  setIsEraser,
  isHighlighter,
  setIsHighlighter,
  onUndoDrawing,
  onClearDrawing,
  onTakeScreenshot,
  bgMusicVolume,
  setBgMusicVolume,
  hasBgMusic,
  opacity,
  position,
  setPosition,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showColorPalette, setShowColorPalette] = useState<boolean>(false);
  const [showAudioControls, setShowAudioControls] = useState<boolean>(false);

  const dragRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number }>({
    x: 0,
    y: 0,
    posX: 0,
    posY: 0,
  });

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Drag logic with pointer events
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag from handle or bubble header
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    const newX = Math.max(10, Math.min(window.innerWidth - 80, dragStartRef.current.posX + dx));
    const newY = Math.max(10, Math.min(window.innerHeight - 80, dragStartRef.current.posY + dy));

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      // Optional subtle snap to nearest edge if close
      if (position.x < 60) {
        setPosition((prev) => ({ ...prev, x: 20 }));
      } else if (position.x > window.innerWidth - 300) {
        setPosition((prev) => ({ ...prev, x: window.innerWidth - (isExpanded ? 340 : 180) }));
      }
    }
  };

  if (status === 'idle' || status === 'countdown') return null;

  return (
    <div
      ref={dragRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        opacity: Math.max(0.3, opacity),
        zIndex: 9999,
      }}
      className="fixed top-0 left-0 transition-opacity duration-150 select-none touch-none filter drop-shadow-2xl"
    >
      {/* Floating Widget Container */}
      {!isExpanded ? (
        /* COLLAPSED FLOATING BUBBLE PILL */
        <div
          onClick={(e) => {
            e.stopPropagation();
            soundEffects.playTap();
            setIsExpanded(true);
          }}
          className="flex items-center space-x-2.5 px-3.5 py-2 bg-stone-900/90 text-white rounded-full border border-rose-500/40 shadow-xl backdrop-blur-lg hover:scale-105 cursor-pointer active:scale-95 transition-all group"
        >
          <div className="relative flex items-center justify-center">
            {status === 'recording' ? (
              <span className="flex h-3.5 w-3.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
              </span>
            ) : (
              <span className="h-3.5 w-3.5 rounded-full bg-amber-400 inline-block" />
            )}
          </div>

          <span className="text-xs font-mono font-bold tracking-wider text-rose-300">
            {formatTime(recordingSeconds)}
          </span>

          <Move className="w-3.5 h-3.5 text-stone-400 group-hover:text-white" />
        </div>
      ) : (
        /* EXPANDED MATERIAL 3 FLOATING OVERLAY DIALOG */
        <div
          className="flex flex-col w-80 bg-stone-950/95 text-stone-100 rounded-3xl border border-stone-700/80 shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar with Drag Handle & Live Stats */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-stone-900/90 border-b border-stone-800 cursor-move">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                {status === 'recording' ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
                )}
              </span>
              <span className="text-xs font-mono font-bold text-rose-400">
                {formatTime(recordingSeconds)}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                {formatSize(dataSizeBytes)}
              </span>
            </div>

            {/* Invisible Guarantee Tag */}
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-stone-800 text-[10px] text-emerald-400 font-medium">
              <EyeOff className="w-2.5 h-2.5" />
              <span>Not in Video</span>
            </div>

            {/* Minimize button */}
            <button
              onClick={() => {
                soundEffects.playTap();
                setIsExpanded(false);
              }}
              className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              title="Minimize to Bubble"
            >
              <ChevronRight className="w-4 h-4 rotate-90" />
            </button>
          </div>

          {/* Core Recording Controls Row */}
          <div className="grid grid-cols-4 gap-1.5 p-3 bg-stone-950/60">
            {/* Pause / Resume Button */}
            {status === 'recording' ? (
              <button
                onClick={() => {
                  soundEffects.playTap();
                  onPause();
                }}
                className="flex flex-col items-center justify-center p-2 rounded-2xl bg-stone-800 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 transition-all active:scale-95 group"
                title="Pause Recording"
              >
                <div className="p-2 rounded-full bg-amber-500/20 group-hover:bg-amber-500/30 mb-1">
                  <Pause className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-[10px] font-semibold">Pause</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  soundEffects.playTap();
                  onResume();
                }}
                className="flex flex-col items-center justify-center p-2 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 transition-all active:scale-95 group"
                title="Resume Recording"
              >
                <div className="p-2 rounded-full bg-emerald-500/20 group-hover:bg-emerald-500/30 mb-1">
                  <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                </div>
                <span className="text-[10px] font-semibold">Resume</span>
              </button>
            )}

            {/* Stop & Save Button */}
            <button
              onClick={() => {
                soundEffects.playStopSound();
                onStop();
              }}
              className="flex flex-col items-center justify-center p-2 rounded-2xl bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 transition-all active:scale-95 group"
              title="Stop & Save Recording"
            >
              <div className="p-2 rounded-full bg-rose-600 group-hover:bg-rose-500 text-white mb-1 shadow-md shadow-rose-600/30">
                <Square className="w-4 h-4 fill-white" />
              </div>
              <span className="text-[10px] font-semibold">Stop</span>
            </button>

            {/* Microphone Toggle */}
            <button
              onClick={() => {
                soundEffects.playTap();
                onToggleMic();
              }}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all active:scale-95 group ${
                isMicMuted
                  ? 'bg-stone-800/80 text-stone-400 hover:text-stone-200'
                  : 'bg-stone-800 hover:bg-blue-500/20 text-blue-300'
              }`}
              title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              <div
                className={`p-2 rounded-full mb-1 ${
                  isMicMuted ? 'bg-stone-700' : 'bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30'
                }`}
              >
                {isMicMuted ? <MicOff className="w-4 h-4 text-stone-400" /> : <Mic className="w-4 h-4" />}
              </div>
              <span className="text-[10px] font-semibold">{isMicMuted ? 'Mic Off' : 'Mic On'}</span>
            </button>

            {/* Draw Pen Toggle */}
            <button
              onClick={() => {
                soundEffects.playTap();
                setIsDrawingActive(!isDrawingActive);
              }}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all active:scale-95 group ${
                isDrawingActive
                  ? 'bg-purple-950/80 text-purple-200 border border-purple-500/50'
                  : 'bg-stone-800 hover:bg-purple-500/20 text-purple-300'
              }`}
              title="Draw on Screen"
            >
              <div
                className={`p-2 rounded-full mb-1 ${
                  isDrawingActive ? 'bg-purple-600 text-white' : 'bg-purple-500/20 text-purple-400'
                }`}
              >
                <PenTool className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold">{isDrawingActive ? 'Drawing' : 'Draw'}</span>
            </button>
          </div>

          {/* Quick Tools Row (Screenshot, BG Music, Color Palette toggle) */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-stone-900/50 border-t border-stone-800/80 text-xs">
            <div className="flex items-center space-x-1">
              {onTakeScreenshot && (
                <button
                  onClick={() => {
                    soundEffects.playTap();
                    onTakeScreenshot();
                  }}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] transition-colors"
                  title="Take Screenshot"
                >
                  <Camera className="w-3 h-3 text-cyan-400" />
                  <span>Snapshot</span>
                </button>
              )}

              {hasBgMusic && (
                <button
                  onClick={() => setShowAudioControls(!showAudioControls)}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[11px] transition-colors ${
                    showAudioControls ? 'bg-indigo-900/60 text-indigo-300' : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                  }`}
                >
                  <Volume2 className="w-3 h-3 text-indigo-400" />
                  <span>Music {Math.round(bgMusicVolume * 100)}%</span>
                </button>
              )}
            </div>

            {isDrawingActive && (
              <button
                onClick={() => setShowColorPalette(!showColorPalette)}
                className="flex items-center space-x-1 px-2 py-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-[11px] text-stone-300"
              >
                <span className="w-3 h-3 rounded-full border border-white/40" style={{ backgroundColor: brushColor }} />
                <span>Colors</span>
              </button>
            )}
          </div>

          {/* Audio Quick Adjust Drawer if opened */}
          {showAudioControls && hasBgMusic && (
            <div className="px-3 py-2 bg-stone-900/90 border-t border-stone-800 animate-in fade-in duration-100">
              <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                <span>Background Music Volume</span>
                <span className="text-white font-bold">{Math.round(bgMusicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={bgMusicVolume}
                onChange={(e) => setBgMusicVolume(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          )}

          {/* DRAWING TOOLBAR EXPANSION (When Drawing Mode is Active) */}
          {isDrawingActive && (
            <div className="p-3 bg-stone-900 border-t border-stone-800 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Drawing Tool Modes (Pen, Highlighter, Eraser, Undo, Clear) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {/* Pen Mode */}
                  <button
                    onClick={() => {
                      setIsEraser(false);
                      setIsHighlighter(false);
                    }}
                    className={`p-1.5 rounded-xl transition-colors ${
                      !isEraser && !isHighlighter
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-stone-800 text-stone-400 hover:text-white'
                    }`}
                    title="Pen"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                  </button>

                  {/* Highlighter Mode */}
                  <button
                    onClick={() => {
                      setIsEraser(false);
                      setIsHighlighter(true);
                    }}
                    className={`p-1.5 rounded-xl transition-colors ${
                      isHighlighter
                        ? 'bg-amber-500 text-stone-950 font-bold'
                        : 'bg-stone-800 text-stone-400 hover:text-white'
                    }`}
                    title="Highlighter"
                  >
                    <Highlighter className="w-3.5 h-3.5" />
                  </button>

                  {/* Eraser Mode */}
                  <button
                    onClick={() => {
                      setIsEraser(true);
                      setIsHighlighter(false);
                    }}
                    className={`p-1.5 rounded-xl transition-colors ${
                      isEraser ? 'bg-sky-600 text-white' : 'bg-stone-800 text-stone-400 hover:text-white'
                    }`}
                    title="Eraser"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Undo & Clear */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={onUndoDrawing}
                    className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                    title="Undo stroke"
                  >
                    <Undo className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onClearDrawing}
                    className="p-1.5 rounded-xl bg-stone-800 hover:bg-rose-950 text-rose-400 transition-colors"
                    title="Clear all drawings"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsDrawingActive(false)}
                    className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white"
                    title="Close Drawing Toolbar"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Color Presets Palette */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-1.5">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => {
                        setBrushColor(c.hex);
                        setIsEraser(false);
                      }}
                      className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-125 flex items-center justify-center"
                      style={{
                        backgroundColor: c.hex,
                        borderColor: brushColor === c.hex && !isEraser ? '#FFFFFF' : 'transparent',
                      }}
                      title={c.name}
                    >
                      {brushColor === c.hex && !isEraser && (
                        <Check className={`w-2.5 h-2.5 ${c.hex === '#FFFFFF' || c.hex === '#FACC15' ? 'text-black' : 'text-white'}`} />
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Color Input */}
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => {
                    setBrushColor(e.target.value);
                    setIsEraser(false);
                  }}
                  className="w-6 h-6 rounded-lg bg-transparent cursor-pointer border border-stone-600"
                  title="Pick custom color"
                />
              </div>

              {/* Brush Thickness Slider */}
              <div className="flex items-center space-x-2 pt-1">
                <span className="text-[10px] text-stone-400 whitespace-nowrap">Size ({brushSize}px)</span>
                <input
                  type="range"
                  min="2"
                  max="36"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
