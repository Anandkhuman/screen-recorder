import React, { useEffect, useState } from 'react';
import { Play, X, FastForward } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface CountdownModalProps {
  seconds: number;
  onFinish: () => void;
  onCancel: () => void;
}

export const CountdownModal: React.FC<CountdownModalProps> = ({
  seconds,
  onFinish,
  onCancel,
}) => {
  const [currentCount, setCurrentCount] = useState<number>(seconds);

  useEffect(() => {
    setCurrentCount(seconds);
  }, [seconds]);

  useEffect(() => {
    if (currentCount <= 0) {
      soundEffects.playStartChime();
      onFinish();
      return;
    }

    soundEffects.playCountdownTick();

    const timer = setTimeout(() => {
      setCurrentCount((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentCount, onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="flex flex-col items-center justify-center p-8 text-center max-w-sm w-full mx-4">
        {/* Animated Expanding Rings */}
        <div className="relative flex items-center justify-center w-40 h-40 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-rose-500/20 animate-ping opacity-60" />
          <div className="absolute inset-2 rounded-full border-2 border-rose-500/40 animate-pulse" />
          <div className="flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-rose-500 to-red-600 shadow-2xl shadow-rose-500/40 text-white font-extrabold text-6xl font-mono tracking-tighter">
            {currentCount > 0 ? currentCount : <Play className="w-12 h-12 fill-white animate-bounce" />}
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
          Recording starting...
        </h3>
        <p className="text-sm text-stone-400 mb-6">
          Controls will minimize to the floating overlay bubble.
        </p>

        {/* Action buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              soundEffects.playStartChime();
              onFinish();
            }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all active:scale-95"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Skip Timer</span>
          </button>

          <button
            onClick={onCancel}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-all active:scale-95"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
};
