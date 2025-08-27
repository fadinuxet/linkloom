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
    const { method, url } = req
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    if (method === 'GET') {
      // Handle OAuth callback from Trello
      const urlObj = new URL(url)
      const code = urlObj.searchParams.get('code')
      const state = urlObj.searchParams.get('state')
      
      if (!code) {
        return new Response(
          JSON.stringify({ error: 'No authorization code received' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Exchange code for access token
      const tokenResponse = await fetch('https://trello.com/1/OAuthGetAccessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          name: 'LinkLoom',
          expiration: 'never',
          scope: 'read,write',
          response_type: 'token',
          key: Deno.env.get('TRELLO_API_KEY') ?? '',
          secret: Deno.env.get('TRELLO_API_SECRET') ?? '',
          code: code,
          return_url: `${Deno.env.get('LINKLOOM_URL')}/dashboard/integrations`,
        })
      })

      if (!tokenResponse.ok) {
        throw new Error(`Failed to get access token: ${tokenResponse.statusText}`)
      }

      const tokenData = await tokenResponse.text()
      const accessToken = new URLSearchParams(tokenData).get('oauth_token')

      if (!accessToken) {
        throw new Error('No access token received from Trello')
      }

      // Get user info from Trello
      const userResponse = await fetch(`https://api.trello.com/1/members/me?key=${Deno.env.get('TRELLO_API_KEY')}&token=${accessToken}`)
      const userData = await userResponse.json()

      // Store the connection in Supabase
      const { data: connection, error } = await supabaseClient
        .from('integrations')
        .upsert({
          user_id: state, // state contains user_id
          provider: 'trello',
          provider_user_id: userData.id,
          provider_username: userData.username,
          access_token: accessToken,
          metadata: {
            trello_user_id: userData.id,
            trello_username: userData.username,
            trello_full_name: userData.fullName,
            connected_at: new Date().toISOString()
          }
        }, {
          onConflict: 'user_id,provider'
        })

      if (error) {
        throw new Error(`Failed to save connection: ${error.message}`)
      }

      // Redirect to dashboard with success
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': `${Deno.env.get('LINKLOOM_URL')}/dashboard/integrations?success=true&provider=trello`
        }
      })
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Trello OAuth error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
