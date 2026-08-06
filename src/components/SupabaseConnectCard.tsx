import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, AlertCircle, RefreshCw, Copy, Check, Server, Key, ExternalLink, Zap } from 'lucide-react';
import { getStoredSupabaseConfig, saveStoredSupabaseConfig, testSupabaseConnection, resetSupabaseClient } from '../lib/supabase';
import { supabaseService } from '../services/supabaseService';
import { Anime, User } from '../types';

interface SupabaseConnectCardProps {
  animeList: Anime[];
  users: User[];
  onDataSynced?: () => void;
}

export const SupabaseConnectCard: React.FC<SupabaseConnectCardProps> = ({
  animeList,
  users,
  onDataSynced,
}) => {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  useEffect(() => {
    const config = getStoredSupabaseConfig();
    setSupabaseUrl(config.url);
    setAnonKey(config.anonKey);

    if (config.url && config.anonKey) {
      handleTestConnection(config.url, config.anonKey);
    }
  }, []);

  const handleTestConnection = async (urlToTest?: string, keyToTest?: string) => {
    setStatus('testing');
    setStatusMessage('Supabase bilan bog‘lanilmoqda...');

    const url = urlToTest !== undefined ? urlToTest : supabaseUrl;
    const key = keyToTest !== undefined ? keyToTest : anonKey;

    resetSupabaseClient();
    const result = await testSupabaseConnection(url, key);

    if (result.success) {
      setStatus('connected');
      setStatusMessage(result.message);
      saveStoredSupabaseConfig(url, key);
    } else {
      setStatus('error');
      setStatusMessage(result.message);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleTestConnection();
  };

  const handleCopySqlScript = () => {
    const sqlContent = `-- SELECON TV SUPABASE SCHEMAS
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.anime (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  poster TEXT NOT NULL,
  banner TEXT NOT NULL,
  description TEXT NOT NULL,
  genre TEXT NOT NULL,
  rating NUMERIC(3,1) DEFAULT 9.0,
  year INTEGER DEFAULT 2026,
  status TEXT DEFAULT 'Efirda',
  studio TEXT DEFAULT 'Selecon Dub Studios',
  voice_studio TEXT DEFAULT 'Selecon Dub',
  total_episodes INTEGER DEFAULT 12,
  released_episodes INTEGER DEFAULT 1,
  duration TEXT DEFAULT '24 daq',
  age_rating TEXT DEFAULT '16+',
  views BIGINT DEFAULT 1000,
  featured BOOLEAN DEFAULT FALSE,
  trending BOOLEAN DEFAULT FALSE,
  popular BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.episodes (
  id TEXT PRIMARY KEY,
  anime_id TEXT NOT NULL REFERENCES public.anime(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  video_url TEXT NOT NULL,
  title TEXT,
  duration TEXT DEFAULT '24:00',
  thumbnail_url TEXT,
  release_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anime ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Anime Read" ON public.anime FOR SELECT USING (true);
CREATE POLICY "Public Episodes Read" ON public.episodes FOR SELECT USING (true);
CREATE POLICY "Public Users Read" ON public.users FOR SELECT USING (true);
`;

    navigator.clipboard.writeText(sqlContent);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleSyncToSupabase = async () => {
    setSyncing(true);
    setSyncResult(null);

    const res = await supabaseService.syncLocalDataToSupabase(animeList, users);

    setSyncing(false);
    if (res.success) {
      setSyncResult(`Muvaffaqiyatli! ${res.animeSynced} ta anime va ${res.usersSynced} ta user Supabase ga yuklandi.`);
      if (onDataSynced) onDataSynced();
    } else {
      setSyncResult(`Xatolik: ${res.error || 'Sinxronlab bo‘lmadi'}`);
    }
  };

  return (
    <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                Supabase Baza Integratsiyasi
              </h3>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-bold uppercase">
                PostgreSQL
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Selecon TV platformasini Supabase PostgreSQL ma'lumotlar bazasiga ulash
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 shrink-0">
          {status === 'testing' && (
            <span className="px-3 py-1.5 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Tekshirilmoqda...</span>
            </span>
          )}

          {status === 'connected' && (
            <span className="px-3 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-600/80 text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Ulangan (Faol)</span>
            </span>
          )}

          {status === 'error' && (
            <span className="px-3 py-1.5 rounded-full bg-red-950/90 border border-red-600/80 text-red-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>Ulanmagan</span>
            </span>
          )}

          {status === 'idle' && (
            <span className="px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-wider">
              Kutilmoqda
            </span>
          )}
        </div>
      </div>

      {/* Connection Info / Status Message */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2.5 ${
            status === 'connected'
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : status === 'error'
              ? 'bg-red-950/40 border-red-800/60 text-red-300'
              : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-300'
          }`}
        >
          {status === 'connected' ? (
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          )}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Form Credentials */}
      <form onSubmit={handleSaveConfig} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-red-500" />
              <span>Supabase Project URL</span>
            </label>
            <input
              type="text"
              placeholder="https://your-project.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-red-500" />
              <span>Supabase Anon / Public Key</span>
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 font-mono"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={status === 'testing'}
              className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_12px_rgba(220,38,38,0.4)] transition-all cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Ulanish va Saqlash</span>
            </button>

            <button
              type="button"
              onClick={handleCopySqlScript}
              className="px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'SQL Nusxalandi!' : 'SQL Schema Nusxalash'}</span>
            </button>
          </div>

          {status === 'connected' && (
            <button
              type="button"
              onClick={handleSyncToSupabase}
              disabled={syncing}
              className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Sinxronlanmoqda...' : 'Ma\'lumotlarni Supabase ga Yuklash'}</span>
            </button>
          )}
        </div>
      </form>

      {syncResult && (
        <div className="p-3 rounded-lg bg-zinc-900 border border-emerald-800 text-emerald-300 text-xs font-semibold">
          {syncResult}
        </div>
      )}

      {/* Instruction Steps */}
      <div className="pt-4 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-zinc-400">
        <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
          <span className="font-bold text-white uppercase text-[10px] block text-red-500">1-Qadam</span>
          <p className="text-zinc-300 font-semibold">Supabase Loyiha Yaratish</p>
          <p className="text-zinc-500">supabase.com saytidan yangi PostgreSQL loyihasini ro'yxatdan o'tkazing.</p>
        </div>

        <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
          <span className="font-bold text-white uppercase text-[10px] block text-red-500">2-Qadam</span>
          <p className="text-zinc-300 font-semibold">SQL Schemani Bajarish</p>
          <p className="text-zinc-500">"SQL Schema Nusxalash" tugmasini bosing va Supabase SQL Editor rejimida kiriting.</p>
        </div>

        <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
          <span className="font-bold text-white uppercase text-[10px] block text-red-500">3-Qadam</span>
          <p className="text-zinc-300 font-semibold">API Keys Kiriting</p>
          <p className="text-zinc-500">Project Settings {'->'} API bo'limidan URL va anon key kalitlarini yuqoriga joylang.</p>
        </div>
      </div>
    </div>
  );
};
