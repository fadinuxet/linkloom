-- LinkLoom Database Setup for Trello Sync
-- Run this in your Supabase SQL Editor

-- Create bio_pages table
CREATE TABLE IF NOT EXISTS public.bio_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  subdomain TEXT UNIQUE NOT NULL,
  theme TEXT DEFAULT 'default',
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create links table
CREATE TABLE IF NOT EXISTS public.links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  bio_page_id UUID REFERENCES public.bio_pages(id),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_pinned BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bio_pages_user_id ON public.bio_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_bio_pages_subdomain ON public.bio_pages(subdomain);
CREATE INDEX IF NOT EXISTS idx_links_user_id ON public.links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_bio_page_id ON public.links(bio_page_id);

-- Create unique constraint for Trello card ID to prevent duplicates
-- Use B-tree index with extracted text value (GIN doesn't support unique)
CREATE UNIQUE INDEX IF NOT EXISTS idx_links_trello_card_id ON public.links ((metadata->>'trello_card_id'));

-- Enable Row Level Security (RLS)
ALTER TABLE public.bio_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- Create policies (basic - you can customize these later)
CREATE POLICY "Enable read access for all users" ON public.bio_pages FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.bio_pages FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.bio_pages FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON public.links FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.links FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.links FOR UPDATE USING (true);

-- Grant permissions to authenticated users
GRANT ALL ON public.bio_pages TO authenticated;
GRANT ALL ON public.links TO authenticated;

-- Grant permissions to anon users (for public access)
GRANT SELECT ON public.bio_pages TO anon;
GRANT SELECT ON public.links TO anon;
