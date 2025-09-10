import { Link, useLocation } from 'react-router-dom'
import { Sun, Moon, Menu, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { GlassNav } from '@/components/ui/glass-nav'
import { cn } from '@/lib/utils'
import { useTheme } from './ThemeProvider'
import Footer from './Footer'

export function Layout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  const NavLink = ({ to, label }: { to: string; label: string }) => (
    <Link
      to={to}
      className={cn(
        'relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ease-out',
        'text-slate-600 hover:text-slate-800 hover:bg-white/20',
        'dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10',
        'backdrop-blur-sm border border-transparent hover:border-white/30 dark:hover:border-white/20',
        'hover:scale-105 active:scale-95',
        location.pathname === to && 'bg-white/30 text-slate-800 border-white/50 shadow-glass-sm dark:bg-white/12 dark:text-white dark:border-white/20'
      )}
      onClick={() => setOpen(false)}
    >
      <span className="relative z-10">{label}</span>
      {location.pathname === to && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-xl dark:from-white/10 dark:to-white/5" />
      )}
    </Link>
  )

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        {/* Light mode - Soft and pleasant */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-200 via-pink-200 to-blue-200 dark:hidden" />
        <div className="absolute inset-0 bg-gradient-to-tl from-teal-200/60 via-transparent to-indigo-200/60 dark:hidden" />
        
        {/* Dark mode - Match screenshot deep navy theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-800 to-slate-700 hidden dark:block" />
        <div className="absolute inset-0 bg-gradient-to-tl from-slate-800/40 via-transparent to-gray-700/30 hidden dark:block" />
        
        {/* Floating orbs for both themes */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-300/30 dark:bg-slate-600/15 rounded-full blur-3xl animate-float" />
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-pink-300/30 dark:bg-gray-600/15 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}} />
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-300/30 dark:bg-slate-500/15 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}} />
        </div>
      </div>

      {/* Glass Navigation */}
      <GlassNav variant="top" blur="heavy">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 rounded-xl bg-white/20 border border-white/40 text-slate-700 dark:bg-white/8 dark:border-white/12 dark:text-white transition-all hover:bg-white/30 dark:hover:bg-white/12 hover:scale-105 active:scale-95"
              onClick={() => setOpen((v) => !v)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-glow">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-700 dark:text-white">
                UrbanPulse
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/" label="Home" />
            <NavLink to="/report" label="Report" />
            <NavLink to="/dashboard" label="Dashboard" />
          </nav>

          <div className="flex items-center gap-3">
            <Button 
              variant="glass" 
              size="icon" 
              onClick={toggleTheme} 
              aria-label="Toggle theme"
              className="hover:scale-110 active:scale-90"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Link to="/report">
              <Button variant="glass-primary" size="lg" className="font-semibold">
                Report an Issue
              </Button>
            </Link>
          </div>
        </div>

        {open && (
          <div className="md:hidden border-t border-white/30 dark:border-white/8 bg-white/20 dark:bg-white/5 backdrop-blur-xl">
            <div className="container mx-auto px-6 py-4 flex flex-col gap-2">
              <NavLink to="/" label="Home" />
              <NavLink to="/report" label="Report" />
              <NavLink to="/dashboard" label="Dashboard" />
            </div>
          </div>
        )}
      </GlassNav>

      {/* Main content with glass container */}
      <main className="relative z-10">
        <div className="container mx-auto px-6 py-12">
          {children}
        </div>
      </main>

      {/* Professional Footer */}
      <Footer />
    </div>
  )
}

