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
    console.log('🚀 TRELLO SYNC FUNCTION - FINAL WORKING VERSION!');
    
    const { method } = req
    
    if (method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { user_id, board_id, list_id, sync_rule, board_name, list_name, linkloom_url, card_limit, trello_token, trello_api_key } = await req.json()

    console.log('📋 Request data received:', {
      user_id,
      board_id,
      list_id,
      sync_rule,
      board_name,
      list_name,
      has_trello_token: !!trello_token,
      has_trello_api_key: !!trello_api_key
    })

    if (!user_id || !board_id || !list_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch cards from Trello list using OAuth token and API key from request
    let trelloApiKey = trello_api_key || Deno.env.get('TRELLO_API_KEY')
    let trelloToken = trello_token
    
    console.log('🔑 Authentication setup:', {
      hasApiKey: !!trelloApiKey,
      hasToken: !!trelloToken,
      apiKeyPrefix: trelloApiKey ? trelloApiKey.substring(0, 10) + '...' : 'NO KEY',
      tokenPrefix: trelloToken ? trelloToken.substring(0, 10) + '...' : 'NO TOKEN'
    })
    
    if (!trelloToken && !trelloApiKey) {
      return new Response(
        JSON.stringify({ error: 'No Trello authentication provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fetch cards from Trello list
    let authParams = []
    
    if (trelloToken) {
      // OAuth token requires both key and token
      authParams.push(`key=${trelloApiKey}`)
      authParams.push(`token=${trelloToken}`)
      console.log('🔐 Using OAuth authentication: key + token')
    } else {
      // API key only (for public boards)
      authParams.push(`key=${trelloApiKey}`)
      console.log('🔑 Using API key authentication only')
    }
    
    const authString = authParams.join('&')
    const trelloUrl = `https://api.trello.com/1/lists/${list_id}/cards?${authString}`
    
    // SUPER AGGRESSIVE DEBUGGING
    console.log('🚨 SUPER DEBUG - Auth params:', authParams);
    console.log('🚨 SUPER DEBUG - Auth string:', authString);
    console.log('🚨 SUPER DEBUG - List ID:', list_id);
    console.log('🚨 SUPER DEBUG - Full URL:', trelloUrl);
    console.log('🚨 SUPER DEBUG - API Key length:', trelloApiKey?.length || 0);
    console.log('🚨 SUPER DEBUG - Token length:', trelloToken?.length || 0);
    console.log('🚨 SUPER DEBUG - API Key value:', trelloApiKey);
    console.log('🚨 SUPER DEBUG - Token value:', trelloToken);
    console.log('🌐 Fetching from Trello URL:', trelloUrl)
    
    let cards
    try {
      console.log('📡 Making Trello API request...')
      console.log('🚨 SUPER DEBUG - About to fetch from URL:', trelloUrl)
      
      const cardsResponse = await fetch(trelloUrl)
      console.log('🚨 SUPER DEBUG - Fetch completed, response received')
      console.log('📡 Trello API response status:', cardsResponse.status, cardsResponse.statusText)

      if (!cardsResponse.ok) {
        console.log('🚨 SUPER DEBUG - Response not OK, getting error text...')
        const errorText = await cardsResponse.text()
        console.log('🚨 SUPER DEBUG - Error text received:', errorText)
        console.error('❌ Trello API error:', cardsResponse.status, errorText)
        throw new Error(`Failed to fetch Trello cards: ${cardsResponse.statusText} (${cardsResponse.status})`)
      }

      cards = await cardsResponse.json()
      console.log('✅ Trello cards fetched successfully:', cards.length, 'cards')
      
      // Log first card for debugging
      if (cards.length > 0) {
        console.log('📋 First card sample:', {
          id: cards[0].id,
          name: cards[0].name,
          desc: cards[0].desc?.substring(0, 50) + '...',
          shortUrl: cards[0].shortUrl
        })
      }
    } catch (error) {
      console.error('❌ Error fetching Trello cards:', error)
      throw new Error(`Failed to fetch Trello cards: ${error.message}`)
    }

    // Process cards based on sync rule and card limit
    let processedCards = cards
    const limit = card_limit || 10
    
    if (sync_rule === 'latest') {
      processedCards = cards.slice(0, limit)
    } else if (sync_rule === 'pinned') {
      processedCards = cards.filter((card: any) => card.stickers && card.stickers.length > 0).slice(0, limit)
    } else if (sync_rule === 'all') {
      processedCards = cards.slice(0, limit)
    }

    // Convert Trello cards to LinkLoom links
    const links = processedCards.map((card: any) => ({
      user_id,
      bio_page_id: null, // Will be set when bio page is created
      title: card.name,
      description: card.desc || '',
      url: card.shortUrl,
      image_url: card.attachments?.[0]?.url || null,
      is_active: true,
      is_pinned: false,
      order_index: 0,
      metadata: {
        trello_card_id: card.id,
        trello_list_id: card.idList,
        trello_board_id: card.idBoard,
        trello_labels: card.labels?.map((l: any) => l.name) || [],
        trello_due_date: card.due,
        trello_members: card.idMembers,
        synced_at: new Date().toISOString()
      }
    }))
    
    console.log(`🔄 Processing ${links.length} cards for sync...`)
    
    // SMART DEDUPLICATION: Check existing links and update them, only insert new ones
    let savedLinks = [];
    let updatedCount = 0;
    let insertedCount = 0;
    
    console.log('🔄 Starting smart deduplication for', links.length, 'links...');
    
    try {
      // Process each link individually
      for (const link of links) {
        const trelloCardId = link.metadata.trello_card_id;
        console.log(`🔍 Processing link: ${link.title} (Trello ID: ${trelloCardId})`);
        
        // Check if link already exists by trello_card_id
        const { data: existingLink, error: selectError } = await supabaseClient
          .from('links')
          .select('id, title, description, url, metadata')
          .eq('user_id', user_id)
          .eq('metadata->trello_card_id', trelloCardId)
          .maybeSingle();
        
        if (selectError) {
          console.log(`⚠️ Error checking existing link ${trelloCardId}:`, selectError.message);
          continue; // Skip this link if we can't check it
        }
        
        if (existingLink) {
          console.log(`🔄 Updating existing link ${trelloCardId}...`);
          console.log(`🔍 Old description: "${existingLink.description}"`);
          console.log(`🔍 New description: "${link.description}"`);
          
          // Update existing link with new data from Trello
          const { data: updatedLink, error: updateError } = await supabaseClient
            .from('links')
            .update({
              title: link.title,
              description: link.description,
              url: link.url,
              image_url: link.image_url,
              metadata: link.metadata
            })
            .eq('id', existingLink.id)
            .select()
            .single();
          
          if (updateError) {
            console.log(`❌ Failed to update existing link ${trelloCardId}:`, updateError.message);
            continue; // Skip this link if update fails
          } else {
            console.log(`✅ Successfully updated link ${trelloCardId}`);
            savedLinks.push(updatedLink);
            updatedCount++;
          }
        } else {
          console.log(`🆕 Inserting new link ${trelloCardId}...`);
          
          // Insert new link
          const { data: newLink, error: insertError } = await supabaseClient
            .from('links')
            .insert(link)
            .select()
            .single();
          
          if (insertError) {
            console.log(`❌ Failed to insert new link ${trelloCardId}:`, insertError.message);
            continue; // Skip this link if insert fails
          } else {
            console.log(`✅ Successfully inserted link ${trelloCardId}`);
            savedLinks.push(newLink);
            insertedCount++;
          }
        }
      }
      
      console.log(`✅ Smart deduplication complete!`);
      console.log(`📊 Results: ${updatedCount} updated, ${insertedCount} inserted, ${savedLinks.length} total processed`);
      
    } catch (error) {
      console.log('❌ Error during smart deduplication:', error.message);
      throw new Error(`Failed to process links: ${error.message}`)
    }

    // Update or create bio page connection
    let bioPage = null;
    let bioPageError = null;
    
    try {
      const { data, error } = await supabaseClient
        .from('bio_pages')
        .upsert({
          user_id,
          title: board_name || `Trello Sync - ${board_id}`,
          description: `Automatically synced from Trello board: ${board_name || board_id}, List: ${list_name || list_id}`,
          subdomain: `${user_id}-trello-${board_id}`,
          theme: 'default',
          is_active: true,
          metadata: {
            trello_board_id: board_id,
            trello_board_name: board_name,
            trello_list_id: list_id,
            trello_list_name: list_name,
            linkloom_url: linkloom_url,
            sync_rule,
            card_limit: card_limit,
            last_synced: new Date().toISOString(),
            cards_count: processedCards.length
          }
        });
      
      bioPage = data;
      bioPageError = error;
    } catch (error) {
      console.log('⚠️ Bio page creation failed, continuing with links only:', error.message);
      // Continue without bio page - links will still be saved
    }

    if (bioPageError) {
      console.log('⚠️ Bio page error, but continuing:', bioPageError.message);
      // Don't throw error - continue with links only
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced_cards: processedCards.length,
        updated_links: updatedCount,
        inserted_links: insertedCount,
        total_processed: savedLinks.length,
        bio_page_id: bioPage?.[0]?.id,
        message: `Successfully synced ${processedCards.length} cards. Updated ${updatedCount} existing links, inserted ${insertedCount} new links.`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Trello sync error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
