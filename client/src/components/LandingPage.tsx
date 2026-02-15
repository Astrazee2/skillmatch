import { Link } from 'react-router-dom'
import { Briefcase, Users, Shield, ArrowRight } from 'lucide-react'

const CATEGORIES = ['Design', 'Marketing', 'Tech', 'Operations', 'Finance']
const STEPS = [
  { icon: Briefcase, title: 'Post your project', desc: 'Describe your needs, budget, and timeline' },
  { icon: Users, title: 'Get matched', desc: 'Our algorithm finds the best specialists for you' },
  { icon: Shield, title: 'Work with confidence', desc: 'Connect, collaborate, and get results' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="text-xl font-bold text-primary">SkillMatch</Link>
            <div className="flex gap-4">
              <Link to="/about" className="text-gray-600 hover:text-primary font-medium">About Us</Link>
              <Link to="/contact" className="text-gray-600 hover:text-primary font-medium">Contact Us</Link>
              <Link to="/login" className="text-gray-600 hover:text-primary font-medium">Sign in</Link>
              <Link to="/register" className="text-primary font-medium hover:underline">Register</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
            Connect SMEs with Expert
            <span className="text-primary"> Freelance Specialists</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Skip full-time hiring. Find vetted professionals for short-term projects in design, marketing, tech, operations, and finance.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-white bg-primary hover:bg-blue-700 font-medium transition shadow-lg"
            >
              Find a Specialist <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-primary border-2 border-primary hover:bg-primary/5 font-medium transition"
            >
              Become a Specialist
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900">How It Works</h2>
          <p className="mt-2 text-center text-gray-600 max-w-2xl mx-auto">Three simple steps to get your project done</p>
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary">
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900">Categories of Expertise</h2>
          <p className="mt-2 text-center text-gray-600">Find specialists across key business functions</p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            {CATEGORIES.map((cat) => (
              <div
                key={cat}
                className="px-6 py-4 rounded-lg bg-primary/5 border border-primary/20 text-primary font-medium hover:bg-primary/10 transition cursor-pointer"
              >
                {cat}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900">Ready to get started?</h2>
          <p className="mt-2 text-center text-gray-600">Join SkillMatch and connect with top talent today.</p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3 rounded-lg text-white bg-primary hover:bg-blue-700 font-medium transition"
            >
              Find a Specialist
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 rounded-lg text-primary border-2 border-primary hover:bg-primary/5 font-medium transition"
            >
              Become a Specialist
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-12">
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
