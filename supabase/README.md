# LinkLoom Supabase Edge Functions

This directory contains the Supabase Edge Functions that power the LinkLoom Trello integration.

## Functions Overview

### 1. `trello-oauth` - OAuth Flow Handler
- **Purpose**: Handles Trello OAuth callback and stores user tokens
- **Endpoint**: `/functions/v1/trello-oauth`
- **Method**: GET
- **Flow**: 
  1. User authorizes LinkLoom in Trello
  2. Trello redirects to this function with auth code
  3. Function exchanges code for access token
  4. Stores token in `integrations` table
  5. Redirects user back to dashboard

### 2. `trello-sync` - Data Synchronization
- **Purpose**: Syncs Trello cards to LinkLoom bio pages
- **Endpoint**: `/functions/v1/trello-sync`
- **Method**: POST
- **Flow**:
  1. Power-Up calls this function with board/list info
  2. Function fetches cards from Trello API
  3. Converts cards to LinkLoom links
  4. Creates/updates bio page
  5. Returns sync results

### 3. `webhook-handler` - Real-time Updates
- **Purpose**: Handles Trello webhooks for automatic updates
- **Endpoint**: `/functions/v1/webhook-handler`
- **Method**: POST
- **Flow**:
  1. Trello sends webhook when cards change
  2. Function processes different action types
  3. Updates LinkLoom data automatically
  4. Maintains real-time sync

## Deployment

### Prerequisites
1. Supabase project with Edge Functions enabled
2. Trello API key and secret
3. Environment variables configured

### Environment Variables
Copy `env.example` to `.env` and fill in your values:

```bash
# Supabase
SUPABASE_URL=https://ctfugzedtycshflmqlsd.supabase.co
SUPABASE_ANON_KEY=***REMOVED***
SUPABASE_SERVICE_ROLE_KEY=***REMOVED***


# Trello
VITE_TRELLO_API_KEY=***REMOVED***
VITE_TRELLO_APP_NAME=LinkLoom

# LinkLoom
LINKLOOM_URL=https://your-linkloom-domain.com
```

### Deploy Commands
```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy trello-oauth
supabase functions deploy trello-sync
supabase functions deploy webhook-handler
```

## Trello Setup

### 1. Create Trello App
1. Go to [Trello Developers](https://developer.atlassian.com/cloud/trello/)
2. Create new app
3. Get API key and secret
4. Set OAuth callback URL: `https://your-project.supabase.co/functions/v1/trello-oauth`

### 2. Configure Webhooks
1. Set webhook URL: `https://your-project.supabase.co/functions/v1/webhook-handler`
2. Subscribe to: `updateCard`, `createCard`, `deleteCard`, `moveCardFromList`, `moveCardToList`

## Database Schema

### Required Tables
- `integrations` - Stores Trello OAuth tokens
- `bio_pages` - User bio pages
- `links` - Individual links from Trello cards
- `user_profiles` - User account information

### RLS Policies
Ensure proper Row Level Security policies are in place for user data isolation.

## Testing

### Test OAuth Flow
1. Visit: `https://your-project.supabase.co/functions/v1/trello-oauth?code=test&state=user123`
2. Check console for errors
3. Verify token storage in database

### Test Sync Function
```bash
curl -X POST https://your-project.supabase.co/functions/v1/trello-sync \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","board_id":"board123","list_id":"list123","sync_rule":"latest"}'
```

### Test Webhook Handler
```bash
curl -X POST https://your-project.supabase.co/functions/v1/webhook-handler \
  -H "Content-Type: application/json" \
  -d '{"action":{"type":"updateCard"},"model":{"id":"card123","name":"Test Card"}}'
```

## Troubleshooting

### Common Issues
1. **CORS errors**: Check function CORS headers
2. **Auth errors**: Verify environment variables
3. **Database errors**: Check RLS policies and table structure
4. **Trello API errors**: Verify API key/secret and permissions

### Logs
Check Supabase dashboard > Edge Functions > Logs for detailed error information.

## Next Steps

After deploying these functions:
1. Update Power-Up to call real endpoints
2. Test OAuth flow end-to-end
3. Verify data sync works
4. Set up webhook monitoring
5. Build bio page templates
