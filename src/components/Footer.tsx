import { 
  Twitter, 
  Linkedin, 
  Github, 
  Mail,
  Heart,
  ArrowRight
} from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-foreground to-foreground/95 text-foreground/80 py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-hero rounded-2xl flex items-center justify-center mr-4">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <span className="text-2xl font-bold text-foreground">LinkLoom</span>
            </div>
            <p className="text-foreground/70 mb-8 max-w-lg text-lg leading-relaxed">
              Automate your bio links with intelligent Trello integration. 
              Never manually update your social media bio links again.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-12 h-12 bg-foreground/20 rounded-xl flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-foreground/30 transition-all duration-300 cursor-pointer">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-12 h-12 bg-foreground/20 rounded-xl flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-foreground/30 transition-all duration-300 cursor-pointer">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="w-12 h-12 bg-foreground/20 rounded-xl flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-foreground/30 transition-all duration-300 cursor-pointer">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="w-12 h-12 bg-foreground/20 rounded-xl flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-foreground/30 transition-all duration-300 cursor-pointer">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-foreground font-bold text-lg mb-6">Product</h3>
            <ul className="space-y-4">
              <li>
                <a href="#features" className="text-foreground/70 hover:text-foreground transition-colors duration-300 cursor-pointer flex items-center group">
                  Features
                  <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1" />
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-foreground/70 hover:text-foreground transition-colors duration-300 cursor-pointer flex items-center group">
                  How It Works
                  <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1" />
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-foreground/70 hover:text-foreground transition-colors duration-300 cursor-pointer flex items-center group">
                  Pricing
                  <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1" />
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-foreground transition-colors duration-300 cursor-pointer flex items-center group">
                  Integrations
                  <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1" />
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-foreground transition-colors duration-300 cursor-pointer flex items-center group">
                  API
                  <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1" />
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-foreground font-bold text-lg mb-6">Company</h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-foreground/70 hover:text-foreground transition-colors duration-300 cursor-pointer flex items-center group">
                  About
                  <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1" />
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-foreground transition-colors duration-300 cursor-pointer flex items-center group">
                  Blog
                  <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1" />
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-foreground transition-colors duration-300 cursor-pointer flex items-center group">
                  Careers
                  <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1" />
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-foreground transition-colors duration-300 cursor-pointer flex items-center group">
                  Contact
                  <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1" />
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-foreground transition-colors duration-300 cursor-pointer flex items-center group">
                  Press
                  <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-foreground/20 pt-12 mb-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Stay updated with LinkLoom
            </h3>
            <p className="text-foreground/70 mb-6 text-lg">
              Get the latest updates, tips, and insights delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-foreground/20 border border-foreground/30 rounded-xl text-foreground placeholder-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
              />
              <button className="px-6 py-3 bg-gradient-hero text-white rounded-xl font-semibold hover:opacity-90 transition-opacity cursor-pointer">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center text-sm text-foreground/60 mb-4 md:mb-0">
              <span>© 2024 LinkLoom. Made with</span>
              <Heart className="h-4 w-4 mx-1 text-red-500 animate-pulse" />
              <span>for content creators.</span>
            </div>
            <div className="flex space-x-8 text-sm">
              <a href="#" className="text-foreground/60 hover:text-foreground transition-colors duration-300 cursor-pointer">
                Privacy Policy
              </a>
              <a href="#" className="text-foreground/60 hover:text-foreground transition-colors duration-300 cursor-pointer">
                Terms of Service
              </a>
              <a href="#" className="text-foreground/60 hover:text-foreground transition-colors duration-300 cursor-pointer">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
