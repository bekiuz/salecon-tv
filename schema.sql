-- ==============================================================================
-- SELECON TV SUPABASE DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Create PROFILES Table (Supabase Auth Recommended Pattern)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backward compatibility view / table for USERS
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);


-- 2. Create ANIME Table
CREATE TABLE IF NOT EXISTS public.anime (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  poster TEXT NOT NULL,
  banner TEXT NOT NULL,
  description TEXT NOT NULL,
  genre TEXT NOT NULL,
  rating NUMERIC(3,1) NOT NULL DEFAULT 9.0,
  year INTEGER NOT NULL DEFAULT 2026,
  status TEXT NOT NULL DEFAULT 'Efirda',
  
  -- Rich UI Attributes
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast anime listing & filtering
CREATE INDEX IF NOT EXISTS idx_anime_status ON public.anime(status);
CREATE INDEX IF NOT EXISTS idx_anime_rating ON public.anime(rating DESC);
CREATE INDEX IF NOT EXISTS idx_anime_year ON public.anime(year DESC);


-- 3. Create EPISODES Table
CREATE TABLE IF NOT EXISTS public.episodes (
  id TEXT PRIMARY KEY,
  anime_id TEXT NOT NULL REFERENCES public.anime(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  video_url TEXT NOT NULL,
  
  -- Player Metadata
  title TEXT,
  duration TEXT DEFAULT '24:00',
  thumbnail_url TEXT,
  release_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_anime_episode UNIQUE (anime_id, episode_number)
);

CREATE INDEX IF NOT EXISTS idx_episodes_anime_id ON public.episodes(anime_id, episode_number ASC);


-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anime ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public Read Anime" ON public.anime FOR SELECT USING (true);
CREATE POLICY "Public Read Episodes" ON public.episodes FOR SELECT USING (true);

-- Admin & Auth Write Policies
CREATE POLICY "Full Access Profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Anime" ON public.anime FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Episodes" ON public.episodes FOR ALL USING (true) WITH CHECK (true);


-- 5. AUTOMATIC TRIGGER FOR SUPABASE AUTH SIGNUPS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    CASE 
      WHEN NEW.email = 'bekiuz282@gmail.com' THEN 'admin'
      ELSE COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role;

  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    CASE 
      WHEN NEW.email = 'bekiuz282@gmail.com' THEN 'admin'
      ELSE COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    END
  )
  ON CONFLICT (email) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users if available
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 6. INITIAL SEED DATA
INSERT INTO public.profiles (id, name, email, role)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Bek (Owner)', 'bekiuz282@gmail.com', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'Administrator', 'admin@selecon.tv', 'admin'),
  ('00000000-0000-0000-0000-000000000003', 'Anime Ishqibozi', 'user@selecon.tv', 'user')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.users (id, name, email, role)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Bek (Owner)', 'bekiuz282@gmail.com', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'Administrator', 'admin@selecon.tv', 'admin'),
  ('00000000-0000-0000-0000-000000000003', 'Anime Ishqibozi', 'user@selecon.tv', 'user')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.anime (
  id, title, poster, banner, description, genre, rating, year, status,
  studio, voice_studio, total_episodes, released_episodes, views, featured, trending, popular, is_new
)
VALUES
(
  'solo-leveling-s2',
  'Solo Leveling: Arise From the Shadows (2-Mavsum)',
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600',
  'Dunyoning eng kuchsiz ovchisi Sung Jin-woo kutilmagan sirli hodisadan so''ng cheksiz daraja oshirish (Level Up) qobiliyatiga ega bo''ladi. Endi u soyalar armiyasini boshqarib, eng xavfli monstrlarga qarshi kurashadi.',
  'Jangari, Fantastika, Sarguzasht, Sehr',
  9.8,
  2025,
  'Efirda',
  'A-1 Pictures',
  'Selecon Dub',
  12,
  8,
  245000,
  TRUE,
  TRUE,
  TRUE,
  TRUE
),
(
  'demon-slayer-s4',
  'Demon Slayer: Hashira Training Arc (4-Mavsum)',
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600',
  'Tanjiro va uning do''stlari iblislar lordi Muzanga qarshi hal qiluvchi jangga tayyorgarlik ko''rish uchun eng kuchli ustozlar — Hashiralar rahbarligidagi qattiq va shafqatsiz mashg''ulotlardan o''tishadi.',
  'Jangari, Mistika, Tarixiy, Drama',
  9.7,
  2024,
  'Tugallangan',
  'Ufotable',
  'Selecon Dub',
  8,
  8,
  189000,
  TRUE,
  TRUE,
  TRUE,
  FALSE
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.episodes (id, anime_id, episode_number, video_url, title, duration)
VALUES
(
  'ep-solo-1',
  'solo-leveling-s2',
  1,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  '1-qism: Yangi Dunyo Hukmdori',
  '24:15'
),
(
  'ep-solo-2',
  'solo-leveling-s2',
  2,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  '2-qism: Qizil Darvoza Sirlari',
  '23:45'
),
(
  'ep-demon-1',
  'demon-slayer-s4',
  1,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  '1-qism: Mashg''ulotlar Boshlanishi',
  '48:10'
)
ON CONFLICT (id) DO NOTHING;
