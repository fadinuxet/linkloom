import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Switch } from '../../components/ui/switch'
import { useBioPages } from '../../hooks/useBioPages'
import { useLinks } from '../../hooks/useLinks'
import { 
  Plus, 
  ExternalLink, 
  Eye, 
  Copy, 
  Globe,
  Link as LinkIcon,
  Trash2,
  Pin,
  Edit3,
  Save,
  X
} from 'lucide-react'

interface LinkFormData {
  title: string
  url: string
  description: string
  isPinned: boolean
}

export default function BioPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { bioPages, updateBioPage } = useBioPages()
  const { links, createLink, updateLink, deleteLink, togglePin, toggleActive } = useLinks(id || '')
  
  const [editing, setEditing] = useState(false)
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [linkForm, setLinkForm] = useState<LinkFormData>({
    title: '',
    url: '',
    description: '',
    isPinned: false
  })
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null)

  const bioPage = bioPages.find(page => page.id === id)

  useEffect(() => {
    if (!bioPage && bioPages.length > 0) {
      // Redirect to first bio page if none specified
      navigate(`/dashboard/bio-page/${bioPages[0].id}`)
    }
  }, [bioPage, bioPages, navigate])

  if (!bioPage) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const handleSaveBioPage = async () => {
    if (!bioPage) return

    try {
      const { error } = await updateBioPage(bioPage.id, {
        title: bioPage.title,
        description: bioPage.description,
        theme: bioPage.theme
      })

      if (error) {
        console.error('Failed to update bio page:', error)
      } else {
        setEditing(false)
      }
    } catch (err) {
      console.error('Error updating bio page:', err)
    }
  }

  const handleTogglePublish = async () => {
    if (!bioPage) return

    try {
      await updateBioPage(bioPage.id, { is_published: !bioPage.is_published })
    } catch (err) {
      console.error('Error toggling publish:', err)
    }
  }

  const handleCreateLink = async () => {
    if (!linkForm.title || !linkForm.url) return

    try {
      const { error } = await createLink({
        title: linkForm.title,
        url: linkForm.url,
        description: linkForm.description || null,
        is_pinned: linkForm.isPinned,
        source: 'manual',
        is_active: true,
        click_count: 0
      })

      if (error) {
        console.error('Failed to create link:', error)
      } else {
        setShowLinkForm(false)
        setLinkForm({ title: '', url: '', description: '', isPinned: false })
      }
    } catch (err) {
      console.error('Error creating link:', err)
    }
  }

  const handleUpdateLink = async () => {
    if (!editingLinkId || !linkForm.title || !linkForm.url) return

    try {
      const { error } = await updateLink(editingLinkId, {
        title: linkForm.title,
        url: linkForm.url,
        description: linkForm.description || null,
        is_pinned: linkForm.isPinned
      })

      if (error) {
        console.error('Failed to update link:', error)
      } else {
        setEditingLinkId(null)
        setShowLinkForm(false)
        setLinkForm({ title: '', url: '', description: '', isPinned: false })
      }
    } catch (err) {
      console.error('Error updating link:', err)
    }
  }

  const handleEditLink = (link: any) => {
    setEditingLinkId(link.id)
    setLinkForm({
      title: link.title,
      url: link.url,
      description: link.description || '',
      isPinned: link.is_pinned
    })
    setShowLinkForm(true)
  }

  const handleDeleteLink = async (linkId: string) => {
    if (confirm('Are you sure you want to delete this link?')) {
      try {
        await deleteLink(linkId)
      } catch (err) {
        console.error('Error deleting link:', err)
      }
    }
  }

  const handleToggleLinkPin = async (linkId: string, isPinned: boolean) => {
    try {
      await togglePin(linkId, !isPinned)
    } catch (err) {
      console.error('Error toggling pin:', err)
    }
  }

  const handleToggleLinkActive = async (linkId: string, isActive: boolean) => {
    try {
      await toggleActive(linkId, !isActive)
    } catch (err) {
      console.error('Error toggling active:', err)
    }
  }

  const copyBioPageUrl = () => {
    const url = `${window.location.origin}/${bioPage.subdomain}`
    navigator.clipboard.writeText(url)
    // You could add a toast notification here
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bio Page</h1>
          <p className="text-muted-foreground">
            Customize your bio page and manage your links
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={copyBioPageUrl}>
            <Copy className="h-4 w-4 mr-2" />
            Copy URL
          </Button>
          <Button variant="outline" onClick={() => window.open(`/${bioPage.subdomain}`, '_blank')}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={() => setEditing(!editing)}>
            {editing ? <X className="h-4 w-4 mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
            {editing ? 'Cancel' : 'Edit'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bio Page Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Page Settings</CardTitle>
            <CardDescription>
              Configure your bio page appearance and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Page Title</label>
              {editing ? (
                <input
                  type="text"
                  value={bioPage.title}
                  onChange={(e) => updateBioPage(bioPage.id, { title: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              ) : (
                <p className="mt-1 text-foreground">{bioPage.title}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              {editing ? (
                <textarea
                  value={bioPage.description || ''}
                  onChange={(e) => updateBioPage(bioPage.id, { description: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  rows={3}
                />
              ) : (
                <p className="mt-1 text-muted-foreground">{bioPage.description || 'No description'}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Subdomain</label>
              <div className="flex items-center mt-1">
                <span className="text-foreground">{bioPage.subdomain}</span>
                <span className="text-muted-foreground ml-1">.linkloom.app</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Theme</label>
              {editing ? (
                <select
                  value={bioPage.theme}
                  onChange={(e) => updateBioPage(bioPage.id, { theme: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="default">Default</option>
                  <option value="minimal">Minimal</option>
                  <option value="dark">Dark</option>
                  <option value="colorful">Colorful</option>
                </select>
              ) : (
                <Badge variant="outline" className="mt-1">{bioPage.theme}</Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Published</label>
                <p className="text-xs text-muted-foreground">
                  Make your bio page visible to the public
                </p>
              </div>
              <Switch
                checked={bioPage.is_published}
                onCheckedChange={handleTogglePublish}
              />
            </div>

            {editing && (
              <Button onClick={handleSaveBioPage} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Live Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>
              See how your bio page will look to visitors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-6 min-h-[400px] flex flex-col items-center justify-center">
              <Globe className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{bioPage.title}</h3>
              {bioPage.description && (
                <p className="text-muted-foreground text-center mb-4">{bioPage.description}</p>
              )}
              <div className="space-y-2 w-full max-w-xs">
                {links.slice(0, 3).map((link) => (
                  <div key={link.id} className="bg-background rounded-lg p-3 border">
                    <div className="flex items-center space-x-2">
                      {link.is_pinned && <Pin className="h-3 w-3 text-primary" />}
                      <span className="font-medium text-sm">{link.title}</span>
                    </div>
                  </div>
                ))}
                {links.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center">No links yet</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Links Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Links</CardTitle>
              <CardDescription>
                Manage the links that appear on your bio page
              </CardDescription>
            </div>
            <Button onClick={() => setShowLinkForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <LinkIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No links yet</p>
              <p className="mb-4">Add your first link to get started</p>
              <Button onClick={() => setShowLinkForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {links.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
                      <ExternalLink className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{link.title}</span>
                        {link.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                        <Badge variant={link.is_active ? 'success' : 'secondary'}>
                          {link.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{link.url}</p>
                      {link.description && (
                        <p className="text-xs text-muted-foreground mt-1">{link.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditLink(link)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleLinkPin(link.id, link.is_pinned)}
                    >
                      <Pin className={`h-4 w-4 ${link.is_pinned ? 'text-primary' : ''}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleLinkActive(link.id, link.is_active)}
                    >
                      <Eye className={`h-4 w-4 ${link.is_active ? 'text-green-600' : ''}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteLink(link.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Link Modal */}
      {showLinkForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingLinkId ? 'Edit Link' : 'Add New Link'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <input
                  type="text"
                  value={linkForm.title}
                  onChange={(e) => setLinkForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="Link title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">URL</label>
                <input
                  type="url"
                  value={linkForm.url}
                  onChange={(e) => setLinkForm(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description (Optional)</label>
                <textarea
                  value={linkForm.description}
                  onChange={(e) => setLinkForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="Brief description of the link"
                  rows={2}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={linkForm.isPinned}
                  onCheckedChange={(checked) => setLinkForm(prev => ({ ...prev, isPinned: checked }))}
                />
                <label className="text-sm font-medium">Pin to top</label>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowLinkForm(false)}>
                Cancel
              </Button>
              <Button onClick={editingLinkId ? handleUpdateLink : handleCreateLink}>
                {editingLinkId ? 'Update' : 'Create'} Link
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
