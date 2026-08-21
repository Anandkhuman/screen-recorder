import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  Download,
  Share2,
  Trash2,
  Edit2,
  Check,
  X,
  Volume2,
  Maximize,
  Clock,
  HardDrive,
  Film,
  Sparkles,
  Scissors,
  CheckCircle2,
  Layers,
  Music
} from 'lucide-react';
import { RecordedVideo } from '../types';
import confetti from 'canvas-confetti';

interface RecordingsManagerProps {
  recordings: RecordedVideo[];
  setRecordings: React.Dispatch<React.SetStateAction<RecordedVideo[]>>;
}

export const RecordingsManager: React.FC<RecordingsManagerProps> = ({
  recordings,
  setRecordings,
}) => {
  const [selectedVideo, setSelectedVideo] = useState<RecordedVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [trimModalOpen, setTrimModalOpen] = useState<boolean>(false);
  const [trimRange, setTrimRange] = useState<{ start: number; end: number }>({ start: 0, end: 10 });

  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalStorageBytes = recordings.reduce((acc, r) => acc + r.fileSizeBytes, 0);

  const handlePlayVideo = (rec: RecordedVideo) => {
    setSelectedVideo(rec);
    setIsPlaying(true);
    setCurrentTime(0);
  };

  const handleDownload = (rec: RecordedVideo) => {
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      const a = document.createElement('a');
      a.href = rec.blobUrl || rec.thumbnailUrl;
      a.download = `${rec.title}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('Download error:', e);
    }
  };

  const handleShare = async (rec: RecordedVideo) => {
    if (navigator.share && rec.blobUrl) {
      try {
        const file = new File([rec.blob], `${rec.title}.mp4`, { type: 'video/mp4' });
        await navigator.share({
          title: rec.title,
          text: `Screen Recording (${rec.quality}, ${rec.fps} FPS)`,
          files: [file],
        });
      } catch (err) {
        console.log('Share canceled or failed:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this screen recording?')) {
      setRecordings((prev) => prev.filter((r) => r.id !== id));
      if (selectedVideo?.id === id) {
        setSelectedVideo(null);
      }
    }
  };

  const handleSaveRename = (id: string) => {
    if (!editTitle.trim()) return;
    setRecordings((prev) =>
      prev.map((r) => (r.id === id ? { ...r, title: editTitle.trim() } : r))
    );
    if (selectedVideo?.id === id) {
      setSelectedVideo((prev) => (prev ? { ...prev, title: editTitle.trim() } : null));
    }
    setEditingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Storage Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-white flex items-center space-x-2">
            <Film className="w-5 h-5 text-rose-500" />
            <span>Screen Recordings Manager</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold border border-rose-200 dark:border-rose-800">
              {recordings.length} Videos
            </span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Play, rename, trim, export MP4, and share your screen captures
          </p>
        </div>

        <div className="flex items-center space-x-3 mt-3 sm:mt-0 p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
          <HardDrive className="w-4 h-4 text-stone-400" />
          <div className="text-xs">
            <span className="text-stone-500">Storage Used: </span>
            <strong className="text-stone-900 dark:text-white font-mono">
              {formatSize(totalStorageBytes)}
            </strong>
          </div>
        </div>
      </div>

      {/* Recordings Grid / Empty State */}
      {recordings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-stone-50 dark:bg-stone-900/40 rounded-3xl border border-stone-200 dark:border-stone-800 text-center">
          <Film className="w-12 h-12 text-stone-300 dark:text-stone-700 mb-3" />
          <h3 className="text-base font-bold text-stone-700 dark:text-stone-300">
            No Recordings Yet
          </h3>
          <p className="text-xs text-stone-400 max-w-sm mt-1">
            Tap "Start Recording" from the Recorder tab to capture your screen with floating controls.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recordings.map((rec) => (
            <div
              key={rec.id}
              className="group flex flex-col bg-white dark:bg-stone-900/70 border border-stone-200/90 dark:border-stone-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200"
            >
              {/* Thumbnail Container */}
              <div
                onClick={() => handlePlayVideo(rec)}
                className="relative aspect-video bg-stone-950 overflow-hidden cursor-pointer flex items-center justify-center group-hover:opacity-95"
              >
                {rec.thumbnailUrl ? (
                  <img
                    src={rec.thumbnailUrl}
                    alt={rec.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-stone-900 text-stone-700">
                    <Film className="w-10 h-10" />
                  </div>
                )}

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-3 rounded-full bg-rose-600 text-white shadow-lg">
                    <Play className="w-6 h-6 fill-white" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/75 backdrop-blur-xs text-white text-[11px] font-mono font-bold flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-rose-400" />
                  <span>{formatTime(rec.durationSeconds)}</span>
                </div>

                {/* Resolution & FPS Badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold">
                  {rec.quality} • {rec.fps} FPS
                </div>

                {rec.hasBackgroundMusic && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-indigo-600/90 text-white text-[10px] font-semibold flex items-center space-x-1">
                    <Music className="w-2.5 h-2.5" />
                    <span>Music</span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                {/* Title & Edit */}
                <div>
                  {editingId === rec.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full text-xs font-semibold px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveRename(rec.id)}
                        className="p-1 rounded-md bg-emerald-600 text-white"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 rounded-md bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <h4
                        className="text-xs font-bold text-stone-900 dark:text-white truncate pr-2"
                        title={rec.title}
                      >
                        {rec.title}
                      </h4>
                      <button
                        onClick={() => {
                          setEditingId(rec.id);
                          setEditTitle(rec.title);
                        }}
                        className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
                        title="Rename"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                    <span>{formatSize(rec.fileSizeBytes)}</span>
                    <span>•</span>
                    <span>{new Date(rec.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800/80 text-xs">
                  <button
                    onClick={() => handlePlayVideo(rec)}
                    className="flex items-center space-x-1 text-rose-600 dark:text-rose-400 font-bold hover:underline"
                  >
                    <Play className="w-3.5 h-3.5 fill-rose-600 dark:fill-rose-400" />
                    <span>Watch</span>
                  </button>

                  <div className="flex items-center space-x-1 text-stone-500">
                    <button
                      onClick={() => handleShare(rec)}
                      className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                      title="Share Recording"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDownload(rec)}
                      className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-indigo-600 dark:text-indigo-400 transition-colors"
                      title="Export as MP4"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(rec.id)}
                      className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RICH MATERIAL 3 VIDEO PLAYER MODAL */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-stone-950 rounded-3xl border border-stone-800 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-stone-900 border-b border-stone-800">
              <div className="flex items-center space-x-2 truncate">
                <Film className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-white truncate">
                  {selectedVideo.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedVideo(null);
                  setIsPlaying(false);
                }}
                className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Canvas / Element */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {selectedVideo.blobUrl ? (
                <video
                  ref={videoPlayerRef}
                  src={selectedVideo.blobUrl}
                  controls={false}
                  autoPlay
                  onTimeUpdate={() => {
                    if (videoPlayerRef.current) {
                      setCurrentTime(videoPlayerRef.current.currentTime);
                      setDuration(videoPlayerRef.current.duration || selectedVideo.durationSeconds);
                    }
                  }}
                  onEnded={() => setIsPlaying(false)}
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={selectedVideo.thumbnailUrl}
                  alt={selectedVideo.title}
                  className="w-full h-full object-contain opacity-80"
                />
              )}
            </div>

            {/* Video Controls Bar */}
            <div className="p-4 bg-stone-900/90 border-t border-stone-800 space-y-3">
              {/* Scrub Bar */}
              <div className="flex items-center space-x-2 text-xs text-stone-400">
                <span className="font-mono">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration || selectedVideo.durationSeconds || 10}
                  step="0.1"
                  value={currentTime}
                  onChange={(e) => {
                    const time = parseFloat(e.target.value);
                    setCurrentTime(time);
                    if (videoPlayerRef.current) {
                      videoPlayerRef.current.currentTime = time;
                    }
                  }}
                  className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <span className="font-mono">
                  {formatTime(duration || selectedVideo.durationSeconds)}
                </span>
              </div>

              {/* Buttons Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      if (videoPlayerRef.current) {
                        if (isPlaying) {
                          videoPlayerRef.current.pause();
                          setIsPlaying(false);
                        } else {
                          videoPlayerRef.current.play();
                          setIsPlaying(true);
                        }
                      }
                    }}
                    className="p-2.5 rounded-full bg-rose-600 text-white hover:bg-rose-500 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
                  </button>

                  {/* Playback speed selector */}
                  <div className="flex items-center space-x-1 text-xs">
                    {[0.5, 1, 1.5, 2].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => {
                          setPlaybackSpeed(spd);
                          if (videoPlayerRef.current) {
                            videoPlayerRef.current.playbackRate = spd;
                          }
                        }}
                        className={`px-2 py-1 rounded-lg font-mono ${
                          playbackSpeed === spd
                            ? 'bg-rose-600 text-white font-bold'
                            : 'text-stone-400 hover:text-white bg-stone-800'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownload(selectedVideo)}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download MP4</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
