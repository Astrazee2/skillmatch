import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { Briefcase, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import Spinner from './shared/Spinner'
import { ProjectCardSkeleton } from './shared/Skeleton'
import EmptyState from './shared/EmptyState'
import { ApplicationStatusBadge } from './shared/StatusBadge'

interface Project {
  id: string
  title: string
  category: string
  budgetMin: number
  budgetMax: number
  deadline: string
  requiredSkills: string[]
  sme?: { userId: string; companyName: string; industry?: string }
}

interface Application {
  id: string
  status: 'pending' | 'accepted' | 'rejected'
  proposalText: string
  quotedPrice?: number
  appliedAt: string
  project: Project
}

export default function SpecialistDashboard() {
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'applications' | 'messages'>('projects')
  const [profile, setProfile] = useState<any>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<any[]>([])
  const [messageTo, setMessageTo] = useState<{ id: string; name: string } | null>(null)
  const [messageText, setMessageText] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const { user: authUser } = useAuth()
  const [form, setForm] = useState<any>({})
  const [submitting, setSubmitting] = useState(false)
  const [applyModal, setApplyModal] = useState<{ project: Project; proposal: string; quotedPrice: string } | null>(null)
  const [applicationFilter, setApplicationFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all')

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      const [meRes, projectsRes, appsRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/projects'),
        api.get('/applications/my-applications'),
      ])
      const sp = meRes.data.specialistProfile
      setProfile(sp)
      setForm({
        fullName: sp?.fullName || '',
        bio: sp?.bio || '',
        hourlyRate: sp?.hourlyRate || 0,
        experienceYears: sp?.experienceYears || 0,
        expertiseAreas: sp?.expertiseAreas || [],
        skills: sp?.skills || [],
        availabilityStatus: sp?.availabilityStatus ?? true,
        profilePhotoUrl: sp?.profilePhotoUrl || '',
      })
      setProjects(projectsRes.data)
      setApplications(appsRes.data)
      if (activeTab === 'messages') {
        const msgRes = await api.get('/messages')
        setMessages(msgRes.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.patch('/users/specialist-profile', {
        ...form,
        expertiseAreas: Array.isArray(form.expertiseAreas) ? form.expertiseAreas : form.expertiseAreas?.split(',').map((s: string) => s.trim()).filter(Boolean),
        skills: Array.isArray(form.skills) ? form.skills : form.skills?.split(',').map((s: string) => s.trim()).filter(Boolean),
      })
      loadData()
      toast.success('Profile updated successfully')
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to update profile')
    } finally {
      setSubmitting(false)
    }
  }

  const handleApply = async () => {
    if (!applyModal) return
    setSubmitting(true)
    try {
      await api.post('/applications', {
        projectId: applyModal.project.id,
        proposalText: applyModal.proposal,
        quotedPrice: applyModal.quotedPrice ? Number(applyModal.quotedPrice) : null,
      })
      setApplyModal(null)
      loadData()
      toast.success('Application submitted successfully!')
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to submit application')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Specialist Dashboard</h1>

      {profile && profile.verificationStatus === 'pending' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
          Your profile is pending verification. Complete your profile to improve visibility.
        </div>
      )}

      <div className="flex gap-2 border-b border-gray-200">
        {['profile', 'projects', 'applications', 'messages'].map((tab) => (
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

      {activeTab === 'profile' && (
        <form onSubmit={handleUpdateProfile} className="bg-white rounded-xl shadow p-6 space-y-4 max-w-2xl">
          <h2 className="text-lg font-semibold">Edit your profile</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Full name</label>
            <input
              value={form.fullName || ''}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Profile photo URL</label>
            <input
              value={form.profilePhotoUrl || ''}
              onChange={(e) => setForm({ ...form, profilePhotoUrl: e.target.value })}
              placeholder="https://..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              rows={4}
              value={form.bio || ''}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Hourly rate ($)</label>
              <input
                type="number"
                value={form.hourlyRate || 0}
                onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Years of experience</label>
              <input
                type="number"
                value={form.experienceYears || 0}
                onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Expertise areas (comma-separated)</label>
            <input
              value={Array.isArray(form.expertiseAreas) ? form.expertiseAreas.join(', ') : form.expertiseAreas || ''}
              onChange={(e) => setForm({ ...form, expertiseAreas: e.target.value })}
              placeholder="Design, Marketing, Tech"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Skills (comma-separated)</label>
            <input
              value={Array.isArray(form.skills) ? form.skills.join(', ') : form.skills || ''}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              placeholder="React, UI/UX, Figma"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.availabilityStatus ?? true}
                onChange={(e) => setForm({ ...form, availabilityStatus: e.target.checked })}
              />
              <span className="text-sm font-medium text-gray-700">Available for new projects</span>
            </label>
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

      {activeTab === 'projects' && (
        <div>
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => <ProjectCardSkeleton key={i} />)}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState icon={Briefcase} title="No projects found" description="Check back later for new opportunities that match your expertise." />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p) => (
                <div key={p.id} className="bg-white rounded-xl shadow p-6 border border-gray-100 hover:shadow-lg transition">
                  <h3 className="font-semibold text-lg">{p.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{p.category}</p>
                  {p.sme && <p className="text-sm text-gray-500">{p.sme.companyName} • {p.sme.industry}</p>}
                  <p className="text-primary font-semibold mt-2">${p.budgetMin} - ${p.budgetMax}</p>
                  <p className="text-sm text-gray-500">Deadline: {new Date(p.deadline).toLocaleDateString()}</p>
                  {p.requiredSkills?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {p.requiredSkills.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-gray-100 rounded text-xs">{s}</span>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setApplyModal({ project: p, proposal: '', quotedPrice: '' })}
                    className="mt-4 flex items-center gap-2 text-primary font-medium hover:underline"
                  >
                    <Briefcase className="w-4 h-4" /> Apply
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'applications' && (
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : applications.length === 0 ? (
            <EmptyState icon={Briefcase} title="No applications yet" description="Apply to projects to see your applications here." action={<button onClick={() => setActiveTab('projects')} className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700">Browse Projects</button>} />
          ) : (
            <>
              <div className="flex gap-2 mb-6 flex-wrap">
                {(['all', 'pending', 'accepted', 'rejected'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setApplicationFilter(f)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      applicationFilter === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f === 'all' ? 'All' : f === 'pending' ? 'Under Review' : f === 'accepted' ? 'Accepted' : 'Not Selected'}
                    {' '}({f === 'all' ? applications.length : applications.filter((a) => a.status === f).length})
                  </button>
                ))}
              </div>
              <div className="space-y-4">
                {applications
                  .filter((app) => applicationFilter === 'all' || app.status === applicationFilter)
                  .map((app) => (
                    <div
                      key={app.id}
                      className={`rounded-xl shadow p-6 border ${
                        app.status === 'accepted' ? 'bg-green-50/50 border-green-200' :
                        app.status === 'rejected' ? 'bg-gray-50 border-gray-200 opacity-90' :
                        'bg-white border-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg">{app.project.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{app.project.category} • ${app.project.budgetMin} - ${app.project.budgetMax}</p>
                          {app.project.sme && <p className="text-sm text-gray-500">{app.project.sme.companyName}</p>}
                          <p className="text-gray-600 mt-2 line-clamp-2">{app.proposalText}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                            {app.quotedPrice != null && <span className="text-primary font-medium">Quoted: ${app.quotedPrice}</span>}
                            <span className="text-gray-500">Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="mt-3 flex gap-2">
                            {app.status === 'pending' && (
                              <span className="text-gray-500 text-sm">Awaiting client response...</span>
                            )}
                            {app.status === 'accepted' && app.project.sme?.userId && (
                              <button
                                onClick={() => setMessageTo({ id: app.project.sme!.userId, name: app.project.sme!.companyName })}
                                className="text-sm text-primary font-medium hover:underline"
                              >
                                Contact SME
                              </button>
                            )}
                            {app.status === 'accepted' && (
                              <span className="text-sm text-green-600 font-medium">View project details in Messages</span>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <ApplicationStatusBadge status={app.status} variant="specialist" />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </>
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
            <EmptyState icon={MessageSquare} title="No messages yet" description="Messages from clients will appear here." />
          ) : (
            <div className="space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-4 rounded-lg border ${
                    m.sender?.id === authUser?.id ? 'bg-primary/5 border-primary/20 ml-8' : 'bg-gray-50 border-gray-200 mr-8'
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
              <button onClick={() => { setMessageTo(null); setMessageText('') }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button
                onClick={async () => {
                  if (!messageText.trim()) return
                  setSendingMessage(true)
                  try {
                    await api.post('/messages', { receiverId: messageTo.id, messageText })
                    setMessageTo(null)
                    setMessageText('')
                    loadData()
                    toast.success('Message sent successfully')
                  } catch (e) {
                    toast.error('Failed to send message. Please try again.')
                  } finally {
                    setSendingMessage(false)
                  }
                }}
                disabled={sendingMessage}
                className="px-4 py-2 flex items-center gap-2 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {sendingMessage ? <><Spinner size="sm" className="border-white border-t-transparent" /> Sending...</> : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {applyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="font-semibold text-lg">Apply to {applyModal.project.title}</h3>
            <textarea
              rows={4}
              value={applyModal.proposal}
              onChange={(e) => setApplyModal({ ...applyModal, proposal: e.target.value })}
              placeholder="Write your proposal..."
              className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700">Quoted price ($) - optional</label>
              <input
                type="number"
                value={applyModal.quotedPrice}
                onChange={(e) => setApplyModal({ ...applyModal, quotedPrice: e.target.value })}
                placeholder="e.g. 1500"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <button onClick={() => setApplyModal(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button
                onClick={handleApply}
                disabled={submitting || !applyModal.proposal.trim()}
                className="px-4 py-2 flex items-center gap-2 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? <><Spinner size="sm" className="border-white border-t-transparent" /> Submitting...</> : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
