import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Camera, MapPin, AlertTriangle, BarChart3, Clock, Users, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
      <section className="text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Improve Your City,{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              One Report at a Time
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Report infrastructure issues, track their progress, and help build a better community.
            Your voice matters in city development.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/report">
            <Button size="xl" variant="gradient" className="min-w-48">
              <Camera className="mr-2 h-5 w-5" />
              Report an Issue
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="xl" variant="outline" className="min-w-48">
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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
          >
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          </motion.div>
        ))}
      </motion.section>

      {/* Features Section */}
      <section className="space-y-12">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground mt-4"
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
              <Card className="p-6 text-center h-full hover:shadow-lg transition-shadow">
                <feature.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center text-white"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Make a Difference?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of citizens improving their communities daily.
        </p>
        <Link to="/report">
          <Button size="xl" variant="secondary" className="min-w-48">
            Get Started Now
          </Button>
        </Link>
      </motion.section>
    </div>
  )
}
