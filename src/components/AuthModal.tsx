import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Shield, CheckCircle, LogIn, UserPlus, RefreshCw } from 'lucide-react';
import { User, UserRole } from '../types';
import { supabaseService } from '../services/supabaseService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  registeredUsers: User[];
  onRegister: (newUser: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  registeredUsers,
  onRegister,
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password) {
      setError('Iltimos, barcha maydonlarni to‘ldiring');
      return;
    }

    setLoading(true);

    try {
      if (isRegisterMode) {
        if (!name) {
          setError('Iltimos, ismingizni kiriting');
          setLoading(false);
          return;
        }

        const finalRole: UserRole = email.toLowerCase() === 'bekiuz282@gmail.com' ? 'admin' : role;

        // Try Supabase Auth if configured
        if (supabaseService.isConfigured()) {
          const res = await supabaseService.signUp(email, password, name, finalRole);
          if (res.error) {
            setError(`Supabase Auth Xatosi: ${res.error}`);
            setLoading(false);
            return;
          }
          if (res.user) {
            onRegister(res.user);
            onLogin(res.user);
            setSuccessMsg('Supabase orqali muvaffaqiyatli ro‘yxatdan o‘tdingiz!');
            setTimeout(() => onClose(), 600);
            setLoading(false);
            return;
          }
        }

        // Local Fallback Mode
        const existing = registeredUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
          setError('Ushbu email bilan foydalanuvchi allaqachon ro‘yxatdan o‘tgan');
          setLoading(false);
          return;
        }

        const newUser: User = {
          id: `user-${Date.now()}`,
          email: email.trim(),
          name: name.trim(),
          role: finalRole,
          createdAt: new Date().toISOString().split('T')[0],
        };

        onRegister(newUser);
        onLogin(newUser);
        setSuccessMsg('Muvaffaqiyatli ro‘yxatdan o‘tdingiz!');
        setTimeout(() => onClose(), 600);
      } else {
        // Sign In logic
        if (supabaseService.isConfigured()) {
          const res = await supabaseService.signIn(email, password);
          if (res.user) {
            onRegister(res.user);
            onLogin(res.user);
            setSuccessMsg('Supabase orqali tizimga kirdingiz!');
            setTimeout(() => onClose(), 500);
            setLoading(false);
            return;
          }
        }

        // Local Auth Fallback
        const found = registeredUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase().trim()
        );

        if (found) {
          onLogin(found);
          setSuccessMsg('Xush kelibsiz!');
          setTimeout(() => onClose(), 500);
        } else if (email.toLowerCase().trim() === 'bekiuz282@gmail.com') {
          const ownerUser: User = {
            id: 'owner-1',
            email: 'bekiuz282@gmail.com',
            name: 'Bek Owner',
            role: 'admin',
            createdAt: '2026-01-01',
          };
          onRegister(ownerUser);
          onLogin(ownerUser);
          setSuccessMsg('Eski egasi (Owner) sifatida tizimga kirdingiz!');
          setTimeout(() => onClose(), 500);
        } else {
          setError('Foydalanuvchi topilmadi yoki parol noto‘g‘ri');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Kirishda kutilmagan xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (targetEmail: string) => {
    let found = registeredUsers.find((u) => u.email.toLowerCase() === targetEmail.toLowerCase());
    if (!found) {
      if (targetEmail === 'bekiuz282@gmail.com') {
        found = {
          id: 'owner-1',
          email: 'bekiuz282@gmail.com',
          name: 'Owner (bekiuz282)',
          role: 'admin',
          createdAt: '2026-01-01',
        };
      } else if (targetEmail === 'admin@selecon.tv') {
        found = {
          id: 'admin-1',
          email: 'admin@selecon.tv',
          name: 'Administrator',
          role: 'admin',
          createdAt: '2026-01-01',
        };
      } else {
        found = {
          id: 'user-1',
          email: 'user@selecon.tv',
          name: 'Anime Ishqibozi',
          role: 'user',
          createdAt: '2026-02-01',
        };
      }
      onRegister(found);
    }
    onLogin(found);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-600/20 text-red-500 border border-red-600/30 mb-1">
            {isRegisterMode ? <UserPlus className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tight text-white">
            {isRegisterMode ? 'Ro‘yxatdan O‘tish' : 'Tizimga Kirish'}
          </h3>
          <p className="text-xs text-zinc-400">
            {isRegisterMode
              ? 'Selecon TV profilini yaratib barcha imkoniyatlardan foydalaning'
              : 'O‘z hisobingizga kiring va sevimli animelaringizni saqlang'}
          </p>
        </div>

        {/* Error / Success Alerts */}
        {error && (
          <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-lg text-xs font-semibold text-red-400 text-center">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-lg text-xs font-semibold text-emerald-400 text-center flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegisterMode && (
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Ism-familiyangiz
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ismingizni kiriting"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
                />
                <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Email Manzili
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="masalan: bekiuz282@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Parol
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
              />
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            </div>
          </div>

          {isRegisterMode && (
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Foydalanuvchi Roli (Supabase Role)
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-600"
              >
                <option value="user">User (Oddiy Foydalanuvchi)</option>
                <option value="admin">Admin (Administrator)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Tekshirilmoqda...</span>
              </>
            ) : isRegisterMode ? (
              'Ro‘yxatdan O‘tish'
            ) : (
              'Kirish'
            )}
          </button>
        </form>

        {/* Quick Demo Logins Section */}
        <div className="pt-4 border-t border-zinc-800 space-y-2">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold text-center">
            Tezkor Kirish (Demo Accounts):
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin('bekiuz282@gmail.com')}
              className="p-2 rounded bg-zinc-950 border border-red-600/40 hover:border-red-600 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-red-400 text-[11px] font-bold">
                <Shield className="w-3.5 h-3.5" />
                <span>bekiuz282@gmail.com</span>
              </div>
              <span className="text-[9px] text-zinc-500">Owner / Admin Role</span>
            </button>

            <button
              onClick={() => handleQuickLogin('user@selecon.tv')}
              className="p-2 rounded bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-zinc-300 text-[11px] font-bold">
                <UserIcon className="w-3.5 h-3.5" />
                <span>user@selecon.tv</span>
              </div>
              <span className="text-[9px] text-zinc-500">Standard User Role</span>
            </button>
          </div>
        </div>

        {/* Toggle Mode Footer */}
        <div className="text-center text-xs text-zinc-400">
          {isRegisterMode ? (
            <p>
              Hisobingiz bormi?{' '}
              <button
                onClick={() => {
                  setIsRegisterMode(false);
                  setError('');
                }}
                className="text-red-500 font-bold hover:underline cursor-pointer"
              >
                Kirish
              </button>
            </p>
          ) : (
            <p>
              Hisobingiz yo‘qmi?{' '}
              <button
                onClick={() => {
                  setIsRegisterMode(true);
                  setError('');
                }}
                className="text-red-500 font-bold hover:underline cursor-pointer"
              >
                Ro‘yxatdan o‘tish
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
