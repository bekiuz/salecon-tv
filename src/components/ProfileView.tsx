import React from 'react';
import { User, Shield, Heart, Calendar, LogOut, Tv, CheckCircle, Mail, Sparkles } from 'lucide-react';
import { User as UserType } from '../types';

interface ProfileViewProps {
  currentUser: UserType | null;
  onLogout: () => void;
  favoritesCount: number;
  onNavigateToAdmin?: () => void;
  onNavigateHome: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onLogout,
  favoritesCount,
  onNavigateToAdmin,
  onNavigateHome,
}) => {
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#050505] pt-32 pb-20 text-center">
        <div className="max-w-md mx-auto p-8 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
          <User className="w-12 h-12 text-zinc-500 mx-auto" />
          <h2 className="text-xl font-black uppercase text-white">Tizimga Kirmagansiz</h2>
          <p className="text-xs text-zinc-400">
            Profilingizni ko‘rish uchun iltimos tizimga kiring.
          </p>
          <button
            onClick={onNavigateHome}
            className="px-6 py-2.5 rounded bg-red-600 text-white font-bold text-xs uppercase tracking-wider"
          >
            Bosh Sahifaga Qaytish
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser.role === 'admin' || currentUser.email.toLowerCase() === 'bekiuz282@gmail.com';

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20 text-zinc-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Banner Card */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* User Avatar Box */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 border-2 border-zinc-700 flex items-center justify-center text-3xl font-black text-white uppercase shadow-xl shrink-0">
              {currentUser.name.charAt(0)}
            </div>

            {/* User Info Details */}
            <div className="space-y-2 text-center sm:text-left flex-grow">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span
                  className={`px-3 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    isAdmin
                      ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)]'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{isAdmin ? 'ADMIN (RBAC Enabled)' : 'USER'}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded bg-zinc-800/80 border border-zinc-700 text-[10px] text-zinc-400 font-bold uppercase">
                  Supabase Auth Ready
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {currentUser.name}
              </h1>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-red-500" />
                  <span>{currentUser.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Ro‘yxatdan o‘tgan: {currentUser.createdAt}</span>
                </div>
              </div>
            </div>

            {/* Logout & Action Buttons */}
            <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
              {isAdmin && onNavigateToAdmin && (
                <button
                  onClick={onNavigateToAdmin}
                  className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Panelga O‘tish</span>
                </button>
              )}
              <button
                onClick={onLogout}
                className="px-5 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-zinc-700 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Chiqish</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider">Sevimlilarim</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            </div>
            <div className="text-3xl font-black text-white">{favoritesCount} ta</div>
            <p className="text-[10px] text-zinc-500">Saqlangan animelar ro‘yxati</p>
          </div>

          <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider">Foydalanish Roli</span>
              <Shield className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-3xl font-black text-white uppercase">{currentUser.role}</div>
            <p className="text-[10px] text-zinc-500">
              {isAdmin ? 'Barcha boshqaruv huquqlari mavjud' : 'Tomosha qilish va izoh qoldirish'}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider">Supabase Ma'lumoti</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-sm font-bold text-emerald-400">auth.users (active)</div>
            <p className="text-[10px] text-zinc-500">ID: {currentUser.id}</p>
          </div>
        </div>

        {/* Permissions Overview */}
        <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white border-l-4 border-red-600 pl-3">
            Ruxsatlar Ro‘yxati (Role-Based Access Control)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 p-3 rounded bg-zinc-950 border border-zinc-800">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Animelarni tomosha qilish va qismlarni tanlash</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded bg-zinc-950 border border-zinc-800">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Sevimlilarga anime qo‘shish va o‘chirish</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded bg-zinc-950 border border-zinc-800">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Shaxsiy profil va ma'lumotlarni ko‘rish</span>
            </div>
            <div
              className={`flex items-center gap-2 p-3 rounded border ${
                isAdmin
                  ? 'bg-red-950/30 border-red-600/50 text-red-300 font-bold'
                  : 'bg-zinc-950/50 border-zinc-800 text-zinc-500 line-through'
              }`}
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span>Admin Panel va Animelarni tahrirlash (Admin Only)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
