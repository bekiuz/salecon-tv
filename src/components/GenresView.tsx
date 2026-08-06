import React, { useState } from 'react';
import { GENRES_DATA } from '../data/animeData';
import { Anime, Genre } from '../types';
import { AnimeCard } from './AnimeCard';
import { Grid, Sparkles, Swords, Compass, Wand2, Heart, HeartCrack, Smile, Brain, GraduationCap } from 'lucide-react';

interface GenresViewProps {
  allAnime: Anime[];
  onSelectAnime: (anime: Anime) => void;
  onWatchAnime: (anime: Anime) => void;
  onToggleFavorite: (anime: Anime) => void;
  isFavorite: (animeId: string) => boolean;
}

export const GenresView: React.FC<GenresViewProps> = ({
  allAnime,
  onSelectAnime,
  onWatchAnime,
  onToggleFavorite,
  isFavorite,
}) => {
  const [selectedGenreSlug, setSelectedGenreSlug] = useState<string | null>(null);

  const selectedGenre = GENRES_DATA.find((g) => g.slug === selectedGenreSlug);

  const filteredAnime = selectedGenreSlug
    ? allAnime.filter((a) =>
        a.genres.some((g) => {
          const target = (selectedGenre?.nameUz || '').toLowerCase();
          const current = g.toLowerCase();
          return current === target || current.includes(target) || target.includes(current);
        })
      )
    : allAnime;

  const renderIcon = (name: string) => {
    switch (name) {
      case 'Swords':
        return <Swords className="w-6 h-6" />;
      case 'Compass':
        return <Compass className="w-6 h-6" />;
      case 'Wand2':
        return <Wand2 className="w-6 h-6" />;
      case 'Heart':
        return <Heart className="w-6 h-6" />;
      case 'HeartCrack':
        return <HeartCrack className="w-6 h-6" />;
      case 'Smile':
        return <Smile className="w-6 h-6" />;
      case 'Brain':
        return <Brain className="w-6 h-6" />;
      case 'GraduationCap':
        return <GraduationCap className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
            Anime Janrlari
          </h1>
          <p className="text-xs text-zinc-400 max-w-xl mx-auto">
            O'zingizga yoqgan janrni tanlang va eng sara o'zbekcha dublyajdagi animelarni tomosha qiling
          </p>
        </div>

        {/* Genre Visual Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 mb-10">
          {GENRES_DATA.map((genre) => {
            const isSelected = selectedGenreSlug === genre.slug;
            return (
              <div
                key={genre.id}
                onClick={() => setSelectedGenreSlug(isSelected ? null : genre.slug)}
                className={`relative group rounded-xl overflow-hidden p-5 cursor-pointer border transition-all duration-300 ${
                  isSelected
                    ? 'border-red-600 ring-2 ring-red-600/50 shadow-xl shadow-red-950/80 scale-[1.02]'
                    : 'border-zinc-800 hover:border-red-600'
                }`}
              >
                {/* Background Image & Gradient */}
                <img
                  src={genre.image}
                  alt={genre.nameUz}
                  className="absolute inset-0 w-full h-full object-cover filter brightness-40 group-hover:scale-105 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-80 mix-blend-multiply`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

                {/* Content */}
                <div className="relative z-10 space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-zinc-900/80 backdrop-blur-md border border-zinc-700 flex items-center justify-center text-white shadow-lg">
                    {renderIcon(genre.iconName)}
                  </div>
                  <h3 className="font-bold text-lg text-white uppercase tracking-wider">{genre.nameUz}</h3>
                  <p className="text-xs text-zinc-300 line-clamp-2">{genre.descriptionUz}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filtered Anime Results Section */}
        <div className="space-y-6 pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white uppercase tracking-tight border-l-4 border-red-600 pl-3">
              <span>
                {selectedGenre ? `${selectedGenre.nameUz} Janridagi Animelar` : "Barcha Animelar"}
              </span>
              <span className="text-xs font-normal text-zinc-400 ml-2">({filteredAnime.length} ta)</span>
            </h2>

            {selectedGenreSlug && (
              <button
                onClick={() => setSelectedGenreSlug(null)}
                className="text-xs font-bold text-red-500 hover:text-red-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg uppercase tracking-wider"
              >
                Filtrni tozalash
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filteredAnime.map((anime) => (
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
        </div>
      </div>
    </div>
  );
};
