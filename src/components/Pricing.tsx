import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Check, X, Star } from 'lucide-react'

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with automated bio links",
    features: [
      "Up to 10 links",
      "Trello integration",
      "Basic automation rules",
      "Standard bio page",
      "Community support"
    ],
    notIncluded: [
      "Custom domains",
      "Advanced analytics",
      "Priority support",
      "Bulk link import"
    ],
    cta: "Get Started Free",
    popular: false
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    description: "Everything you need for professional content creators",
    features: [
      "Unlimited links",
      "Trello integration",
      "Advanced automation rules",
      "Custom bio pages",
      "Custom domains",
      "Analytics & insights",
      "Priority support",
      "Bulk link import",
      "API access"
    ],
    notIncluded: [],
    cta: "Start Pro Trial",
    popular: true
  }
]

const features = [
  "Up to 10 links",
  "Unlimited links",
  "Trello integration",
  "Basic automation rules",
  "Advanced automation rules",
  "Standard bio page",
  "Custom bio pages",
  "Custom domains",
  "Analytics & insights",
  "Community support",
  "Priority support",
  "Bulk link import",
  "API access"
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6 border border-primary/20">
            Pricing
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Start free and upgrade when you need more features. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-20">
          {plans.map((plan, index) => (
            <div key={index} className="relative">
              <div className={`relative bg-white/50 backdrop-blur-sm rounded-3xl border-2 p-10 shadow-card transition-all duration-500 hover:shadow-glow ${
                plan.popular ? 'border-primary scale-105' : 'border-border hover:scale-105'
              }`}>
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge variant="default" className="px-6 py-3 text-sm font-semibold shadow-lg">
                      <Star className="w-4 h-4 mr-2" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-10">
                  <h3 className="text-3xl font-bold text-foreground mb-4">
                    {plan.name}
                  </h3>
                  <div className="mb-6">
                    <span className="text-6xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-xl text-muted-foreground ml-2">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-10">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center">
                      <X className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button 
                  variant={plan.popular ? "hero" : "outline"} 
                  size="lg" 
                  className="w-full h-14 text-lg font-semibold"
                >
                  {plan.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-5xl mx-auto mb-20">
          <h3 className="text-3xl font-bold text-foreground text-center mb-10">
            Feature Comparison
          </h3>
          <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-border overflow-hidden shadow-card">
            <div className="grid grid-cols-3 gap-px bg-border">
              <div className="bg-background p-6 font-semibold text-foreground">
                Feature
              </div>
              <div className="bg-background p-6 font-semibold text-foreground text-center">
                Free
              </div>
              <div className="bg-background p-6 font-semibold text-foreground text-center">
                Pro
              </div>
            </div>
            
            {features.map((feature, index) => (
              <div key={index} className="grid grid-cols-3 gap-px bg-border">
                <div className="bg-background p-6 text-foreground">
                  {feature}
                </div>
                <div className="bg-background p-6 text-center">
                  {index < 5 ? (
                    <Check className="h-5 w-5 text-green-600 mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground mx-auto" />
                  )}
                </div>
                <div className="bg-background p-6 text-center">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="bg-gradient-card rounded-3xl p-12 shadow-card border border-border/50 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-foreground mb-6">
              All plans include a 14-day free trial
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              No credit card required. Start automating your bio links today and see the difference it makes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button variant="hero" size="lg" className="px-10 py-4 h-14 text-lg font-semibold">
                Start Free Trial
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-4 h-14 text-lg font-semibold border-2">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
