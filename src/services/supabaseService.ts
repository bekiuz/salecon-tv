import { getSupabaseClient } from '../lib/supabase';
import {
  DBAnime,
  DBEpisode,
  DBUser,
  mapDBAnimeToAppAnime,
  mapAppAnimeToDBAnime,
  mapAppEpisodeToDBEpisode,
  mapDBUserToAppUser,
  mapAppUserToDBUser,
} from '../types/database';
import { Anime, Episode, User, UserRole } from '../types';

/**
 * Service Layer for Supabase Database & Auth Operations:
 * Provides authentication, user profiles, and CRUD for Anime/Episodes.
 */

export const supabaseService = {
  /**
   * Checks if Supabase client is configured and ready
   */
  isConfigured(): boolean {
    return getSupabaseClient() !== null;
  },

  /**
   * Supabase Auth: Register new user with email & password
   */
  async signUp(
    email: string,
    password: string,
    name: string,
    role: UserRole = 'user'
  ): Promise<{ user: User | null; error: string | null }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { user: null, error: 'Supabase sozlanmagan' };
    }

    try {
      const isOwner = email.toLowerCase() === 'bekiuz282@gmail.com';
      const finalRole: UserRole = isOwner ? 'admin' : role;

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            role: finalRole,
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Ro‘yxatdan o‘tishda xatolik yuz berdi' };
      }

      const newUser: User = {
        id: data.user.id,
        email: email.trim(),
        name: name.trim(),
        role: finalRole,
        createdAt: new Date().toISOString().split('T')[0],
      };

      // Also save into profiles / users table for database record
      await this.saveUser(newUser);

      return { user: newUser, error: null };
    } catch (err: any) {
      return { user: null, error: err?.message || 'Ro‘yxatdan o‘tishda xatolik' };
    }
  },

  /**
   * Supabase Auth: Sign in with email & password
   */
  async signIn(
    email: string,
    password: string
  ): Promise<{ user: User | null; error: string | null }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { user: null, error: 'Supabase sozlanmagan' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Foydalanuvchi topilmadi' };
      }

      // Try fetching user profile from DB
      const dbUsers = await this.getAllUsers();
      const existing = dbUsers?.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() || u.id === data.user?.id
      );

      if (existing) {
        return { user: existing, error: null };
      }

      // Fallback user object from auth metadata
      const isOwner = email.toLowerCase() === 'bekiuz282@gmail.com';
      const userMeta = data.user.user_metadata || {};
      const fallbackUser: User = {
        id: data.user.id,
        email: email.trim(),
        name: userMeta.name || email.split('@')[0],
        role: isOwner ? 'admin' : (userMeta.role as UserRole) || 'user',
        createdAt: new Date().toISOString().split('T')[0],
      };

      await this.saveUser(fallbackUser);

      return { user: fallbackUser, error: null };
    } catch (err: any) {
      return { user: null, error: err?.message || 'Kirishda xatolik' };
    }
  },

  /**
   * Supabase Auth: Sign out current user
   */
  async signOut(): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;
    try {
      await supabase.auth.signOut();
      return true;
    } catch (e) {
      console.error('SignOut error:', e);
      return false;
    }
  },

  /**
   * Get Active Supabase Session User
   */
  async getCurrentSessionUser(): Promise<User | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) return null;

      const authUser = data.session.user;
      const dbUsers = await this.getAllUsers();
      const match = dbUsers?.find(
        (u) => u.id === authUser.id || u.email.toLowerCase() === authUser.email?.toLowerCase()
      );

      if (match) return match;

      const isOwner = authUser.email?.toLowerCase() === 'bekiuz282@gmail.com';
      return {
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        role: isOwner ? 'admin' : (authUser.user_metadata?.role as UserRole) || 'user',
        createdAt: new Date().toISOString().split('T')[0],
      };
    } catch (e) {
      console.error('Failed to get current session:', e);
      return null;
    }
  },

  /**
   * Fetch all Anime records along with their Episodes from Supabase
   */
  async getAllAnime(): Promise<Anime[] | null> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return null;
    }

    try {
      let animeRows: DBAnime[] | null = null;

      // Try fetching anime ordered by created_at first
      const resWithOrder = await supabase
        .from('anime')
        .select('*')
        .order('created_at', { ascending: false });

      if (resWithOrder.error) {
        console.warn('getAllAnime order by created_at failed, retrying without order:', resWithOrder.error.message);
        const resWithoutOrder = await supabase.from('anime').select('*');
        if (resWithoutOrder.error) {
          console.error('Exact error fetching anime from Supabase:', resWithoutOrder.error.message, resWithoutOrder.error);
          return null;
        }
        animeRows = resWithoutOrder.data as DBAnime[];
      } else {
        animeRows = resWithOrder.data as DBAnime[];
      }

      if (!animeRows) {
        console.warn('Supabase anime table returned null or undefined rows');
        return [];
      }

      const { data: episodeRows, error: epErr } = await supabase
        .from('episodes')
        .select('*')
        .order('episode_number', { ascending: true });

      if (epErr) {
        console.warn('Supabase getAllEpisodes error:', epErr.message);
      }

      const dbEpisodes: DBEpisode[] = (episodeRows as DBEpisode[]) || [];

      const result: Anime[] = (animeRows as DBAnime[]).map((row) =>
        mapDBAnimeToAppAnime(row, dbEpisodes)
      );

      console.log("SUPABASE ANIME:", result);
      return result;
    } catch (e: any) {
      console.error('Failed to fetch anime from Supabase:', e?.message || e);
      return null;
    }
  },

  /**
   * Insert or Update an Anime record in Supabase
   */
  async saveAnime(anime: Anime): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
      const dbAnime = mapAppAnimeToDBAnime(anime);

      const { error: animeErr } = await supabase.from('anime').upsert(dbAnime, {
        onConflict: 'id',
      });

      if (animeErr) {
        console.error('Failed to save anime to Supabase:', animeErr.message);
        return false;
      }

      if (anime.episodes && anime.episodes.length > 0) {
        const dbEpisodes = anime.episodes.map((ep) => mapAppEpisodeToDBEpisode(ep, anime.id));
        const { error: epErr } = await supabase.from('episodes').upsert(dbEpisodes, {
          onConflict: 'id',
        });
        if (epErr) {
          console.error('Failed to save episodes to Supabase:', epErr.message);
        }
      }

      return true;
    } catch (e) {
      console.error('Error in saveAnime:', e);
      return false;
    }
  },

  /**
   * Delete an Anime record from Supabase
   */
  async deleteAnime(animeId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
      const { error } = await supabase.from('anime').delete().eq('id', animeId);
      if (error) {
        console.error('Failed to delete anime from Supabase:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Error in deleteAnime:', e);
      return false;
    }
  },

  /**
   * Save an Episode to Supabase
   */
  async saveEpisode(animeId: string, episode: Episode): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
      const dbEp = mapAppEpisodeToDBEpisode(episode, animeId);
      const { error } = await supabase.from('episodes').upsert(dbEp, {
        onConflict: 'id',
      });

      if (error) {
        console.error('Failed to save episode to Supabase:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Error in saveEpisode:', e);
      return false;
    }
  },

  /**
   * Delete an Episode from Supabase
   */
  async deleteEpisode(episodeId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
      const { error } = await supabase.from('episodes').delete().eq('id', episodeId);
      if (error) {
        console.error('Failed to delete episode from Supabase:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Error in deleteEpisode:', e);
      return false;
    }
  },

  /**
   * Fetch all Users / Profiles from Supabase (Checks `profiles` then `users`)
   */
  async getAllUsers(): Promise<User[] | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      // First try 'profiles'
      const { data: profiles, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!profErr && profiles && profiles.length > 0) {
        return (profiles as DBUser[]).map(mapDBUserToAppUser);
      }

      // Fallback to 'users'
      const { data: users, error: userErr } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (userErr) {
        console.warn('Supabase getAllUsers error:', userErr.message);
        return null;
      }

      if (!users) return [];

      return (users as DBUser[]).map(mapDBUserToAppUser);
    } catch (e) {
      console.error('Error in getAllUsers:', e);
      return null;
    }
  },

  /**
   * Upsert User in both `profiles` and `users` tables for maximal compatibility
   */
  async saveUser(user: User): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
      const dbUser = mapAppUserToDBUser(user);

      // Attempt upsert in profiles
      await supabase.from('profiles').upsert(dbUser, { onConflict: 'email' });
      // Attempt upsert in users
      await supabase.from('users').upsert(dbUser, { onConflict: 'email' });

      return true;
    } catch (e) {
      console.error('Error in saveUser:', e);
      return false;
    }
  },

  /**
   * Update User Role in Supabase (`profiles` and `users`)
   */
  async updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
      await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      await supabase.from('users').update({ role: newRole }).eq('id', userId);
      return true;
    } catch (e) {
      console.error('Error in updateUserRole:', e);
      return false;
    }
  },

  /**
   * Seed / Sync local data into Supabase
   */
  async syncLocalDataToSupabase(
    localAnime: Anime[],
    localUsers: User[]
  ): Promise<{ success: boolean; animeSynced: number; usersSynced: number; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, animeSynced: 0, usersSynced: 0, error: 'Supabase ga ulanib bo‘lmadi' };
    }

    try {
      let animeSynced = 0;
      let usersSynced = 0;

      for (const u of localUsers) {
        const dbU = mapAppUserToDBUser(u);
        await supabase.from('profiles').upsert(dbU, { onConflict: 'email' });
        const { error } = await supabase.from('users').upsert(dbU, { onConflict: 'email' });
        if (!error) usersSynced++;
      }

      for (const a of localAnime) {
        const dbA = mapAppAnimeToDBAnime(a);
        const { error: animeErr } = await supabase.from('anime').upsert(dbA, { onConflict: 'id' });
        if (!animeErr) {
          animeSynced++;
          if (a.episodes && a.episodes.length > 0) {
            const dbEps = a.episodes.map((ep) => mapAppEpisodeToDBEpisode(ep, a.id));
            await supabase.from('episodes').upsert(dbEps, { onConflict: 'id' });
          }
        }
      }

      return {
        success: true,
        animeSynced,
        usersSynced,
      };
    } catch (err: any) {
      return {
        success: false,
        animeSynced: 0,
        usersSynced: 0,
        error: err?.message || 'Sinxronlash xatosi',
      };
    }
  },

  /**
   * Helper to compress image files before upload using HTML Canvas
   */
  async compressImage(file: File, maxWidth = 1920, maxHeight = 1080, quality = 0.82): Promise<File> {
    if (!file.type.startsWith('image/')) return file;
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, '') + '.jpg',
              { type: 'image/jpeg', lastModified: Date.now() }
            );
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    });
  },

  /**
   * Upload File to Supabase Storage (target buckets: posters, banners, thumbnails, videos)
   */
  async uploadFile(
    file: File,
    bucketName: 'posters' | 'banners' | 'thumbnails' | 'videos' = 'posters',
    onProgress?: (percent: number) => void
  ): Promise<{ url: string | null; error: string | null }> {
    const supabase = getSupabaseClient();
    let uploadFileTarget = file;

    // Compress images before upload
    if (file.type.startsWith('image/')) {
      if (onProgress) onProgress(15);
      uploadFileTarget = await this.compressImage(file);
    }

    if (onProgress) onProgress(35);

    const ext = uploadFileTarget.name.split('.').pop() || 'png';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    if (supabase) {
      try {
        // Try uploading to specified bucket first, then fallback bucket list
        const bucketList = [bucketName, 'media', 'selecon-media', 'public', 'avatars'];
        for (const bucket of bucketList) {
          if (onProgress) onProgress(60);
          const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, uploadFileTarget, { upsert: true, cacheControl: '3600' });

          if (!error && data) {
            if (onProgress) onProgress(90);
            const { data: publicUrlData } = supabase.storage
              .from(bucket)
              .getPublicUrl(fileName);

            if (publicUrlData?.publicUrl) {
              if (onProgress) onProgress(100);
              return { url: publicUrlData.publicUrl, error: null };
            }
          }
        }
      } catch (err: any) {
        console.warn('Supabase storage bucket upload warning:', err?.message);
      }
    }

    if (onProgress) onProgress(80);
    // Fallback to Data URL if Supabase client not connected or buckets unconfigured
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(uploadFileTarget);
      });
      if (onProgress) onProgress(100);
      return { url: dataUrl, error: null };
    } catch (err: any) {
      return { url: null, error: err?.message || 'Faylni o‘qishda xatolik' };
    }
  },

  /**
   * Save Watch Progress for an anime episode (localStorage + Supabase DB)
   */
  async saveWatchProgress(data: {
    animeId: string;
    episodeNumber: number;
    progressSeconds: number;
    durationSeconds: number;
    animeTitleUz?: string;
    animePoster?: string;
  }): Promise<void> {
    const record = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    // 1. Save locally in localStorage for instant access
    try {
      localStorage.setItem(`selecon_watch_${data.animeId}`, JSON.stringify(record));
      
      const continueRaw = localStorage.getItem('selecon_continue_watching');
      let continueList: any[] = continueRaw ? JSON.parse(continueRaw) : [];
      // Remove existing item for same anime
      continueList = continueList.filter((item) => item.animeId !== data.animeId);
      // Unshift new watch record
      continueList.unshift(record);
      // Keep top 20
      localStorage.setItem('selecon_continue_watching', JSON.stringify(continueList.slice(0, 20)));
    } catch (e) {
      console.warn('LocalStorage saveWatchProgress error:', e);
    }

    // 2. Save in Supabase if logged in
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          await supabase.from('watch_progress').upsert(
            {
              user_id: userData.user.id,
              anime_id: data.animeId,
              episode_number: data.episodeNumber,
              progress_seconds: Math.floor(data.progressSeconds),
              duration_seconds: Math.floor(data.durationSeconds),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id, anime_id' }
          );
        }
      } catch (err) {
        // Table watch_progress might not exist yet, silent fallback to localStorage
      }
    }
  },

  /**
   * Get Watch Progress for a specific anime
   */
  getWatchProgress(animeId: string): {
    animeId: string;
    episodeNumber: number;
    progressSeconds: number;
    durationSeconds: number;
    updatedAt: string;
  } | null {
    try {
      const saved = localStorage.getItem(`selecon_watch_${animeId}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('getWatchProgress read error:', e);
    }
    return null;
  },

  /**
   * Get all Continue Watching records
   */
  getContinueWatchingList(): Array<{
    animeId: string;
    episodeNumber: number;
    progressSeconds: number;
    durationSeconds: number;
    animeTitleUz?: string;
    animePoster?: string;
    updatedAt: string;
  }> {
    try {
      const raw = localStorage.getItem('selecon_continue_watching');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
};
