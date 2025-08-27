-- Fix duplicate links in the public.links table
-- Run this in your Supabase SQL Editor

-- Step 1: First, let's see what duplicates we have
SELECT 
  metadata->>'trello_card_id' as trello_card_id,
  title,
  description,
  url,
  COUNT(*) as duplicate_count
FROM public.links 
WHERE metadata->>'trello_card_id' IS NOT NULL
GROUP BY metadata->>'trello_card_id', title, description, url
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Step 2: Remove duplicates, keeping only the most recent one
WITH duplicates AS (
  SELECT 
    id,
    metadata->>'trello_card_id' as trello_card_id,
    title,
    description,
    url,
    ROW_NUMBER() OVER (
      PARTITION BY metadata->>'trello_card_id', title, description, url 
      ORDER BY created_at DESC
    ) as rn
  FROM public.links 
  WHERE metadata->>'trello_card_id' IS NOT NULL
)
DELETE FROM public.links 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Step 3: Create unique constraint for Trello card ID to prevent future duplicates
-- Use B-tree index with extracted text value (GIN doesn't support unique)
CREATE UNIQUE INDEX IF NOT EXISTS idx_links_trello_card_id ON public.links ((metadata->>'trello_card_id'));

-- Step 4: Verify duplicates are removed
SELECT 
  metadata->>'trello_card_id' as trello_card_id,
  title,
  description,
  url,
  COUNT(*) as count
FROM public.links 
WHERE metadata->>'trello_card_id' IS NOT NULL
GROUP BY metadata->>'trello_card_id', title, description, url
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- If no results above, duplicates are successfully removed!
