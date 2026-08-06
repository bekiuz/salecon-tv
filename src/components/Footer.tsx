import React from 'react';
import { Tv, Heart, Send, ShieldCheck, Film, Sparkles } from 'lucide-react';
import { ViewMode } from '../types';

interface FooterProps {
  onNavigate: (view: ViewMode) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-zinc-800 bg-[#050505] text-zinc-400 py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-zinc-800">
          <div className="space-y-3">
            <div className="text-2xl font-black tracking-tighter text-red-600 flex items-center">
              SELECON
              <span className="text-white drop-shadow-[0_0_8px_rgba(255,0,0,0.8)] ml-1">
                TV
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              O'zbekistondagi №1 Anime Platformasi. Barcha animelar professional dublyaj va yuqori sifatda taqdim etiladi.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest border-l-2 border-red-600 pl-2">
              Bo'limlar
            </h4>
            <ul className="space-y-1.5 text-xs text-zinc-400 font-medium">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-red-500 transition-colors">
                  Bosh sahifa
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalog')} className="hover:text-red-500 transition-colors">
                  Animelar
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('genres')} className="hover:text-red-500 transition-colors">
                  Janrlar
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('favorites')} className="hover:text-red-500 transition-colors">
                  Sevimlilar
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest border-l-2 border-red-600 pl-2">
              Janrlar
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {['Jangari', 'Fantastika', 'Sarguzasht', 'Isekai', 'Komediya', 'Drama'].map((g) => (
                <button
                  key={g}
                  onClick={() => onNavigate('genres')}
                  className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 hover:text-white hover:border-red-600 transition-all"
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest border-l-2 border-red-600 pl-2">
              Telegram Hamjamiyat
            </h4>
            <p className="text-xs text-zinc-400">Yangi premyeralarni o'tkazib yubormang:</p>
            <a
              href="https://t.me"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-zinc-900 border border-zinc-800 hover:border-red-600 text-xs font-bold text-red-500 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>@selecon_tv Telegram</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] text-zinc-500 uppercase tracking-[0.2em] gap-4">
          <div>© 2026 SELECON TV — O'zbekistondagi №1 Anime Platformasi</div>
          <div className="flex gap-6">
            <span className="hover:text-zinc-300 cursor-pointer">Foydalanish shartlari</span>
            <span className="hover:text-zinc-300 cursor-pointer">Maxfiylik siyosati</span>
            <span className="text-red-600 font-bold">Barcha huquqlar himoyalangan</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
