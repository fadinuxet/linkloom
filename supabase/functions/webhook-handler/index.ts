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

    const webhookData = await req.json()
    const { action, model } = webhookData

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Handle different types of Trello webhooks
    if (action.type === 'updateCard') {
      await handleCardUpdate(supabaseClient, action, model)
    } else if (action.type === 'createCard') {
      await handleCardCreate(supabaseClient, action, model)
    } else if (action.type === 'deleteCard') {
      await handleCardDelete(supabaseClient, action, model)
    } else if (action.type === 'moveCardFromList' || action.type === 'moveCardToList') {
      await handleCardMove(supabaseClient, action, model)
    }

    return new Response(
      JSON.stringify({ success: true, processed: action.type }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Webhook handler error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleCardUpdate(supabaseClient: any, action: any, model: any) {
  const cardId = model.id
  
  // Find links that reference this Trello card
  const { data: links, error } = await supabaseClient
    .from('links')
    .select('*')
    .eq('metadata->trello_card_id', cardId)

  if (error || !links || links.length === 0) return

  // Update link with new card data
  for (const link of links) {
    await supabaseClient
      .from('links')
      .update({
        title: model.name,
        description: model.desc || '',
        url: model.shortUrl,
        image_url: model.attachments?.[0]?.url || null,
        metadata: {
          ...link.metadata,
          trello_labels: model.labels?.map((l: any) => l.name) || [],
          trello_due_date: model.due,
          trello_members: model.idMembers,
          last_updated: new Date().toISOString()
        }
      })
      .eq('id', link.id)
  }
}

async function handleCardCreate(supabaseClient: any, action: any, model: any) {
  const cardId = model.id
  const listId = model.idList
  
  // Find bio pages that sync from this list
  const { data: bioPages, error } = await supabaseClient
    .from('bio_pages')
    .select('*')
    .eq('metadata->trello_list_id', listId)

  if (error || !bioPages || bioPages.length === 0) return

  // Create new link for this card
  for (const bioPage of bioPages) {
    const newLink = {
      user_id: bioPage.user_id,
      bio_page_id: bioPage.id,
      title: model.name,
      description: model.desc || '',
      url: model.shortUrl,
      image_url: model.attachments?.[0]?.url || null,
      is_active: true,
      is_pinned: false,
      order_index: 0,
      metadata: {
        trello_card_id: cardId,
        trello_list_id: listId,
        trello_board_id: model.idBoard,
        trello_labels: model.labels?.map((l: any) => l.name) || [],
        trello_due_date: model.due,
        trello_members: model.idMembers,
        synced_at: new Date().toISOString()
      }
    }

    await supabaseClient
      .from('links')
      .insert(newLink)
  }
}

async function handleCardDelete(supabaseClient: any, action: any, model: any) {
  const cardId = model.id
  
  // Remove links that reference this deleted card
  await supabaseClient
    .from('links')
    .delete()
    .eq('metadata->trello_card_id', cardId)
}

async function handleCardMove(supabaseClient: any, action: any, model: any) {
  const cardId = model.id
  const newListId = action.data.listAfter?.id || model.idList
  
  // Check if the new list is being synced by any bio pages
  const { data: bioPages, error } = await supabaseClient
    .from('bio_pages')
    .select('*')
    .eq('metadata->trello_list_id', newListId)

  if (error || !bioPages || bioPages.length === 0) {
    // Card moved to unsynced list, remove the link
    await supabaseClient
      .from('links')
      .delete()
      .eq('metadata->trello_card_id', cardId)
    return
  }

  // Update link metadata with new list info
  const { data: links } = await supabaseClient
    .from('links')
    .select('*')
    .eq('metadata->trello_card_id', cardId)

  if (links && links.length > 0) {
    for (const link of links) {
      await supabaseClient
        .from('links')
        .update({
          metadata: {
            ...link.metadata,
            trello_list_id: newListId,
            last_updated: new Date().toISOString()
          }
        })
        .eq('id', link.id)
    }
  }
}
