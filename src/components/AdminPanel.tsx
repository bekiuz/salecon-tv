import React, { useState } from 'react';
import {
  Shield,
  Film,
  List,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  Users,
  Eye,
  Star,
  Check,
  X,
  Lock,
  Search,
  ArrowLeft,
  Sparkles,
  Tv,
  Play,
  Calendar,
  Layers,
  Save,
  AlertTriangle,
  Database,
  Upload,
  Video,
} from 'lucide-react';
import { Anime, Episode, User, UserRole, VoiceStudio, AnimeStatus } from '../types';
import { SupabaseConnectCard } from './SupabaseConnectCard';
import { supabaseService } from '../services/supabaseService';

interface AdminPanelProps {
  currentUser: User | null;
  animeList: Anime[];
  onAddAnime: (newAnime: Anime) => void;
  onUpdateAnime: (updatedAnime: Anime) => void;
  onDeleteAnime: (animeId: string) => void;
  users: User[];
  onUpdateUserRole: (userId: string, newRole: UserRole) => void;
  onNavigateHome: () => void;
  onOpenAuth: () => void;
  onRefreshData?: () => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  animeList,
  onAddAnime,
  onUpdateAnime,
  onDeleteAnime,
  users,
  onUpdateUserRole,
  onNavigateHome,
  onOpenAuth,
  onRefreshData,
}) => {
  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.email.toLowerCase() === 'bekiuz282@gmail.com');

  // Active sub-tab inside Admin Panel
  const [activeTab, setActiveTab] = useState<'stats' | 'anime' | 'episodes' | 'users' | 'database'>('stats');

  // State for Anime Modal (Add / Edit)
  const [isAnimeModalOpen, setIsAnimeModalOpen] = useState(false);
  const [editingAnime, setEditingAnime] = useState<Anime | null>(null);

  // Notification Banner State
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Loading states for async operations
  const [isSavingAnime, setIsSavingAnime] = useState(false);
  const [isDeletingAnime, setIsDeletingAnime] = useState(false);
  const [isSavingEpisode, setIsSavingEpisode] = useState(false);
  const [isDeletingEpisode, setIsDeletingEpisode] = useState(false);

  // Storage Upload loading & progress states
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [posterProgress, setPosterProgress] = useState(0);

  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerProgress, setBannerProgress] = useState(0);

  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [thumbnailProgress, setThumbnailProgress] = useState(0);

  // Confirmation Delete Modal States
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteEpConfirmId, setDeleteEpConfirmId] = useState<string | null>(null);

  // Media Image File Upload Handlers (Supabase Storage)
  const handlePosterFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPoster(true);
    setPosterProgress(10);
    showToast("Poster fayli siqilmoqda va Supabase 'posters' bucket-ga yuklanmoqda...", "info");

    const res = await supabaseService.uploadFile(file, "posters", (pct) => setPosterProgress(pct));
    setIsUploadingPoster(false);

    if (res.url) {
      setAnimePoster(res.url);
      showToast("Poster Supabase Storage-ga muvaffaqiyatli yuklandi!", "success");
    } else {
      showToast(res.error || "Poster yuklashda xatolik yuz berdi!", "error");
    }
  };

  const handleBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBanner(true);
    setBannerProgress(10);
    showToast("Banner fayli siqilmoqda va Supabase 'banners' bucket-ga yuklanmoqda...", "info");

    const res = await supabaseService.uploadFile(file, "banners", (pct) => setBannerProgress(pct));
    setIsUploadingBanner(false);

    if (res.url) {
      setAnimeBanner(res.url);
      showToast("Banner Supabase Storage-ga muvaffaqiyatli yuklandi!", "success");
    } else {
      showToast(res.error || "Banner yuklashda xatolik yuz berdi!", "error");
    }
  };

  const handleThumbnailFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingThumbnail(true);
    setThumbnailProgress(10);
    showToast("Thumbnail rasmi Supabase 'thumbnails' bucket-ga yuklanmoqda...", "info");

    const res = await supabaseService.uploadFile(file, "thumbnails", (pct) => setThumbnailProgress(pct));
    setIsUploadingThumbnail(false);

    if (res.url) {
      setEpThumbnailUrl(res.url);
      showToast("Thumbnail rasmi muvaffaqiyatli yuklandi va URL saqlandi!", "success");
    } else {
      showToast(res.error || "Thumbnail yuklashda xatolik yuz berdi!", "error");
    }
  };
  const [animeTitleUz, setAnimeTitleUz] = useState('');
  const [animeTitleJp, setAnimeTitleJp] = useState('');
  const [animePoster, setAnimePoster] = useState('');
  const [animeBanner, setAnimeBanner] = useState('');
  const [animeDescUz, setAnimeDescUz] = useState('');
  const [animeRating, setAnimeRating] = useState('9.5');
  const [animeYear, setAnimeYear] = useState('2026');
  const [animeStudio, setAnimeStudio] = useState('Selecon Animation');
  const [animeVoiceStudio, setAnimeVoiceStudio] = useState<VoiceStudio>('Selecon Dub');
  const [animeStatus, setAnimeStatus] = useState<AnimeStatus>('Efirda');
  const [animeGenresStr, setAnimeGenresStr] = useState('Jangari, Fantastika, Sarguzasht');
  const [animeAgeRating, setAnimeAgeRating] = useState('16+');
  const [animeDuration, setAnimeDuration] = useState('24 daq');

  // Search in Admin Anime List
  const [adminAnimeSearch, setAdminAnimeSearch] = useState('');

  // State for Episode Modal (Add / Edit)
  const [selectedAnimeIdForEp, setSelectedAnimeIdForEp] = useState<string>(animeList[0]?.id || '');
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);

  // Form inputs for Episode
  const [epNumber, setEpNumber] = useState(1);
  const [epTitleUz, setEpTitleUz] = useState('');
  const [epVideoUrl, setEpVideoUrl] = useState('');
  const [epThumbnailUrl, setEpThumbnailUrl] = useState('');
  const [epDuration, setEpDuration] = useState('24:00');

  // ACCESS DENIED GUARD if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4">
        <div className="max-w-md mx-auto bg-zinc-900 border border-red-900/40 rounded-2xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-800/60 text-red-500 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              Ruxsat Berilmagan!
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Admin Panel faqat administrator va tizim egasi (bekiuz282@gmail.com) uchun ochiq.
              Iltimos, admin hisobiga kiring.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={onOpenAuth}
              className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all cursor-pointer"
            >
              Admin Hisobiga Kirish
            </button>
            <button
              onClick={onNavigateHome}
              className="w-full py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-wider"
            >
              Bosh Sahifaga Qaytish
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Statistics Calculations
  const totalAnimeCount = animeList.length;
  const totalEpisodesCount = animeList.reduce((acc, a) => acc + (a.episodes?.length || 0), 0);
  const totalViewsCount = animeList.reduce((acc, a) => acc + (a.views || 0), 0);
  const totalUsersCount = users.length;
  const adminUsersCount = users.filter((u) => u.role === 'admin' || u.email.toLowerCase() === 'bekiuz282@gmail.com').length;

  // Open Add Anime Modal
  const handleOpenAddAnime = () => {
    setEditingAnime(null);
    setAnimeTitleUz('');
    setAnimeTitleJp('');
    setAnimePoster('https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600');
    setAnimeBanner('https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200');
    setAnimeDescUz('');
    setAnimeRating('9.6');
    setAnimeYear('2026');
    setAnimeStudio('Selecon Dub Studios');
    setAnimeVoiceStudio('Selecon Dub');
    setAnimeStatus('Efirda');
    setAnimeGenresStr('Jangari, Fantastika, Sarguzasht');
    setAnimeAgeRating('16+');
    setAnimeDuration('24 daq');
    setIsAnimeModalOpen(true);
  };

  // Open Edit Anime Modal
  const handleOpenEditAnime = (anime: Anime) => {
    setEditingAnime(anime);
    setAnimeTitleUz(anime.titleUz);
    setAnimeTitleJp(anime.titleJp || anime.title);
    setAnimePoster(anime.poster);
    setAnimeBanner(anime.banner);
    setAnimeDescUz(anime.descriptionUz);
    setAnimeRating(String(anime.rating));
    setAnimeYear(String(anime.year));
    setAnimeStudio(anime.studio);
    setAnimeVoiceStudio(anime.voiceStudio);
    setAnimeStatus(anime.status);
    setAnimeGenresStr(anime.genres.join(', '));
    setAnimeAgeRating(anime.ageRating);
    setAnimeDuration(anime.duration);
    setIsAnimeModalOpen(true);
  };

  // Validate Anime Form Fields
  const validateAnimeForm = (): string | null => {
    if (!animeTitleUz.trim()) {
      return "Iltimos, Anime nomini (O'zbekcha) kiriting!";
    }
    if (!animePoster.trim()) {
      return "Iltimos, Poster URL manzilini kiriting!";
    }
    if (!animeDescUz.trim()) {
      return "Iltimos, Anime tavsifini (O'zbekcha) kiriting!";
    }
    const numRating = parseFloat(animeRating);
    if (isNaN(numRating) || numRating < 0 || numRating > 10) {
      return "Reyting 0.0 va 10.0 orasida bo'lishi kerak!";
    }
    const numYear = parseInt(animeYear, 10);
    if (isNaN(numYear) || numYear < 1970 || numYear > 2035) {
      return "Iltimos, to'g'ri chiqarilgan yilini kiriting (masalan, 2026)!";
    }
    return null;
  };

  // Save Anime (Add or Update) with Supabase integration
  const handleSaveAnime = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateAnimeForm();
    if (validationError) {
      showToast(validationError, 'error');
      return;
    }

    setIsSavingAnime(true);
    const genresArray = animeGenresStr.split(',').map((g) => g.trim()).filter(Boolean);

    let animeToSave: Anime;

    if (editingAnime) {
      animeToSave = {
        ...editingAnime,
        titleUz: animeTitleUz.trim(),
        titleJp: animeTitleJp.trim() || editingAnime.titleJp || animeTitleUz.trim(),
        poster: animePoster.trim(),
        banner: animeBanner.trim() || animePoster.trim(),
        descriptionUz: animeDescUz.trim(),
        shortDescriptionUz: animeDescUz.trim().slice(0, 120) + '...',
        rating: parseFloat(animeRating) || 9.5,
        year: parseInt(animeYear, 10) || 2026,
        studio: animeStudio.trim() || 'Selecon Dub Studios',
        voiceStudio: animeVoiceStudio,
        status: animeStatus,
        genres: genresArray.length > 0 ? genresArray : editingAnime.genres,
        ageRating: animeAgeRating || '16+',
        duration: animeDuration || '24 daq',
      };
    } else {
      const newId = `anime-${Date.now()}`;
      animeToSave = {
        id: newId,
        title: animeTitleUz.trim(),
        titleUz: animeTitleUz.trim(),
        titleJp: animeTitleJp.trim() || animeTitleUz.trim(),
        poster: animePoster.trim(),
        banner: animeBanner.trim() || animePoster.trim(),
        descriptionUz: animeDescUz.trim(),
        shortDescriptionUz: animeDescUz.trim().slice(0, 120) + '...',
        rating: parseFloat(animeRating) || 9.5,
        year: parseInt(animeYear, 10) || 2026,
        totalEpisodes: 12,
        releasedEpisodes: 1,
        duration: animeDuration || '24 daq',
        studio: animeStudio.trim() || 'Selecon Dub Studios',
        status: animeStatus,
        genres: genresArray.length > 0 ? genresArray : ['Jangari', 'Fantastika'],
        tags: ['Uzbek Dub', 'HD'],
        voiceStudio: animeVoiceStudio,
        views: 0,
        ageRating: animeAgeRating || '16+',
        trending: true,
        episodes: [
          {
            id: `ep-${newId}-1`,
            episodeNumber: 1,
            title: '1-qism',
            titleUz: '1-qism: Muqaddima va Boshlanish',
            duration: '24:00',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            thumbnailUrl: animeBanner.trim() || animePoster.trim(),
            releaseDate: new Date().toISOString().split('T')[0],
          },
        ],
      };
    }

    const isSupabaseConfigured = supabaseService.isConfigured();

    if (isSupabaseConfigured) {
      // Direct Supabase save
      const savedSuccessfully = await supabaseService.saveAnime(animeToSave);

      if (savedSuccessfully) {
        if (onRefreshData) {
          await onRefreshData();
        } else {
          if (editingAnime) {
            onUpdateAnime(animeToSave);
          } else {
            onAddAnime(animeToSave);
          }
        }

        showToast(
          editingAnime
            ? `"${animeToSave.titleUz}" Supabase bazasida muvaffaqiyatli yangilandi!`
            : `"${animeToSave.titleUz}" Supabase "anime" jadvaliga saqlandi!`,
          'success'
        );
        setIsAnimeModalOpen(false);
      } else {
        showToast("Supabase bazasiga saqlashda xatolik yuz berdi! Tarmog'ingizni va Supabase sozlamalarini tekshiring.", 'error');
      }
    } else {
      // Fallback local update
      if (editingAnime) {
        onUpdateAnime(animeToSave);
      } else {
        onAddAnime(animeToSave);
      }
      showToast(
        editingAnime
          ? `"${animeToSave.titleUz}" ma'lumotlari yangilandi!`
          : `"${animeToSave.titleUz}" muvaffaqiyatli qo'shildi!`,
        'success'
      );
      setIsAnimeModalOpen(false);
    }

    setIsSavingAnime(false);
  };

  // Confirm Delete Anime handler
  const handleConfirmDeleteAnime = async () => {
    if (!deleteConfirmId) return;

    const targetAnime = animeList.find((a) => a.id === deleteConfirmId);
    const animeTitle = targetAnime?.titleUz || 'Anime';
    setIsDeletingAnime(true);

    const isSupabaseConfigured = supabaseService.isConfigured();

    if (isSupabaseConfigured) {
      const deletedSuccessfully = await supabaseService.deleteAnime(deleteConfirmId);
      if (deletedSuccessfully) {
        if (onRefreshData) {
          await onRefreshData();
        } else {
          onDeleteAnime(deleteConfirmId);
        }
        showToast(`"${animeTitle}" Supabase bazasidan va ro'yxatdan muvaffaqiyatli o'chirildi!`, 'success');
      } else {
        showToast(`"${animeTitle}"ni Supabase-dan o'chirishda xatolik yuz berdi!`, 'error');
      }
    } else {
      onDeleteAnime(deleteConfirmId);
      showToast(`"${animeTitle}" ro'yxatdan o'chirildi!`, 'success');
    }

    setIsDeletingAnime(false);
    setDeleteConfirmId(null);
  };

  // Selected Anime for Episode Management
  const currentAnimeForEp = animeList.find((a) => a.id === selectedAnimeIdForEp) || animeList[0];

  // Open Add Episode (Automatic episode numbering)
  const handleOpenAddEpisode = () => {
    if (!currentAnimeForEp) return;
    setEditingEpisode(null);
    const existingEpNums = currentAnimeForEp.episodes?.map((e) => e.episodeNumber) || [];
    const maxEpNum = existingEpNums.length > 0 ? Math.max(...existingEpNums) : 0;
    const nextEpNum = maxEpNum + 1;
    setEpNumber(nextEpNum);
    setEpTitleUz(`${nextEpNum}-qism`);
    setEpVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
    setEpThumbnailUrl(currentAnimeForEp.banner || currentAnimeForEp.poster);
    setEpDuration('24:15');
    setIsEpisodeModalOpen(true);
  };

  // Open Edit Episode
  const handleOpenEditEpisode = (ep: Episode) => {
    setEditingEpisode(ep);
    setEpNumber(ep.episodeNumber);
    setEpTitleUz(ep.titleUz);
    setEpVideoUrl(ep.videoUrl);
    setEpThumbnailUrl(ep.thumbnailUrl);
    setEpDuration(ep.duration);
    setIsEpisodeModalOpen(true);
  };

  // Validate Episode Form
  const validateEpisodeForm = (): string | null => {
    if (!epTitleUz.trim()) {
      return "Iltimos, Qism nomini (O'zbekcha) kiriting!";
    }
    if (!epVideoUrl.trim()) {
      return "Iltimos, Video Stream URL manzilini kiriting!";
    }
    if (epNumber <= 0) {
      return "Qism raqami 1 yoki undan yuqori bo'lishi kerak!";
    }
    return null;
  };

  // Save Episode with Supabase Integration and auto sorting
  const handleSaveEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAnimeForEp) return;

    const errorMsg = validateEpisodeForm();
    if (errorMsg) {
      showToast(errorMsg, 'error');
      return;
    }

    setIsSavingEpisode(true);

    let updatedEpisodes = [...(currentAnimeForEp.episodes || [])];
    let episodeToSave: Episode;

    if (editingEpisode) {
      episodeToSave = {
        ...editingEpisode,
        episodeNumber: epNumber,
        titleUz: epTitleUz.trim(),
        videoUrl: epVideoUrl.trim(),
        thumbnailUrl: epThumbnailUrl.trim() || currentAnimeForEp.banner || currentAnimeForEp.poster,
        duration: epDuration.trim() || '24:00',
      };
      updatedEpisodes = updatedEpisodes.map((ep) =>
        ep.id === editingEpisode.id ? episodeToSave : ep
      );
    } else {
      episodeToSave = {
        id: `ep-${currentAnimeForEp.id}-${Date.now()}`,
        episodeNumber: epNumber,
        title: `${epNumber}-qism`,
        titleUz: epTitleUz.trim(),
        duration: epDuration.trim() || '24:00',
        videoUrl: epVideoUrl.trim(),
        thumbnailUrl: epThumbnailUrl.trim() || currentAnimeForEp.banner || currentAnimeForEp.poster,
        releaseDate: new Date().toISOString().split('T')[0],
      };
      updatedEpisodes.push(episodeToSave);
    }

    // Sort episodes in ascending order by episodeNumber
    updatedEpisodes.sort((a, b) => a.episodeNumber - b.episodeNumber);

    const updatedAnime: Anime = {
      ...currentAnimeForEp,
      episodes: updatedEpisodes,
      releasedEpisodes: updatedEpisodes.length,
      totalEpisodes: Math.max(currentAnimeForEp.totalEpisodes || 0, updatedEpisodes.length),
    };

    const isSupabaseConfigured = supabaseService.isConfigured();

    if (isSupabaseConfigured) {
      const savedEpSuccess = await supabaseService.saveEpisode(currentAnimeForEp.id, episodeToSave);
      await supabaseService.saveAnime(updatedAnime);

      if (savedEpSuccess) {
        if (onRefreshData) {
          await onRefreshData();
        } else {
          onUpdateAnime(updatedAnime);
        }
        showToast(`${epNumber}-qism Supabase bazasiga saqlandi!`, 'success');
        setIsEpisodeModalOpen(false);
      } else {
        showToast("Supabase-ga qismni saqlashda xatolik yuz berdi!", 'error');
      }
    } else {
      onUpdateAnime(updatedAnime);
      showToast(`${epNumber}-qism saqlandi!`, 'success');
      setIsEpisodeModalOpen(false);
    }

    setIsSavingEpisode(false);
  };

  // Delete Episode with Supabase integration
  const handleDeleteEpisode = async (epId: string) => {
    if (!currentAnimeForEp) return;

    let updatedEpisodes = currentAnimeForEp.episodes.filter((ep) => ep.id !== epId);
    updatedEpisodes.sort((a, b) => a.episodeNumber - b.episodeNumber);

    const updatedAnime: Anime = {
      ...currentAnimeForEp,
      episodes: updatedEpisodes,
      releasedEpisodes: updatedEpisodes.length,
    };

    const isSupabaseConfigured = supabaseService.isConfigured();

    if (isSupabaseConfigured) {
      const deletedEpSuccess = await supabaseService.deleteEpisode(epId);
      await supabaseService.saveAnime(updatedAnime);

      if (deletedEpSuccess) {
        if (onRefreshData) {
          await onRefreshData();
        } else {
          onUpdateAnime(updatedAnime);
        }
        showToast("Qism Supabase bazasidan va ro'yxatdan o'chirildi!", 'success');
      } else {
        showToast("Qismni Supabase-dan o'chirishda xatolik yuz berdi!", 'error');
      }
    } else {
      onUpdateAnime(updatedAnime);
      showToast("Qism o'chirildi!", 'success');
    }
  };

  // Confirm Delete Episode handler
  const handleConfirmDeleteEpisode = async () => {
    if (!deleteEpConfirmId) return;
    setIsDeletingEpisode(true);
    await handleDeleteEpisode(deleteEpConfirmId);
    setIsDeletingEpisode(false);
    setDeleteEpConfirmId(null);
  };

  const filteredAnimeList = animeList.filter(
    (a) =>
      a.titleUz.toLowerCase().includes(adminAnimeSearch.toLowerCase()) ||
      a.title.toLowerCase().includes(adminAnimeSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </span>
              <span className="text-xs text-zinc-400 font-bold flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    supabaseService.isConfigured()
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                      : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                  }`}
                />
                <span>{supabaseService.isConfigured() ? 'Supabase Online' : 'Lokal Rejim'}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white border-l-4 border-red-600 pl-3">
              Boshqaruv Paneli
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="px-4 py-2 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Saytga Qaytish</span>
            </button>
          </div>
        </div>

        {/* Global Action Toast Notification Banner */}
        {notification && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-3 shadow-2xl transition-all animate-fadeIn ${
              notification.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-600/80 text-emerald-200'
                : notification.type === 'error'
                ? 'bg-red-950/90 border-red-600/80 text-red-200'
                : 'bg-zinc-900 border-zinc-700 text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
              {notification.type === 'success' ? (
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : notification.type === 'error' ? (
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              ) : (
                <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="p-1 rounded hover:bg-black/30 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Sub-Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-2">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.4)]'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Statistika & Metrikalar</span>
          </button>

          <button
            onClick={() => setActiveTab('anime')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'anime'
                ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.4)]'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Animelarni Boshqarish ({totalAnimeCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('episodes')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'episodes'
                ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.4)]'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Qismlar Boshqaruvi ({totalEpisodesCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.4)]'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users Table & Roles ({totalUsersCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'database'
                ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'bg-zinc-900 border border-emerald-900/60 text-emerald-400 hover:bg-emerald-950/40'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Supabase Database</span>
          </button>
        </div>

        {/* TAB: SUPABASE DATABASE */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <SupabaseConnectCard animeList={animeList} users={users} />
          </div>
        )}

        {/* TAB 1: STATISTICS */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Jami Animelar</span>
                  <Film className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-3xl font-black text-white">{totalAnimeCount} ta</div>
                <p className="text-[10px] text-zinc-500">Katalogdagi animelar soni</p>
              </div>

              <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Jami Qismlar</span>
                  <List className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-3xl font-black text-white">{totalEpisodesCount} ta</div>
                <p className="text-[10px] text-zinc-500">Yuklangan o'zbekcha qismlar</p>
              </div>

              <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Jami Ko'rishlar</span>
                  <Eye className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-3xl font-black text-white">
                  {totalViewsCount.toLocaleString('uz-UZ')}
                </div>
                <p className="text-[10px] text-zinc-500">Tomoshabinlar soni</p>
              </div>

              <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Foydalanuvchilar</span>
                  <Users className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-3xl font-black text-white">{totalUsersCount} ta</div>
                <p className="text-[10px] text-zinc-500">Adminlar: {adminUsersCount} ta</p>
              </div>
            </div>

            {/* Popular & Recently Added Lists in Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recently Added Anime */}
              <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white border-l-4 border-red-600 pl-3">
                    Yaqinda Qo'shilgan Animelar
                  </h3>
                  <span className="text-xs text-zinc-500 font-semibold">{totalAnimeCount} ta</span>
                </div>
                <div className="divide-y divide-zinc-800/80">
                  {animeList.slice(0, 5).map((anime, idx) => (
                    <div key={anime.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-5 text-center font-black text-red-500 text-xs">
                          #{idx + 1}
                        </span>
                        <img
                          src={anime.poster}
                          alt={anime.titleUz}
                          className="w-10 h-12 object-cover rounded border border-zinc-800"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase">{anime.titleUz}</h4>
                          <p className="text-[10px] text-zinc-500">
                            {anime.year} • {anime.studio}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-red-400 block">
                          {anime.releasedEpisodes || anime.episodes?.length || 0} qism
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {anime.views.toLocaleString()} ko'rishlar
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recently Added Episodes */}
              <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white border-l-4 border-red-600 pl-3">
                    Yaqinda Qo'shilgan Qismlar
                  </h3>
                  <span className="text-xs text-zinc-500 font-semibold">{totalEpisodesCount} ta</span>
                </div>
                <div className="divide-y divide-zinc-800/80">
                  {animeList
                    .flatMap((a) =>
                      (a.episodes || []).map((ep) => ({
                        ...ep,
                        animeTitle: a.titleUz,
                        animePoster: a.poster,
                      }))
                    )
                    .slice(-5)
                    .reverse()
                    .map((ep) => (
                      <div key={ep.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={ep.thumbnailUrl || ep.animePoster}
                            alt={ep.titleUz}
                            className="w-12 h-9 object-cover rounded border border-zinc-800"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-white truncate max-w-[180px]">
                              {ep.titleUz}
                            </h4>
                            <p className="text-[10px] text-zinc-500">{ep.animeTitle}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-400 block">
                            {ep.episodeNumber}-qism
                          </span>
                          <span className="text-[10px] text-zinc-500">{ep.duration}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ANIME MANAGEMENT */}
        {activeTab === 'anime' && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Anime izlash..."
                  value={adminAnimeSearch}
                  onChange={(e) => setAdminAnimeSearch(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
                />
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              </div>

              <button
                onClick={handleOpenAddAnime}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Yangi Anime Qo‘shish</span>
              </button>
            </div>

            {/* Anime Table */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-x-auto shadow-xl">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase tracking-wider text-[10px] border-b border-zinc-800">
                  <tr>
                    <th className="p-3">Poster</th>
                    <th className="p-3">Anime Nomi (Uzbek / Original)</th>
                    <th className="p-3">Dublyaj / Studiya</th>
                    <th className="p-3">Qismlar</th>
                    <th className="p-3">Reyting</th>
                    <th className="p-3 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredAnimeList.map((anime) => (
                    <tr key={anime.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-3">
                        <img
                          src={anime.poster}
                          alt={anime.titleUz}
                          className="w-10 h-14 object-cover rounded border border-zinc-800"
                        />
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-white text-xs">{anime.titleUz}</div>
                        <div className="text-[10px] text-zinc-500">{anime.title}</div>
                        <div className="flex gap-1 mt-1">
                          {anime.genres.slice(0, 2).map((g) => (
                            <span
                              key={g}
                              className="px-1.5 py-0.2 rounded bg-zinc-800 text-[9px] text-zinc-400"
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-red-400">{anime.voiceStudio}</span>
                        <div className="text-[10px] text-zinc-500">{anime.studio}</div>
                      </td>
                      <td className="p-3 font-semibold text-zinc-200">
                        {anime.releasedEpisodes} / {anime.totalEpisodes} qism
                      </td>
                      <td className="p-3 font-bold text-yellow-400 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400" />
                        <span>{anime.rating}</span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditAnime(anime)}
                            className="p-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-colors cursor-pointer"
                            title="Tahrirlash"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(anime.id)}
                            className="p-2 rounded bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-red-400 transition-colors cursor-pointer"
                            title="O‘chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: EPISODE MANAGEMENT */}
        {activeTab === 'episodes' && (
          <div className="space-y-6">
            {/* Anime Selector Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Anime Tanlang:
                </span>
                <select
                  value={selectedAnimeIdForEp}
                  onChange={(e) => setSelectedAnimeIdForEp(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 font-bold"
                >
                  {animeList.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.titleUz} ({a.releasedEpisodes} qism)
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleOpenAddEpisode}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Qism Qo‘shish</span>
              </button>
            </div>

            {/* Episodes List for Selected Anime */}
            {currentAnimeForEp && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider border-l-4 border-red-600 pl-3">
                    {currentAnimeForEp.titleUz} — Qismlar Ro‘yxati
                  </h3>
                  <span className="text-xs text-zinc-400 font-semibold">
                    Jami: {currentAnimeForEp.episodes.length} ta qism
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {[...(currentAnimeForEp.episodes || [])]
                    .sort((a, b) => a.episodeNumber - b.episodeNumber)
                    .map((ep) => (
                    <div
                      key={ep.id}
                      className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex gap-3 items-center justify-between"
                    >
                      <div className="flex gap-3 items-center overflow-hidden">
                        <img
                          src={ep.thumbnailUrl}
                          alt={ep.titleUz}
                          className="w-16 h-12 object-cover rounded border border-zinc-800 shrink-0"
                        />
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-white truncate">{ep.titleUz}</h4>
                          <p className="text-[10px] text-zinc-500">
                            Davomiyligi: {ep.duration} • {ep.releaseDate}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEditEpisode(ep)}
                          className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                          title="Tahrirlash"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteEpConfirmId(ep.id)}
                          className="p-1.5 rounded bg-red-950 border border-red-800 text-red-400 hover:bg-red-900 cursor-pointer"
                          title="Qismni O‘chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: USERS & ROLES (Supabase Ready Table) */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-l-4 border-red-600 pl-3">
                  Supabase Users Table & Role-Based Access Control
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Foydalanuvchilar va ularning rollarini boshqarish (`user` / `admin`).
                </p>
              </div>
              <span className="px-3 py-1 rounded bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300">
                Jami: {users.length} user
              </span>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-x-auto shadow-xl">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase tracking-wider text-[10px] border-b border-zinc-800">
                  <tr>
                    <th className="p-3">User ID (UUID)</th>
                    <th className="p-3">Foydalanuvchi Nomi</th>
                    <th className="p-3">Email Manzili</th>
                    <th className="p-3">Sana</th>
                    <th className="p-3">Joriy Rol</th>
                    <th className="p-3 text-right">Rolni O'zgartirish</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {users.map((u) => {
                    const isUserOwner = u.email.toLowerCase() === 'bekiuz282@gmail.com';
                    return (
                      <tr key={u.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="p-3 font-mono text-[11px] text-zinc-500">{u.id}</td>
                        <td className="p-3 font-bold text-white flex items-center gap-2">
                          <span>{u.name}</span>
                          {isUserOwner && (
                            <span className="px-2 py-0.2 rounded bg-amber-500/20 border border-amber-500/40 text-[9px] text-amber-300 font-bold uppercase">
                              Owner
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-zinc-300">{u.email}</td>
                        <td className="p-3 text-zinc-500">{u.createdAt}</td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              u.role === 'admin'
                                ? 'bg-red-600 text-white shadow-[0_0_8px_rgba(220,38,38,0.5)]'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onUpdateUserRole(u.id, 'user')}
                              disabled={u.role === 'user'}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                                u.role === 'user'
                                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer'
                              }`}
                            >
                              Make User
                            </button>

                            <button
                              onClick={() => onUpdateUserRole(u.id, 'admin')}
                              disabled={u.role === 'admin'}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                                u.role === 'admin'
                                  ? 'bg-red-950 text-red-700 cursor-not-allowed border border-red-900'
                                  : 'bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow'
                              }`}
                            >
                              Make Admin
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ANIME MODAL (ADD / EDIT) */}
      {isAnimeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAnimeModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black uppercase text-white border-l-4 border-red-600 pl-3">
              {editingAnime ? 'Animeni Tahrirlash' : 'Yangi Anime Qo‘shish'}
            </h3>

            <form onSubmit={handleSaveAnime} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-bold uppercase mb-1">
                    Anime Nomi (O'zbekcha)
                  </label>
                  <input
                    type="text"
                    required
                    value={animeTitleUz}
                    onChange={(e) => setAnimeTitleUz(e.target.value)}
                    placeholder="Masalan: Solo Leveling: Yangi Mavsum"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold uppercase mb-1">
                    Original Nomi (Ingliz / Yapon)
                  </label>
                  <input
                    type="text"
                    value={animeTitleJp}
                    onChange={(e) => setAnimeTitleJp(e.target.value)}
                    placeholder="Masalan: Ore dake Level Up na Ken"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* POSTER UPLOAD */}
                <div className="space-y-2 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-300 font-bold uppercase text-[11px] flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-red-500" />
                      <span>Poster Rasm</span>
                    </label>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">posters bucket</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {animePoster ? (
                      <img
                        src={animePoster}
                        alt="Poster"
                        className="w-12 h-16 object-cover rounded border border-zinc-700 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-zinc-900 border border-dashed border-zinc-700 rounded flex items-center justify-center text-zinc-600 text-[10px] font-bold shrink-0">
                        Rasm Yo'q
                      </div>
                    )}

                    <div className="flex-1 space-y-1.5">
                      <label className="cursor-pointer w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-3 rounded flex items-center justify-center gap-2 transition-all shadow-[0_0_12px_rgba(220,38,38,0.3)]">
                        {isUploadingPoster ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{isUploadingPoster ? `Yuklanmoqda (${posterProgress}%)...` : 'Poster Yuklash'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePosterFileUpload}
                          className="hidden"
                          disabled={isUploadingPoster}
                        />
                      </label>

                      <input
                        type="text"
                        required
                        value={animePoster}
                        onChange={(e) => setAnimePoster(e.target.value)}
                        placeholder="yoki URL kiriting: https://..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-[11px] text-zinc-300 focus:outline-none focus:border-red-600"
                      />
                    </div>
                  </div>

                  {isUploadingPoster && (
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-red-600 h-full transition-all duration-300"
                        style={{ width: `${posterProgress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* BANNER UPLOAD */}
                <div className="space-y-2 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-300 font-bold uppercase text-[11px] flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-red-500" />
                      <span>Banner Rasm</span>
                    </label>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">banners bucket</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {animeBanner ? (
                      <img
                        src={animeBanner}
                        alt="Banner"
                        className="w-20 h-12 object-cover rounded border border-zinc-700 shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-12 bg-zinc-900 border border-dashed border-zinc-700 rounded flex items-center justify-center text-zinc-600 text-[10px] font-bold shrink-0">
                        Rasm Yo'q
                      </div>
                    )}

                    <div className="flex-1 space-y-1.5">
                      <label className="cursor-pointer w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs py-2 px-3 rounded flex items-center justify-center gap-2 border border-zinc-700 transition-all">
                        {isUploadingBanner ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 text-red-500" />
                        )}
                        <span>{isUploadingBanner ? `Yuklanmoqda (${bannerProgress}%)...` : 'Banner Yuklash'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBannerFileUpload}
                          className="hidden"
                          disabled={isUploadingBanner}
                        />
                      </label>

                      <input
                        type="text"
                        required
                        value={animeBanner}
                        onChange={(e) => setAnimeBanner(e.target.value)}
                        placeholder="yoki URL kiriting: https://..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-[11px] text-zinc-300 focus:outline-none focus:border-red-600"
                      />
                    </div>
                  </div>

                  {isUploadingBanner && (
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-red-600 h-full transition-all duration-300"
                        style={{ width: `${bannerProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-zinc-400 font-bold uppercase mb-1">
                    Reyting (1-10)
                  </label>
                  <input
                    type="text"
                    value={animeRating}
                    onChange={(e) => setAnimeRating(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold uppercase mb-1">
                    Yili
                  </label>
                  <input
                    type="text"
                    value={animeYear}
                    onChange={(e) => setAnimeYear(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold uppercase mb-1">
                    Ovoz Studiyasi
                  </label>
                  <select
                    value={animeVoiceStudio}
                    onChange={(e) => setAnimeVoiceStudio(e.target.value as VoiceStudio)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white"
                  >
                    <option value="Selecon Dub">Selecon Dub</option>
                    <option value="Anidub">Anidub</option>
                    <option value="Subtitr">Subtitr</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold uppercase mb-1">
                    Holati
                  </label>
                  <select
                    value={animeStatus}
                    onChange={(e) => setAnimeStatus(e.target.value as AnimeStatus)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white"
                  >
                    <option value="Efirda">Efirda</option>
                    <option value="Tugallangan">Tugallangan</option>
                    <option value="Kutilmoqda">Kutilmoqda</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">
                  Janrlar (Vergul bilan ajratilgan)
                </label>
                <input
                  type="text"
                  value={animeGenresStr}
                  onChange={(e) => setAnimeGenresStr(e.target.value)}
                  placeholder="Jangari, Fantastika, Sarguzasht"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">
                  Tavsif (O'zbekcha)
                </label>
                <textarea
                  rows={4}
                  value={animeDescUz}
                  onChange={(e) => setAnimeDescUz(e.target.value)}
                  placeholder="Anime haqida batafsil ma'lumot kiriting..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-red-600"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAnimeModalOpen(false)}
                  disabled={isSavingAnime}
                  className="px-4 py-2 rounded bg-zinc-800 text-zinc-300 font-bold uppercase cursor-pointer hover:bg-zinc-700"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSavingAnime}
                  className="px-6 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-bold uppercase shadow-[0_0_12px_rgba(220,38,38,0.4)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingAnime && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>{isSavingAnime ? 'Saqlanmoqda...' : 'Saqlash'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EPISODE MODAL (ADD / EDIT) */}
      {isEpisodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <button
              onClick={() => setIsEpisodeModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black uppercase text-white border-l-4 border-red-600 pl-3">
              {editingEpisode ? 'Qismni Tahrirlash' : 'Yangi Qism Qo‘shish'}
            </h3>

            <form onSubmit={handleSaveEpisode} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-bold uppercase mb-1">
                    Qism Raqami
                  </label>
                  <input
                    type="number"
                    value={epNumber}
                    onChange={(e) => setEpNumber(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold uppercase mb-1">
                    Davomiyligi
                  </label>
                  <input
                    type="text"
                    value={epDuration}
                    onChange={(e) => setEpDuration(e.target.value)}
                    placeholder="24:00"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">
                  Qism Nomi (O'zbekcha)
                </label>
                <input
                  type="text"
                  required
                  value={epTitleUz}
                  onChange={(e) => setEpTitleUz(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">
                  Video Stream MP4 URL
                </label>
                <input
                  type="text"
                  required
                  value={epVideoUrl}
                  onChange={(e) => setEpVideoUrl(e.target.value)}
                  placeholder="https://...mp4 yoki HLS stream URL"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-red-600"
                />
              </div>

              {/* THUMBNAIL UPLOAD */}
              <div className="space-y-2 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-300 font-bold uppercase text-[11px] flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-red-500" />
                    <span>Thumbnail Rasm</span>
                  </label>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">thumbnails bucket</span>
                </div>

                <div className="flex items-center gap-3">
                  {epThumbnailUrl ? (
                    <img
                      src={epThumbnailUrl}
                      alt="Thumbnail"
                      className="w-16 h-10 object-cover rounded border border-zinc-700 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-10 bg-zinc-900 border border-dashed border-zinc-700 rounded flex items-center justify-center text-zinc-600 text-[10px] font-bold shrink-0">
                      Rasm Yo'q
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <label className="cursor-pointer w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs py-2 px-3 rounded flex items-center justify-center gap-2 border border-zinc-700 transition-all">
                      {isUploadingThumbnail ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-red-500" />
                      )}
                      <span>
                        {isUploadingThumbnail
                          ? `Yuklanmoqda (${thumbnailProgress}%)...`
                          : 'Thumbnail Rasm Yuklash'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailFileUpload}
                        className="hidden"
                        disabled={isUploadingThumbnail}
                      />
                    </label>

                    <input
                      type="text"
                      value={epThumbnailUrl}
                      onChange={(e) => setEpThumbnailUrl(e.target.value)}
                      placeholder="yoki URL kiriting: https://..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-[11px] text-zinc-300 focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                {isUploadingThumbnail && (
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-red-600 h-full transition-all duration-300"
                      style={{ width: `${thumbnailProgress}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEpisodeModalOpen(false)}
                  disabled={isSavingEpisode}
                  className="px-4 py-2 rounded bg-zinc-800 text-zinc-300 font-bold uppercase cursor-pointer hover:bg-zinc-700"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSavingEpisode}
                  className="px-6 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-bold uppercase shadow-[0_0_12px_rgba(220,38,38,0.4)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingEpisode && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>{isSavingEpisode ? 'Saqlanmoqda...' : 'Saqlash'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ANIME DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-zinc-900 border border-red-900/50 rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-black uppercase text-white">Animeni O‘chirmoqchimisiz?</h3>
            <p className="text-xs text-zinc-400">
              Ushbu harakat qaytarib bo'lmaydi va barcha qismlar Supabase bazasi hamda katalogdan o'chiriladi.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeletingAnime}
                className="px-4 py-2 rounded bg-zinc-800 text-zinc-300 font-bold text-xs uppercase cursor-pointer hover:bg-zinc-700"
              >
                Yo'q, Bekor Qilish
              </button>
              <button
                onClick={handleConfirmDeleteAnime}
                disabled={isDeletingAnime}
                className="px-5 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase shadow flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeletingAnime && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>{isDeletingAnime ? "O'chirilmoqda..." : "Ha, O‘chirish"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EPISODE DELETE CONFIRMATION MODAL */}
      {deleteEpConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-zinc-900 border border-red-900/50 rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-black uppercase text-white">Qismni O‘chirmoqchimisiz?</h3>
            <p className="text-xs text-zinc-400">
              Ushbu qism Supabase bazasi hamda ro'yxatdan batamom o'chiriladi.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteEpConfirmId(null)}
                disabled={isDeletingEpisode}
                className="px-4 py-2 rounded bg-zinc-800 text-zinc-300 font-bold text-xs uppercase cursor-pointer hover:bg-zinc-700"
              >
                Yo'q, Bekor Qilish
              </button>
              <button
                onClick={handleConfirmDeleteEpisode}
                disabled={isDeletingEpisode}
                className="px-5 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase shadow flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeletingEpisode && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>{isDeletingEpisode ? "O'chirilmoqda..." : "Ha, O‘chirish"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
