import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Tables, InsertDto, UpdateDto } from '../lib/supabase'

export function useLinks(bioPageId: string) {
  const [links, setLinks] = useState<Tables<'links'>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch links for a specific bio page
  const fetchLinks = async () => {
    if (!bioPageId) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('links')
        .select('*')
        .eq('bio_page_id', bioPageId)
        .order('order_index', { ascending: true })
        .order('is_pinned', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setLinks(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch links')
    } finally {
      setLoading(false)
    }
  }

  // Create a new link
  const createLink = async (linkData: Omit<InsertDto<'links'>, 'bio_page_id'>) => {
    try {
      const { data, error } = await supabase
        .from('links')
        .insert([{ ...linkData, bio_page_id: bioPageId }])
        .select()
        .single()

      if (error) throw error

      setLinks(prev => [...prev, data])
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create link'
      setError(errorMessage)
      return { data: null, error: { message: errorMessage } as any }
    }
  }

  // Update an existing link
  const updateLink = async (id: string, updates: UpdateDto<'links'>) => {
    try {
      const { data, error } = await supabase
        .from('links')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setLinks(prev => prev.map(link => link.id === id ? data : link))
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update link'
      setError(errorMessage)
      return { data: null, error: { message: errorMessage } as any }
    }
  }

  // Delete a link
  const deleteLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id)

      if (error) throw error

      setLinks(prev => prev.filter(link => link.id !== id))
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete link'
      setError(errorMessage)
      return { error: { message: errorMessage } as any }
    }
  }

  // Reorder links
  const reorderLinks = async (linkIds: string[]) => {
    try {
      const updates = linkIds.map((id, index) => ({
        id,
        order_index: index
      }))

      const { error } = await supabase
        .from('links')
        .upsert(updates, { onConflict: 'id' })

      if (error) throw error

      // Update local state with new order
      setLinks(prev => {
        const linkMap = new Map(prev.map(link => [link.id, link]))
        return linkIds.map(id => linkMap.get(id)!).filter(Boolean)
      })

      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reorder links'
      setError(errorMessage)
      return { error: { message: errorMessage } as any }
    }
  }

  // Toggle link pin status
  const togglePin = async (id: string, isPinned: boolean) => {
    return updateLink(id, { is_pinned: isPinned })
  }

  // Toggle link active status
  const toggleActive = async (id: string, isActive: boolean) => {
    return updateLink(id, { is_active: isActive })
  }

  // Set up real-time subscription
  useEffect(() => {
    if (!bioPageId) return

    fetchLinks()

    const subscription = supabase
      .channel('links_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'links',
          filter: `bio_page_id=eq.${bioPageId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLinks(prev => [...prev, payload.new as Tables<'links'>])
          } else if (payload.eventType === 'UPDATE') {
            setLinks(prev => prev.map(link => 
              link.id === payload.new.id ? payload.new as Tables<'links'> : link
            ))
          } else if (payload.eventType === 'DELETE') {
            setLinks(prev => prev.filter(link => link.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [bioPageId])

  return {
    links,
    loading,
    error,
    createLink,
    updateLink,
    deleteLink,
    reorderLinks,
    togglePin,
    toggleActive,
    refetch: fetchLinks
  }
}
