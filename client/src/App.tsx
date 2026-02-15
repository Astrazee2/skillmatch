import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import NProgress from 'nprogress'

function NProgressHandler() {
  const location = useLocation()
  useEffect(() => {
    NProgress.done()
  }, [location.pathname])
  return null
}
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LandingPage from './components/LandingPage'
import SMEDashboard from './components/SMEDashboard'
import SpecialistDashboard from './components/SpecialistDashboard'
import MatchingEngine from './components/MatchingEngine'
import AdminPanel from './components/AdminPanel'
import ContactPage from './components/ContactPage'
import AboutPage from './components/AboutPage'
import Login from './components/shared/Login'
import Register from './components/shared/Register'
import Layout from './components/shared/Layout'

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-10 h-10 border-2 border-primary border-t-transparent rounded-full" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.userType)) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <>
      <NProgressHandler />
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/sme" element={<Layout><ProtectedRoute roles={['sme']}><SMEDashboard /></ProtectedRoute></Layout>} />
      <Route path="/specialist" element={<Layout><ProtectedRoute roles={['specialist']}><SpecialistDashboard /></ProtectedRoute></Layout>} />
      <Route path="/matching" element={<Layout><ProtectedRoute><MatchingEngine /></ProtectedRoute></Layout>} />
      <Route path="/admin" element={<Layout><ProtectedRoute roles={['admin']}><AdminPanel /></ProtectedRoute></Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { fontFamily: 'Inter, system-ui, sans-serif' },
            success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
