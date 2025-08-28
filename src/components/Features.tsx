import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { 
  RefreshCw, 
  Globe, 
  BarChart3,
  Trello,
  Settings,
  Smartphone
} from 'lucide-react'

const features = [
  {
    icon: Trello,
    title: "Trello Integration",
    description: "Connect your Trello boards and lists to automatically sync content links.",
    badge: "MVP Ready",
    badgeVariant: "success" as const,
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    icon: Settings,
    title: "Smart Rules Engine",
    description: "Set automated rules for how your links should be organized and displayed.",
    badge: "Automated",
    badgeVariant: "default" as const,
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    icon: Smartphone,
    title: "Custom Bio Pages",
    description: "Create beautiful, responsive bio pages that match your brand perfectly.",
    badge: "Responsive",
    badgeVariant: "secondary" as const,
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    icon: RefreshCw,
    title: "Real-time Sync",
    description: "Your bio links update instantly when your content calendar changes.",
    badge: "Instant",
    badgeVariant: "default" as const,
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  },
  {
    icon: Globe,
    title: "Custom Domains",
    description: "Use your own domain for a professional, branded experience.",
    badge: "Pro Feature",
    badgeVariant: "warning" as const,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50"
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description: "Track link performance and understand your audience better.",
    badge: "Coming Soon",
    badgeVariant: "outline" as const,
    color: "text-pink-600",
    bgColor: "bg-pink-50"
  }
]

export default function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6 border border-primary/20">
            Features
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Everything you need to automate your bio links
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Powerful features that work together to keep your bio links always up-to-date and engaging
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Card 
                key={index} 
                className="group hover:shadow-card transition-all duration-500 hover:-translate-y-2 cursor-pointer border-0 bg-white/50 backdrop-blur-sm"
              >
                <CardHeader className="pb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-4 rounded-2xl ${feature.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`h-8 w-8 ${feature.color}`} />
                    </div>
                    <Badge variant={feature.badgeVariant} className="text-xs px-3 py-1">
                      {feature.badge}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <CardTitle className="text-xl mb-4 group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="bg-gradient-card rounded-3xl p-12 shadow-card border border-border/50 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-foreground mb-6">
              Ready to automate your bio links?
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of content creators who've already automated their bio links and saved hours every week
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-gradient-hero text-white px-10 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity shadow-glow cursor-pointer">
                Start Free Trial
              </button>
              <button className="text-primary hover:text-primary/80 font-semibold text-lg transition-colors cursor-pointer border-2 border-primary/20 px-8 py-4 rounded-xl hover:border-primary/40">
                View All Features →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
