import { motion } from 'framer-motion'
import { Mail, MapPin, Phone, Send, Clock } from 'lucide-react'
import { useState } from 'react'
import HeroSection from '../components/HeroSection'

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'contact@jinnahleague.com' },
  { icon: MapPin, label: 'Location', value: 'Mohammad Ali Jinnah University, Karachi' },
  { icon: Phone, label: 'Phone', value: '+92 XXX XXXXXXX' },
  { icon: Clock, label: 'Response Time', value: 'Within 24-48 hours' },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <>
      <HeroSection
        title="CONTACT US"
        subtitle="GET IN TOUCH"
        description="HAVE QUESTIONS? WE'D LOVE TO HEAR FROM YOU"
      />

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="font-display text-2xl gradient-text-pink mb-6">REACH OUT</h2>
              <p className="text-gray-300 text-sm leading-relaxed mb-8">
                Whether you want to register, sponsor, partner, or just ask a question — our team
                is here to help. Reach out and we&apos;ll get back to you as soon as possible.
              </p>
              <div className="space-y-5">
                {contactInfo.map((info) => (
                  <div key={info.label} className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded bg-jl-card border border-jl-card-border flex items-center justify-center flex-shrink-0 group-hover:border-jl-purple/50 transition-colors">
                      <info.icon size={18} className="text-jl-purple" />
                    </div>
                    <div>
                      <p className="font-heading text-xs tracking-widest uppercase text-gray-400">{info.label}</p>
                      <p className="text-sm text-white mt-0.5">{info.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="bg-jl-card border border-jl-card-border rounded-lg p-6 md:p-8">
                <h3 className="font-display text-xl gradient-text-pink mb-6">SEND A MESSAGE</h3>
                {submitted ? (
                  <div className="text-center py-12">
                    <Send size={40} className="text-jl-pink mx-auto mb-4" />
                    <p className="text-white font-heading font-bold text-sm tracking-widest uppercase">MESSAGE SENT!</p>
                    <p className="text-gray-400 text-xs mt-2">We&apos;ll get back to you soon.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-xs font-heading tracking-widest uppercase text-gray-400 mb-1.5">NAME</label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-jl-darker border border-jl-card-border rounded px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-jl-purple transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-xs font-heading tracking-widest uppercase text-gray-400 mb-1.5">EMAIL</label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-jl-darker border border-jl-card-border rounded px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-jl-purple transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-xs font-heading tracking-widest uppercase text-gray-400 mb-1.5">SUBJECT</label>
                      <input
                        id="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-jl-darker border border-jl-card-border rounded px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-jl-purple transition-colors"
                        placeholder="What's this about?"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-xs font-heading tracking-widest uppercase text-gray-400 mb-1.5">MESSAGE</label>
                      <textarea
                        id="message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-jl-darker border border-jl-card-border rounded px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-jl-purple transition-colors resize-none"
                        placeholder="Your message..."
                      />
                    </div>
                    <button type="submit" className="btn-primary w-full text-xs py-3">
                      SEND MESSAGE
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
