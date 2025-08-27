import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { 
  Link, 
  Settings, 
  Zap, 
  CheckCircle,
  ArrowRight
} from 'lucide-react'

const steps = [
  {
    number: "01",
    icon: Link,
    title: "Connect Calendar",
    description: "Connect your Trello board and select the list containing your content links.",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    number: "02",
    icon: Settings,
    title: "Set Rules",
    description: "Configure automation rules for how your links should be organized and displayed.",
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    number: "03",
    icon: Zap,
    title: "Go Live",
    description: "Publish your bio page and start sharing it with your audience.",
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    number: "04",
    icon: CheckCircle,
    title: "Set & Forget",
    description: "Your bio links automatically update as you add new content to Trello.",
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  }
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6 border border-primary/20">
            How It Works
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Get started in minutes with our simple 4-step process
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Setting up automated bio links has never been easier. Follow these simple steps and you'll be up and running in no time.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mb-20">
          {/* Connection Lines */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 transform -translate-y-1/2 z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => {
              const IconComponent = step.icon
              return (
                <div key={index} className="relative">
                  {/* Step Card */}
                  <Card className="text-center group hover:shadow-card transition-all duration-500 hover:-translate-y-3 cursor-pointer border-0 bg-white/50 backdrop-blur-sm">
                    <CardHeader className="pb-6">
                      <div className="flex flex-col items-center">
                        {/* Step Number */}
                        <div className="w-16 h-16 bg-gradient-hero rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-6 shadow-lg">
                          {step.number}
                        </div>
                        
                        {/* Icon */}
                        <div className={`p-5 rounded-2xl ${step.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className={`h-8 w-8 ${step.color}`} />
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <CardTitle className="text-xl mb-4 text-foreground">
                        {step.title}
                      </CardTitle>
                      <CardDescription className="text-base leading-relaxed text-muted-foreground">
                        {step.description}
                      </CardDescription>
                    </CardContent>
                  </Card>

                  {/* Arrow (except for last step) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                      <div className="w-10 h-10 bg-background border-2 border-primary/20 rounded-full flex items-center justify-center shadow-lg">
                        <ArrowRight className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="bg-gradient-card rounded-3xl p-12 shadow-card border border-border/50 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-foreground mb-6">
              Ready to get started?
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of content creators who've already automated their bio links and are saving hours every week
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-gradient-hero text-white px-10 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity shadow-glow cursor-pointer">
                Start Free Trial
              </button>
              <button className="text-primary hover:text-primary/80 font-semibold text-lg transition-colors cursor-pointer border-2 border-primary/20 px-8 py-4 rounded-xl hover:border-primary/40">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
