import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Camera, MapPin, AlertTriangle, BarChart3, Clock, Users, CheckCircle, Sparkles, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { Card } from '@/components/ui/primitives'

const stats = [
  { icon: AlertTriangle, label: 'Issues Reported', value: '1,247' },
  { icon: CheckCircle, label: 'Issues Resolved', value: '892' },
  { icon: Clock, label: 'Avg Response Time', value: '2.3 days' },
  { icon: Users, label: 'Active Citizens', value: '3,456' },
]

const features = [
  {
    icon: Camera,
    title: 'Photo Reporting',
    description: 'Capture and report issues with your phone camera instantly.',
  },
  {
    icon: MapPin,
    title: 'GPS Location',
    description: 'Automatic location detection for precise issue reporting.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track progress and monitor community improvements.',
  },
  {
    icon: AlertTriangle,
    title: 'Real-time Updates',
    description: 'Get notified about the status of your reported issues.',
  },
]

export function HomePage() {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center space-y-10 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/30 dark:bg-white/10 border border-white/50 dark:border-white/20 backdrop-blur-xl text-slate-700 dark:text-white/80 mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Powered by Community</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-800 dark:text-white">
            Improve Your City,{' '}
            <span className="text-gradient-blue">
              One Report at a Time
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-white/70 max-w-3xl mx-auto leading-relaxed">
            Report infrastructure issues, track their progress, and help build a better community.
            Your voice matters in city development.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <Link to="/report">
            <Button size="xl" variant="glass-primary" className="min-w-52 text-base font-semibold">
              <Camera className="mr-2 h-5 w-5" />
              Report an Issue
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="xl" variant="glass" className="min-w-52 text-base">
              <BarChart3 className="mr-2 h-5 w-5" />
              View Dashboard
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
          >
            <GlassCard className="p-8 text-center group">
              <div className="relative z-10">
                <div className="inline-flex p-3 rounded-2xl bg-gradient-to-r from-blue-500/30 to-indigo-500/30 mb-4">
                  <stat.icon className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{stat.value}</div>
                <div className="text-sm text-slate-600 dark:text-white/70">{stat.label}</div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.section>

      {/* Features Section */}
      <section className="space-y-16 py-12">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-4"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-slate-600 dark:text-white/70 max-w-2xl mx-auto"
          >
            Simple steps to make a difference in your community
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-8 text-center h-full group relative overflow-hidden">
                <div className="relative z-10">
                  <div className="inline-flex p-4 rounded-3xl bg-gradient-to-r from-purple-500/30 to-pink-500/30 mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-white">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-white/70 text-sm leading-relaxed">{feature.description}</p>
                </div>
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative py-16"
      >
        <GlassCard className="p-12 text-center relative overflow-hidden" variant="elevated">
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-pink-500/15 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 rounded-2xl" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/40 to-purple-500/40 dark:from-blue-500/30 dark:to-purple-500/30 border border-white/30 dark:border-white/20 mb-6">
              <Zap className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Ready to Transform Your City?</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800 dark:text-white">
              Ready to Make a{' '}
              <span className="text-gradient-purple">Difference?</span>
            </h2>
            <p className="text-xl mb-10 text-slate-600 dark:text-white/80 max-w-2xl mx-auto leading-relaxed">
              Join thousands of citizens improving their communities daily.
              Your voice can shape the future of your city.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/report">
                <Button size="xl" variant="glass-primary" className="min-w-48 font-semibold">
                  <Camera className="mr-2 h-5 w-5" />
                  Get Started Now
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="xl" variant="glass" className="min-w-48">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Explore Data
                </Button>
              </Link>
            </div>
          </div>
        </GlassCard>
      </motion.section>
    </div>
  )
}
