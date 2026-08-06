import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipForward,
  SkipBack,
  RotateCcw,
  RotateCw,
  Settings,
  List,
  ArrowLeft,
  Tv,
  Sparkles,
  ChevronRight,
  PictureInPicture,
  Loader2,
  Clock,
  Search,
  Check
} from 'lucide-react';
import { Anime, Episode } from '../types';
import { supabaseService } from '../services/supabaseService';

interface VideoPlayerProps {
  anime: Anime;
  currentEpisodeNumber: number;
  onSelectEpisode: (episodeNumber: number) => void;
  onBack: () => void;
  onSelectAnime: (anime: Anime) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  anime,
  currentEpisodeNumber,
  onSelectEpisode,
  onBack,
  onSelectAnime,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentEpisode =
    anime.episodes.find((ep) => ep.episodeNumber === currentEpisodeNumber) ||
    anime.episodes[0] || {
      id: 'ep-fallback',
      episodeNumber: currentEpisodeNumber,
      titleUz: `${currentEpisodeNumber}-qism`,
      videoUrl: '',
      thumbnailUrl: anime.poster,
      duration: '24:00',
    };

  // State Declarations
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('1080p Ultra HD');
  const [selectedAudio, setSelectedAudio] = useState('Selecon Dub (O\'zbekcha)');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [autoNext, setAutoNext] = useState(true);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [resumeNotice, setResumeNotice] = useState<string | null>(null);
  const [seekFeedback, setSeekFeedback] = useState<string | null>(null);

  // Sync Video Speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Save last watched episode & progress periodically
  useEffect(() => {
    try {
      localStorage.setItem(`selecon_last_ep_${anime.id}`, currentEpisodeNumber.toString());
    } catch (e) {
      console.warn(e);
    }
  }, [anime.id, currentEpisodeNumber]);

