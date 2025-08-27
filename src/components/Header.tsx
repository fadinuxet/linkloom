import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { useAuth } from '../contexts/AuthContext'
import { Menu, X, User, LogOut, Settings, ChevronDown, AlertTriangle } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  // Check if Supabase is configured
  const isSupabaseConfigured = Boolean(
    (import.meta as any).env?.VITE_SUPABASE_URL && 
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY
  )

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    setIsUserMenuOpen(false)
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen)

  return (
    <>
      {/* Demo Mode Banner */}
      {!isSupabaseConfigured && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-center text-sm text-yellow-800">
            <AlertTriangle className="w-4 h-4 mr-2" />
            <span>
              Running in demo mode. 
              <a 
                href="#setup-supabase" 
                className="underline ml-1 hover:text-yellow-900"
                onClick={(e) => {
                  e.preventDefault()
                  // Scroll to setup instructions or show modal
                  alert('To enable full functionality, follow the setup guide in setup-supabase.md')
                }}
              >
                Set up Supabase
              </a>
            </span>
          </div>
        </div>
      )}

      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-hero rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <span className="text-2xl font-bold text-foreground">LinkLoom</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/#features"
                className="text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
              >
                Features
              </Link>
              <Link
                to="/#how-it-works"
                className="text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
              >
                How it Works
              </Link>
              <Link
                to="/#pricing"
                className="text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
              >
                Pricing
              </Link>
            </nav>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-foreground font-medium">{user.email}</span>
                    <ChevronDown className="w-4 h-4 text-foreground/60" />
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg py-2 z-50">
                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-3 px-4 py-2 text-foreground hover:bg-muted transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/dashboard/settings"
                        className="flex items-center space-x-3 px-4 py-2 text-foreground hover:bg-muted transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      <hr className="border-border my-2" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/auth/signin">
                    <Button variant="ghost" className="text-foreground hover:text-foreground">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth/signup">
                    <Button className="bg-gradient-hero text-white hover:opacity-90 shadow-glow">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-border py-4">
              <nav className="flex flex-col space-y-4">
                <Link
                  to="/#features"
                  className="text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  to="/#how-it-works"
                  className="text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  How it Works
                </Link>
                <Link
                  to="/#pricing"
                  className="text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
                  onClick={() => setIsMenuOpen(false)}
                />
              </nav>

              {/* Mobile CTA Buttons */}
              <div className="mt-6 pt-6 border-t border-border">
                {user ? (
                  <div className="space-y-3">
                    <Link to="/dashboard" className="block">
                      <Button className="w-full bg-gradient-hero text-white hover:opacity-90 shadow-glow">
                        Go to Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link to="/auth/signin" className="block">
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/auth/signup" className="block">
                      <Button className="w-full bg-gradient-hero text-white hover:opacity-90 shadow-glow">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  )
}
