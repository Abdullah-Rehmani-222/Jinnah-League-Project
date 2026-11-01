import { motion } from 'framer-motion'
import { Mail, MapPin, Phone, Send, Clock, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import HeroSection from '../components/HeroSection'
import CmsSections from '../components/CmsSections'
import { publicApi, usePage, useSettings } from '../lib/publicApi'

const defaultInfo = [
  { icon: Mail, label: 'Email', value: 'contact@jinnahleague.com' },
  { icon: MapPin, label: 'Visit', value: 'Mohammad Ali Jinnah University, Karachi' },
  { icon: Phone, label: 'Phone', value: '+92 XXX XXXXXXX' },
  { icon: Clock, label: 'Response Time', value: 'Within 24-48 hours' },
]

export default function ContactPage() {
  const settings = useSettings()
  const { sections } = usePage('contact')
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '', website: '' })
  const [status, setStatus] = useState('idle') // idle | sending | sent
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')

  // Contact details come from Website Settings; the built-in defaults are only used for values not set yet.
  const info = defaultInfo
    .map((row) => {
      if (row.label === 'Email' && settings.contact_email) return { ...row, value: settings.contact_email }
      if (row.label === 'Location' && settings.contact_address) return { ...row, value: settings.contact_address }
      if (row.label === 'Phone') return settings.contact_phone ? { ...row, value: settings.contact_phone } : null // never show the placeholder number
      return row
    })
    .filter(Boolean)

  const set = (field) => (e) => {
    setFormData((f) => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    setErrors({})
    setFormError('')
    try {
      await publicApi.sendContact(formData)
      setFormData({ name: '', email: '', subject: '', message: '', website: '' })
      setStatus('sent')
    } catch (err) {
      setStatus('idle')
      setErrors(err.fieldErrors?.() ?? {})
      setFormError(err.status === 422 ? 'Please correct the highlighted fields.' : err.message)
    }
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
                {info.map((info) => (
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
              <div className="relative bg-jl-card border border-jl-card-border rounded-lg p-6 md:p-8">
                <h3 className="font-display text-xl gradient-text-pink mb-6">SEND A MESSAGE</h3>
                {status === 'sent' ? (
                  <div className="text-center py-12">
                    <Send size={40} className="text-jl-pink mx-auto mb-4" />
                    <p className="text-white font-heading font-bold text-sm tracking-widest uppercase">MESSAGE SENT!</p>
                    <p className="text-gray-400 text-xs mt-2">We&apos;ll get back to you soon.</p>
                    <button type="button" onClick={() => setStatus('idle')} className="btn-outline text-xs mt-6">SEND ANOTHER MESSAGE</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
                    {formError && (
                      <p role="alert" className="flex items-start gap-2 rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                        <AlertCircle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />{formError}
                      </p>
                    )}
                    {/* Honeypot: hidden from people, bots fill it in and are silently ignored by the API */}
                    <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                      <label htmlFor="website">Website</label>
                      <input id="website" type="text" tabIndex={-1} autoComplete="off" value={formData.website} onChange={set('website')} />
                    </div>
                    <div>
                      <label htmlFor="name" className="block text-xs font-heading tracking-widest uppercase text-gray-400 mb-1.5">NAME</label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={set('name')} minLength={2} maxLength={100}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                        className="w-full bg-jl-darker border border-jl-card-border rounded px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-jl-purple transition-colors"
                        placeholder="Your name"
                      />
                      {errors.name && <p id="name-error" role="alert" className="mt-1 text-xs text-red-400">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-xs font-heading tracking-widest uppercase text-gray-400 mb-1.5">EMAIL</label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={set('email')} maxLength={255}
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        className="w-full bg-jl-darker border border-jl-card-border rounded px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-jl-purple transition-colors"
                        placeholder="your@email.com"
                      />
                      {errors.email && <p id="email-error" role="alert" className="mt-1 text-xs text-red-400">{errors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-xs font-heading tracking-widest uppercase text-gray-400 mb-1.5">SUBJECT</label>
                      <input
                        id="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={set('subject')} maxLength={200}
                        aria-invalid={Boolean(errors.subject)}
                        aria-describedby={errors.subject ? 'subject-error' : undefined}
                        className="w-full bg-jl-darker border border-jl-card-border rounded px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-jl-purple transition-colors"
                        placeholder="What's this about?"
                      />
                      {errors.subject && <p id="subject-error" role="alert" className="mt-1 text-xs text-red-400">{errors.subject}</p>}
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-xs font-heading tracking-widest uppercase text-gray-400 mb-1.5">MESSAGE</label>
                      <textarea
                        id="message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={set('message')} minLength={10} maxLength={5000}
                        aria-invalid={Boolean(errors.message)}
                        aria-describedby={errors.message ? 'message-error' : undefined}
                        className="w-full bg-jl-darker border border-jl-card-border rounded px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-jl-purple transition-colors resize-none"
                        placeholder="Your message..."
                      />
                      {errors.message && <p id="message-error" role="alert" className="mt-1 text-xs text-red-400">{errors.message}</p>}
                    </div>
                    <button type="submit" disabled={status === 'sending'} className="btn-primary w-full text-xs py-3 disabled:cursor-not-allowed disabled:opacity-60">
                      {status === 'sending' ? 'SENDING…' : 'SEND MESSAGE'}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <CmsSections sections={sections} />
    </>
  )
}
