import React from 'react';
import { Play } from 'lucide-react';
import { Anime } from '../types';

interface LatestEpisodesSectionProps {
  allAnime: Anime[];
  onWatchAnime: (anime: Anime, episodeNumber?: number) => void;
}

export const LatestEpisodesSection: React.FC<LatestEpisodesSectionProps> = ({
  allAnime,
  onWatchAnime,
}) => {
  // Dynamically derive latest releases from allAnime
  const latestReleases = allAnime.flatMap((anime) => {
    if (anime.episodes && anime.episodes.length > 0) {
      const latestEp = [...anime.episodes].sort((a, b) => b.episodeNumber - a.episodeNumber)[0];
      return [{
        id: `rel-${anime.id}-${latestEp.episodeNumber}`,
        anime,
        animeTitleUz: anime.titleUz || anime.title,
        episodeNumber: latestEp.episodeNumber,
        releaseTime: latestEp.releaseDate || 'Yaqinda',
        voiceStudio: anime.voiceStudio || 'Selecon Dub',
        quality: '1080p Full HD',
        poster: latestEp.thumbnailUrl || anime.banner || anime.poster,
      }];
    }
    return [{
      id: `rel-${anime.id}-1`,
      anime,
      animeTitleUz: anime.titleUz || anime.title,
      episodeNumber: anime.releasedEpisodes || 1,
      releaseTime: 'Premyera',
      voiceStudio: anime.voiceStudio || 'Selecon Dub',
      quality: '1080p Full HD',
      poster: anime.poster || anime.banner,
    }];
  }).slice(0, 6);

  if (latestReleases.length === 0) return null;

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
          <h2 className="text-lg font-bold border-l-4 border-red-600 pl-3 uppercase tracking-tighter text-white">
            So‘nggi qismlar
          </h2>
          <div className="flex gap-2 text-xs font-bold text-zinc-400">
            <span className="text-red-500 uppercase tracking-widest text-[10px]">Bugungi premyeralar</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {latestReleases.map((rel) => (
            <div
              key={rel.id}
              onClick={() => onWatchAnime(rel.anime, rel.episodeNumber)}
              className="flex gap-4 p-2 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800/80 transition-colors cursor-pointer group"
            >
              <div
                className="w-32 h-20 bg-zinc-800 rounded-md shrink-0 bg-cover bg-center relative overflow-hidden"
                style={{ backgroundImage: `url(${rel.poster})` }}
              >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                  <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow">
                    <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-1 right-1 bg-black/80 text-yellow-400 text-[9px] font-bold px-1.5 py-0.5 rounded">
                  {rel.episodeNumber}-qism
                </span>
              </div>

              <div className="flex flex-col justify-center overflow-hidden flex-grow">
                <h3 className="text-sm font-bold truncate text-white group-hover:text-red-500 transition-colors">
                  {rel.animeTitleUz} — {rel.episodeNumber}-qism
                </h3>
                <p className="text-[10px] text-zinc-500 uppercase mb-1 font-semibold">
                  {rel.releaseTime} • {rel.voiceStudio}
                </p>
                <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
                  {rel.quality}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
