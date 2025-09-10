import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  CheckCircle2,
  Clock,
  MapPin,
  Download,
  Eye
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, PageHeader, Loading } from '@/components/ui/primitives'
import { formatTimeAgo } from '@/lib/utils'

interface DashboardData {
  stats: {
    totalReports: number
    resolvedReports: number
    inProgressReports: number
    avgResolutionTime: number
    activeUsers: number
    trendsUp: boolean
  }
  categoryData: Array<{ category: string; count: number; resolved: number }>
  timelineData: Array<{ date: string; reports: number; resolved: number }>
  recentReports: Array<{
    id: string
    category: string
    description: string
    status: 'submitted' | 'in-progress' | 'resolved' | 'rejected'
    submittedAt: Date
    location: string
  }>
  regionData: Array<{ name: string; value: number; color: string }>
}

const statusColors = {
  submitted: 'text-blue-600',
  'in-progress': 'text-orange-600',
  resolved: 'text-green-600',
  rejected: 'text-red-600',
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    // Simulate API call to fetch dashboard data
    const fetchData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1500))

      const mockData: DashboardData = {
        stats: {
          totalReports: 1247,
          resolvedReports: 892,
          inProgressReports: 245,
          avgResolutionTime: 2.3,
          activeUsers: 3456,
          trendsUp: true
        },
        categoryData: [
          { category: 'Potholes', count: 342, resolved: 298 },
          { category: 'Streetlights', count: 218, resolved: 165 },
          { category: 'Sidewalks', count: 189, resolved: 144 },
          { category: 'Graffiti', count: 156, resolved: 142 },
          { category: 'Drainage', count: 134, resolved: 89 },
          { category: 'Traffic Signs', count: 98, resolved: 54 },
          { category: 'Other', count: 110, resolved: 78 }
        ],
        timelineData: [
          { date: '2024-01-01', reports: 45, resolved: 32 },
          { date: '2024-01-02', reports: 52, resolved: 38 },
          { date: '2024-01-03', reports: 38, resolved: 45 },
          { date: '2024-01-04', reports: 61, resolved: 42 },
          { date: '2024-01-05', reports: 44, resolved: 56 },
          { date: '2024-01-06', reports: 58, resolved: 48 },
          { date: '2024-01-07', reports: 47, resolved: 51 }
        ],
        recentReports: [
          {
            id: 'RPT001',
            category: 'Pothole',
            description: 'Large pothole causing traffic issues on Main Street',
            status: 'in-progress',
            submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            location: 'Main St & 5th Ave'
          },
          {
            id: 'RPT002',
            category: 'Streetlight',
            description: 'Broken streetlight in park area',
            status: 'submitted',
            submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
            location: 'Central Park'
          },
          {
            id: 'RPT003',
            category: 'Graffiti',
            description: 'Vandalism on public building wall',
            status: 'resolved',
            submittedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
            location: 'City Hall'
          },
          {
            id: 'RPT004',
            category: 'Drainage',
            description: 'Blocked storm drain causing flooding',
            status: 'in-progress',
            submittedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
            location: 'Oak Street'
          }
        ],
        regionData: [
          { name: 'Downtown', value: 35, color: COLORS[0] },
          { name: 'North Side', value: 28, color: COLORS[1] },
          { name: 'South Side', value: 20, color: COLORS[2] },
          { name: 'East District', value: 12, color: COLORS[3] },
          { name: 'West District', value: 5, color: COLORS[4] }
        ]
      }

      setData(mockData)
      setLoading(false)
    }

    fetchData()
  }, [timeRange])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <PageHeader title="Loading Dashboard..." />
        <div className="flex justify-center py-12">
          <Loading label="Fetching analytics data..." />
        </div>
      </div>
    )
  }

  if (!data) return null

  const resolutionRate = Math.round((data.stats.resolvedReports / data.stats.totalReports) * 100)

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <PageHeader 
            title="Analytics Dashboard" 
            subtitle="Monitor city infrastructure reports and resolution progress" 
          />
          
          <div className="flex items-center gap-3">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background text-foreground"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
            </select>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Key Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Reports</p>
              <p className="text-2xl font-bold">{data.stats.totalReports.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Resolution Rate</p>
              <p className="text-2xl font-bold">{resolutionRate}%</p>
              <div className="flex items-center gap-1 mt-1">
                {data.stats.trendsUp ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-xs ${data.stats.trendsUp ? 'text-green-600' : 'text-red-600'}`}>
                  +5.2% from last month
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Resolution Time</p>
              <p className="text-2xl font-bold">{data.stats.avgResolutionTime} days</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold">{data.stats.activeUsers.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Reports by Category</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" name="Total" />
                  <Bar dataKey="resolved" fill="#10B981" name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Timeline Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Reports Timeline</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="reports" stroke="#3B82F6" name="New Reports" />
                  <Line type="monotone" dataKey="resolved" stroke="#10B981" name="Resolved" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Regional Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Regional Distribution</h3>
            <div className="h-80 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.regionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.regionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="ml-4 space-y-2">
                {data.regionData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm">{entry.name}</span>
                    <span className="text-sm text-muted-foreground">({entry.value}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Recent Reports */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Recent Reports</h3>
              <Button variant="ghost" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {data.recentReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm bg-secondary px-2 py-1 rounded">
                        {report.id}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[report.status]}`}>
                        {report.status.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(report.submittedAt)}
                    </span>
                  </div>
                  <p className="font-medium text-sm mb-1">{report.category}</p>
                  <p className="text-xs text-muted-foreground mb-2">{report.description}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {report.location}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
