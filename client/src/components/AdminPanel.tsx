import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Users, Briefcase, BarChart3, Shield } from 'lucide-react'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'projects' | 'specialists'>('overview')
  const [analytics, setAnalytics] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      const [analyticsRes, usersRes, projectsRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/users'),
        api.get('/admin/projects'),
      ])
      setAnalytics(analyticsRes.data)
      setUsers(usersRes.data)
      setProjects(projectsRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (specialistId: string, status: 'verified' | 'rejected') => {
    try {
      await api.patch(`/admin/specialists/${specialistId}/verify`, { status })
      loadData()
    } catch (e) {
      alert('Failed to update')
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>

      <div className="flex gap-2 border-b border-gray-200">
        {['overview', 'users', 'projects', 'specialists'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium rounded-t-lg capitalize ${
              activeTab === tab ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{analytics?.totalUsers ?? '-'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-secondary/10 rounded-lg text-secondary">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold">{analytics?.totalProjects ?? '-'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/10 rounded-lg text-accent">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Specialists</p>
                <p className="text-2xl font-bold">{analytics?.totalSpecialists ?? '-'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Open Projects</p>
                <p className="text-2xl font-bold">{analytics?.openProjects ?? '-'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.userType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="space-y-4">
          {projects.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow p-6 border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{p.title}</h3>
                  <p className="text-sm text-gray-600">{p.category} • {p.sme?.companyName}</p>
                  <p className="text-primary font-medium">${p.budgetMin} - ${p.budgetMax}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  p.status === 'open' ? 'bg-green-100 text-green-800' :
                  p.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'specialists' && (
        <div className="space-y-4">
          {users.filter((u) => u.specialistProfile).map((u) => {
            const sp = u.specialistProfile
            return (
              <div key={u.id} className="bg-white rounded-xl shadow p-6 border border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{sp.fullName}</h3>
                  <p className="text-sm text-gray-600">{sp.expertiseAreas?.join(', ')} • ${sp.hourlyRate}/hr</p>
                  <p className="text-sm text-gray-500">Status: {sp.verificationStatus}</p>
                </div>
                {sp.verificationStatus === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerify(sp.id, 'verified')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => handleVerify(sp.id, 'rejected')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
