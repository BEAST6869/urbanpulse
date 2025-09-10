import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'blur' | 'minimal' | 'elevated'
  floating?: boolean
  shimmer?: boolean
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', floating = false, shimmer = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base glass styles
          'relative overflow-hidden rounded-2xl',
          'backdrop-blur-xl bg-white/40 dark:bg-white/8 border border-white/60 dark:border-white/12',
          'shadow-glass transition-all duration-300 ease-out',
          
          // Variants
          {
            'backdrop-blur-lg bg-white/30 dark:bg-white/6 shadow-glass-sm': variant === 'minimal',
            'backdrop-blur-2xl bg-white/50 dark:bg-white/10 shadow-glass-lg': variant === 'blur',
            'backdrop-blur-xl bg-white/60 dark:bg-white/12 shadow-glass-lg': variant === 'elevated',
          },
          
          // Interactive states - subtle hover without odd scaling
          'hover:bg-white/50 dark:hover:bg-white/12 hover:shadow-glass-lg',
          
          // Floating animation
          floating && 'animate-float',
          
          className
        )}
        {...props}
      >
        {shimmer && (
          <div className="absolute inset-0 -translate-x-full animate-glass-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        )}
        
        {/* Inner glow effect */}
        <div className="absolute inset-0 rounded-2xl shadow-glass-inset pointer-events-none" />
        
        {props.children}
      </div>
    )
  }
)
GlassCard.displayName = 'GlassCard'

export { GlassCard }