  // Save Progress Timer
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (videoRef.current && duration > 0) {
        const cur = videoRef.current.currentTime;
        supabaseService.saveWatchProgress({
          animeId: anime.id,
          episodeNumber: currentEpisodeNumber,
          progressSeconds: cur,
          durationSeconds: duration,
          animeTitleUz: anime.titleUz,
          animePoster: anime.poster,
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, duration, anime.id, anime.titleUz, anime.poster, currentEpisodeNumber]);

  // Save Watch Progress on Unmount or Episode Change
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.currentTime > 5) {
        supabaseService.saveWatchProgress({
          animeId: anime.id,
          episodeNumber: currentEpisodeNumber,
          progressSeconds: videoRef.current.currentTime,
          durationSeconds: videoRef.current.duration || 1,
          animeTitleUz: anime.titleUz,
          animePoster: anime.poster,
        });
      }
    };
  }, [anime.id, currentEpisodeNumber, anime.titleUz, anime.poster]);

  // Handle Video Metadata Loaded -> Resume position
  const handleLoadedMetadata = () => {
    setIsLoading(false);
    if (!videoRef.current) return;
    const dur = videoRef.current.duration || 0;
    setDuration(dur);

    // Check for saved progress to resume position
    const saved = supabaseService.getWatchProgress(anime.id);
    if (
      saved &&
      saved.episodeNumber === currentEpisodeNumber &&
      saved.progressSeconds > 8 &&
      saved.progressSeconds < dur - 15
    ) {
      videoRef.current.currentTime = saved.progressSeconds;
      setCurrentTime(saved.progressSeconds);
      const min = Math.floor(saved.progressSeconds / 60);
      const sec = Math.floor(saved.progressSeconds % 60);
      const timeStr = `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`;
      setResumeNotice(`Oxirgi ko'rgan joyingizdan (${timeStr}) davom ettirildi`);

      setTimeout(() => setResumeNotice(null), 5000);
    }
  };

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 1;
    setCurrentTime(cur);
    setDuration(dur);
    setProgress((cur / dur) * 100);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const seekTo = (parseFloat(e.target.value) / 100) * duration;
    videoRef.current.currentTime = seekTo;
    setProgress(parseFloat(e.target.value));
  };

  const seekRelative = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + seconds));
    
    setSeekFeedback(seconds > 0 ? `+${seconds}s` : `${seconds}s`);
    setTimeout(() => setSeekFeedback(null), 800);
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
  };

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.volume = volume || 0.8;
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('Picture in Picture error:', err);
    }
  };

  const handleSkipIntro = () => {
    seekRelative(85);
  };

  const handlePrevEpisode = () => {
    if (currentEpisodeNumber > 1) {
      onSelectEpisode(currentEpisodeNumber - 1);
      setIsPlaying(true);
    }
  };

  const handleNextEpisode = () => {
    if (currentEpisodeNumber < anime.episodes.length) {
      onSelectEpisode(currentEpisodeNumber + 1);
      setIsPlaying(true);
    }
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when user typing in text input/textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      switch (e.key) {
        case ' ':
        case 'k':
        case 'K':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
        case 'j':
        case 'J':
          e.preventDefault();
          seekRelative(-10);
          break;
        case 'ArrowRight':
        case 'l':
        case 'L':
          e.preventDefault();
          seekRelative(10);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (videoRef.current) {
            const newVol = Math.min(1, (videoRef.current.volume || 0) + 0.1);
            videoRef.current.volume = newVol;
            setVolume(newVol);
            setIsMuted(false);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (videoRef.current) {
            const newVol = Math.max(0, (videoRef.current.volume || 0) - 0.1);
            videoRef.current.volume = newVol;
            setVolume(newVol);
            if (newVol === 0) setIsMuted(true);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seekRelative, toggleFullscreen, toggleMute]);

  // Fullscreen event listener sync
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const formatTime = (timeInSec: number) => {
    if (isNaN(timeInSec)) return '00:00';
    const min = Math.floor(timeInSec / 60);
    const sec = Math.floor(timeInSec % 60);
    return `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`;
  };

  // Filtered Sidebar Episodes (Sorted by episodeNumber)
  const filteredEpisodes = [...anime.episodes]
    .sort((a, b) => a.episodeNumber - b.episodeNumber)
    .filter(
      (ep) =>
        ep.titleUz.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
        ep.episodeNumber.toString().includes(sidebarSearch)
    );

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-20 pb-20">
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isTheaterMode ? 'max-w-none px-0' : ''}`}>
        {/* Navigation Breadcrumb Bar */}
        <div className="flex items-center justify-between pb-4">
          <button
            id="watch-back-btn"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{anime.titleUz} saxifasiga qaytish</span>
          </button>

          <div className="flex items-center gap-3">
            <label className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 cursor-pointer bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded hover:text-white transition-all">
              <input
                type="checkbox"
                checked={autoNext}
                onChange={(e) => setAutoNext(e.target.checked)}
                className="accent-red-600 rounded cursor-pointer"
              />
              <span className="font-bold uppercase text-[10px] tracking-wider">Avto-ijro (Keyingi qism)</span>
            </label>

            <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded">
              {selectedAudio}
            </span>
          </div>
        </div>

        {/* Video Player Main Container Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Player Area */}
          <div className={`lg:col-span-3 ${isTheaterMode ? 'lg:col-span-4' : ''}`}>
            <div
              ref={containerRef}
              onDoubleClick={toggleFullscreen}
              className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-zinc-800 group select-none"
            >
              {/* HTML5 Video Element */}
              <video
                ref={videoRef}
                src={currentEpisode.videoUrl}
                poster={currentEpisode.thumbnailUrl || anime.poster}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onWaiting={() => setIsLoading(true)}
                onPlaying={() => {
                  setIsLoading(false);
                  setIsPlaying(true);
                }}
                onPause={() => setIsPlaying(false)}
                onCanPlay={() => setIsLoading(false)}
                onEnded={() => {
                  setIsPlaying(false);
                  if (autoNext && currentEpisodeNumber < anime.episodes.length) {
                    handleNextEpisode();
                  }
                }}
                onClick={togglePlay}
                className="w-full h-full object-contain cursor-pointer"
              />

              {/* Loading Spinner Overlay */}
              {isLoading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs transition-all">
                  <div className="p-4 rounded-full bg-zinc-900/80 border border-red-600/50 shadow-[0_0_30px_rgba(220,38,38,0.4)] animate-spin mb-2">
                    <Loader2 className="w-8 h-8 text-red-500" />
                  </div>
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest animate-pulse">
                    Video yuklanmoqda...
                  </span>
                </div>
              )}

              {/* Seek Feedback Overlay (+10s / -10s) */}
              {seekFeedback && (
                <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                  <div className="bg-red-600/90 text-white font-black text-xl px-6 py-3 rounded-full border border-red-400 shadow-2xl animate-ping uppercase tracking-widest">
                    {seekFeedback}
                  </div>
                </div>
              )}

              {/* Resume Position Toast Banner */}
              {resumeNotice && (
                <div className="absolute top-4 left-4 z-30 bg-zinc-900/95 border border-red-600 text-white text-xs px-4 py-2 rounded-lg shadow-2xl flex items-center gap-3 backdrop-blur-md animate-fadeIn">
                  <Clock className="w-4 h-4 text-red-500" />
                  <span>{resumeNotice}</span>
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = 0;
                        setResumeNotice(null);
                      }
                    }}
                    className="ml-2 text-[10px] font-bold text-red-400 hover:text-red-300 underline uppercase cursor-pointer"
                  >
                    Boshidan ko'rish
                  </button>
                </div>
              )}

              {/* Skip Intro Overlay Button */}
              <button
                onClick={handleSkipIntro}
                className="absolute bottom-20 left-6 z-20 px-3.5 py-1.5 rounded bg-black/80 hover:bg-red-600 border border-zinc-700 text-white font-bold text-xs flex items-center gap-2 backdrop-blur-md shadow-xl transition-all uppercase tracking-wider cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Kirish qismini o'tkazib yuborish (+85s)</span>
              </button>

              {/* Custom Video Controls Bar */}
              <div className="absolute inset-x-0 bottom-0 z-30 p-4 bg-gradient-to-t from-black via-black/80 to-transparent opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
                {/* Seekbar Range */}
                <div className="relative flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600 hover:h-2.5 transition-all"
                  />
                </div>

                {/* Controls buttons row */}
                <div className="flex items-center justify-between text-sm pt-1">
                  {/* Left Controls */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Play/Pause */}
                    <button
                      onClick={togglePlay}
                      className="p-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors shadow-[0_0_10px_rgba(220,38,38,0.5)] cursor-pointer"
                      title={isPlaying ? 'Pauza (Space)' : 'Ijro etish (Space)'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                    </button>

                    {/* Previous Episode Button */}
                    <button
                      onClick={handlePrevEpisode}
                      disabled={currentEpisodeNumber <= 1}
                      className="p-2 rounded bg-zinc-800 hover:bg-zinc-700 text-white disabled:opacity-40 transition-colors cursor-pointer"
                      title="Oldingi qism"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>

                    {/* Next Episode Button */}
                    <button
                      onClick={handleNextEpisode}
                      disabled={currentEpisodeNumber >= anime.episodes.length}
                      className="p-2 rounded bg-zinc-800 hover:bg-zinc-700 text-white disabled:opacity-40 transition-colors flex items-center gap-1 font-bold text-xs uppercase tracking-wider cursor-pointer"
                      title="Keyingi qism"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>

                    {/* 10s Rewind / Forward */}
                    <button
                      onClick={() => seekRelative(-10)}
                      className="p-2 rounded bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 hidden sm:flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                      title="10 sekund orqaga (←)"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>-10s</span>
                    </button>

                    <button
                      onClick={() => seekRelative(10)}
                      className="p-2 rounded bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 hidden sm:flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                      title="10 sekund oldinga (→)"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>+10s</span>
                    </button>

                    {/* Volume Controls */}
                    <div className="flex items-center gap-2 ml-1">
                      <button onClick={toggleMute} className="text-zinc-300 hover:text-white cursor-pointer" title="Ovoz (M)">
                        {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-16 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600 hidden md:block"
                      />
                    </div>

                    {/* Time Indicator */}
                    <span className="text-xs text-zinc-300 font-mono font-medium ml-1">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  {/* Right Controls */}
                  <div className="flex items-center gap-2.5">
                    {/* Speed Selector Quick Button */}
                    <button
                      onClick={() => {
                        const speeds = [0.5, 1, 1.25, 1.5, 2];
                        const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                        setPlaybackSpeed(speeds[nextIdx]);
                      }}
                      className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] font-mono font-bold text-red-400 border border-zinc-700 cursor-pointer"
                      title="Ijro tezligi"
                    >
                      {playbackSpeed}x
                    </button>

                    {/* Picture in Picture */}
                    <button
                      onClick={togglePiP}
                      className="text-zinc-300 hover:text-white hidden sm:block cursor-pointer p-1"
                      title="Picture in Picture (Kichik Oyna)"
                    >
                      <PictureInPicture className="w-4 h-4" />
                    </button>

                    {/* Quality & Settings */}
                    <button
                      onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                      className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{selectedQuality}</span>
                    </button>

                    {/* Theater mode toggle */}
                    <button
                      onClick={() => setIsTheaterMode(!isTheaterMode)}
                      className="text-zinc-300 hover:text-white hidden sm:block cursor-pointer p-1"
                      title="Kino rejim"
                    >
                      <Tv className="w-4 h-4" />
                    </button>

                    {/* Fullscreen Toggle */}
                    <button onClick={toggleFullscreen} className="text-zinc-300 hover:text-white cursor-pointer p-1" title="To'liq ekranga olish (F)">
                      {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Settings Dropdown Overlay */}
              {showSettingsMenu && (
                <div className="absolute top-12 right-6 z-40 bg-zinc-900/95 border border-zinc-800 rounded-xl p-4 shadow-2xl space-y-4 w-64 text-xs backdrop-blur-md">
                  <div>
                    <h5 className="font-bold text-zinc-400 mb-2 uppercase tracking-wider text-[10px]">Video Sifati</h5>
                    <div className="grid grid-cols-1 gap-1">
                      {['1080p Ultra HD', '720p HD', '480p SD'].map((q) => (
                        <button
                          key={q}
                          onClick={() => {
                            setSelectedQuality(q);
                            setShowSettingsMenu(false);
                          }}
                          className={`text-left px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center justify-between ${
                            selectedQuality === q ? 'bg-red-600 text-white font-bold' : 'hover:bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          <span>{q}</span>
                          {selectedQuality === q && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-zinc-400 mb-2 uppercase tracking-wider text-[10px]">Ovoz va Subtitr</h5>
                    <div className="grid grid-cols-1 gap-1">
                      {["Selecon Dub (O'zbekcha)", "O'zbekcha Subtitr", "Yaponcha (Original)"].map((aud) => (
                        <button
                          key={aud}
                          onClick={() => {
                            setSelectedAudio(aud);
                            setShowSettingsMenu(false);
                          }}
                          className={`text-left px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center justify-between ${
                            selectedAudio === aud ? 'bg-red-600 text-white font-bold' : 'hover:bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          <span>{aud}</span>
                          {selectedAudio === aud && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-zinc-400 mb-2 uppercase tracking-wider text-[10px]">Tezlik (Playback Speed)</h5>
                    <div className="flex gap-1">
                      {[0.5, 1, 1.25, 1.5, 2].map((sp) => (
                        <button
                          key={sp}
                          onClick={() => {
                            setPlaybackSpeed(sp);
                            setShowSettingsMenu(false);
                          }}
                          className={`flex-1 py-1.5 rounded text-center transition-colors cursor-pointer text-[11px] font-bold ${
                            playbackSpeed === sp ? 'bg-red-600 text-white shadow' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                          }`}
                        >
                          {sp}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Episode Title & Metadata Header Below Video */}
            <div className="mt-6 bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-3">
                <div>
                  <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
                    {anime.titleUz} — {currentEpisodeNumber}-qism
                  </span>
                  <h2 className="font-bold text-xl text-white uppercase tracking-tight mt-0.5">
                    {currentEpisode.titleUz}
                  </h2>
                </div>

                {/* Keyingi qism Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevEpisode}
                    disabled={currentEpisodeNumber <= 1}
                    className="px-3 py-2.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-bold text-xs uppercase disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <SkipBack className="w-4 h-4" />
                    <span className="hidden sm:inline">Oldingi qism</span>
                  </button>

                  <button
                    id="watch-next-ep-btn"
                    onClick={handleNextEpisode}
                    disabled={currentEpisodeNumber >= anime.episodes.length}
                    className="px-5 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.4)] disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <span>Keyingi qism</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Episode summary description */}
              <p className="text-xs text-zinc-300 leading-relaxed">
                {currentEpisode.descriptionUz ||
                  `${anime.titleUz} animesining ${currentEpisodeNumber}-qismi o'zbekcha Selecon Dub ovozi bilan tomosha qiling.`}
              </p>
            </div>
          </div>

          {/* Episode Selector Sidebar ("Qism tanlash") */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                  <List className="w-4 h-4 text-red-500" />
                  <span>Qismlar Ro'yxati</span>
                </h3>
                <span className="text-[10px] text-zinc-400 font-bold bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                  {anime.episodes.length} qism
                </span>
              </div>

              {/* Search Bar for Episodes */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Qism nomini yoki raqamini qidiring..."
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
                />
              </div>

              {/* Episodes List Scrollable */}
              <div className="space-y-2 max-h-[520px] overflow-y-auto no-scrollbar pr-1">
                {filteredEpisodes.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-4">Qism topilmadi</p>
                ) : (
                  filteredEpisodes.map((ep) => {
                    const isActive = ep.episodeNumber === currentEpisodeNumber;
                    return (
                      <button
                        key={ep.id}
                        onClick={() => {
                          onSelectEpisode(ep.episodeNumber);
                          setIsPlaying(true);
                        }}
                        className={`w-full text-left p-2 rounded-lg border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-red-600 border-red-600 text-white font-bold shadow-lg shadow-red-900/30'
                            : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {/* Episode Thumbnail */}
                          <img
                            src={ep.thumbnailUrl || anime.poster}
                            alt={ep.titleUz}
                            className="w-12 h-9 object-cover rounded border border-zinc-800 shrink-0"
                          />

                          <div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-[10px] font-black uppercase px-1.5 py-0.2 rounded ${
                                  isActive ? 'bg-white text-red-600' : 'bg-zinc-800 text-zinc-400'
                                }`}
                              >
                                {ep.episodeNumber}-QISM
                              </span>
                            </div>
                            <h4 className="text-xs line-clamp-1 mt-0.5">{ep.titleUz}</h4>
                          </div>
                        </div>

                        {isActive && (
                          <Sparkles className="w-4 h-4 text-yellow-300 flex-shrink-0 animate-pulse" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
