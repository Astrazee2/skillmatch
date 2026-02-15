import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
    setShowLogoutConfirm(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-6">
              <Link to="/" className="text-xl font-bold text-primary">SkillMatch</Link>
              {user?.userType === 'sme' && <Link to="/sme" className="text-gray-600 hover:text-primary">Dashboard</Link>}
              {user?.userType === 'specialist' && <Link to="/specialist" className="text-gray-600 hover:text-primary">Dashboard</Link>}
              {user?.userType === 'admin' && <Link to="/admin" className="text-gray-600 hover:text-primary">Admin</Link>}
              <Link to="/matching" className="text-gray-600 hover:text-primary">Matching</Link>
              <Link to="/about" className="text-gray-600 hover:text-primary">About Us</Link>
              <Link to="/contact" className="text-gray-600 hover:text-primary">Contact Us</Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button onClick={() => setShowLogoutConfirm(true)} className="text-gray-600 hover:text-red-600 text-sm font-medium">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-lg">Log out?</h3>
            <p className="mt-2 text-gray-600 text-sm">Are you sure you want to log out?</p>
            <div className="mt-6 flex gap-3 justify-end">
              <button onClick={() => setShowLogoutConfirm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Log out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
