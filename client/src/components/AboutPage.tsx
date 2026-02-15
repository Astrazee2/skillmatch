import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Users, MessageSquare, Shield, CheckCircle } from 'lucide-react'
import { api } from '../services/api'

export default function AboutPage() {
  const [stats, setStats] = useState<{ activeSpecialists?: number; completedProjects?: number; matchAccuracy?: number; satisfactionRate?: number } | null>(null)

  useEffect(() => {
    api.get('/public/stats').then(({ data }) => setStats(data)).catch(() => setStats({ matchAccuracy: 92, satisfactionRate: 4.8 }))
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="text-xl font-bold text-primary">SkillMatch</Link>
            <div className="flex gap-4">
              <Link to="/about" className="text-primary font-medium">About Us</Link>
              <Link to="/contact" className="text-gray-600 hover:text-primary font-medium">Contact Us</Link>
              <Link to="/login" className="text-gray-600 hover:text-primary font-medium">Sign in</Link>
              <Link to="/register" className="text-primary font-medium hover:underline">Register</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-4xl font-bold text-gray-900">About SkillMatch</h1>
        <p className="mt-4 text-xl text-primary font-medium">Connecting SMEs with Expert Freelancers</p>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              SkillMatch was created to solve a common challenge faced by Small and Medium Enterprises: finding reliable, skilled professionals for short-term projects without the overhead of full-time hiring. We believe that businesses should have access to top talent when they need it, and that talented freelancers deserve quality opportunities that match their expertise.
            </p>
            <p>
              Our platform empowers freelancers to showcase their skills and connect with businesses that need their services. Whether you're a designer, marketer, developer, or operations expert, SkillMatch helps you find projects that align with your expertise and availability.
            </p>
            <p>
              We're building a trusted matching platform where SMEs and specialists can collaborate with confidence. Every specialist is vetted, every project is structured for success, and our smart algorithm ensures the best possible matches based on skills, budget, availability, and past performance.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Post Your Project</h3>
              <p className="mt-2 text-gray-600">SMEs describe their needs, budget, and timeline in a simple project brief.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="inline-flex p-4 rounded-full bg-secondary/10 text-secondary">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Get Matched</h3>
              <p className="mt-2 text-gray-600">Our smart algorithm finds the best specialists based on skills, budget, and availability.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="inline-flex p-4 rounded-full bg-accent/10 text-accent">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Collaborate</h3>
              <p className="mt-2 text-gray-600">Work together seamlessly with built-in messaging and project management.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">Why Choose SkillMatch</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Pre-vetted Specialists', desc: 'Every specialist is verified for skills and professional credentials.' },
              { icon: Users, title: 'Smart Matching Algorithm', desc: 'Our algorithm considers skills, budget, availability, and ratings.' },
              { icon: Shield, title: 'Secure Platform', desc: 'Safe, transparent transactions and project workflows.' },
              { icon: Briefcase, title: 'Flexible Project-Based Work', desc: 'No long-term commitments—hire for exactly what you need.' },
              { icon: CheckCircle, title: 'Quality Assurance', desc: 'Ratings and reviews help you choose the best fit.' },
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 text-primary">
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">By the Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-primary/5 rounded-xl p-6 text-center border border-primary/20">
              <p className="text-3xl font-bold text-primary">{stats?.activeSpecialists ?? '-'}</p>
              <p className="mt-1 text-sm text-gray-600">Active Specialists</p>
            </div>
            <div className="bg-secondary/5 rounded-xl p-6 text-center border border-secondary/20">
              <p className="text-3xl font-bold text-secondary">{stats?.completedProjects ?? '-'}</p>
              <p className="mt-1 text-sm text-gray-600">Completed Projects</p>
            </div>
            <div className="bg-primary/5 rounded-xl p-6 text-center border border-primary/20">
              <p className="text-3xl font-bold text-primary">{stats?.matchAccuracy ?? 92}%</p>
              <p className="mt-1 text-sm text-gray-600">Match Accuracy</p>
            </div>
            <div className="bg-accent/5 rounded-xl p-6 text-center border border-accent/20">
              <p className="text-3xl font-bold text-accent">{stats?.satisfactionRate ?? 4.8}/5</p>
              <p className="mt-1 text-sm text-gray-600">Client Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-semibold text-primary">SkillMatch</span>
          <div className="flex gap-6 text-gray-600 text-sm">
            <Link to="/" className="hover:text-primary">Home</Link>
            <Link to="/about" className="hover:text-primary">About Us</Link>
            <Link to="/contact" className="hover:text-primary">Contact Us</Link>
            <Link to="/login" className="hover:text-primary">Login</Link>
            <Link to="/register" className="hover:text-primary">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
