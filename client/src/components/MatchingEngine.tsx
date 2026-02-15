import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { Percent } from 'lucide-react'

export default function MatchingEngine() {
  const { user } = useAuth()
  const [projectId, setProjectId] = useState('')
  const [matches, setMatches] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [, setActiveView] = useState<'project' | 'specialist'>('project')
  const [filters, setFilters] = useState({ category: '', sort: 'relevance', minRating: '', maxRate: '' })

  useEffect(() => {
    if (user?.userType === 'sme') {
      loadMyProjects()
      setActiveView('project')
    } else if (user?.userType === 'specialist') {
      loadSpecialistMatches()
      setActiveView('specialist')
    }
  }, [user])

  const loadMyProjects = async () => {
    try {
      const { data } = await api.get('/projects/sme/my-projects')
      setProjects(data)
      if (data.length > 0 && !projectId) setProjectId(data[0].id)
    } catch (e) {
      console.error(e)
    }
  }

  const loadSpecialistMatches = async () => {
    try {
      const sp = (await api.get('/users/me')).data.specialistProfile
      if (!sp) return
      const { data } = await api.get(`/matching/specialist/${sp.id}`)
      setMatches(data)
    } catch (e) {
      console.error(e)
    }
  }

  const loadProjectMatches = async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.sort) params.append('sort', filters.sort)
      const { data } = await api.get(`/matching/project/${projectId}?${params}`)
      setMatches(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (projectId && user?.userType === 'sme') loadProjectMatches()
  }, [projectId, filters.sort])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Smart Matching</h1>
        <p className="text-gray-600 mt-1">Match score based on skills (40%), budget (25%), availability (15%), industry (10%), rating (10%)</p>
      </div>

      {user?.userType === 'sme' && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-4">Select a project to see matched specialists</h2>
          <div className="flex flex-wrap gap-4">
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="relevance">Relevance (match score)</option>
              <option value="rating">Rating</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      )}

      {user?.userType === 'specialist' && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-4">Projects matching your expertise</h2>
        </div>
      )}

      <div>
        {loading ? (
          <div className="text-gray-500 py-8">Loading matches...</div>
        ) : matches.length === 0 ? (
          <div className="text-gray-600 py-8">
            {user?.userType === 'sme' && !projectId && 'Select a project to see matches.'}
            {user?.userType === 'sme' && projectId && 'No matches found for this project.'}
            {user?.userType === 'specialist' && 'No matching projects at the moment.'}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((item: any) => (
              <div key={item.id} className="bg-white rounded-xl shadow p-6 border border-gray-100 hover:shadow-lg transition">
                {item.fullName ? (
                  <>
                    <div className="flex items-start gap-4">
                      <img src={item.profilePhotoUrl || 'https://i.pravatar.cc/80'} alt="" className="w-14 h-14 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{item.fullName}</h3>
                          {item.matchScore != null && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded text-sm font-medium">
                              <Percent className="w-3 h-3" /> {item.matchScore}%
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{item.expertiseAreas?.join(', ')}</p>
                        <p className="text-primary font-semibold">${item.hourlyRate}/hr</p>
                        <p className="text-sm text-gray-500">{item.experienceYears}y exp • ⭐ {item.rating}</p>
                        {item.bio && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.bio}</p>}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      {item.matchScore != null && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded text-sm font-medium">
                          <Percent className="w-3 h-3" /> {item.matchScore}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{item.category}</p>
                    {item.sme && <p className="text-sm text-gray-500">{item.sme.companyName}</p>}
                    <p className="text-primary font-semibold mt-2">${item.budgetMin} - ${item.budgetMax}</p>
                    <p className="text-sm text-gray-500">Deadline: {new Date(item.deadline).toLocaleDateString()}</p>
                    {item.requiredSkills?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.requiredSkills.map((s: string) => (
                          <span key={s} className="px-2 py-0.5 bg-gray-100 rounded text-xs">{s}</span>
                        ))}
                      </div>
                    )}
                    <a href="/specialist" className="mt-4 inline-block text-primary font-medium hover:underline">View & Apply →</a>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
