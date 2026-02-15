import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { MessageSquare, Briefcase, Users, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import Spinner from './shared/Spinner'
import { ProjectCardSkeleton, SpecialistCardSkeleton } from './shared/Skeleton'
import EmptyState from './shared/EmptyState'
import { ProjectStatusBadge, ApplicationStatusBadge } from './shared/StatusBadge'

const CATEGORIES = ['Design', 'Marketing', 'Tech', 'Operations', 'Finance']

type ProjectStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'
type ApplicationStatusType = 'pending' | 'accepted' | 'rejected'

interface Application {
  id: string
  status: ApplicationStatusType
  proposalText: string
  quotedPrice?: number
  appliedAt: string
  specialist: Specialist
}

interface Project {
  id: string
  title: string
  category: string
  budgetMin: number
  budgetMax: number
  deadline: string
  status: ProjectStatus
  requiredSkills: string[]
  applications?: Application[]
}

interface Specialist {
  id: string
  fullName: string
  profilePhotoUrl?: string
  expertiseAreas: string[]
  hourlyRate: number
  experienceYears: number
  rating: number
  bio?: string
  matchScore?: number
  verificationStatus: string
}

export default function SMEDashboard() {
  const [activeTab, setActiveTab] = useState<'projects' | 'specialists' | 'post' | 'profile' | 'messages'>('projects')
  const [projects, setProjects] = useState<Project[]>([])
  const [specialists, setSpecialists] = useState<Specialist[]>([])
  const [loading, setLoading] = useState(true)
  const [smeProfile, setSmeProfile] = useState<any>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    budgetMin: '',
    budgetMax: '',
    deadline: '',
    requiredSkills: '',
  })
  const [filters, setFilters] = useState({ category: '', minRating: '', maxRate: '', sort: 'relevance' })
  const [messageTo, setMessageTo] = useState<{ id: string; name: string } | null>(null)
  const [messageText, setMessageText] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [smeForm, setSmeForm] = useState({ companyName: '', industry: '', companySize: '', phone: '' })
  const [messages, setMessages] = useState<any[]>([])
  const [projectStatusFilter, setProjectStatusFilter] = useState<'all' | ProjectStatus>('all')
  const [applicationFilter, setApplicationFilter] = useState<'all' | ApplicationStatusType>('pending')
  const [statusChangeProject, setStatusChangeProject] = useState<{ id: string; status: ProjectStatus } | null>(null)
  const [statusChangeLoading, setStatusChangeLoading] = useState(false)
  const [statusChangeConfirm, setStatusChangeConfirm] = useState<{ projectId: string; newStatus: ProjectStatus } | null>(null)
  const { user: authUser } = useAuth()

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      const [meRes, projectsRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/projects/sme/my-projects'),
      ])
      const sp = meRes.data.smeProfile
      setSmeProfile(sp)
      if (sp) setSmeForm({
        companyName: sp.companyName || '',
        industry: sp.industry || '',
        companySize: sp.companySize || '',
        phone: sp.phone || '',
      })
      setProjects(projectsRes.data)
      if (activeTab === 'messages') {
        const msgRes = await api.get('/messages')
        setMessages(msgRes.data)
      }
      if (activeTab === 'specialists') {
        const params = new URLSearchParams()
        if (filters.category) params.append('category', filters.category)
        if (filters.minRating) params.append('minRating', filters.minRating)
        if (filters.maxRate) params.append('maxRate', filters.maxRate)
        if (filters.sort) params.append('sort', filters.sort)
        const specRes = await api.get(`/matching/browse-specialists?${params}`)
        setSpecialists(specRes.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handlePostProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/projects', {
        ...form,
        budgetMin: Number(form.budgetMin),
        budgetMax: Number(form.budgetMax),
        requiredSkills: form.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
      })
      setForm({ title: '', description: '', category: '', budgetMin: '', budgetMax: '', deadline: '', requiredSkills: '' })
      setActiveTab('projects')
      loadData()
      toast.success('Project posted successfully!')
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to post project')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendMessage = async (receiverId: string) => {
    if (!messageText.trim()) return
    setSendingMessage(true)
    try {
      await api.post('/messages', { receiverId, messageText })
      setMessageTo(null)
      setMessageText('')
      toast.success('Message sent successfully')
      if (activeTab === 'messages') {
        const msgRes = await api.get('/messages')
        setMessages(msgRes.data)
      }
    } catch (e) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleApplicationStatus = async (appId: string, status: 'accepted' | 'rejected') => {
    try {
      await api.patch(`/applications/${appId}/status`, { status })
      loadData()
      toast.success(status === 'accepted' ? 'Application accepted successfully' : 'Application rejected')
    } catch (e) {
      toast.error(`Failed to ${status} application`)
    }
  }

  const handleProjectStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
    setStatusChangeLoading(true)
    try {
      await api.patch(`/projects/${projectId}/status`, { status: newStatus })
      loadData()
      toast.success(`Project marked as ${newStatus.replace('_', ' ')}`)
      setStatusChangeProject(null)
      setStatusChangeConfirm(null)
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to update project status')
    } finally {
      setStatusChangeLoading(false)
    }
  }

  const filteredProjects = projectStatusFilter === 'all'
    ? projects
    : projects.filter((p) => p.status === projectStatusFilter)

  const projectCounts = {
    all: projects.length,
    open: projects.filter((p) => p.status === 'open').length,
    in_progress: projects.filter((p) => p.status === 'in_progress').length,
    completed: projects.filter((p) => p.status === 'completed').length,
    cancelled: projects.filter((p) => p.status === 'cancelled').length,
  }

  const filterApplications = (apps: Application[] = []) =>
    applicationFilter === 'all' ? apps : apps.filter((a) => a.status === applicationFilter)

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">SME Dashboard</h1>
      {smeProfile && !smeProfile.profileComplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
          Complete your company profile for better matches.{' '}
          <button onClick={() => setActiveTab('profile')} className="underline font-medium">Edit profile</button>
        </div>
      )}

      <div className="flex gap-2 border-b border-gray-200">
        {['projects', 'specialists', 'post', 'profile', 'messages'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium rounded-t-lg capitalize ${
              activeTab === tab ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab === 'post' ? 'Post Project' : tab}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && smeProfile && (
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            setSubmitting(true)
            try {
              await api.patch('/users/sme-profile', smeForm)
              loadData()
              toast.success('Profile updated successfully')
            } catch (err) {
              toast.error('Failed to update profile')
            } finally {
              setSubmitting(false)
            }
          }}
          className="bg-white rounded-xl shadow p-6 space-y-4 max-w-2xl"
        >
          <h2 className="text-lg font-semibold">Company Profile</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Company name</label>
            <input
              value={smeForm.companyName}
              onChange={(e) => setSmeForm({ ...smeForm, companyName: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Industry</label>
            <input
              value={smeForm.industry}
              onChange={(e) => setSmeForm({ ...smeForm, industry: e.target.value })}
              placeholder="e.g. Retail, Tech"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Company size</label>
            <input
              value={smeForm.companySize}
              onChange={(e) => setSmeForm({ ...smeForm, companySize: e.target.value })}
              placeholder="e.g. 1-10, 11-50"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              value={smeForm.phone}
              onChange={(e) => setSmeForm({ ...smeForm, phone: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 flex items-center gap-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? <><Spinner size="sm" className="border-white border-t-transparent" /> Saving...</> : 'Save Profile'}
          </button>
        </form>
      )}

      {activeTab === 'post' && (
        <form onSubmit={handlePostProject} className="bg-white rounded-xl shadow p-6 space-y-4 max-w-2xl">
          <h2 className="text-lg font-semibold">Post a new project</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Project title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select...</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Budget min ($)</label>
              <input
                type="number"
                required
                value={form.budgetMin}
                onChange={(e) => setForm({ ...form, budgetMin: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Budget max ($)</label>
              <input
                type="number"
                required
                value={form.budgetMax}
                onChange={(e) => setForm({ ...form, budgetMax: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Deadline</label>
            <input
              type="date"
              required
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Required skills (comma-separated)</label>
            <input
              value={form.requiredSkills}
              onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })}
              placeholder="e.g. React, Node.js, API"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 flex items-center gap-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? <><Spinner size="sm" className="border-white border-t-transparent" /> Posting...</> : 'Post Project'}
          </button>
        </form>
      )}

      {activeTab === 'projects' && (
        <div>
          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => <ProjectCardSkeleton key={i} />)}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No projects yet"
              description="Post your first project to start connecting with specialists."
              action={<button onClick={() => setActiveTab('post')} className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700">Post a Project</button>}
            />
          ) : (
            <>
              <div className="flex gap-2 mb-6 flex-wrap">
                {(['all', 'open', 'in_progress', 'completed', 'cancelled'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setProjectStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      projectStatusFilter === status
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'all' ? 'All' : status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                    {' '}({projectCounts[status === 'all' ? 'all' : status]})
                  </button>
                ))}
              </div>
              <div className="grid gap-4">
                {filteredProjects.map((p) => (
                  <div key={p.id} className="bg-white rounded-xl shadow p-6 border border-gray-100">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">{p.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{p.category} • ${p.budgetMin} - ${p.budgetMax}</p>
                        <p className="text-gray-500 text-sm">Deadline: {new Date(p.deadline).toLocaleDateString()}</p>
                        {p.requiredSkills?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {p.requiredSkills.map((s) => (
                              <span key={s} className="px-2 py-0.5 bg-gray-100 rounded text-xs">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <ProjectStatusBadge status={p.status} />
                        <div className="relative">
                          <button
                            onClick={() => setStatusChangeProject(statusChangeProject?.id === p.id ? null : { id: p.id, status: p.status })}
                            className="p-2 rounded-lg hover:bg-gray-100"
                            title="Change status"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          {statusChangeProject?.id === p.id && (
                            <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                              {(['open', 'in_progress', 'completed', 'cancelled'] as ProjectStatus[]).map((s) => (
                                <button
                                  key={s}
                                  onClick={() => {
                                    if (s === 'completed' || s === 'cancelled') {
                                      setStatusChangeConfirm({ projectId: p.id, newStatus: s })
                                      setStatusChangeProject(null)
                                    } else {
                                      handleProjectStatusChange(p.id, s)
                                      setStatusChangeProject(null)
                                    }
                                  }}
                                  disabled={statusChangeLoading}
                                  className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                                    p.status === s ? 'bg-primary/10 text-primary font-medium' : ''
                                  }`}
                                >
                                  {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {p.applications && p.applications.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-700">Applications</h4>
                          <div className="flex gap-1">
                            {(['all', 'pending', 'accepted', 'rejected'] as const).map((f) => (
                              <button
                                key={f}
                                onClick={() => setApplicationFilter(f)}
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  applicationFilter === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                        {filterApplications(p.applications).length === 0 ? (
                          <p className="text-gray-500 text-sm py-2">No {applicationFilter === 'all' ? '' : applicationFilter} applications</p>
                        ) : (
                          filterApplications(p.applications).map((app) => (
                            <div
                              key={app.id}
                              className={`flex items-center justify-between py-3 px-3 rounded-lg border mb-2 last:mb-0 ${
                                app.status === 'accepted' ? 'bg-green-50 border-green-200' :
                                app.status === 'rejected' ? 'bg-red-50/50 border-red-200 opacity-80' :
                                'bg-gray-50 border-gray-100'
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <img src={app.specialist.profilePhotoUrl || 'https://i.pravatar.cc/80'} alt="" className="w-10 h-10 rounded-full flex-shrink-0" />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium">{app.specialist.fullName}</span>
                                    <ApplicationStatusBadge status={app.status} variant="sme" />
                                  </div>
                                  <p className="text-gray-600 text-sm mt-0.5 line-clamp-1">{app.proposalText}</p>
                                  <p className="text-gray-500 text-xs mt-1">
                                    ${app.specialist.hourlyRate}/hr • {app.specialist.experienceYears}y exp
                                    {app.quotedPrice != null && ` • Quoted: $${app.quotedPrice}`}
                                    {' • '}{new Date(app.appliedAt).toLocaleDateString()}
                                  </p>
                                  {app.status === 'pending' && (
                                    <div className="mt-2 flex gap-2">
                                      <button onClick={() => handleApplicationStatus(app.id, 'accepted')} className="text-sm text-green-600 font-medium hover:underline">
                                        Accept
                                      </button>
                                      <button onClick={() => handleApplicationStatus(app.id, 'rejected')} className="text-sm text-red-600 font-medium hover:underline">
                                        Reject
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {statusChangeConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl p-6 max-w-sm w-full">
                    <h3 className="font-semibold text-lg">Confirm status change</h3>
                    <p className="mt-2 text-gray-600 text-sm">
                      Are you sure you want to mark this project as {statusChangeConfirm.newStatus.replace('_', ' ')}?
                    </p>
                    <div className="mt-6 flex gap-3 justify-end">
                      <button onClick={() => setStatusChangeConfirm(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                      <button
                        onClick={() => handleProjectStatusChange(statusChangeConfirm.projectId, statusChangeConfirm.newStatus)}
                        disabled={statusChangeLoading}
                        className="px-4 py-2 flex items-center gap-2 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {statusChangeLoading ? <><Spinner size="sm" className="border-white border-t-transparent" /> Updating...</> : 'Confirm'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'specialists' && (
        <div>
          <div className="flex gap-4 mb-6">
            <select
              value={filters.category}
              onChange={(e) => { setFilters({ ...filters, category: e.target.value }); loadData() }}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={filters.sort}
              onChange={(e) => { setFilters({ ...filters, sort: e.target.value }); loadData() }}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="relevance">Relevance</option>
              <option value="rating">Rating</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => <SpecialistCardSkeleton key={i} />)}
            </div>
          ) : specialists.length === 0 ? (
            <EmptyState icon={Users} title="No specialists found" description="Try adjusting your filters or check back later." />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {specialists.map((s) => (
                <div key={s.id} className="bg-white rounded-xl shadow p-6 border border-gray-100 hover:shadow-lg transition">
                  <div className="flex items-start gap-4">
                    <img src={s.profilePhotoUrl || 'https://i.pravatar.cc/80'} alt="" className="w-16 h-16 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{s.fullName}</h3>
                        {s.verificationStatus === 'verified' && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Verified</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{s.expertiseAreas.join(', ')}</p>
                      <p className="text-primary font-semibold mt-1">${s.hourlyRate}/hr</p>
                      <p className="text-sm text-gray-500">{s.experienceYears} years exp • ⭐ {s.rating}</p>
                      {s.bio && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{s.bio}</p>}
                      <button
                        onClick={() => setMessageTo({ id: (s as any).userId, name: s.fullName })}
                        className="mt-3 flex items-center gap-1 text-primary font-medium hover:underline"
                      >
                        <MessageSquare className="w-4 h-4" /> Request Consultation
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : messages.length === 0 ? (
            <EmptyState icon={MessageSquare} title="No messages yet" description="Start a conversation by requesting a consultation from a specialist." />
          ) : (
            <div className="space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-4 rounded-lg border ${
                    m.sender?.id === authUser?.id
                      ? 'bg-primary/5 border-primary/20 ml-8'
                      : 'bg-gray-50 border-gray-200 mr-8'
                  }`}
                >
                  <p className="text-sm text-gray-600">
                    {m.sender?.email} → {m.receiver?.email}
                    {m.project?.title && ` • ${m.project.title}`}
                  </p>
                  <p className="mt-1">{m.messageText}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(m.sentAt).toLocaleString()}</p>
                  <button
                    onClick={() => setMessageTo({ id: m.sender?.id === authUser?.id ? m.receiver?.id : m.sender?.id, name: m.sender?.id === authUser?.id ? m.receiver?.email : m.sender?.email })}
                    className="mt-2 text-sm text-primary hover:underline"
                  >
                    Reply
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {messageTo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="font-semibold text-lg">Message {messageTo.name}</h3>
            <textarea
              rows={4}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Write your message..."
              className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <div className="mt-4 flex gap-2 justify-end">
              <button onClick={() => { setMessageTo(null); setMessageText('') }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button
                onClick={() => handleSendMessage(messageTo.id)}
                className="px-4 py-2 flex items-center gap-2 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={!messageText.trim() || sendingMessage}
              >
                {sendingMessage ? <><Spinner size="sm" className="border-white border-t-transparent" /> Sending...</> : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
