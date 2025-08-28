import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request body
    const { user_id, board_id, board_name, trello_token } = await req.json()

    console.log('🔗 Trello connection request:', { user_id, board_id, board_name, trello_token: !!trello_token })

    // Validate required fields
    if (!user_id || !board_id || !board_name || !trello_token) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          required: ['user_id', 'board_id', 'board_name', 'trello_token'],
          received: { user_id, board_id, board_name, trello_token: !!trello_token }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user already has an active connection
    const { data: existingConnection, error: checkError } = await supabase
      .from('trello_connections')
      .select('*')
      .eq('user_id', user_id)
      .eq('is_active', true)
      .maybeSingle()

    if (checkError) {
      console.error('❌ Error checking existing connection:', checkError)
      return new Response(
        JSON.stringify({ error: 'Database error checking existing connection' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (existingConnection) {
      // Update existing connection
      const { error: updateError } = await supabase
        .from('trello_connections')
        .update({
          board_id,
          board_name,
          connected_at: new Date().toISOString(),
          disconnected_at: null,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConnection.id)

      if (updateError) {
        console.error('❌ Error updating connection:', updateError)
        return new Response(
          JSON.stringify({ error: 'Database error updating connection' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('✅ Updated existing connection for user:', user_id)
    } else {
      // Create new connection
      const { error: insertError } = await supabase
        .from('trello_connections')
        .insert({
          user_id,
          board_id,
          board_name,
          connected_at: new Date().toISOString(),
          is_active: true
        })

      if (insertError) {
        console.error('❌ Error creating connection:', insertError)
        return new Response(
          JSON.stringify({ error: 'Database error creating connection' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('✅ Created new connection for user:', user_id)
    }

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Trello connection established successfully',
        user_id,
        board_id,
        board_name,
        connected_at: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
