import { useState, useEffect } from 'react' // Added useEffect
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import Spinner from './Spinner'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState<'sme' | 'specialist'>('sme')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register, user } = useAuth()
  const navigate = useNavigate()

  // FIXED: Moved navigation to useEffect
  useEffect(() => {
    if (user) {
      navigate(user.userType === 'sme' ? '/sme' : '/specialist')
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(email, password, userType)
      toast.success('Registration successful! Welcome to SkillMatch')
      navigate(userType === 'sme' ? '/sme' : '/specialist')
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Registration failed'
      setError(msg)
      toast.error(msg === 'Email already registered' ? 'Email already exists' : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-2xl font-bold text-gray-900">Create your SkillMatch account</h2>
          <p className="mt-1 text-center text-gray-600">Join as SME or Specialist</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow">
          {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700">Account type</label>
            <div className="mt-2 flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="userType"
                  checked={userType === 'sme'}
                  onChange={() => setUserType('sme')}
                  className="text-primary focus:ring-primary"
                />
                <span className="ml-2">SME (Find specialists)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="userType"
                  checked={userType === 'specialist'}
                  onChange={() => setUserType('specialist')}
                  className="text-primary focus:ring-primary"
                />
                <span className="ml-2">Specialist (Offer services)</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {loading ? <><Spinner size="sm" className="border-white border-t-transparent" /> Creating account...</> : 'Register'}
          </button>
          <p className="text-center text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-primary font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}