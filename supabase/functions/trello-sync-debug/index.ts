// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚨 COMPLETELY NEW FUNCTION - TRELLO-SYNC-DEBUG!');
    console.log('🚨 THIS IS DEFINITELY NOT THE OLD CODE!');
    console.log('🚨 THIS IS A BRAND NEW FUNCTION NAME!');
    
    const { method } = req
    
    if (method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed - COMPLETELY NEW FUNCTION' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // Get the request body to see what's being sent
    const body = await req.json();
    console.log('📋 Request body received:', body);
    
    // Check if we have the required fields
    const { user_id, board_id, list_id, trello_token, trello_api_key } = body;
    
    console.log('🔍 DEBUG - Required fields check:');
    console.log('🔍 DEBUG - user_id:', user_id);
    console.log('🔍 DEBUG - board_id:', board_id);
    console.log('🔍 DEBUG - list_id:', list_id);
    console.log('🔍 DEBUG - trello_token length:', trello_token?.length || 0);
    console.log('🔍 DEBUG - trello_api_key length:', trello_api_key?.length || 0);
    console.log('🔍 DEBUG - trello_token value:', trello_token);
    console.log('🔍 DEBUG - trello_api_key value:', trello_api_key);
    
    // TEST: Try to create Supabase client
    console.log('🔍 TEST - About to create Supabase client...');
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      console.log('✅ TEST - Supabase client created successfully!');
      console.log('🔍 TEST - SUPABASE_URL:', Deno.env.get('SUPABASE_URL') ? 'SET' : 'NOT SET');
      console.log('🔍 TEST - SUPABASE_SERVICE_ROLE_KEY length:', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.length || 0);
    } catch (error) {
      console.log('❌ TEST - Failed to create Supabase client:', error.message);
    }
    
    // Immediately return success to test if this function is being called
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'COMPLETELY NEW FUNCTION IS WORKING!',
        version: '5.0',
        timestamp: new Date().toISOString(),
        received_data: body,
        debug_info: {
          has_user_id: !!user_id,
          has_board_id: !!board_id,
          has_list_id: !!list_id,
          has_trello_token: !!trello_token,
          has_trello_api_key: !!trello_api_key,
          trello_token_length: trello_token?.length || 0,
          trello_api_key_length: trello_api_key?.length || 0
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Completely new function error:', error)
    return new Response(
      JSON.stringify({ error: error.message, version: '5.0' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/trello-sync-debug' \
    --header 'Authorization: Bearer ***REMOVED***' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
