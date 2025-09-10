import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'gradient'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  glow?: boolean
  shimmer?: boolean
}

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = 'default', size = 'md', glow = false, shimmer = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base button styles
          'relative overflow-hidden font-medium transition-all duration-200 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
          
          // Glass base
          'backdrop-blur-xl border',
          
          // Sizes
          {
            'px-3 py-1.5 text-xs rounded-lg': size === 'sm',
            'px-4 py-2 text-sm rounded-xl': size === 'md',
            'px-6 py-3 text-base rounded-xl': size === 'lg',
            'px-8 py-4 text-lg rounded-2xl': size === 'xl',
          },
          
          // Variants
          {
            // Default glass
            'bg-white/20 border-white/30 text-white shadow-glass hover:bg-white/25 hover:shadow-glass-lg': variant === 'default',
            
            // Primary with Apple blue gradient
            'bg-gradient-to-r from-apple-blue to-apple-indigo text-white border-apple-blue/30 shadow-glow hover:shadow-glow-lg': variant === 'primary',
            
            // Secondary with purple gradient
            'bg-gradient-to-r from-apple-purple to-apple-pink text-white border-apple-purple/30 shadow-glow hover:shadow-glow-lg': variant === 'secondary',
            
            // Ghost variant
            'bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white/40': variant === 'ghost',
            
            // Gradient variant
            'bg-gradient-to-r from-apple-cyan to-apple-blue text-white border-transparent shadow-glow hover:shadow-glow-lg': variant === 'gradient',
          },
          
          // Interactive states
          'hover:scale-105 active:scale-95',
          'transform-gpu will-change-transform',
          
          // Glow effect
          glow && 'animate-pulse-glow',
          
          className
        )}
        {...props}
      >
        {shimmer && (
          <div className="absolute inset-0 -translate-x-full animate-glass-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}
        
        {/* Inner highlight */}
        <div className="absolute inset-0 rounded-inherit bg-gradient-to-t from-transparent to-white/10 pointer-events-none" />
        
        {props.children}
      </button>
    )
  }
)
GlassButton.displayName = 'GlassButton'

export { GlassButton }
