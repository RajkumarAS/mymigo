-- ============================================================================
-- MyMigo MVP Database Schema (Supabase / PostgreSQL)
-- 1. Stores: Boutique directory matching MVP Store Data specification.
-- 2. Users: Shopper accounts with handle, interests, and profile photo.
-- 3. Sellers: Boutique Seller accounts with handle, store profile, and category.
-- ============================================================================

-- ============================================================================
-- 1. STORES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  instagram_url TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast Explore Stores filtering on active stores by city and category
CREATE INDEX IF NOT EXISTS idx_stores_active_city_category
  ON public.stores (active, city, category);

-- Enable Row Level Security
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active stores" ON public.stores;
CREATE POLICY "Public can read active stores"
  ON public.stores
  FOR SELECT
  USING (active = TRUE);

DROP POLICY IF EXISTS "Public can insert or update stores" ON public.stores;
CREATE POLICY "Public can insert or update stores"
  ON public.stores
  FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================================================
-- 2. USERS (SHOPPERS) TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  handle TEXT NOT NULL,
  avatar TEXT,
  interests TEXT,
  preferences TEXT,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'shopper',
  connections_count INTEGER NOT NULL DEFAULT 140,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_handle ON public.users (handle);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read users" ON public.users;
CREATE POLICY "Public can read users"
  ON public.users
  FOR SELECT
  USING (status = 'active');

DROP POLICY IF EXISTS "Public can insert or update users" ON public.users;
CREATE POLICY "Public can insert or update users"
  ON public.users
  FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================================================
-- 3. SELLERS (STORE PROFILES) TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sellers (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  store_name TEXT NOT NULL,
  handle TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  avatar TEXT,
  image TEXT,
  rating NUMERIC NOT NULL DEFAULT 5.0,
  connections_count INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sellers_store_id ON public.sellers (store_id);
CREATE INDEX IF NOT EXISTS idx_sellers_handle ON public.sellers (handle);

ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read sellers" ON public.sellers;
CREATE POLICY "Public can read sellers"
  ON public.sellers
  FOR SELECT
  USING (active = TRUE);

DROP POLICY IF EXISTS "Public can insert or update sellers" ON public.sellers;
CREATE POLICY "Public can insert or update sellers"
  ON public.sellers
  FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================================================
-- 4. PERMISSIONS & GRANTS
-- Allow the Supabase API (anon and authenticated roles) to read and write
-- ============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.stores TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.users TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.sellers TO anon, authenticated, service_role;

-- Sample seed data (optional)
INSERT INTO public.stores (id, name, city, category, description, image, instagram_url, active)
VALUES
  ('store-001', 'Pooja Boutique', 'Coimbatore', 'Sarees', 'Handpicked Coimbatore soft silks, pastel silk-cottons, and custom bridal blouses from Cross Cut Road.', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80', 'https://www.instagram.com/poojaboutiquecbe/', TRUE),
  ('store-002', 'Sri Murugan Handloom Weavers', 'Salem', 'Sarees', 'Authentic Ilampillai cotton sarees, copper zari temple borders, and jacquard weaves straight from Salem looms.', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80', 'https://www.instagram.com/ilampillaihandlooms/', TRUE),
  ('store-003', 'Nalli & Sons Heritage', 'Chennai', 'Sarees', 'Iconic T. Nagar heritage house known for pure Kanchipuram zari silks, korvai borders, and ceremonial weaves.', 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=1000&q=80', 'https://www.instagram.com/nalliheritagechennai/', TRUE),
  ('store-004', 'Virasat Temple Jewels', 'Madurai', 'Jewellery', '92.5 hallmark temple silver, antique nakshi ornaments, and handcrafted pooja silverware near Meenakshi Temple.', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80', 'https://www.instagram.com/virasatsilvermadurai/', TRUE),
  ('store-005', 'Zari House of Banjara', 'Hyderabad', 'Women''s Fashion', 'Festive kurtis, Gadwal weaves, and contemporary ethnic ensembles curated in Banjara Hills.', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80', 'https://www.instagram.com/zarihousebanjara/', TRUE),
  ('store-006', 'Loom & Tailors Studio', 'Bengaluru', 'Men''s Fashion', 'Tailored linen shirts, handloom bandhgalas, and festive kurtas from Indiranagar''s independent menswear studio.', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80', 'https://www.instagram.com/loomtailorsblr/', TRUE),
  ('store-007', 'Malabar Craft Collective', 'Kochi', 'Handicrafts', 'Aranmula brass mirrors, carved rosewood decor, and coastal artisan homeware from Fort Kochi.', 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1000&q=80', 'https://www.instagram.com/malabarcraftkochi/', TRUE),
  ('store-008', 'Kasavu & Co. Textiles', 'Kochi', 'Textiles', 'Handwoven Balaramapuram unbleached cottons, kasavu mundus, and breathable home linens.', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80', 'https://www.instagram.com/kasavuandco/', TRUE),
  ('store-009', 'Nilgiri Spice & Estate Pantry', 'Coimbatore', 'Local Products', 'Single-estate Nilgiri teas, cold-pressed eucalyptus oils, and artisanal regional condiments.', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1000&q=80', 'https://www.instagram.com/nilgiripantry/', TRUE)
ON CONFLICT (id) DO NOTHING;
