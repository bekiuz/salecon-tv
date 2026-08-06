import React, { useState } from 'react';
import {
  Star,
  Play,
  Heart,
  Calendar,
  Clock,
  Tv,
  Building,
  Share2,
  ArrowLeft,
  CheckCircle2,
  MessageSquare,
  ThumbsUp,
  Send,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { Anime, Episode, Comment } from '../types';

interface AnimeDetailProps {
  anime: Anime;
  onBack: () => void;
  onWatchEpisode: (episodeNumber: number) => void;
  onToggleFavorite: (anime: Anime) => void;
  isFavorite: boolean;
  onSelectAnime: (anime: Anime) => void;
  allAnime: Anime[];
}

export const AnimeDetail: React.FC<AnimeDetailProps> = ({
  anime,
  onBack,
  onWatchEpisode,
  onToggleFavorite,
  isFavorite,
  onSelectAnime,
  allAnime,
}) => {
  const [activeTab, setActiveTab] = useState<'episodes' | 'description' | 'comments'>('episodes');
  const [commentsList, setCommentsList] = useState<Comment[]>(anime.comments || []);
  const [newCommentText, setNewCommentText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const relatedAnime = allAnime
    .filter((a) => a.id !== anime.id && a.genres.some((g) => anime.genres.includes(g)))
    .slice(0, 4);

  const lastWatchedEpNum = React.useMemo(() => {
    try {
      const savedEp = localStorage.getItem(`selecon_last_ep_${anime.id}`);
      if (savedEp) return parseInt(savedEp, 10);
    } catch (e) {}
    return 1;
  }, [anime.id]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      animeId: anime.id,
      userName: 'Foydalanuvchi',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop',
      text: newCommentText.trim(),
      date: 'Hozirgina',
      likes: 0,
      userLiked: false,
    };

    setCommentsList([newComment, ...commentsList]);
    setNewCommentText('');
  };

  const handleLikeComment = (commentId: string) => {
    setCommentsList(
      commentsList.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            likes: c.userLiked ? c.likes - 1 : c.likes + 1,
            userLiked: !c.userLiked,
          };
        }
        return c;
      })
    );
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 pb-20 pt-20">
      {/* Back Button Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <button
          id="detail-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Orqaga qaytish</span>
        </button>
      </div>

      {/* Hero Backdrop Banner Section */}
      <div className="relative w-full h-[320px] sm:h-[420px] overflow-hidden">
        <img
          src={anime.banner}
          alt={anime.titleUz}
          className="w-full h-full object-cover object-center filter brightness-65"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
      </div>

      {/* Main Container - Header Poster & Info Overlay */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-44 sm:-mt-56 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Poster Card */}
          <div className="w-48 sm:w-60 md:w-64 flex-shrink-0 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl relative bg-zinc-900 mx-auto md:mx-0">
            <img src={anime.poster} alt={anime.titleUz} className="w-full h-auto object-cover" />
            <div className="p-3 bg-zinc-950 flex flex-col gap-2 border-t border-zinc-800">
              <button
                id="detail-main-watch-btn"
                onClick={() => onWatchEpisode(lastWatchedEpNum)}
                className="w-full py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>
                  {lastWatchedEpNum > 1
                    ? `${lastWatchedEpNum}-qismdan davom ettirish`
                    : '1-qismni ko‘rish'}
                </span>
              </button>

              <button
                id="detail-favorite-btn"
                onClick={() => onToggleFavorite(anime)}
                className={`w-full py-2.5 rounded-md border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isFavorite
                    ? 'bg-red-600/30 border-red-600 text-red-400'
                    : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{isFavorite ? 'Sevimlilarda' : 'Sevimlilarga qo‘shish'}</span>
              </button>
            </div>
          </div>

          {/* Details Content */}
          <div className="flex-grow space-y-4 text-center md:text-left">
            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider">
                {anime.voiceStudio}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold uppercase">
                {anime.status}
              </span>
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-yellow-400 text-[10px] font-bold">
                <Star className="w-3 h-3 fill-yellow-400" />
                <span>{anime.rating} / 10</span>
              </div>
            </div>

            {/* Titles */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight leading-tight">
                {anime.titleUz}
              </h1>
              <p className="text-xs font-bold text-red-500 mt-1 uppercase tracking-widest">
                {anime.titleJp} ({anime.title})
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-zinc-800 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase font-bold">Yili</p>
                  <p className="font-bold text-white">{anime.year}-yil</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase font-bold">Davomiyligi</p>
                  <p className="font-bold text-white">{anime.duration}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase font-bold">Studiya</p>
                  <p className="font-bold text-white">{anime.studio}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase font-bold">Qismlar</p>
                  <p className="font-bold text-white">
                    {anime.releasedEpisodes} / {anime.totalEpisodes}
                  </p>
                </div>
              </div>
            </div>

            {/* Genres list */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-1">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider mr-1">Janrlar:</span>
              {anime.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 font-semibold"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Description Paragraph */}
            <p className="text-sm text-zinc-300 leading-relaxed pt-2">
              {anime.descriptionUz}
            </p>

            {/* Share Link Button */}
            <div className="pt-2 flex justify-center md:justify-start">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white transition-all uppercase tracking-wider cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Nusxalandi!' : "Ulashish"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Section for Episode List & Comments */}
        <div className="mt-10 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-6 shadow-xl">
          <div className="flex border-b border-zinc-800 gap-4 sm:gap-6 mb-6">
            <button
              onClick={() => setActiveTab('episodes')}
              className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'episodes'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>Qismlar ({anime.episodes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('comments')}
              className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'comments'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Fikrlar ({commentsList.length})</span>
            </button>
          </div>

          {/* Episodes Tab Content */}
          {activeTab === 'episodes' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {[...anime.episodes]
                .sort((a, b) => a.episodeNumber - b.episodeNumber)
                .map((ep) => (
                <div
                  key={ep.id}
                  onClick={() => onWatchEpisode(ep.episodeNumber)}
                  className="group relative bg-zinc-900 border border-zinc-800 hover:border-red-600 rounded-lg p-2.5 flex gap-3 cursor-pointer transition-colors"
                >
                  <div className="relative w-24 h-16 rounded overflow-hidden flex-shrink-0 bg-zinc-800">
                    <img src={ep.thumbnailUrl} alt={ep.titleUz} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                      <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow">
                        <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between py-0.5 flex-grow overflow-hidden">
                    <div>
                      <h4 className="font-bold text-xs text-white group-hover:text-red-500 transition-colors truncate">
                        {ep.titleUz}
                      </h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Davomiyligi: {ep.duration}</p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-semibold">
                      <span>{ep.releaseDate}</span>
                      <span className="text-red-500 font-bold">1080p HD</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comments Tab Content */}
          {activeTab === 'comments' && (
            <div className="space-y-6">
              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="flex gap-3">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Ushbu anime haqida fikringizni yozib qoldiring..."
                  className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                />
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-md shadow-red-950/60"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Yuborish</span>
                </button>
              </form>

              {/* Comment List */}
              <div className="space-y-4 pt-2">
                {commentsList.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">
                    Hali hech kim fikr bildirmadi. Birinchi bo'ling!
                  </p>
                ) : (
                  commentsList.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 flex gap-3.5"
                    >
                      <img
                        src={c.userAvatar}
                        alt={c.userName}
                        className="w-10 h-10 rounded-full object-cover border border-white/20"
                      />
                      <div className="flex-grow space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-white">{c.userName}</span>
                          <span className="text-xs text-gray-500">{c.date}</span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">{c.text}</p>
                        <div className="pt-2 flex items-center gap-2">
                          <button
                            onClick={() => handleLikeComment(c.id)}
                            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                              c.userLiked
                                ? 'bg-red-600/20 border-red-500 text-red-400'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{c.likes}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Related Anime Recommendations */}
        {relatedAnime.length > 0 && (
          <div className="mt-12">
            <h3 className="font-display font-bold text-2xl text-white mb-6 border-l-4 border-red-600 pl-3">
              O'xshash tavsiyalar
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedAnime.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectAnime(item)}
                  className="bg-[#0f0f15] border border-white/5 hover:border-red-500/50 rounded-xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1"
                >
                  <img src={item.poster} alt={item.titleUz} className="w-full aspect-[2/3] object-cover" />
                  <div className="p-3">
                    <h4 className="font-bold text-sm text-white line-clamp-1">{item.titleUz}</h4>
                    <span className="text-xs text-red-400 font-medium">{item.rating} ⭐</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
