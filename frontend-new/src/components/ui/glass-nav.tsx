import React from 'react'
import { cn } from '@/lib/utils'

export interface GlassNavProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'top' | 'floating' | 'sidebar'
  blur?: 'light' | 'medium' | 'heavy'
}

const GlassNav: React.FC<GlassNavProps> = ({ 
  className, 
  variant = 'top', 
  blur = 'medium',
  children,
  ...props 
}) => {
  return (
    <nav
      className={cn(
        // Base glass nav styles
        'relative z-50 border border-white/20',
        'transition-all duration-300 ease-out',
        
        // Blur variants
        {
          'backdrop-blur-sm bg-white/10': blur === 'light',
          'backdrop-blur-xl bg-white/15': blur === 'medium',
          'backdrop-blur-2xl bg-white/20': blur === 'heavy',
        },
        
        // Layout variants
        {
          // Top navigation
          'sticky top-0 w-full shadow-glass-sm border-b border-white/20': variant === 'top',
          
          // Floating navigation
          'fixed top-4 left-1/2 -translate-x-1/2 rounded-2xl shadow-glass-lg border-white/30 px-6 py-3': variant === 'floating',
          
          // Sidebar navigation
          'fixed left-0 top-0 h-full w-64 shadow-glass-lg border-r border-white/30': variant === 'sidebar',
        },
        
        className
      )}
      {...props}
    >
      {/* Background overlay for better glass effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-inherit pointer-events-none" />
      
      {/* Inner glow */}
      <div className="absolute inset-0 shadow-glass-inset rounded-inherit pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </nav>
  )
}

export { GlassNav }
