/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Supabase Config Keys
const DEFAULT_SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const DEFAULT_SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// Local Storage Keys for dynamic user config override
const STORAGE_KEY_URL = 'selecon_supabase_url';
const STORAGE_KEY_KEY = 'selecon_supabase_anon_key';

export function getStoredSupabaseConfig(): { url: string; anonKey: string } {
  try {
    const url = localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_SUPABASE_URL;
    const anonKey = localStorage.getItem(STORAGE_KEY_KEY) || DEFAULT_SUPABASE_ANON_KEY;
    return { url, anonKey };
  } catch {
    return { url: DEFAULT_SUPABASE_URL, anonKey: DEFAULT_SUPABASE_ANON_KEY };
  }
}

export function saveStoredSupabaseConfig(url: string, anonKey: string) {
  try {
    if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
    else localStorage.removeItem(STORAGE_KEY_URL);

    if (anonKey) localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
    else localStorage.removeItem(STORAGE_KEY_KEY);
  } catch (e) {
    console.error('Failed to save Supabase config in localStorage', e);
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getStoredSupabaseConfig();
  if (!url || !anonKey) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.error('Failed to instantiate Supabase client:', err);
      return null;
    }
  }

  return supabaseInstance;
}

export function resetSupabaseClient() {
  supabaseInstance = null;
}

/**
 * Tests connection to configured Supabase database instance
 */
export async function testSupabaseConnection(overrideUrl?: string, overrideKey?: string): Promise<{ success: boolean; message: string }> {
  const url = overrideUrl || getStoredSupabaseConfig().url;
  const anonKey = overrideKey || getStoredSupabaseConfig().anonKey;

  if (!url || !anonKey) {
    return {
      success: false,
      message: 'Supabase URL yoki Anon Key kiritilmagan. Iltimos, ma’lumotlarni kiriting.',
    };
  }

  try {
    const tempClient = createClient(url, anonKey);
    const { data, error } = await tempClient.from('anime').select('count', { count: 'exact', head: true });

    if (error) {
      // Check if table missing vs network/auth error
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Supabase bilan aloqa o‘rnatildi! Ammo `anime` jadvali topilmadi. `schema.sql` skriptini Supabase SQL Editor rejimida ishga tushiring.',
        };
      }
      return {
        success: false,
        message: `Supabase xatosi: ${error.message} (Code: ${error.code})`,
      };
    }

    return {
      success: true,
      message: 'Supabase ma’lumotlar bazasiga muvaffaqiyatli ulandi!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Ulanishda xatolik: ${err?.message || 'Tarmoq xatosi'}`,
    };
  }
}
