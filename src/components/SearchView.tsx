import React, { useState } from 'react';
import { Search, X, Filter, Sparkles, Film } from 'lucide-react';
import { Anime } from '../types';
import { AnimeCard } from './AnimeCard';

interface SearchViewProps {
  allAnime: Anime[];
  onSelectAnime: (anime: Anime) => void;
  onWatchAnime: (anime: Anime) => void;
  onToggleFavorite: (anime: Anime) => void;
  isFavorite: (animeId: string) => boolean;
}

export const SearchView: React.FC<SearchViewProps> = ({
  allAnime,
  onSelectAnime,
  onWatchAnime,
  onToggleFavorite,
  isFavorite,
}) => {
  const [query, setQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('Barchasi');

  const popularSuggestions = [
    'Solo Leveling',
    'Demon Slayer',
    'Jujutsu Kaisen',
    'Attack on Titan',
    'One Piece',
    'Chainsaw Man',
    'Spy x Family'
  ];

  const searchResults = allAnime.filter((anime) => {
    const matchQuery =
      anime.titleUz.toLowerCase().includes(query.toLowerCase()) ||
      anime.title.toLowerCase().includes(query.toLowerCase()) ||
      (anime.titleJp && anime.titleJp.toLowerCase().includes(query.toLowerCase())) ||
      anime.genres.some((g) => g.toLowerCase().includes(query.toLowerCase()));

    const matchStatus =
      selectedStatus === 'Barchasi' || anime.status === selectedStatus;

    return matchQuery && matchStatus;
  });

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Search Input Box */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
            Anime Qidiruvi
          </h1>
          <p className="text-xs text-zinc-400">
            Sevimli animelaringiz nomini o'zbekcha yoki inglizcha yozib qidiring
          </p>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-red-500">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Masalan: Solo Leveling, Iblislar Qotili, One Piece..."
              className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 shadow-2xl transition-all text-sm font-medium"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Quick Suggestions Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Ommabop:</span>
            {popularSuggestions.map((sug) => (
              <button
                key={sug}
                onClick={() => setQuery(sug)}
                className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-red-600 text-xs text-zinc-300 transition-all font-medium"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-red-500" />
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Holati:</span>
            {['Barchasi', 'Efirda', 'Tugallangan'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  selectedStatus === status
                    ? 'bg-red-600 text-white font-bold'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <span className="text-xs text-zinc-400 font-medium">
            Topilgan animelar: <strong className="text-white font-bold">{searchResults.length} ta</strong>
          </span>
        </div>

        {/* Search Results Grid */}
        {searchResults.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {searchResults.map((anime) => (
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
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 max-w-xl mx-auto space-y-4">
            <Film className="w-12 h-12 text-red-500 mx-auto opacity-60" />
            <h3 className="font-display font-bold text-xl text-white">Natija topilmadi</h3>
            <p className="text-sm text-gray-400">
              "{query}" so'rovi bo'yicha hech qanday anime topilmadi. Boshqa kalit so'z yoki janr bo'yicha izlab ko'ring.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
