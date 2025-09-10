import { Link } from 'react-router-dom'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Github,
  Sparkles,
  ExternalLink,
  Shield,
  FileText,
  Users,
  MessageSquare
} from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative z-10 mt-16">
      <div className="backdrop-blur-xl bg-white/20 dark:bg-white/6 border-t border-white/30 dark:border-white/8">
        <div className="container mx-auto px-6 py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            
            {/* Brand Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 shadow-glow">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-800 dark:text-white">
                  UrbanPulse
                </span>
              </div>
              <p className="text-slate-600 dark:text-white/70 text-sm max-w-xs">
                Empowering citizens through collaborative reporting and transparent governance.
              </p>
              <div className="flex space-x-2">
                <a 
                  href="#" 
                  className="p-1.5 rounded-lg bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 text-slate-700 dark:text-white/80 hover:bg-white/30 dark:hover:bg-white/15 hover:scale-105 transition-all duration-200"
                  aria-label="Facebook"
                >
                  <Facebook className="h-3.5 w-3.5" />
                </a>
                <a 
                  href="#" 
                  className="p-1.5 rounded-lg bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 text-slate-700 dark:text-white/80 hover:bg-white/30 dark:hover:bg-white/15 hover:scale-105 transition-all duration-200"
                  aria-label="Twitter"
                >
                  <Twitter className="h-3.5 w-3.5" />
                </a>
                <a 
                  href="#" 
                  className="p-1.5 rounded-lg bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 text-slate-700 dark:text-white/80 hover:bg-white/30 dark:hover:bg-white/15 hover:scale-105 transition-all duration-200"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-3.5 w-3.5" />
                </a>
                <a 
                  href="#" 
                  className="p-1.5 rounded-lg bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 text-slate-700 dark:text-white/80 hover:bg-white/30 dark:hover:bg-white/15 hover:scale-105 transition-all duration-200"
                  aria-label="GitHub"
                >
                  <Github className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Quick Links & Legal Combined */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-slate-800 dark:text-white">
                Quick Links
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <Link 
                  to="/" 
                  className="text-slate-600 dark:text-white/70 hover:text-slate-800 dark:hover:text-white transition-colors duration-200 text-sm"
                >
                  Home
                </Link>
                <Link 
                  to="/report" 
                  className="text-slate-600 dark:text-white/70 hover:text-slate-800 dark:hover:text-white transition-colors duration-200 text-sm"
                >
                  Report Issues
                </Link>
                <Link 
                  to="/dashboard" 
                  className="text-slate-600 dark:text-white/70 hover:text-slate-800 dark:hover:text-white transition-colors duration-200 text-sm"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/about" 
                  className="text-slate-600 dark:text-white/70 hover:text-slate-800 dark:hover:text-white transition-colors duration-200 text-sm"
                >
                  About
                </Link>
                <Link 
                  to="/privacy" 
                  className="text-slate-600 dark:text-white/70 hover:text-slate-800 dark:hover:text-white transition-colors duration-200 text-sm"
                >
                  Privacy
                </Link>
                <Link 
                  to="/contact" 
                  className="text-slate-600 dark:text-white/70 hover:text-slate-800 dark:hover:text-white transition-colors duration-200 text-sm"
                >
                  Contact
                </Link>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-slate-800 dark:text-white">
                Contact
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-600 dark:text-white/70 flex-shrink-0" />
                  <a 
                    href="tel:+15551234567" 
                    className="text-slate-600 dark:text-white/70 hover:text-slate-800 dark:hover:text-white transition-colors duration-200 text-sm"
                  >
                    (555) 123-4567
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-600 dark:text-white/70 flex-shrink-0" />
                  <a 
                    href="mailto:support@urbanpulse.gov" 
                    className="text-slate-600 dark:text-white/70 hover:text-slate-800 dark:hover:text-white transition-colors duration-200 text-sm"
                  >
                    support@urbanpulse.gov
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-600 dark:text-white/70 mt-0.5 flex-shrink-0" />
                  <div className="text-slate-600 dark:text-white/70 text-sm">
                    <div>City Hall</div>
                    <div>123 Government St</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-white/20 dark:border-white/10 pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-slate-600 dark:text-white/70 text-xs text-center sm:text-left">
                <p>
                  © {currentYear} UrbanPulse. Built for our community.
                </p>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-white/70">
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  Online
                </span>
                <Link 
                  to="/status" 
                  className="hover:text-slate-800 dark:hover:text-white transition-colors duration-200"
                >
                  Status
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
