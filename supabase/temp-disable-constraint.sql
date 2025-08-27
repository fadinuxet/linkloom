-- Temporarily disable the unique constraint to test if that's causing the issue
-- Run this in your Supabase SQL Editor

-- Drop the unique constraint temporarily
DROP INDEX IF EXISTS idx_links_trello_card_id;

-- Verify it's gone
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'links' 
AND indexname LIKE '%trello_card_id%';

-- Test the sync now - it should work without the constraint
-- After testing, you can recreate it with:
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_links_trello_card_id ON public.links ((metadata->>'trello_card_id'));
