import React, { useState, useEffect, useRef } from 'react';
import {
  Gamepad2,
  Camera,
  Image as ImageIcon,
  MessageSquare,
  Settings,
  Battery,
  Wifi,
  Signal,
  Sparkles,
  RefreshCw,
  Trophy,
  Play,
  Share2,
  Heart
} from 'lucide-react';
import { DrawingStroke } from '../types';

interface AndroidSimulatorProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  drawingCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  isRecording: boolean;
  showTouchIndicator: boolean;
}

export const AndroidSimulator: React.FC<AndroidSimulatorProps> = ({
  canvasRef,
  drawingCanvasRef,
  isRecording,
}) => {
  const [activeApp, setActiveApp] = useState<'game' | 'camera' | 'social' | 'gallery'>('game');
  const [gameScore, setGameScore] = useState(0);
  const [gameTarget, setGameTarget] = useState({ x: 150, y: 250, size: 40 });
  const [cameraFilter, setCameraFilter] = useState<'normal' | 'cyber' | 'warm'>('cyber');

  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);

  // Render loop to paint the simulated Android OS into the recording canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 0;

    const render = () => {
      frameCount++;
      const width = canvas.width;
      const height = canvas.height;

      // 1. Android Background (Material 3 Dark Wallpaper)
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#090d16');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle dynamic particle background
      for (let i = 0; i < 20; i++) {
        const px = (Math.sin(frameCount * 0.01 + i) * 0.5 + 0.5) * width;
        const py = (Math.cos(frameCount * 0.015 + i * 2) * 0.5 + 0.5) * height;
        ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
        ctx.beginPath();
        ctx.arc(px, py, 15 + (i % 10) * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Android Status Bar (top 44px)
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(0, 0, width, 44);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('12:45', 20, 28);
      ctx.fillText('5G  100%', width - 90, 28);

      // 3. Render Active App Content
      if (activeApp === 'game') {
        // Render 60 FPS Interactive Action Game
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(`🎮 Cyber Strike 2026`, 20, 90);

        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#a78bfa';
        ctx.fillText(`Score: ${gameScore} PTS • 60 FPS ULTRA`, 20, 115);

        // Animated Game Player Sphere
        const orbX = width / 2 + Math.sin(frameCount * 0.05) * 80;
        const orbY = height / 2 + Math.cos(frameCount * 0.04) * 120;

        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(orbX, orbY, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Target Bubble
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(gameTarget.x, gameTarget.y, gameTarget.size / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('TARGET', gameTarget.x - 22, gameTarget.y + 4);
      } else if (activeApp === 'camera') {
        // Camera Viewfinder Simulation
        ctx.fillStyle = '#111827';
        ctx.fillRect(20, 80, width - 40, height - 180);

        // Grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(width / 3, 80);
        ctx.lineTo(width / 3, height - 100);
        ctx.moveTo((width * 2) / 3, 80);
        ctx.lineTo((width * 2) / 3, height - 100);
        ctx.moveTo(20, height / 2);
        ctx.lineTo(width - 20, height / 2);
        ctx.stroke();

        // Focus reticle
        const fx = width / 2 + Math.sin(frameCount * 0.02) * 40;
        const fy = height / 2;
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.strokeRect(fx - 40, fy - 40, 80, 80);

        ctx.fillStyle = '#facc15';
        ctx.font = '12px monospace';
        ctx.fillText('4K HDR • 60FPS AI-AF', 30, 110);
      } else {
        // Social Feed / Gallery
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(20, 80, width - 40, 180);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('🔥 Trending Tech & Reels', 35, 115);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px sans-serif';
        ctx.fillText('Material 3 Screen Recording Demo', 35, 140);
        ctx.fillText('Smooth 60 FPS recording with zero frame drops.', 35, 160);

        ctx.fillStyle = '#334155';
        ctx.fillRect(20, 280, width - 40, 220);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('📸 High-Res Photo Gallery (Android 15)', 35, 315);
      }

      // 4. Android Gesture Navigation Bar at Bottom
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath();
      ctx.roundRect(width / 2 - 40, height - 16, 80, 4, [2]);
      ctx.fill();

      // 5. Composite Drawing Strokes if drawing canvas exists
      if (drawingCanvasRef && drawingCanvasRef.current) {
        ctx.drawImage(drawingCanvasRef.current, 0, 0, width, height);
      }

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [canvasRef, drawingCanvasRef, activeApp, gameScore, gameTarget]);

  // Interactive Target move
  const handleGameTargetClick = () => {
    setGameScore((s) => s + 100);
    setGameTarget({
      x: Math.floor(60 + Math.random() * 260),
      y: Math.floor(180 + Math.random() * 320),
      size: 40,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-white flex items-center space-x-2">
            <span>Android 15 Device Sandbox</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800">
              60 FPS Live
            </span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Interactive phone screen rendered in real-time. Test recording and observe that the floating popup is never recorded in the video.
          </p>
        </div>

        {/* App Switcher Tabs */}
        <div className="flex items-center space-x-1 p-1 bg-stone-200 dark:bg-stone-800 rounded-full mt-3 sm:mt-0">
          <button
            onClick={() => setActiveApp('game')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${
              activeApp === 'game'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Game</span>
          </button>

          <button
            onClick={() => setActiveApp('camera')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${
              activeApp === 'camera'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Camera</span>
          </button>

          <button
            onClick={() => setActiveApp('social')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${
              activeApp === 'social'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Social</span>
          </button>
        </div>
      </div>

      {/* ANDROID DEVICE FRAME CONTAINER */}
      <div className="flex flex-col items-center justify-center p-4 sm:p-8 bg-stone-100 dark:bg-stone-900/40 rounded-3xl border border-stone-200 dark:border-stone-800">
        {/* Device Bezel */}
        <div
          ref={containerRef}
          className="relative w-[360px] h-[640px] rounded-[48px] bg-stone-950 p-3 shadow-2xl border-4 border-stone-800 ring-8 ring-stone-900/50 overflow-hidden"
        >
          {/* Top Notch / Dynamic Island */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 rounded-full bg-black z-30 flex items-center justify-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-stone-900 border border-stone-700" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-900" />
          </div>

          {/* Screen Content Frame */}
          <div className="relative w-full h-full rounded-[38px] overflow-hidden bg-stone-950">
            {/* The Real Canvas Rendered Output */}
            <canvas
              ref={canvasRef}
              width={360}
              height={640}
              className="w-full h-full object-cover"
            />

            {/* Interactive Elements Overlay inside the Simulated App */}
            {activeApp === 'game' && (
              <div
                onClick={handleGameTargetClick}
                style={{
                  left: gameTarget.x - 20,
                  top: gameTarget.y - 20,
                  width: gameTarget.size,
                  height: gameTarget.size,
                }}
                className="absolute rounded-full cursor-pointer hover:scale-110 active:scale-95 transition-transform z-20"
                title="Tap Target to Score Points!"
              />
            )}
          </div>
        </div>

        {/* Action Controls & Simulator hints */}
        <div className="mt-4 flex items-center space-x-4 text-xs text-stone-500 dark:text-stone-400">
          <div className="flex items-center space-x-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Score: <strong>{gameScore}</strong> (Tap blue target on phone)</span>
          </div>
          <span>•</span>
          <button
            onClick={() => setGameScore(0)}
            className="flex items-center space-x-1 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Game</span>
          </button>
        </div>
      </div>
    </div>
  );
};
