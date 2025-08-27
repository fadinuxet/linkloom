import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Tables, UpdateDto } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useProfile() {
  const [profile, setProfile] = useState<Tables<'user_profiles'> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Fetch user profile
  const fetchProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchError) {
        throw fetchError
      }

      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  // Update user profile
  const updateProfile = async (updates: UpdateDto<'user_profiles'>) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
      setError(errorMessage)
      return { data: null, error: { message: errorMessage } as any }
    }
  }

  // Check if subdomain is available
  const checkSubdomainAvailability = async (subdomain: string) => {
    if (!subdomain) return false

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('subdomain', subdomain)
        .neq('id', user?.id || '')
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      // If data exists, subdomain is taken
      return !data
    } catch (err) {
      console.error('Error checking subdomain:', err)
      return false
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return

    fetchProfile()

    const subscription = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setProfile(payload.new as Tables<'user_profiles'>)
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  return {
    profile,
    loading,
    error,
    updateProfile,
    checkSubdomainAvailability,
    refetch: fetchProfile
  }
}
