import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Tables, InsertDto, UpdateDto } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useBioPages() {
  const [bioPages, setBioPages] = useState<Tables<'bio_pages'>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Fetch bio pages for the current user
  const fetchBioPages = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('bio_pages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setBioPages(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bio pages')
    } finally {
      setLoading(false)
    }
  }

  // Create a new bio page
  const createBioPage = async (bioPageData: Omit<InsertDto<'bio_pages'>, 'user_id'>) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { data, error } = await supabase
        .from('bio_pages')
        .insert([{ ...bioPageData, user_id: user.id }])
        .select()
        .single()

      if (error) throw error

      setBioPages(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create bio page'
      setError(errorMessage)
      return { data: null, error: { message: errorMessage } as any }
    }
  }

  // Update an existing bio page
  const updateBioPage = async (id: string, updates: UpdateDto<'bio_pages'>) => {
    try {
      const { data, error } = await supabase
        .from('bio_pages')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setBioPages(prev => prev.map(page => page.id === id ? data : page))
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update bio page'
      setError(errorMessage)
      return { data: null, error: { message: errorMessage } as any }
    }
  }

  // Delete a bio page
  const deleteBioPage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bio_pages')
        .delete()
        .eq('id', id)

      if (error) throw error

      setBioPages(prev => prev.filter(page => page.id !== id))
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete bio page'
      setError(errorMessage)
      return { error: { message: errorMessage } as any }
    }
  }

  // Publish/unpublish a bio page
  const togglePublish = async (id: string, isPublished: boolean) => {
    return updateBioPage(id, { is_published: isPublished })
  }

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return

    fetchBioPages()

    const subscription = supabase
      .channel('bio_pages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bio_pages',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBioPages(prev => [payload.new as Tables<'bio_pages'>, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setBioPages(prev => prev.map(page => 
              page.id === payload.new.id ? payload.new as Tables<'bio_pages'> : page
            ))
          } else if (payload.eventType === 'DELETE') {
            setBioPages(prev => prev.filter(page => page.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  return {
    bioPages,
    loading,
    error,
    createBioPage,
    updateBioPage,
    deleteBioPage,
    togglePublish,
    refetch: fetchBioPages
  }
}
