import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, Clock, MapPin } from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'
import Spinner from './shared/Spinner'

export default function ContactPage() {
  const [form, setForm] = useState({ fullName: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!emailRegex.test(form.email)) e.email = 'Please enter a valid email address'
    if (!form.subject.trim()) e.subject = 'Subject is required'
    if (!form.message.trim()) e.message = 'Message is required'
    else if (form.message.trim().length < 10) e.message = 'Message must be at least 10 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/contact', {
        name: form.fullName,
        email: form.email,
        subject: form.subject,
        message: form.message,
      })
      toast.success("Contact form submitted successfully! We'll get back to you soon")
      setForm({ fullName: '', email: '', subject: '', message: '' })
      setSubmitted(true)
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to submit'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="text-xl font-bold text-primary">SkillMatch</Link>
            <div className="flex gap-4">
              <Link to="/about" className="text-gray-600 hover:text-primary font-medium">About Us</Link>
              <Link to="/contact" className="text-primary font-medium">Contact Us</Link>
              <Link to="/login" className="text-gray-600 hover:text-primary font-medium">Sign in</Link>
              <Link to="/register" className="text-primary font-medium hover:underline">Register</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
          <p className="mt-2 text-gray-600">We'd love to hear from you. Send us a message.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-8 space-y-4">
              {submitted && (
                <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
                  Thank you! Your message has been received. We'll get back to you soon.
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  value={form.fullName}
                  onChange={(e) => { setForm({ ...form, fullName: e.target.value }); setErrors({ ...errors, fullName: '' }) }}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Your full name"
                />
                {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }) }}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject *</label>
                <input
                  value={form.subject}
                  onChange={(e) => { setForm({ ...form, subject: e.target.value }); setErrors({ ...errors, subject: '' }) }}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md ${errors.subject ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Subject of your inquiry"
                />
                {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Message / Inquiry *</label>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={(e) => { setForm({ ...form, message: e.target.value }); setErrors({ ...errors, message: '' }) }}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md ${errors.message ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Your message (min 10 characters)"
                />
                {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? <><Spinner size="sm" className="border-white border-t-transparent" /> Submitting...</> : 'Submit'}
              </button>
            </form>
          </div>
          <div>
            <div className="bg-white rounded-xl shadow p-8 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Email</p>
                  <a href="mailto:support@skillmatch.com" className="text-primary hover:underline">support@skillmatch.com</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Phone</p>
                  <p className="text-gray-600">+63 XXX XXX XXXX</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Business Hours</p>
                  <p className="text-gray-600">Monday - Friday, 9:00 AM - 6:00 PM (PHT)</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Address</p>
                  <p className="text-gray-600">Manila, Philippines</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
