import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

import { Switch } from '../../components/ui/switch'
import { 
  Zap, 
  Settings, 
  Eye,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react'

export default function Automation() {
  const [automationEnabled, setAutomationEnabled] = useState(true)
  
  // Mock automation rules - replace with real state management
  const [rules] = useState([
    {
      id: 1,
      name: "Latest Content",
      type: "latest_n",
      config: { count: 5 },
      isActive: true
    },
    {
      id: 2,
      name: "Video Content",
      type: "keyword_filter",
      config: { keywords: ["video", "tutorial"] },
      isActive: true
    }
  ])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Automation</h1>
          <p className="text-muted-foreground">
            Set up rules to automatically manage your bio links
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Rule
        </Button>
      </div>

      {/* Automation Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="mr-2 h-5 w-5" />
            Automation Status
          </CardTitle>
          <CardDescription>
            Enable or disable automatic link management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Automation Engine</p>
              <p className="text-sm text-muted-foreground">
                When enabled, LinkLoom will automatically update your bio links based on your rules
              </p>
            </div>
            <Switch
              checked={automationEnabled}
              onCheckedChange={setAutomationEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Automation Rules */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Automation Rules</h2>
        
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Settings className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    <CardDescription>
                      {rule.type === 'latest_n' 
                        ? `Show latest ${rule.config.count} links`
                        : `Filter by keywords: ${rule.config.keywords?.join(', ')}`
                      }
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Switch checked={rule.isActive} />
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Rule Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Rule</CardTitle>
          <CardDescription>
            Define how your bio links should be automatically managed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rule Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Rule Type</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: 'latest_n', name: 'Latest N Links', description: 'Show the most recent N links' },
                { id: 'date_range', name: 'Date Range', description: 'Show links from a specific time period' },
                { id: 'keyword_filter', name: 'Keyword Filter', description: 'Filter links by keywords' }
              ].map((type) => (
                <button
                  key={type.id}
                  className="p-4 border border-border rounded-lg text-left hover:border-primary transition-colors cursor-pointer"
                >
                  <div className="font-medium text-foreground">{type.name}</div>
                  <div className="text-sm text-muted-foreground">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Rule Configuration */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Rule Name</label>
              <input
                type="text"
                placeholder="e.g., Latest Blog Posts"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Number of Links</label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="20"
                  defaultValue="5"
                  className="flex-1"
                />
                <span className="text-sm font-medium text-foreground w-8">5</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline">Cancel</Button>
            <Button>Create Rule</Button>
          </div>
        </CardContent>
      </Card>

      {/* Automation Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="mr-2 h-5 w-5" />
            Automation Preview
          </CardTitle>
          <CardDescription>
            See how your automation rules will affect your bio page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-6 border border-dashed border-muted-foreground/20">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium text-foreground">Preview Mode</h3>
              <p className="text-muted-foreground">
                Your automation rules will show the latest 5 links from your Trello board
              </p>
              <Button variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Preview
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
