import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// For development, provide fallback values if env vars aren't set
const isDevelopment = import.meta.env.DEV
const fallbackUrl = 'https://placeholder.supabase.co'
const fallbackKey = 'placeholder-key'

if (!supabaseUrl || !supabaseAnonKey) {
  if (isDevelopment) {
    console.warn('⚠️ Supabase environment variables not set. Using placeholder values for development.')
    console.warn('To enable full functionality, create a .env.local file with your Supabase credentials.')
  } else {
    throw new Error('Missing Supabase environment variables')
  }
}

export const supabase = createClient(
  supabaseUrl || fallbackUrl,
  supabaseAnonKey || fallbackKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// Database types
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          subdomain: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          subdomain: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subdomain?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bio_pages: {
        Row: {
          id: string
          user_id: string
          subdomain: string
          title: string
          description: string | null
          theme: string
          custom_domain: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subdomain: string
          title?: string
          description?: string | null
          theme?: string
          custom_domain?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subdomain?: string
          title?: string
          description?: string | null
          theme?: string
          custom_domain?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      links: {
        Row: {
          id: string
          bio_page_id: string
          title: string
          url: string
          description: string | null
          order_index: number | null
          is_pinned: boolean
          source: string
          external_id: string | null
          is_active: boolean
          click_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bio_page_id: string
          title: string
          url: string
          description?: string | null
          order_index?: number | null
          is_pinned?: boolean
          source: string
          external_id?: string | null
          is_active?: boolean
          click_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bio_page_id?: string
          title?: string
          url?: string
          description?: string | null
          order_index?: number | null
          is_pinned?: boolean
          source?: string
          external_id?: string | null
          is_active?: boolean
          click_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      integrations: {
        Row: {
          id: string
          user_id: string
          provider: string
          access_token: string
          refresh_token: string | null
          board_id: string | null
          list_id: string | null
          is_active: boolean
          last_sync: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: string
          access_token: string
          refresh_token?: string | null
          board_id?: string | null
          list_id?: string | null
          is_active?: boolean
          last_sync?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          access_token?: string
          refresh_token?: string | null
          board_id?: string | null
          list_id?: string | null
          is_active?: boolean
          last_sync?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      automation_rules: {
        Row: {
          id: string
          bio_page_id: string
          rule_type: string
          rule_config: any
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bio_page_id: string
          rule_type: string
          rule_config: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bio_page_id?: string
          rule_type?: string
          rule_config?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan_type: string
          status: string
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan_type: string
          status: string
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan_type?: string
          status?: string
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertDto<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateDto<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
