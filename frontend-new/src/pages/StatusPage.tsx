import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Calendar,
  User,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, PageHeader, Loading } from '@/components/ui/primitives'
import { formatDate, formatTimeAgo } from '@/lib/utils'

interface ReportData {
  id: string
  category: string
  description: string
  status: 'submitted' | 'in-progress' | 'resolved' | 'rejected'
  location: { latitude: number; longitude: number }
  submittedAt: Date
  updatedAt: Date
  assignedTo?: string
  imageUrl: string
  timeline: Array<{
    id: string
    status: string
    message: string
    timestamp: Date
    user?: string
  }>
}

const statusColors = {
  submitted: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  'in-progress': 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
  resolved: 'text-green-600 bg-green-100 dark:bg-green-900/20',
  rejected: 'text-red-600 bg-red-100 dark:bg-red-900/20',
}

const statusIcons = {
  submitted: Clock,
  'in-progress': AlertCircle,
  resolved: CheckCircle2,
  rejected: AlertCircle,
}

export function StatusPage() {
  const { id } = useParams()
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call to fetch report data
    const fetchReport = async () => {
      setLoading(true)
      
      // Mock data generation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockReport: ReportData = {
        id: id || 'ABC123',
        category: 'Pothole',
        description: 'Large pothole on Main Street causing difficulty for vehicles. Water accumulates during rain making it hazardous.',
        status: 'in-progress',
        location: { latitude: 40.7128, longitude: -74.0060 },
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        assignedTo: 'City Maintenance Team',
        imageUrl: 'https://images.unsplash.com/photo-1519452894617-dd1bb41b8ceb?w=400&h=300&fit=crop',
        timeline: [
          {
            id: '1',
            status: 'submitted',
            message: 'Report submitted by citizen',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            id: '2', 
            status: 'reviewed',
            message: 'Report reviewed and validated',
            timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
            user: 'City Inspector'
          },
          {
            id: '3',
            status: 'assigned',
            message: 'Assigned to City Maintenance Team',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
            user: 'System'
          },
          {
            id: '4',
            status: 'in-progress',
            message: 'Work crew dispatched to location',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
            user: 'Maintenance Supervisor'
          },
        ]
      }
      
      setReport(mockReport)
      setLoading(false)
    }

    fetchReport()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <PageHeader title="Loading Report..." />
        <div className="flex justify-center py-12">
          <Loading label="Fetching report details..." />
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto">
        <PageHeader title="Report Not Found" />
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">The report you're looking for doesn't exist.</p>
        </Card>
      </div>
    )
  }

  const StatusIcon = statusIcons[report.status]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader 
        title={`Report ${report.id}`}
        subtitle={`Track the progress of your ${report.category.toLowerCase()} report`}
      />

      {/* Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusColors[report.status]}`}>
              <StatusIcon className="h-4 w-4" />
              {report.status.replace('-', ' ').toUpperCase()}
            </div>
            <span className="text-sm text-muted-foreground">
              Last updated {formatTimeAgo(report.updatedAt)}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{report.category}</h3>
                <p className="text-muted-foreground">{report.description}</p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Submitted {formatDate(report.submittedAt)}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {report.location.latitude.toFixed(4)}, {report.location.longitude.toFixed(4)}
                </div>
                {report.assignedTo && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {report.assignedTo}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <img
                src={report.imageUrl}
                alt="Report image"
                className="w-full max-w-48 h-32 object-cover rounded-lg border"
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Status Timeline
          </h3>

          <div className="space-y-4">
            {report.timeline.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start gap-4 pb-4 last:pb-0"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                </div>
                
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm">{item.message}</p>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                      {formatTimeAgo(item.timestamp)}
                    </span>
                  </div>
                  {item.user && (
                    <p className="text-xs text-muted-foreground">by {item.user}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
            <div>
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground">
                Have questions about this report? Contact our support team.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => window.open(`https://maps.google.com/?q=${report.location.latitude},${report.location.longitude}`, '_blank')}
              >
                <MapPin className="mr-2 h-4 w-4" />
                View Location
              </Button>
              <Button variant="gradient">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
