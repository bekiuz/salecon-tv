import React, { useState } from 'react';
import { Film, Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Anime } from '../types';
import { AnimeCard } from './AnimeCard';

interface AnimeCatalogViewProps {
  allAnime: Anime[];
  onSelectAnime: (anime: Anime) => void;
  onWatchAnime: (anime: Anime) => void;
  onToggleFavorite: (anime: Anime) => void;
  isFavorite: (animeId: string) => boolean;
}

export const AnimeCatalogView: React.FC<AnimeCatalogViewProps> = ({
  allAnime,
  onSelectAnime,
  onWatchAnime,
  onToggleFavorite,
  isFavorite,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('Barchasi');
  const [selectedStatus, setSelectedStatus] = useState<string>('Barchasi');
  const [sortBy, setSortBy] = useState<'rating' | 'popular' | 'newest'>('rating');

  const genresList = [
    'Barchasi',
    'Jangari',
    'Sarguzasht',
    'Fantastika',
    'Isekai',
    'Komediya',
    'Drama',
    'Psixologik',
    'Maktab'
  ];

  let filtered = allAnime.filter((a) => {
    const matchGenre =
      selectedGenre === 'Barchasi' || a.genres.includes(selectedGenre);
    const matchStatus =
      selectedStatus === 'Barchasi' || a.status === selectedStatus;
    return matchGenre && matchStatus;
  });

  if (sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'popular') {
    filtered.sort((a, b) => b.views - a.views);
  } else if (sortBy === 'newest') {
    filtered.sort((a, b) => b.year - a.year);
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white border-l-4 border-red-600 pl-3">
              Animelar Katalogi
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Selecon TV platformasidagi barcha o'zbekcha dublyajli animelar
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg">
            <ArrowUpDown className="w-4 h-4 text-red-500 ml-2" />
            <span className="text-xs text-zinc-400 font-bold hidden sm:inline">Saralash:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none pr-2 cursor-pointer"
            >
              <option value="rating" className="bg-[#0a0a0a] text-white">
                Reyting bo'yicha
              </option>
              <option value="popular" className="bg-[#0a0a0a] text-white">
                Ommaboplik bo'yicha
              </option>
              <option value="newest" className="bg-[#0a0a0a] text-white">
                Yillari bo'yicha
              </option>
            </select>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="space-y-4 bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
          {/* Genre Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-400 font-bold mr-2 uppercase tracking-wider">Janr:</span>
            {genresList.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  selectedGenre === g
                    ? 'bg-red-600 text-white font-bold shadow-md'
                    : 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-3 pt-2 border-t border-zinc-800 text-xs">
            <span className="text-zinc-400 font-bold uppercase tracking-wider">Holat:</span>
            {['Barchasi', 'Efirda', 'Tugallangan'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  selectedStatus === st
                    ? 'bg-red-600/30 text-red-400 border border-red-600/50 font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Results */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filtered.map((anime) => (
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
  );
};
