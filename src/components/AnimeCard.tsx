import React from 'react';
import { Star, Play, Heart, Tv } from 'lucide-react';
import { Anime } from '../types';

interface AnimeCardProps {
  anime: Anime;
  onSelect: (anime: Anime) => void;
  onWatch: (anime: Anime) => void;
  onToggleFavorite: (anime: Anime) => void;
  isFavorite: boolean;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({
  anime,
  onSelect,
  onWatch,
  onToggleFavorite,
  isFavorite,
}) => {
  return (
    <div className="flex flex-col group cursor-pointer select-none">
      {/* Poster Box */}
      <div
        onClick={() => onSelect(anime)}
        className="aspect-[2/3] bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden relative mb-2.5 transition-all duration-300 group-hover:border-red-600 group-hover:shadow-[0_0_15px_rgba(220,38,38,0.25)]"
      >
        <img
          src={anime.poster}
          alt={anime.titleUz}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur text-[10px] px-2 py-0.5 rounded text-yellow-400 font-bold flex items-center gap-1 shadow">
          <Star className="w-3 h-3 fill-yellow-400" />
          <span>{anime.rating}</span>
        </div>

        {/* Episode Status Badge */}
        <div className="absolute bottom-2 left-2 bg-red-600/90 text-white text-[10px] px-2 py-0.5 rounded font-bold tracking-wide shadow">
          {anime.releasedEpisodes}/{anime.totalEpisodes}
        </div>

        {/* Favorite Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(anime);
          }}
          className={`absolute top-2 left-2 p-1.5 rounded-md backdrop-blur-md transition-all ${
            isFavorite
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-black/60 text-zinc-400 hover:text-white hover:bg-black/80'
          }`}
          title="Sevimlilarga qo'shish"
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : ''}`} />
        </button>

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWatch(anime);
            }}
            className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.6)] hover:scale-110 transition-transform"
          >
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </button>
        </div>
      </div>

      {/* Info */}
      <span
        onClick={() => onSelect(anime)}
        className="text-sm font-bold text-zinc-100 line-clamp-1 group-hover:text-red-500 transition-colors"
        title={anime.titleUz}
      >
        {anime.titleUz}
      </span>
      <div className="flex items-center justify-between mt-0.5">
        <span className="text-[10px] text-zinc-500 uppercase font-semibold truncate max-w-[120px]">
          {anime.genres.slice(0, 2).join(', ')}
        </span>
        <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">
          {anime.voiceStudio}
        </span>
      </div>
    </div>
  );
};
