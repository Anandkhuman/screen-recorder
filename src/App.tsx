import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { RecordingOverlay } from './components/RecordingOverlay';
import { DrawingCanvas } from './components/DrawingCanvas';
import { CountdownModal } from './components/CountdownModal';
import { RecordingsManager } from './components/RecordingsManager';
import { ConfigSettings } from './components/ConfigSettings';
import { BackgroundMusicModal } from './components/BackgroundMusicModal';
import { PermissionsModal } from './components/PermissionsModal';
import { AndroidCodeViewer } from './components/AndroidCodeViewer';

import {
  RecordingConfig,
  RecordingStatus,
  RecordedVideo,
  DrawingStroke,
  FloatingPosition,
  AndroidPermissionState,
} from './types';
import { ScreenRecorderEngine } from './utils/screenRecorder';
import { initializeSampleRecordings } from './utils/sampleVideoGenerator';
import { soundEffects } from './utils/soundEffects';
import confetti from 'canvas-confetti';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Tab navigation
  const [currentTab, setCurrentTab] = useState<'home' | 'recordings' | 'settings' | 'code'>('home');

  // Recording configuration
  const [config, setConfig] = useState<RecordingConfig>({
    videoQuality: '1080p',
    fps: 60,
    bitrate: 'auto',
    audioSource: 'mic_internal',
    orientation: 'auto',
    countdown: 3,
    showTouchIndicator: true,
    enableFloatingPopup: true,
    popupOpacity: 0.95,
    popupSize: 'medium',
    saveLocation: '/storage/emulated/0/Movies/ScreenRecorder',
    autoSave: true,
    bgMusicEnabled: false,
    bgMusicVolume: 0.4,
    bgMusicLoop: true,
    bgMusicTrackName: 'Lo-Fi Chill Lounge (80 BPM)',
    bgMusicDataUrl: null,
    micVolume: 1.0,
  });

  // Recording engine state
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [dataSizeBytes, setDataSizeBytes] = useState<number>(0);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [activeSourceMode, setActiveSourceMode] = useState<'display_media' | 'camera_media' | 'canvas_media'>('display_media');

  // Floating Popup position
  const [floatingPosition, setFloatingPosition] = useState<FloatingPosition>({
    x: 40,
    y: 120,
  });

  // Drawing state
  const [isDrawingActive, setIsDrawingActive] = useState<boolean>(false);
  const [brushColor, setBrushColor] = useState<string>('#EF4444');
  const [brushSize, setBrushSize] = useState<number>(8);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [isHighlighter, setIsHighlighter] = useState<boolean>(false);
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);

  // Recordings library (loads playable video samples)
  const [recordings, setRecordings] = useState<RecordedVideo[]>([]);

  // Modals
  const [musicModalOpen, setMusicModalOpen] = useState<boolean>(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState<boolean>(false);
  const [showCountdownModal, setShowCountdownModal] = useState<boolean>(false);

  // Android Permissions
  const [permissions, setPermissions] = useState<AndroidPermissionState>({
    screenCapture: true,
    microphone: true,
    overlayWindow: true,
    storage: true,
    notifications: true,
  });

  // Canvas Refs
  const liveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const recorderEngineRef = useRef<ScreenRecorderEngine | null>(null);

  // Load playable samples on initial mount
  useEffect(() => {
    initializeSampleRecordings().then((sampleVideos) => {
      setRecordings(sampleVideos);
    });
  }, []);

  // Toggle Dark Mode on HTML body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Initialize Recorder Engine
  useEffect(() => {
    recorderEngineRef.current = new ScreenRecorderEngine({
      onTimeUpdate: (secs) => setRecordingSeconds(secs),
      onStatusChange: (status) => {
        if (status === 'recording') setRecordingStatus('recording');
        else if (status === 'paused') setRecordingStatus('paused');
        else if (status === 'stopped') setRecordingStatus('idle');
      },
      onDataSizeUpdate: (bytes) => setDataSizeBytes(bytes),
    });
  }, []);

  // Strokes getter for composite canvas
  const getStrokesCallback = useCallback(() => strokes, [strokes]);

  // Start Recording Trigger
  const handleInitiateRecording = (sourceMode: 'display_media' | 'camera_media' | 'canvas_media') => {
    setActiveSourceMode(sourceMode);
    if (config.countdown > 0) {
      setShowCountdownModal(true);
    } else {
      executeStartRecording(sourceMode);
    }
  };

  const executeStartRecording = async (sourceMode: 'display_media' | 'camera_media' | 'canvas_media') => {
    setShowCountdownModal(false);
    if (!recorderEngineRef.current) return;

    const targetCanvas = sourceMode === 'canvas_media' ? (drawingCanvasRef.current || liveCanvasRef.current) : null;

    const success = await recorderEngineRef.current.startRecording(
      config,
      sourceMode,
      targetCanvas,
      getStrokesCallback
    );

    if (success) {
      setRecordingStatus('recording');
    }
  };

  // Pause
  const handlePauseRecording = () => {
    if (recorderEngineRef.current) {
      recorderEngineRef.current.pauseRecording();
      setRecordingStatus('paused');
    }
  };

  // Resume
  const handleResumeRecording = () => {
    if (recorderEngineRef.current) {
      recorderEngineRef.current.resumeRecording();
      setRecordingStatus('recording');
    }
  };

  // Stop Recording
  const handleStopRecording = async () => {
    if (!recorderEngineRef.current) return;
    setRecordingStatus('stopping');

    const recordedVideo = await recorderEngineRef.current.stopRecording(config);

    if (recordedVideo) {
      setRecordings((prev) => [recordedVideo, ...prev]);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
      setCurrentTab('recordings');
    }

    setRecordingStatus('idle');
    setRecordingSeconds(0);
    setDataSizeBytes(0);
    setIsDrawingActive(false);
    setStrokes([]);
  };

  // Toggle Microphone Mute
  const handleToggleMic = () => {
    if (!recorderEngineRef.current) return;
    const mixer = recorderEngineRef.current.getAudioMixer();
    if (isMicMuted) {
      mixer.setMicVolume(config.micVolume);
      setIsMicMuted(false);
    } else {
      mixer.setMicVolume(0);
      setIsMicMuted(true);
    }
  };

  // Take Screenshot
  const handleTakeScreenshot = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw background
        ctx.fillStyle = '#18181b';
        ctx.fillRect(0, 0, 1920, 1080);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText(`Screenshot_${new Date().toISOString().slice(0, 19)}`, 60, 100);

        if (drawingCanvasRef.current) {
          ctx.drawImage(drawingCanvasRef.current, 0, 0, 1920, 1080);
        }

        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `Screenshot_${Date.now()}.png`;
        a.click();
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
      }
    } catch (e) {
      console.warn('Screenshot capture failed:', e);
    }
  };

  // Undo Drawing Stroke
  const handleUndoDrawing = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  // Clear All Drawings
  const handleClearDrawing = () => {
    setStrokes([]);
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-colors duration-200 flex flex-col relative overflow-x-hidden">
      {/* Hidden fallback canvas */}
      <canvas ref={liveCanvasRef} className="hidden" width={1920} height={1080} />

      {/* Top App Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        recordingStatus={recordingStatus}
        recordingSeconds={recordingSeconds}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        permissions={permissions}
        onOpenPermissions={() => setPermissionsModalOpen(true)}
        recordingsCount={recordings.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentTab === 'home' && (
          <HomeScreen
            config={config}
            setConfig={setConfig}
            recordingStatus={recordingStatus}
            recordingSeconds={recordingSeconds}
            onStartRecording={handleInitiateRecording}
            onStopRecording={handleStopRecording}
            onOpenMusicModal={() => setMusicModalOpen(true)}
            activeSourceMode={activeSourceMode}
            setActiveSourceMode={setActiveSourceMode}
          />
        )}

        {currentTab === 'recordings' && (
          <RecordingsManager
            recordings={recordings}
            setRecordings={setRecordings}
          />
        )}

        {currentTab === 'settings' && (
          <ConfigSettings
            config={config}
            setConfig={setConfig}
          />
        )}

        {currentTab === 'code' && <AndroidCodeViewer />}
      </main>

      {/* OVERLAID DRAWING CANVAS (Transparent full-screen layer for drawing during recording) */}
      <DrawingCanvas
        canvasRef={drawingCanvasRef}
        isDrawingActive={isDrawingActive}
        brushColor={brushColor}
        brushSize={brushSize}
        isEraser={isEraser}
        isHighlighter={isHighlighter}
        showTouchIndicator={config.showTouchIndicator}
        strokes={strokes}
        setStrokes={setStrokes}
        containerClassName="fixed inset-0 pointer-events-none"
      />

      {/* ⭐ FLOATING POPUP CONTROLS (OVERLAY) */}
      {config.enableFloatingPopup && (
        <RecordingOverlay
          status={recordingStatus}
          recordingSeconds={recordingSeconds}
          dataSizeBytes={dataSizeBytes}
          onPause={handlePauseRecording}
          onResume={handleResumeRecording}
          onStop={handleStopRecording}
          isMicMuted={isMicMuted}
          onToggleMic={handleToggleMic}
          isDrawingActive={isDrawingActive}
          setIsDrawingActive={setIsDrawingActive}
          brushColor={brushColor}
          setBrushColor={setBrushColor}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          isEraser={isEraser}
          setIsEraser={setIsEraser}
          isHighlighter={isHighlighter}
          setIsHighlighter={setIsHighlighter}
          onUndoDrawing={handleUndoDrawing}
          onClearDrawing={handleClearDrawing}
          onTakeScreenshot={handleTakeScreenshot}
          bgMusicVolume={config.bgMusicVolume}
          setBgMusicVolume={(vol) => setConfig((prev) => ({ ...prev, bgMusicVolume: vol }))}
          hasBgMusic={config.bgMusicEnabled}
          opacity={config.popupOpacity}
          position={floatingPosition}
          setPosition={setFloatingPosition}
        />
      )}

      {/* Countdown Modal */}
      {showCountdownModal && (
        <CountdownModal
          seconds={config.countdown}
          onFinish={() => executeStartRecording(activeSourceMode)}
          onCancel={() => setShowCountdownModal(false)}
        />
      )}

      {/* Background Music Mixer Modal */}
      <BackgroundMusicModal
        isOpen={musicModalOpen}
        onClose={() => setMusicModalOpen(false)}
        config={config}
        setConfig={setConfig}
      />

      {/* Android Permissions Modal */}
      <PermissionsModal
        isOpen={permissionsModalOpen}
        onClose={() => setPermissionsModalOpen(false)}
        permissions={permissions}
        setPermissions={setPermissions}
      />
    </div>
  );
}
