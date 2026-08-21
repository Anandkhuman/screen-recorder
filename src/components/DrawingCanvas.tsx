import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DrawingStroke, DrawingPoint } from '../types';

interface TouchRipple {
  id: number;
  x: number;
  y: number;
  createdAt: number;
}

interface DrawingCanvasProps {
  isDrawingActive: boolean;
  brushColor: string;
  brushSize: number;
  isEraser: boolean;
  isHighlighter: boolean;
  showTouchIndicator: boolean;
  strokes: DrawingStroke[];
  setStrokes: React.Dispatch<React.SetStateAction<DrawingStroke[]>>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerClassName?: string;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  isDrawingActive,
  brushColor,
  brushSize,
  isEraser,
  isHighlighter,
  showTouchIndicator,
  strokes,
  setStrokes,
  canvasRef,
  containerClassName = '',
}) => {
  const [currentStroke, setCurrentStroke] = useState<DrawingPoint[] | null>(null);
  const [touchRipples, setTouchRipples] = useState<TouchRipple[]>([]);
  const isPointerDownRef = useRef(false);

  // Redraw canvas whenever strokes or currentStroke change
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear whole canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Helper to draw a single stroke
    const drawStroke = (stroke: DrawingStroke) => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length; i++) {
        const p1 = stroke.points[i - 1];
        const p2 = stroke.points[i];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
      }

      ctx.lineTo(stroke.points[stroke.points.length - 1].x, stroke.points[stroke.points.length - 1].y);

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = stroke.size;

      if (stroke.isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        if (stroke.isHighlighter) {
          ctx.strokeStyle = stroke.color;
          ctx.globalAlpha = 0.45;
        } else {
          ctx.strokeStyle = stroke.color;
          ctx.globalAlpha = 1.0;
        }
      }

      ctx.stroke();
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';
    };

    // Draw all completed strokes
    strokes.forEach(drawStroke);

    // Draw active stroke in progress
    if (currentStroke && currentStroke.length > 1) {
      drawStroke({
        id: 'active_stroke',
        points: currentStroke,
        color: brushColor,
        size: brushSize,
        isEraser,
        isHighlighter,
      });
    }
  }, [strokes, currentStroke, brushColor, brushSize, isEraser, isHighlighter, canvasRef]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Adjust canvas size to match container element
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        if (canvas.width !== rect.width || canvas.height !== rect.height) {
          canvas.width = rect.width;
          canvas.height = rect.height;
          redrawCanvas();
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasRef, redrawCanvas]);

  // Handle pointer down (drawing or touch ripple)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Show touch ripple if touch indicator is enabled
    if (showTouchIndicator) {
      const newRipple: TouchRipple = {
        id: Date.now() + Math.random(),
        x,
        y,
        createdAt: Date.now(),
      };
      setTouchRipples((prev) => [...prev.slice(-6), newRipple]);
    }

    if (!isDrawingActive) return;

    isPointerDownRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setCurrentStroke([{ x, y, pressure: e.pressure || 0.5 }]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingActive || !isPointerDownRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentStroke((prev) => {
      if (!prev) return [{ x, y }];
      return [...prev, { x, y, pressure: e.pressure || 0.5 }];
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingActive || !isPointerDownRef.current) return;
    isPointerDownRef.current = false;

    if (currentStroke && currentStroke.length > 0) {
      const newStrokeItem: DrawingStroke = {
        id: 'stroke_' + Date.now(),
        points: currentStroke,
        color: brushColor,
        size: brushSize,
        isEraser,
        isHighlighter,
      };
      setStrokes((prev) => [...prev, newStrokeItem]);
    }

    setCurrentStroke(null);
  };

  // Clean up old touch ripples after animation
  useEffect(() => {
    if (touchRipples.length === 0) return;
    const timeout = setTimeout(() => {
      const now = Date.now();
      setTouchRipples((prev) => prev.filter((r) => now - r.createdAt < 600));
    }, 200);
    return () => clearTimeout(timeout);
  }, [touchRipples]);

  return (
    <div className={`relative ${containerClassName}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`absolute inset-0 w-full h-full ${
          isDrawingActive ? 'cursor-crosshair pointer-events-auto touch-none' : 'pointer-events-none'
        }`}
        style={{ zIndex: 20 }}
      />

      {/* Touch Indicator Ripples (Visualized in DOM on top) */}
      {showTouchIndicator &&
        touchRipples.map((ripple) => (
          <div
            key={ripple.id}
            className="absolute pointer-events-none rounded-full border-2 border-white/80 bg-rose-500/30 animate-ping"
            style={{
              left: ripple.x - 20,
              top: ripple.y - 20,
              width: 40,
              height: 40,
              zIndex: 30,
              animationDuration: '0.6s',
            }}
          />
        ))}
    </div>
  );
};
