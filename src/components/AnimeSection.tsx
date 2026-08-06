import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Flame, Sparkles, Clock, TrendingUp } from 'lucide-react';
import { Anime } from '../types';
import { AnimeCard } from './AnimeCard';

interface AnimeSectionProps {
  titleUz: string;
  subtitleUz?: string;
  iconType?: 'flame' | 'sparkles' | 'clock' | 'trending';
  animeList: Anime[];
  onSelectAnime: (anime: Anime) => void;
  onWatchAnime: (anime: Anime) => void;
  onToggleFavorite: (anime: Anime) => void;
  isFavorite: (animeId: string) => boolean;
  onViewAll?: () => void;
}

export const AnimeSection: React.FC<AnimeSectionProps> = ({
  titleUz,
  subtitleUz,
  iconType = 'sparkles',
  animeList,
  onSelectAnime,
  onWatchAnime,
  onToggleFavorite,
  isFavorite,
  onViewAll,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const renderIcon = () => {
    switch (iconType) {
      case 'flame':
        return <Flame className="w-5 h-5 text-red-500 fill-red-500/20" />;
      case 'clock':
        return <Clock className="w-5 h-5 text-red-500" />;
      case 'trending':
        return <TrendingUp className="w-5 h-5 text-red-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <section className="py-6 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold border-l-4 border-red-600 pl-3 uppercase tracking-tighter text-white">
              {titleUz}
            </h2>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {onViewAll && (
              <button
                onClick={onViewAll}
                className="text-xs text-red-500 uppercase font-bold hover:underline tracking-wider"
              >
                Barchasi
              </button>
            )}

            <div className="flex gap-1.5">
              <button
                onClick={() => scroll('left')}
                className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs text-zinc-300 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                aria-label="Previous"
              >
                ←
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs text-zinc-300 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                aria-label="Next"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Grid */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-2"
        >
          {animeList.map((anime) => (
            <div
              key={anime.id}
              className="min-w-[150px] sm:min-w-[170px] md:min-w-[190px] max-w-[200px] flex-shrink-0"
            >
              <AnimeCard
                anime={anime}
                onSelect={onSelectAnime}
                onWatch={onWatchAnime}
                onToggleFavorite={onToggleFavorite}
                isFavorite={isFavorite(anime.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
