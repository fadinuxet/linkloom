# 🚀 Supabase Setup Guide for LinkLoom

This guide will walk you through setting up Supabase as the backend for LinkLoom.

## 📋 Prerequisites

- A Supabase account ([sign up here](https://supabase.com))
- Node.js 18+ installed
- Git installed

## 🎯 Step 1: Create Supabase Project

1. **Go to Supabase Dashboard**
   - Visit [supabase.com](https://supabase.com)
   - Sign in or create an account

2. **Create New Project**
   - Click "New Project"
   - Choose your organization
   - Enter project name: `linkloom` (or your preferred name)
   - Enter database password (save this securely!)
   - Choose a region close to your users
   - Click "Create new project"

3. **Wait for Setup**
   - Project creation takes 2-3 minutes
   - You'll see a success message when ready

## 🔑 Step 2: Get Project Credentials

1. **Go to Project Settings**
   - In your project dashboard, click the gear icon (⚙️)
   - Select "API" from the sidebar

2. **Copy Credentials**
   - **Project URL**: Copy the "Project URL" (looks like `https://xyz.supabase.co`)
   - **Anon Key**: Copy the "anon public" key (starts with `eyJ...`)

3. **Save These Securely**
   - You'll need these for the next step

## ⚙️ Step 3: Configure Environment Variables

1. **Create Environment File**
   ```bash
   cp env.example .env.local
   ```

2. **Update with Your Credentials**
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Verify File**
   - Make sure `.env.local` is in your `.gitignore`
   - Never commit this file to version control

## 🗄️ Step 4: Set Up Database Schema

1. **Open SQL Editor**
   - In Supabase dashboard, click "SQL Editor" in the sidebar

2. **Run Migration**
   - Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

3. **Verify Tables Created**
   - Go to "Table Editor" in the sidebar
   - You should see these tables:
     - `user_profiles`
     - `bio_pages`
     - `links`
     - `integrations`
     - `automation_rules`
     - `subscriptions`
     - `link_clicks`

## 🔐 Step 5: Configure Authentication

1. **Go to Authentication Settings**
   - Click "Authentication" in the sidebar
   - Click "Settings"

2. **Configure Site URL**
   - Set "Site URL" to `http://localhost:3001` (for development)
   - Add `http://localhost:3001/auth/callback` to "Redirect URLs"

3. **Email Templates (Optional)**
   - Customize email templates for signup and password reset
   - Update branding and colors to match LinkLoom

## 🚀 Step 6: Test the Setup

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test Authentication**
   - Go to `http://localhost:3001/auth/signup`
   - Try creating a test account
   - Check Supabase dashboard for the new user

3. **Verify Database**
   - Check "Table Editor" for new user records
   - Verify RLS policies are working

## 🔧 Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Check that `.env.local` exists and has correct values
   - Restart your dev server after creating the file

2. **"Invalid API key"**
   - Verify you copied the "anon public" key, not the service role key
   - Check for extra spaces or characters

3. **"Table doesn't exist"**
   - Make sure you ran the migration SQL
   - Check the SQL Editor for any error messages

4. **Authentication not working**
   - Verify redirect URLs are correct
   - Check browser console for CORS errors

### Getting Help

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Discord**: [discord.supabase.com](https://discord.supabase.com)
- **GitHub Issues**: Create an issue in this repository

## 🎉 Next Steps

Once Supabase is working:

1. **Test the full flow**: Sign up → Dashboard → Create bio page
2. **Set up Trello integration**: Add Trello API keys
3. **Configure Stripe**: Add payment processing
4. **Deploy**: Move to production environment

## 🔒 Security Notes

- Never commit `.env.local` to git
- Use environment variables in production
- Regularly rotate API keys
- Monitor database usage and costs
- Set up proper backup strategies

---

**Need help?** Check the main README or create a GitHub issue! 🚀
