import React from 'react';
import { Heart, Film, ArrowRight } from 'lucide-react';
import { Anime } from '../types';
import { AnimeCard } from './AnimeCard';

interface FavoritesViewProps {
  favoritesAnime: Anime[];
  onSelectAnime: (anime: Anime) => void;
  onWatchAnime: (anime: Anime) => void;
  onToggleFavorite: (anime: Anime) => void;
  isFavorite: (animeId: string) => boolean;
  onExploreClick: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favoritesAnime,
  onSelectAnime,
  onWatchAnime,
  onToggleFavorite,
  isFavorite,
  onExploreClick,
}) => {
  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white border-l-4 border-red-600 pl-3">
              Sevimlilar Ro‘yxati
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Siz tanlagan va saqlab qo'yilgan sevimli animelaringiz
            </p>
          </div>

          <span className="text-xs font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-lg w-fit">
            Jami: <strong className="text-red-500">{favoritesAnime.length} ta anime</strong>
          </span>
        </div>

        {/* Favorites Grid or Empty State */}
        {favoritesAnime.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {favoritesAnime.map((anime) => (
              <AnimeCard
                key={anime.id}
                anime={anime}
                onSelect={onSelectAnime}
                onWatch={onWatchAnime}
                onToggleFavorite={onToggleFavorite}
                isFavorite={isFavorite(anime.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 max-w-xl mx-auto space-y-5">
            <div className="w-16 h-16 rounded-full bg-red-950/50 border border-red-800/40 flex items-center justify-center text-red-500 mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-bold text-2xl text-white">
                Sevimlilar ro‘yxatingiz bo‘sh
              </h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto">
                Bosh sahifa yoki katalogdan yoqqan animelarni "Sevimlilarga qo'shish" tugmasi orqali shu yerga saqlashingiz mumkin.
              </p>
            </div>
            <button
              onClick={onExploreClick}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-950/80 transition-all"
            >
              <span>Animelarni ko‘rish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
