-- Add missing columns for Trello integration to the links table

-- Add trello_card_id column
ALTER TABLE public.links 
ADD COLUMN IF NOT EXISTS trello_card_id TEXT;

-- Drop the old index if it exists
DROP INDEX IF EXISTS idx_links_trello_card_id;

-- Add unique constraint on trello_card_id (this creates a constraint with the column name)
ALTER TABLE public.links 
ADD CONSTRAINT links_trello_card_id_key UNIQUE (trello_card_id);

-- Add metadata column if it doesn't exist (for storing Trello-specific data)
ALTER TABLE public.links 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add user_id column if it doesn't exist (make sure it's UUID type)
ALTER TABLE public.links 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add created_at and updated_at columns if they don't exist
ALTER TABLE public.links 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.links 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_links_updated_at ON public.links;
CREATE TRIGGER update_links_updated_at 
    BEFORE UPDATE ON public.links 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON public.links TO authenticated;
GRANT ALL ON public.links TO service_role;

-- Enable RLS if not already enabled
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own links (only if user_id is set)
DROP POLICY IF EXISTS "Users can view own links" ON public.links;
CREATE POLICY "Users can view own links" ON public.links
    FOR SELECT USING (
        user_id IS NULL OR auth.uid()::text = user_id::text
    );

-- Create policy for users to insert their own links
DROP POLICY IF EXISTS "Users can insert own links" ON public.links;
CREATE POLICY "Users can insert own links" ON public.links
    FOR INSERT WITH CHECK (
        user_id IS NULL OR auth.uid()::text = user_id::text
    );

-- Create policy for users to update their own links
DROP POLICY IF EXISTS "Users can update own links" ON public.links;
CREATE POLICY "Users can update own links" ON public.links
    FOR UPDATE USING (
        user_id IS NULL OR auth.uid()::text = user_id::text
    );

-- Create policy for users to delete their own links
DROP POLICY IF EXISTS "Users can delete own links" ON public.links;
CREATE POLICY "Users can delete own links" ON public.links
    FOR DELETE USING (
        user_id IS NULL OR auth.uid()::text = user_id::text
    );

-- Show the current table structure
\d public.links
