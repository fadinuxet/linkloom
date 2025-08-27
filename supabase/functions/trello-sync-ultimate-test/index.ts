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
    console.log('🚨 ULTIMATE TEST FUNCTION - TRELLO-SYNC-ULTIMATE-TEST!');
    console.log('🚨 THIS IS A COMPLETELY NEW FUNCTION WITH A NEW NAME!');
    console.log('🚨 TIMESTAMP:', new Date().toISOString());
    
    const { method } = req
    
    if (method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed - ULTIMATE TEST FUNCTION' }),
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
    
    // STEP 1: Test Supabase client creation
    console.log('🔍 STEP 1 - About to create Supabase client...');
    let supabaseClient;
    try {
      supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      console.log('✅ STEP 1 - Supabase client created successfully!');
      console.log('🔍 STEP 1 - SUPABASE_URL:', Deno.env.get('SUPABASE_URL') ? 'SET' : 'NOT SET');
      console.log('🔍 STEP 1 - SUPABASE_SERVICE_ROLE_KEY length:', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.length || 0);
    } catch (error) {
      console.log('❌ STEP 1 - Failed to create Supabase client:', error.message);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create Supabase client', 
          details: error.message,
          step: 'step_1_supabase_client',
          version: '7.0 - ULTIMATE TEST'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // STEP 2: Test Trello API call
    console.log('🔍 STEP 2 - About to call Trello API...');
    try {
      // Build Trello API URL for the specific list
      const trelloUrl = `https://api.trello.com/1/lists/${list_id}/cards?key=${trello_api_key}&token=${trello_token}`;
      console.log('🔍 STEP 2 - Trello URL:', trelloUrl);
      
      const trelloResponse = await fetch(trelloUrl);
      console.log('🔍 STEP 2 - Trello response status:', trelloResponse.status);
      console.log('🔍 STEP 2 - Trello response headers:', Object.fromEntries(trelloResponse.headers.entries()));
      
      if (!trelloResponse.ok) {
        const trelloErrorText = await trelloResponse.text();
        console.log('❌ STEP 2 - Trello API error response:', trelloErrorText);
        console.log('❌ STEP 2 - Full error details:', {
          status: trelloResponse.status,
          statusText: trelloResponse.statusText,
          url: trelloUrl,
          list_id,
          trello_api_key_length: trello_api_key?.length || 0,
          trello_token_length: trello_token?.length || 0
        });
        
        return new Response(
          JSON.stringify({ 
            error: 'Trello API call failed', 
            status: trelloResponse.status,
            statusText: trelloResponse.statusText,
            trello_error: trelloErrorText,
            trello_url: trelloUrl,
            list_id: list_id,
            trello_api_key_length: trello_api_key?.length || 0,
            trello_token_length: trello_token?.length || 0,
            step: 'step_2_trello_api',
            version: '7.0 - ULTIMATE TEST'
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      const trelloCards = await trelloResponse.json();
      console.log('✅ STEP 2 - Trello API call successful!');
      console.log('🔍 STEP 2 - Number of cards received:', trelloCards.length);
      console.log('🔍 STEP 2 - First card sample:', trelloCards[0] ? { id: trelloCards[0].id, name: trelloCards[0].name } : 'No cards');
      
      // STEP 3: Save cards to Supabase database
      console.log('🔍 STEP 3 - About to save cards to Supabase...');
      try {
        const cardsToSave = trelloCards.map(card => ({
          trello_card_id: card.id,
          title: card.name,
          description: card.desc || '',
          url: card.shortUrl || '',
          metadata: {
            trello_card_id: card.id,
            trello_list_id: list_id,
            trello_board_id: board_id,
            trello_card_name: card.name,
            trello_card_desc: card.desc || '',
            trello_card_url: card.shortUrl || '',
            trello_card_created: card.dateLastActivity,
            trello_card_updated: card.dateLastActivity,
            user_id: user_id
          },
          user_id: user_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        console.log('🔍 STEP 3 - Cards prepared for database:', cardsToSave.length);
        console.log('🔍 STEP 3 - First card sample:', cardsToSave[0]);
        
        // Use upsert to handle duplicates (update if exists, insert if new)
        const { data: savedCards, error: dbError } = await supabaseClient
          .from('links')
          .upsert(cardsToSave, { 
            onConflict: 'trello_card_id',
            ignoreDuplicates: false 
          })
          .select();
        
        if (dbError) {
          console.log('❌ STEP 3 - Database error:', dbError);
          return new Response(
            JSON.stringify({ 
              error: 'Failed to save cards to database', 
              details: dbError.message,
              step: 'step_3_database_save',
              version: '7.1 - STEP 3 TEST'
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        
        console.log('✅ STEP 3 - Database save successful!');
        console.log('🔍 STEP 3 - Cards saved:', savedCards?.length || 0);
        
        // STEP 3 SUCCESS - Return success with database info
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: '✅ ULTIMATE SUCCESS - Cards saved to database!',
            version: '7.1 - STEP 3 TEST',
            timestamp: new Date().toISOString(),
            step: 'step_3_database_success',
            trello_cards_count: trelloCards.length,
            database_cards_saved: savedCards?.length || 0,
            trello_first_card: trelloCards[0] ? { id: trelloCards[0].id, name: trelloCards[0].name } : null,
            supabase_url_set: !!Deno.env.get('SUPABASE_URL'),
            supabase_key_length: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.length || 0,
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
        console.log('❌ STEP 3 - Database operation failed with exception:', error.message);
        return new Response(
          JSON.stringify({ 
            error: 'Database operation failed with exception', 
            details: error.message,
            step: 'step_3_database_exception',
            version: '7.1 - STEP 3 TEST'
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
    } catch (error) {
      console.log('❌ STEP 2 - Trello API call failed with exception:', error.message);
      return new Response(
        JSON.stringify({ 
          error: 'Trello API call failed with exception', 
          details: error.message,
          step: 'step_2_trello_api_exception',
          version: '7.0 - ULTIMATE TEST'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Ultimate test function error:', error)
    return new Response(
      JSON.stringify({ error: error.message, version: '7.0 - ULTIMATE TEST' }),
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/trello-sync-ultimate-test' \
    --header 'Authorization: Bearer ***REMOVED***' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
