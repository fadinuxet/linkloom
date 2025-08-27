-- Clean up duplicate links in the public.links table
-- Run this in your Supabase SQL Editor to remove existing duplicates

-- First, let's see what duplicates we have
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

-- Now let's remove duplicates, keeping only the most recent one
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

-- Verify duplicates are removed
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
