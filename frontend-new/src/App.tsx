import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { HomePage } from '@/pages/HomePage'
import { ReportPage } from '@/pages/ReportPage'
import { StatusPage } from '@/pages/StatusPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ThemeProvider } from '@/components/ThemeProvider'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="urbanpulse-ui-theme">
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/status/:id" element={<StatusPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  )
}

export default App
