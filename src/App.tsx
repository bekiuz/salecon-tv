import React, { useState, useEffect } from 'react';
import { ViewMode, Anime, User, UserRole } from './types';
import { ANIME_DATABASE } from './data/animeData';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroBanner } from './components/HeroBanner';
import { AnimeSection } from './components/AnimeSection';
import { LatestEpisodesSection } from './components/LatestEpisodesSection';
import { AnimeDetail } from './components/AnimeDetail';
import { VideoPlayer } from './components/VideoPlayer';
import { GenresView } from './components/GenresView';
import { SearchView } from './components/SearchView';
import { FavoritesView } from './components/FavoritesView';
import { AnimeCatalogView } from './components/AnimeCatalogView';
import { AdminPanel } from './components/AdminPanel';
import { ProfileView } from './components/ProfileView';
import { AuthModal } from './components/AuthModal';
import { supabaseService } from './services/supabaseService';

const INITIAL_USERS: User[] = [
  {
    id: 'owner-1',
    email: 'bekiuz282@gmail.com',
    name: 'Bek (Owner)',
    role: 'admin',
    createdAt: '2026-01-01',
  },
  {
    id: 'admin-1',
    email: 'admin@selecon.tv',
    name: 'Administrator',
    role: 'admin',
    createdAt: '2026-01-05',
  },
  {
    id: 'user-1',
    email: 'user@selecon.tv',
    name: 'Anime Ishqibozi',
    role: 'user',
    createdAt: '2026-02-01',
  },
];

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Dynamic Anime Database State with localStorage fallback
  const [animeList, setAnimeList] = useState<Anime[]>(() => {
    try {
      const saved = localStorage.getItem('selecon_anime_db');
      return saved ? JSON.parse(saved) : ANIME_DATABASE;
    } catch {
      return ANIME_DATABASE;
    }
  });

  // Initial fetch from Supabase if configured
  const refreshData = async () => {
    if (supabaseService.isConfigured()) {
      const remoteAnime = await supabaseService.getAllAnime();
      if (remoteAnime !== null) {
        setAnimeList(remoteAnime);
      }
      const remoteUsers = await supabaseService.getAllUsers();
      if (remoteUsers && remoteUsers.length > 0) {
        setUsers(remoteUsers);
      }
    }
  };

  useEffect(() => {
    async function loadFromSupabase() {
      if (supabaseService.isConfigured()) {
        await refreshData();

        // Restore active Supabase session user if present
        const sessionUser = await supabaseService.getCurrentSessionUser();
        if (sessionUser) {
          setCurrentUser(sessionUser);
        }
      }
    }
    loadFromSupabase();
  }, []);

  // Save to localStorage ONLY when Supabase is NOT configured
  useEffect(() => {
    if (!supabaseService.isConfigured()) {
      try {
        localStorage.setItem('selecon_anime_db', JSON.stringify(animeList));
      } catch (e) {
        console.error(e);
      }
    }
  }, [animeList]);

  // Registered Users State
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('selecon_users');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  useEffect(() => {
    if (!supabaseService.isConfigured()) {
      try {
        localStorage.setItem('selecon_users', JSON.stringify(users));
      } catch (e) {
        console.error(e);
      }
    }
  }, [users]);

  // Current Logged-in User State (Defaults to Owner Account for seamless access)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('selecon_current_user');
      return saved ? JSON.parse(saved) : INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  });

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('selecon_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('selecon_current_user');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(animeList[0] || null);

  // Automatically keep selectedAnime synced with current animeList
  useEffect(() => {
    if (animeList.length > 0) {
      if (!selectedAnime || !animeList.some((a) => a.id === selectedAnime.id)) {
        setSelectedAnime(animeList[0]);
      }
    }
  }, [animeList]);
  const [selectedEpisodeNumber, setSelectedEpisodeNumber] = useState<number>(1);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('selecon_favorites');
      return saved ? JSON.parse(saved) : ['solo-leveling', 'demon-slayer'];
    } catch {
      return ['solo-leveling', 'demon-slayer'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('selecon_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  const handleToggleFavorite = (anime: Anime) => {
    setFavorites((prev) =>
      prev.includes(anime.id) ? prev.filter((id) => id !== anime.id) : [...prev, anime.id]
    );
  };

  const isFavorite = (animeId: string) => favorites.includes(animeId);

  const handleSelectAnime = (anime: Anime) => {
    setSelectedAnime(anime);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWatchAnime = (anime: Anime, episodeNumber: number = 1) => {
    setSelectedAnime(anime);
    setSelectedEpisodeNumber(episodeNumber);
    setCurrentView('watch');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view: ViewMode) => {
    // Protected Admin Route Guard
    if (view === 'admin') {
      const isAdminUser =
        currentUser &&
        (currentUser.role === 'admin' || currentUser.email.toLowerCase() === 'bekiuz282@gmail.com');

      if (!isAdminUser) {
        setIsAuthModalOpen(true);
        setCurrentView('admin'); // AdminPanel component displays security guard layout
        return;
      }
    }

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin Data Management Callbacks with Supabase Async Mirroring
  const handleAddAnime = (newAnime: Anime) => {
    setAnimeList((prev) => [newAnime, ...prev]);
    if (supabaseService.isConfigured()) {
      supabaseService.saveAnime(newAnime);
    }
  };

  const handleUpdateAnime = (updatedAnime: Anime) => {
    setAnimeList((prev) => prev.map((a) => (a.id === updatedAnime.id ? updatedAnime : a)));
    if (selectedAnime && selectedAnime.id === updatedAnime.id) {
      setSelectedAnime(updatedAnime);
    }
    if (supabaseService.isConfigured()) {
      supabaseService.saveAnime(updatedAnime);
    }
  };

  const handleDeleteAnime = (animeId: string) => {
    setAnimeList((prev) => prev.filter((a) => a.id !== animeId));
    if (selectedAnime && selectedAnime.id === animeId) {
      setSelectedAnime(animeList.find((a) => a.id !== animeId) || null);
    }
    if (supabaseService.isConfigured()) {
      supabaseService.deleteAnime(animeId);
    }
  };

  const handleRegisterUser = (newUser: User) => {
    setUsers((prev) => {
      const exists = prev.some((u) => u.email.toLowerCase() === newUser.email.toLowerCase());
      if (exists) {
        return prev.map((u) => (u.email.toLowerCase() === newUser.email.toLowerCase() ? newUser : u));
      }
      return [...prev, newUser];
    });
    if (supabaseService.isConfigured()) {
      supabaseService.saveUser(newUser);
    }
  };

  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, role: newRole } : null));
    }
    if (supabaseService.isConfigured()) {
      supabaseService.updateUserRole(userId, newRole);
    }
  };


  const featuredAnime = animeList.filter((a) => a.featured);
  const popularAnime = animeList.filter((a) => a.popular);
  const trendingAnime = animeList.filter((a) => a.trending);
  const newAnime = animeList.filter((a) => a.isNew);
  const favoriteAnimeList = animeList.filter((a) => favorites.includes(a.id));

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        favoritesCount={favorites.length}
        onSearchClick={() => handleNavigate('search')}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {currentView === 'home' && (
          <div className="space-y-6">
            {/* Hero Featured Slider */}
            <HeroBanner
              featuredAnimeList={featuredAnime.length > 0 ? featuredAnime : animeList.slice(0, 3)}
              onWatchAnime={handleWatchAnime}
              onSelectAnime={handleSelectAnime}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={isFavorite}
            />

            {/* So'nggi Qismlar Section */}
            <LatestEpisodesSection
              allAnime={animeList}
              onWatchAnime={handleWatchAnime}
            />

            {/* Mashhur Animelar Section */}
            <AnimeSection
              titleUz="Mashhur Animelar"
              subtitleUz="Platformamizdagi eng ko'p ko'rilgan va sevib tomosha qilinadigan animelar"
              iconType="flame"
              animeList={popularAnime.length > 0 ? popularAnime : animeList.slice(0, 4)}
              onSelectAnime={handleSelectAnime}
              onWatchAnime={handleWatchAnime}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={isFavorite}
              onViewAll={() => handleNavigate('catalog')}
            />

            {/* Trenddagi Animelar Section */}
            <AnimeSection
              titleUz="Trenddagi Animelar"
              subtitleUz="Hozirgi kunda dunyo va O'zbekiston bo'ylab eng ko'p muhokama qilinayotgan san'at asarlari"
              iconType="trending"
              animeList={trendingAnime.length > 0 ? trendingAnime : animeList.slice(0, 4)}
              onSelectAnime={handleSelectAnime}
              onWatchAnime={handleWatchAnime}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={isFavorite}
              onViewAll={() => handleNavigate('catalog')}
            />

            {/* Yangi Animelar Section */}
            <AnimeSection
              titleUz="Yangi Animelar"
              subtitleUz="Yaqinda efirga uzatila boshlagan va dublyaj qilingan yangi mavsumlar"
              iconType="sparkles"
              animeList={newAnime.length > 0 ? newAnime : animeList.slice(0, 4)}
              onSelectAnime={handleSelectAnime}
              onWatchAnime={handleWatchAnime}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={isFavorite}
              onViewAll={() => handleNavigate('catalog')}
            />
          </div>
        )}

        {currentView === 'catalog' && (
          <AnimeCatalogView
            allAnime={animeList}
            onSelectAnime={handleSelectAnime}
            onWatchAnime={handleWatchAnime}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={isFavorite}
          />
        )}

        {currentView === 'genres' && (
          <GenresView
            allAnime={animeList}
            onSelectAnime={handleSelectAnime}
            onWatchAnime={handleWatchAnime}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={isFavorite}
          />
        )}

        {currentView === 'search' && (
          <SearchView
            allAnime={animeList}
            onSelectAnime={handleSelectAnime}
            onWatchAnime={handleWatchAnime}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={isFavorite}
          />
        )}

        {currentView === 'favorites' && (
          <FavoritesView
            favoritesAnime={favoriteAnimeList}
            onSelectAnime={handleSelectAnime}
            onWatchAnime={handleWatchAnime}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={isFavorite}
            onExploreClick={() => handleNavigate('catalog')}
          />
        )}

        {currentView === 'detail' && selectedAnime && (
          <AnimeDetail
            anime={selectedAnime}
            onBack={() => handleNavigate('home')}
            onWatchEpisode={(epNum) => handleWatchAnime(selectedAnime, epNum)}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={isFavorite(selectedAnime.id)}
            onSelectAnime={handleSelectAnime}
            allAnime={animeList}
          />
        )}

        {currentView === 'watch' && selectedAnime && (
          <VideoPlayer
            anime={selectedAnime}
            currentEpisodeNumber={selectedEpisodeNumber}
            onSelectEpisode={(epNum) => setSelectedEpisodeNumber(epNum)}
            onBack={() => handleSelectAnime(selectedAnime)}
            onSelectAnime={handleSelectAnime}
          />
        )}

        {currentView === 'admin' && (
          <AdminPanel
            currentUser={currentUser}
            animeList={animeList}
            onAddAnime={handleAddAnime}
            onUpdateAnime={handleUpdateAnime}
            onDeleteAnime={handleDeleteAnime}
            users={users}
            onUpdateUserRole={handleUpdateUserRole}
            onNavigateHome={() => handleNavigate('home')}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onRefreshData={refreshData}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            onLogout={async () => {
              if (supabaseService.isConfigured()) {
                await supabaseService.signOut();
              }
              setCurrentUser(null);
              handleNavigate('home');
            }}
            favoritesCount={favorites.length}
            onNavigateToAdmin={() => handleNavigate('admin')}
            onNavigateHome={() => handleNavigate('home')}
          />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={(user) => setCurrentUser(user)}
        registeredUsers={users}
        onRegister={handleRegisterUser}
      />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

