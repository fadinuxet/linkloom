-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE plan_type AS ENUM ('free', 'pro');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'incomplete');
CREATE TYPE integration_provider AS ENUM ('trello', 'notion', 'airtable');
CREATE TYPE rule_type AS ENUM ('latest_n', 'date_range', 'keyword_filter');

-- User Profiles Table (extends auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  subdomain TEXT UNIQUE NOT NULL CHECK (subdomain ~ '^[a-z0-9-]+$'),
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bio Pages Table
CREATE TABLE public.bio_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subdomain TEXT UNIQUE NOT NULL CHECK (subdomain ~ '^[a-z0-9-]+$'),
  title TEXT DEFAULT 'My Links',
  description TEXT,
  theme TEXT DEFAULT 'default',
  custom_domain TEXT UNIQUE,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT bio_pages_user_subdomain_unique UNIQUE (user_id, subdomain)
);

-- Links Table
CREATE TABLE public.links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bio_page_id UUID REFERENCES public.bio_pages(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL CHECK (url ~ '^https?://'),
  description TEXT,
  order_index INTEGER,
  is_pinned BOOLEAN DEFAULT false,
  source TEXT NOT NULL CHECK (source IN ('manual', 'trello', 'notion')),
  external_id TEXT,
  is_active BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Integrations Table
CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider integration_provider NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  board_id TEXT,
  list_id TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT integrations_user_provider_unique UNIQUE (user_id, provider)
);

-- Automation Rules Table
CREATE TABLE public.automation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bio_page_id UUID REFERENCES public.bio_pages(id) ON DELETE CASCADE NOT NULL,
  rule_type rule_type NOT NULL,
  rule_config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Subscriptions Table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan_type plan_type NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Link Clicks Tracking Table
CREATE TABLE public.link_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID REFERENCES public.links(id) ON DELETE CASCADE NOT NULL,
  visitor_ip INET,
  user_agent TEXT,
  referrer TEXT,
  clicked_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_bio_pages_user_id ON public.bio_pages(user_id);
CREATE INDEX idx_bio_pages_subdomain ON public.bio_pages(subdomain);
CREATE INDEX idx_bio_pages_custom_domain ON public.bio_pages(custom_domain);
CREATE INDEX idx_links_bio_page_id ON public.links(bio_page_id);
CREATE INDEX idx_links_order_index ON public.links(order_index);
CREATE INDEX idx_links_external_id ON public.links(external_id);
CREATE INDEX idx_integrations_user_id ON public.integrations(user_id);
CREATE INDEX idx_integrations_provider ON public.integrations(provider);
CREATE INDEX idx_automation_rules_bio_page_id ON public.automation_rules(bio_page_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_link_clicks_link_id ON public.link_clicks(link_id);
CREATE INDEX idx_link_clicks_clicked_at ON public.link_clicks(clicked_at);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bio_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Public profiles can be viewed by anyone (for bio pages)
CREATE POLICY "Anyone can view published profiles" ON public.user_profiles
  FOR SELECT USING (
    id IN (
      SELECT user_id FROM public.bio_pages WHERE is_published = true
    )
  );

-- RLS Policies for bio_pages
CREATE POLICY "Users can manage own bio pages" ON public.bio_pages
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Anyone can view published bio pages" ON public.bio_pages
  FOR SELECT USING (is_published = true);

-- RLS Policies for links
CREATE POLICY "Users can manage own page links" ON public.links
  FOR ALL USING (
    bio_page_id IN (
      SELECT id FROM public.bio_pages WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view published page links" ON public.links
  FOR SELECT USING (
    bio_page_id IN (
      SELECT id FROM public.bio_pages WHERE is_published = true
    ) AND is_active = true
  );

-- RLS Policies for integrations
CREATE POLICY "Users can manage own integrations" ON public.integrations
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for automation_rules
CREATE POLICY "Users can manage own rules" ON public.automation_rules
  FOR ALL USING (
    bio_page_id IN (
      SELECT id FROM public.bio_pages WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own subscription" ON public.subscriptions
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for link_clicks
CREATE POLICY "Users can view own link clicks" ON public.link_clicks
  FOR SELECT USING (
    link_id IN (
      SELECT l.id FROM public.links l
      JOIN public.bio_pages bp ON l.bio_page_id = bp.id
      WHERE bp.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert link clicks" ON public.link_clicks
  FOR INSERT WITH CHECK (true);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bio_pages_updated_at BEFORE UPDATE ON public.bio_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_links_updated_at BEFORE UPDATE ON public.links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON public.automation_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, subdomain)
  VALUES (NEW.id, 'user-' || NEW.id::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get user's subscription status
CREATE OR REPLACE FUNCTION public.get_user_subscription_status(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  subscription_status TEXT;
BEGIN
  SELECT status INTO subscription_status
  FROM public.subscriptions
  WHERE user_id = user_uuid
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN COALESCE(subscription_status, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can create more links
CREATE OR REPLACE FUNCTION public.can_create_more_links(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_plan TEXT;
  current_link_count INTEGER;
BEGIN
  -- Get current plan
  SELECT plan_type INTO current_plan
  FROM public.subscriptions
  WHERE user_id = user_uuid AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If no active subscription, use free plan
  current_plan := COALESCE(current_plan, 'free');
  
  -- Get current link count
  SELECT COUNT(*) INTO current_link_count
  FROM public.links l
  JOIN public.bio_pages bp ON l.bio_page_id = bp.id
  WHERE bp.user_id = user_uuid;
  
  -- Free plan: max 10 links, Pro plan: unlimited
  IF current_plan = 'free' THEN
    RETURN current_link_count < 10;
  ELSE
    RETURN true;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
