import { Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider } from './lib/store.jsx'
import Landing from './pages/Landing.jsx'
import AppShell from './pages/AppShell.jsx'
import Dashboard from './pages/Dashboard.jsx'
import PropertyView from './pages/PropertyView.jsx'
import CalendarView from './pages/CalendarView.jsx'
import TimelineView from './pages/TimelineView.jsx'
import VendorsDirectory from './pages/VendorsDirectory.jsx'
import ReportsView from './pages/ReportsView.jsx'
import TeamView from './pages/TeamView.jsx'
import SettingsView from './pages/SettingsView.jsx'
import Pricing from './pages/Pricing.jsx'

export default function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="property/:id" element={<PropertyView />} />
          <Route path="property/:id/:tab" element={<PropertyView />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="timeline" element={<TimelineView />} />
          <Route path="vendors" element={<VendorsDirectory />} />
          <Route path="reports" element={<ReportsView />} />
          <Route path="team" element={<TeamView />} />
          <Route path="settings" element={<SettingsView />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </StoreProvider>
  )
}
