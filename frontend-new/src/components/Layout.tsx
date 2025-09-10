import { Link, useLocation } from 'react-router-dom'
import { Sun, Moon, Menu } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTheme } from './ThemeProvider'

export function Layout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  const NavLink = ({ to, label }: { to: string; label: string }) => (
    <Link
      to={to}
      className={cn(
        'px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
        location.pathname === to && 'bg-accent text-accent-foreground'
      )}
      onClick={() => setOpen(false)}
    >
      {label}
    </Link>
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <button className="md:hidden" onClick={() => setOpen((v) => !v)}>
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/" className="text-xl font-bold tracking-tight">UrbanPulse</Link>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" label="Home" />
            <NavLink to="/report" label="Report" />
            <NavLink to="/dashboard" label="Dashboard" />
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Link to="/report">
              <Button variant="gradient" size="lg">Report an Issue</Button>
            </Link>
          </div>
        </div>

        {open && (
          <div className="md:hidden border-t bg-background">
            <div className="container mx-auto px-4 py-2 flex flex-col gap-1">
              <NavLink to="/" label="Home" />
              <NavLink to="/report" label="Report" />
              <NavLink to="/dashboard" label="Dashboard" />
            </div>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Built with ❤️ for the city
      </footer>
    </div>
  )
}

