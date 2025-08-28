-- Create a simple table to track Trello Power-Up connections
CREATE TABLE IF NOT EXISTS trello_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    board_id TEXT NOT NULL,
    board_name TEXT NOT NULL,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    disconnected_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint to prevent multiple active connections per user
ALTER TABLE trello_connections 
ADD CONSTRAINT unique_active_user_connection 
UNIQUE (user_id) 
WHERE is_active = true;

-- Enable RLS
ALTER TABLE trello_connections ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own connections
CREATE POLICY "Users can manage their own Trello connections" ON trello_connections
    FOR ALL USING (auth.uid()::text = user_id);

-- Grant access to authenticated users
GRANT ALL ON trello_connections TO authenticated;
GRANT ALL ON trello_connections TO anon;
