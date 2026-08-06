import { Anime, Episode, User, UserRole, AnimeStatus, VoiceStudio } from '../types';

/**
 * Exact Supabase Database Row Types matching requested schema:
 * 
 * Anime: id, title, poster, banner, description, genre, rating, year, status
 * Episodes: id, anime_id, episode_number, video_url
 * Users: id, name, email, role
 */

export interface DBAnime {
  id: string;
  title: string;
  poster: string;
  banner: string;
  description: string;
  genre: string; // Stored as comma-separated or JSON array in Supabase
  rating: number;
  year: number;
  status: AnimeStatus | string;
  // Extended fields for rich UI rendering
  studio?: string;
  voice_studio?: VoiceStudio | string;
  total_episodes?: number;
  released_episodes?: number;
  duration?: string;
  age_rating?: string;
  views?: number;
  featured?: boolean;
  trending?: boolean;
  popular?: boolean;
  is_new?: boolean;
  created_at?: string;
}

export interface DBEpisode {
  id: string;
  anime_id: string;
  episode_number: number;
  video_url: string;
  // Extended fields for rich video playback
  title?: string;
  duration?: string;
  thumbnail_url?: string;
  release_date?: string;
  created_at?: string;
}

export interface DBUser {
  id: string;
  name: string;
  email: string;
  role: UserRole | string;
  created_at?: string;
}

/**
 * Mapper utilities to convert between Database rows and UI Application Models
 */

export function mapDBAnimeToAppAnime(dbAnime: DBAnime, dbEpisodes: DBEpisode[] = []): Anime {
  const parsedGenres = Array.isArray(dbAnime.genre)
    ? dbAnime.genre
    : typeof dbAnime.genre === 'string'
    ? dbAnime.genre.split(',').map((g) => g.trim()).filter(Boolean)
    : ['Jangari'];

  const mappedEpisodes: Episode[] = dbEpisodes
    .filter((ep) => ep.anime_id === dbAnime.id)
    .map((ep) => ({
      id: ep.id,
      episodeNumber: ep.episode_number,
      title: ep.title || `${ep.episode_number}-qism`,
      titleUz: ep.title || `${ep.episode_number}-qism`,
      duration: ep.duration || '24:00',
      videoUrl: ep.video_url,
      thumbnailUrl: ep.thumbnail_url || dbAnime.banner || dbAnime.poster,
      releaseDate: ep.release_date || new Date().toISOString().split('T')[0],
    }))
    .sort((a, b) => a.episodeNumber - b.episodeNumber);

  return {
    id: dbAnime.id,
    title: dbAnime.title,
    titleUz: dbAnime.title,
    poster: dbAnime.poster,
    banner: dbAnime.banner,
    descriptionUz: dbAnime.description,
    shortDescriptionUz: (dbAnime.description || '').slice(0, 120) + '...',
    rating: Number(dbAnime.rating) || 9.0,
    year: Number(dbAnime.year) || 2026,
    totalEpisodes: dbAnime.total_episodes || Math.max(12, mappedEpisodes.length),
    releasedEpisodes: dbAnime.released_episodes || mappedEpisodes.length || 1,
    duration: dbAnime.duration || '24 daq',
    studio: dbAnime.studio || 'Selecon Dub Studios',
    status: (dbAnime.status as AnimeStatus) || 'Efirda',
    genres: parsedGenres,
    tags: ['Uzbek Dub', 'HD'],
    voiceStudio: (dbAnime.voice_studio as VoiceStudio) || 'Selecon Dub',
    views: dbAnime.views || 1000,
    ageRating: dbAnime.age_rating || '16+',
    featured: Boolean(dbAnime.featured),
    trending: Boolean(dbAnime.trending),
    popular: Boolean(dbAnime.popular),
    isNew: Boolean(dbAnime.is_new),
    episodes: mappedEpisodes,
  };
}

export function mapAppAnimeToDBAnime(anime: Anime): DBAnime {
  return {
    id: anime.id,
    title: anime.titleUz || anime.title,
    poster: anime.poster,
    banner: anime.banner,
    description: anime.descriptionUz,
    genre: Array.isArray(anime.genres) ? anime.genres.join(', ') : anime.genres || 'Jangari',
    rating: anime.rating,
    year: anime.year,
    status: anime.status,
    studio: anime.studio,
    voice_studio: anime.voiceStudio,
    total_episodes: anime.totalEpisodes,
    released_episodes: anime.releasedEpisodes || anime.episodes?.length || 1,
    duration: anime.duration,
    age_rating: anime.ageRating,
    views: anime.views,
    featured: anime.featured,
    trending: anime.trending,
    popular: anime.popular,
    is_new: anime.isNew,
  };
}

export function mapAppEpisodeToDBEpisode(ep: Episode, animeId: string): DBEpisode {
  return {
    id: ep.id,
    anime_id: animeId,
    episode_number: ep.episodeNumber,
    video_url: ep.videoUrl,
    title: ep.titleUz || ep.title,
    duration: ep.duration,
    thumbnail_url: ep.thumbnailUrl,
    release_date: ep.releaseDate,
  };
}

export function mapDBUserToAppUser(dbUser: DBUser): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: (dbUser.role as UserRole) || 'user',
    createdAt: dbUser.created_at || new Date().toISOString().split('T')[0],
  };
}

export function mapAppUserToDBUser(user: User): DBUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.createdAt,
  };
}
