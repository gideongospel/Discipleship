import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { GoogleCalendarProvider } from './context/GoogleCalendarContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { RequireAuth, RequireRole } from './components/layout/ProtectedRoute'
import Layout from './components/layout/Layout'

import Login from './pages/auth/Login'
import Setup from './pages/auth/Setup'
import Dashboard from './pages/Dashboard'
import DiscipleList from './pages/disciples/DiscipleList'
import DiscipleForm from './pages/disciples/DiscipleForm'
import DiscipleProfile from './pages/disciples/DiscipleProfile'
import EvangelismLog from './pages/evangelism/EvangelismLog'
import FollowUpTracker from './pages/followup/FollowUpTracker'
import AttendanceSheet from './pages/attendance/AttendanceSheet'
import Reports from './pages/Reports'
import AdminPanel from './pages/admin/AdminPanel'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <GoogleCalendarProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/setup" element={<Setup />} />

                <Route element={<RequireAuth />}>
                  <Route element={<Layout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/disciples" element={<DiscipleList />} />
                    <Route path="/disciples/new" element={<DiscipleForm />} />
                    <Route path="/disciples/:id" element={<DiscipleProfile />} />
                    <Route path="/disciples/:id/edit" element={<DiscipleForm />} />
                    <Route path="/evangelism" element={<EvangelismLog />} />
                    <Route path="/follow-ups" element={<FollowUpTracker />} />
                    <Route path="/attendance" element={<AttendanceSheet />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings />} />

                    <Route element={<RequireRole roles={['administrator']} />}>
                      <Route path="/admin" element={<AdminPanel />} />
                    </Route>
                  </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </GoogleCalendarProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
