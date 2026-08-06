import React, { useState, useEffect } from 'react';
import { Play, Heart, Star, Info, Volume2, VolumeX, Sparkles, ChevronRight, ChevronLeft, Tv } from 'lucide-react';
import { Anime } from '../types';

interface HeroBannerProps {
  featuredAnimeList: Anime[];
  onWatchAnime: (anime: Anime, episodeNumber?: number) => void;
  onSelectAnime: (anime: Anime) => void;
  onToggleFavorite: (anime: Anime) => void;
  isFavorite: (animeId: string) => boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  featuredAnimeList,
  onWatchAnime,
  onSelectAnime,
  onToggleFavorite,
  isFavorite,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  const currentAnime = featuredAnimeList[currentIndex] || featuredAnimeList[0];

  useEffect(() => {
    if (featuredAnimeList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredAnimeList.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [featuredAnimeList.length]);

  if (!currentAnime) return null;

  const favored = isFavorite(currentAnime.id);

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4">
      <section className="relative h-[340px] sm:h-[380px] md:h-[420px] rounded-2xl overflow-hidden border border-zinc-800 group shadow-2xl">
        {/* Background Image Banner with Dark Overlay Gradients */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ backgroundImage: `url(${currentAnime.banner})`, filter: 'brightness(0.65)' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>

        {/* Hero Banner Overlay Details */}
        <div className="relative h-full flex flex-col justify-end p-6 sm:p-10 max-w-2xl z-10">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-red-600 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider text-white shadow-md">
              Trendda
            </span>
            <span className="text-zinc-300 text-xs font-semibold">
              O'zbek Dublyaj: <span className="text-red-400 font-bold">{currentAnime.voiceStudio}</span>
            </span>
            <span className="text-zinc-400 text-xs">
              • {currentAnime.genres.slice(0, 3).join(', ')}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 leading-tight tracking-tight uppercase text-white drop-shadow-md">
            {currentAnime.titleUz}
          </h1>

          <p className="text-zinc-300 text-sm sm:text-base mb-6 line-clamp-2 sm:line-clamp-3 leading-relaxed">
            {currentAnime.shortDescriptionUz}
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              id="hero-watch-btn"
              onClick={() => onWatchAnime(currentAnime, 1)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-7 py-3 rounded-md flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)] cursor-pointer text-sm"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Tomosha qilish</span>
            </button>

            <button
              id="hero-favorite-btn"
              onClick={() => onToggleFavorite(currentAnime)}
              className={`font-bold px-6 py-3 rounded-md transition-all text-sm flex items-center gap-2 backdrop-blur-md cursor-pointer ${
                favored
                  ? 'bg-red-600/30 text-red-400 border border-red-600/50'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${favored ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{favored ? 'Sevimlilarda' : 'Sevimlilarga qo‘shish'}</span>
            </button>

            <button
              id="hero-details-btn"
              onClick={() => onSelectAnime(currentAnime)}
              className="bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold px-4 py-3 rounded-md transition-all text-sm border border-zinc-800"
              title="Batafsil"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Indicator Thumbnails */}
        <div className="absolute bottom-6 right-6 z-20 hidden lg:flex items-center gap-2 bg-black/70 backdrop-blur-md border border-zinc-800 p-2 rounded-xl">
          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev === 0 ? featuredAnimeList.length - 1 : prev - 1))
            }
            className="p-1.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs"
          >
            ←
          </button>
          <div className="flex gap-2">
            {featuredAnimeList.map((anime, idx) => (
              <button
                key={anime.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-10 h-12 rounded overflow-hidden border transition-all ${
                  idx === currentIndex ? 'border-red-600 scale-105 ring-1 ring-red-600' : 'border-zinc-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={anime.poster} alt={anime.titleUz} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredAnimeList.length)}
            className="p-1.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs"
          >
            →
          </button>
        </div>
      </section>
    </div>
  );
};
