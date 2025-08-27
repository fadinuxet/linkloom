import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    })
  }

  try {
    // Parse request body
    const body = await req.json()
    console.log('📥 Request received:', body)
    
    // Extract required fields
    const {
      user_id,
      board_id,
      list_id,
      sync_rule,
      board_name,
      list_name,
      linkloom_url,
      card_limit,
      trello_token,
      trello_api_key
    } = body
    
    // Validate required fields
    if (!user_id || !board_id || !list_id || !trello_token || !trello_api_key) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields', 
          required: ['user_id', 'board_id', 'list_id', 'trello_token', 'trello_api_key'],
          received: { user_id, board_id, list_id, trello_token: !!trello_token, trello_api_key: !!trello_api_key }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // STEP 1: Create Supabase client
    console.log('🔍 STEP 1 - Creating Supabase client...')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('❌ STEP 1 - Missing Supabase environment variables')
      return new Response(
        JSON.stringify({ 
          error: 'Supabase configuration missing', 
          supabase_url_set: !!supabaseUrl,
          supabase_key_set: !!supabaseServiceKey
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)
    console.log('✅ STEP 1 - Supabase client created successfully')
    
    // STEP 2: Fetch cards from Trello
    console.log('🔍 STEP 2 - Fetching cards from Trello...')
    try {
      const trelloUrl = `https://api.trello.com/1/lists/${list_id}/cards?key=${trello_api_key}&token=${trello_token}`
      console.log('🔍 STEP 2 - Trello URL:', trelloUrl)
      
      const trelloResponse = await fetch(trelloUrl)
      console.log('🔍 STEP 2 - Trello response status:', trelloResponse.status)
      
      if (!trelloResponse.ok) {
        const trelloErrorText = await trelloResponse.text()
        console.log('❌ STEP 2 - Trello API error:', trelloErrorText)
        
        return new Response(
          JSON.stringify({ 
            error: 'Trello API call failed', 
            status: trelloResponse.status,
            statusText: trelloResponse.statusText,
            trello_error: trelloErrorText,
            trello_url: trelloUrl,
            list_id: list_id
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      const trelloCards = await trelloResponse.json()
      console.log('✅ STEP 2 - Trello API call successful!')
      console.log('🔍 STEP 2 - Number of cards received:', trelloCards.length)
      
      // STEP 3: Full Sync with Deletion Handling
      console.log('🔍 STEP 3 - Starting full sync with deletion handling...')
      try {
        // Get existing cards from database for this list
        console.log('🔍 STEP 3.1 - Fetching existing cards from database...')
        const { data: existingCards, error: fetchError } = await supabaseClient
          .from('links')
          .select('trello_card_id, title')
          .eq('metadata->>trello_list_id', list_id)
          .eq('user_id', user_id)
        
        if (fetchError) {
          console.log('❌ STEP 3.1 - Error fetching existing cards:', fetchError)
          return new Response(
            JSON.stringify({ 
              error: 'Failed to fetch existing cards from database', 
              details: fetchError.message,
              step: 'step_3_1_fetch_existing'
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        
        console.log('🔍 STEP 3.1 - Existing cards in database:', existingCards?.length || 0)
        
        // Find cards to delete (exist in DB but not in Trello)
        const trelloCardIds = trelloCards.map(card => card.id)
        const existingCardIds = existingCards?.map(card => card.trello_card_id) || []
        const cardsToDelete = existingCardIds.filter(id => !trelloCardIds.includes(id))
        
        console.log('🔍 STEP 3.2 - Cards to delete (orphaned):', cardsToDelete.length)
        if (cardsToDelete.length > 0) {
          console.log('🔍 STEP 3.2 - Deleting orphaned cards:', cardsToDelete)
        }
        
        // Delete orphaned cards
        if (cardsToDelete.length > 0) {
          const { error: deleteError } = await supabaseClient
            .from('links')
            .delete()
            .in('trello_card_id', cardsToDelete)
          
          if (deleteError) {
            console.log('❌ STEP 3.2 - Error deleting orphaned cards:', deleteError)
            return new Response(
              JSON.stringify({ 
                error: 'Failed to delete orphaned cards from database', 
                details: deleteError.message,
                step: 'step_3_2_delete_orphaned'
              }),
              { 
                status: 500, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }
          
          console.log('✅ STEP 3.2 - Orphaned cards deleted successfully')
        }
        
        // Prepare cards to save/update
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
        }))
        
        console.log('🔍 STEP 3.3 - Cards prepared for database:', cardsToSave.length)
        
        // Use upsert to handle duplicates (update if exists, insert if new)
        const { data: savedCards, error: dbError } = await supabaseClient
          .from('links')
          .upsert(cardsToSave, { 
            onConflict: 'trello_card_id',
            ignoreDuplicates: false 
          })
          .select()
        
        if (dbError) {
          console.log('❌ STEP 3.3 - Database error:', dbError)
          return new Response(
            JSON.stringify({ 
              error: 'Failed to save cards to database', 
              details: dbError.message,
              step: 'step_3_3_database_save'
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        
        console.log('✅ STEP 3.3 - Database save successful!')
        console.log('🔍 STEP 3.3 - Cards saved:', savedCards?.length || 0)
        
        // SUCCESS - Return full sync summary
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: '✅ FULL SYNC SUCCESS - Cards synced with deletion handling!',
            timestamp: new Date().toISOString(),
            sync_summary: {
              trello_cards_received: trelloCards.length,
              existing_cards_found: existingCards?.length || 0,
              cards_deleted: cardsToDelete.length,
              cards_updated_inserted: savedCards?.length || 0
            },
            trello_cards_count: trelloCards.length,
            database_cards_saved: savedCards?.length || 0,
            orphaned_cards_deleted: cardsToDelete.length,
            received_data: {
              board_id,
              list_id,
              list_name,
              user_id
            }
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
        
      } catch (error) {
        console.log('❌ STEP 3 - Database operation failed:', error.message)
        return new Response(
          JSON.stringify({ 
            error: 'Database operation failed', 
            details: error.message,
            step: 'step_3_database_operation'
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
    } catch (error) {
      console.log('❌ STEP 2 - Trello API call failed:', error.message)
      return new Response(
        JSON.stringify({ 
          error: 'Trello API call failed', 
          details: error.message,
          step: 'step_2_trello_api'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
  } catch (error) {
    console.error('Full sync function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
