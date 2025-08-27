import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import Overview from './dashboard/Overview'
import Integrations from './dashboard/Integrations'
import BioPage from './dashboard/BioPage'
import Automation from './dashboard/Automation'
import Analytics from './dashboard/Analytics'
import Settings from './dashboard/Settings'

export default function Dashboard() {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<Overview />} />
        <Route path="integrations" element={<Integrations />} />
        <Route path="bio-page" element={<Navigate to="/dashboard" replace />} />
        <Route path="bio-page/:id" element={<BioPage />} />
        <Route path="automation" element={<Automation />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Routes>
    </DashboardLayout>
  )
}
