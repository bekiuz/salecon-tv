import React, { useState, useEffect } from 'react';
import { Tv, Search, Heart, Film, Grid, Home, Menu, X, Bell, Shield, User as UserIcon, LogIn } from 'lucide-react';
import { ViewMode, User } from '../types';

interface NavbarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  favoritesCount: number;
  onSearchClick: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  favoritesCount,
  onSearchClick,
  currentUser,
  onOpenAuth,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAdmin =
    currentUser &&
    (currentUser.role === 'admin' || currentUser.email.toLowerCase() === 'bekiuz282@gmail.com');

  const navItems: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Bosh sahifa', icon: <Home className="w-4 h-4" /> },
    { id: 'catalog', label: 'Animelar', icon: <Film className="w-4 h-4" /> },
    { id: 'genres', label: 'Janrlar', icon: <Grid className="w-4 h-4" /> },
    { id: 'search', label: 'Qidiruv', icon: <Search className="w-4 h-4" /> },
    { id: 'favorites', label: 'Sevimlilar', icon: <Heart className="w-4 h-4" /> },
  ];

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-zinc-800 ${
        scrolled
          ? 'bg-[#0a0a0a]/95 backdrop-blur-md shadow-2xl py-3'
          : 'bg-[#0a0a0a] py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            id="nav-logo-btn"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 group focus:outline-none cursor-pointer"
          >
            <div className="text-2xl font-black tracking-tighter text-red-600 flex items-center">
              SELECON
              <span className="text-white drop-shadow-[0_0_8px_rgba(255,0,0,0.8)] ml-1">
                TV
              </span>
            </div>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-red-600/20 border border-red-600/40 text-[10px] uppercase font-bold text-red-400 tracking-wider">
              O'zbekcha
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex items-center gap-1.5 transition-colors pb-1 cursor-pointer ${
                    isActive
                      ? 'text-red-500 border-b-2 border-red-600 font-extrabold'
                      : 'hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.id === 'favorites' && favoritesCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded bg-red-600 text-white">
                      {favoritesCount}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Admin Panel Button (ONLY for Admin / Owner) */}
            {isAdmin && (
              <button
                id="nav-admin-panel-btn"
                onClick={() => onNavigate('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                  currentView === 'admin'
                    ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.6)]'
                    : 'bg-red-950/70 border border-red-600/60 text-red-400 hover:bg-red-600 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </button>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Quick Search Button / Input */}
            <div className="relative hidden lg:block">
              <input
                type="text"
                placeholder="Anime nomi..."
                onClick={onSearchClick}
                readOnly
                className="bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 text-xs w-56 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 placeholder-zinc-500 cursor-pointer text-zinc-300 font-medium"
              />
              <span className="absolute right-3 top-2 text-zinc-500 text-xs">🔍</span>
            </div>

            <button
              id="nav-quick-search-btn-mobile"
              onClick={onSearchClick}
              className="lg:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              title="Qidiruv"
            >
              <Search className="w-4 h-4 text-red-500" />
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                id="nav-notification-btn"
                onClick={() => setHasNotifications(false)}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
                title="Xabarlar"
              >
                <Bell className="w-4 h-4" />
                {hasNotifications && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                )}
              </button>
            </div>

            {/* User Profile / Login Action */}
            {currentUser ? (
              <button
                id="nav-user-profile-btn"
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                title="Mening Profilim"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-[11px] font-black text-white uppercase shadow-md">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="hidden sm:inline text-xs font-bold text-zinc-200 max-w-[100px] truncate">
                  {currentUser.name}
                </span>
                {isAdmin && (
                  <span className="px-1.5 py-0.2 rounded bg-red-600 text-white text-[9px] font-bold uppercase">
                    Admin
                  </span>
                )}
              </button>
            ) : (
              <button
                id="nav-login-btn"
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_10px_rgba(220,38,38,0.4)] transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Kirish</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-red-500" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 px-4 pb-4 bg-[#0a0a0a] border-b border-zinc-800 shadow-2xl animate-fadeIn">
          <div className="grid grid-cols-1 gap-1.5 pt-2">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-item-${item.id}`}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-red-600 text-white font-bold'
                      : 'bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'favorites' && favoritesCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded bg-red-600 text-white">
                      {favoritesCount}
                    </span>
                  )}
                </button>
              );
            })}

            {isAdmin && (
              <button
                id="mobile-nav-admin-btn"
                onClick={() => {
                  onNavigate('admin');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider bg-red-950/80 border border-red-700/60 text-red-400 cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

