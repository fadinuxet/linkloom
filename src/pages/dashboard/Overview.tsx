import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { useProfile } from '../../hooks/useProfile'
import { useBioPages } from '../../hooks/useBioPages'
import { 
  Plus, 
  ExternalLink, 
  Settings, 
  BarChart3, 
  Zap, 
  Globe, 
  Calendar,
  TrendingUp,
  Users,
  MousePointer
} from 'lucide-react'

export default function Overview() {
  const { profile, loading: profileLoading } = useProfile()
  const { bioPages, loading: pagesLoading, createBioPage } = useBioPages()
  const [creatingPage, setCreatingPage] = useState(false)

  const handleCreateBioPage = async () => {
    if (!profile) return

    setCreatingPage(true)
    try {
      const { error } = await createBioPage({
        subdomain: `${profile.subdomain}-bio`,
        title: 'My Bio Page',
        description: 'Welcome to my bio page!',
        theme: 'default',
        is_published: false
      })

      if (error) {
        console.error('Failed to create bio page:', error)
      }
    } catch (err) {
      console.error('Error creating bio page:', err)
    } finally {
      setCreatingPage(false)
    }
  }

  const totalLinks = bioPages.reduce((sum, page) => sum + (page.links?.length || 0), 0)
  const publishedPages = bioPages.filter(page => page.is_published).length
  const totalClicks = bioPages.reduce((sum, page) => sum + (page.total_clicks || 0), 0)

  if (profileLoading || pagesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-hero rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {profile?.display_name || profile?.subdomain}!
        </h1>
        <p className="text-white/80 text-lg">
          Your bio links are working hard to connect your audience with your content.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bio Pages</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bioPages.length}</div>
            <p className="text-xs text-muted-foreground">
              {publishedPages} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Links</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLinks}</div>
            <p className="text-xs text-muted-foreground">
              Across all pages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Automation active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-primary" />
              <span>Create Bio Page</span>
            </CardTitle>
            <CardDescription>
              Start building your bio page with custom links and themes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleCreateBioPage}
              disabled={creatingPage}
              className="w-full"
            >
              {creatingPage ? 'Creating...' : 'Get Started'}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-primary" />
              <span>Connect Trello</span>
            </CardTitle>
            <CardDescription>
              Automatically sync your content calendar with bio links
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/integrations">
              <Button variant="outline" className="w-full">
                Connect Platform
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span>View Analytics</span>
            </CardTitle>
            <CardDescription>
              Track performance and optimize your bio page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/analytics">
              <Button variant="outline" className="w-full">
                View Insights
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest updates and changes to your bio pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bioPages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No bio pages yet</p>
              <p className="mb-4">Create your first bio page to get started</p>
              <Button onClick={handleCreateBioPage} disabled={creatingPage}>
                {creatingPage ? 'Creating...' : 'Create Bio Page'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {bioPages.slice(0, 5).map((page) => (
                <div key={page.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
                      <Globe className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{page.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {page.subdomain}.linkloom.app
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={page.is_published ? 'success' : 'secondary'}>
                      {page.is_published ? 'Published' : 'Draft'}
                    </Badge>
                    <Link to={`/dashboard/bio-page/${page.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Quick Tips</CardTitle>
          <CardDescription>
            Make the most of your LinkLoom experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Pin Important Links</p>
                <p className="text-sm text-muted-foreground">
                  Pin your most important links to the top of your bio page
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Use Automation</p>
                <p className="text-sm text-muted-foreground">
                  Connect Trello to automatically update your links
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Custom Themes</p>
                <p className="text-sm text-muted-foreground">
                  Choose from multiple themes to match your brand
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Track Performance</p>
                <p className="text-sm text-muted-foreground">
                  Monitor clicks and engagement in the Analytics section
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
