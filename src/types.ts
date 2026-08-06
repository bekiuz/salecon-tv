export type ViewMode = 'home' | 'catalog' | 'genres' | 'search' | 'favorites' | 'detail' | 'watch' | 'admin' | 'profile';

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
}

export type AnimeStatus = 'Efirda' | 'Tugallangan' | 'Kutilmoqda';

export type VoiceStudio = 'Selecon Dub' | 'Anidub' | 'Subtitr';

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  titleUz: string;
  duration: string;
  videoUrl: string;
  thumbnailUrl: string;
  releaseDate: string;
  isFiller?: boolean;
  descriptionUz?: string;
}

export interface Comment {
  id: string;
  animeId: string;
  episodeId?: string;
  userName: string;
  userAvatar: string;
  text: string;
  date: string;
  likes: number;
  userLiked?: boolean;
}

export interface Anime {
  id: string;
  title: string;
  titleUz: string;
  titleJp?: string;
  poster: string;
  banner: string;
  descriptionUz: string;
  shortDescriptionUz: string;
  rating: number; // e.g. 9.8
  year: number;
  totalEpisodes: number;
  releasedEpisodes: number;
  duration: string; // e.g. "24 daq"
  studio: string; // e.g. "A-1 Pictures"
  status: AnimeStatus;
  genres: string[];
  tags: string[];
  voiceStudio: VoiceStudio;
  views: number;
  ageRating: string; // "16+", "18+", "12+"
  featured?: boolean;
  trending?: boolean;
  popular?: boolean;
  isNew?: boolean;
  episodes: Episode[];
  comments?: Comment[];
}

export interface Genre {
  id: string;
  nameUz: string;
  slug: string;
  iconName: string;
  descriptionUz: string;
  count: number;
  color: string;
  image: string;
}

export interface FilterState {
  genre: string;
  status: string;
  sort: 'rating' | 'popular' | 'newest' | 'views';
  searchQuery: string;
  year: string;
}

export interface WatchRecord {
  animeId: string;
  episodeNumber: number;
  progressSeconds: number;
  durationSeconds: number;
  animeTitleUz?: string;
  animePoster?: string;
  completed?: boolean;
  updatedAt: string;
}
