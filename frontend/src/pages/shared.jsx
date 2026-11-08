import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SectionHeading from '../components/SectionHeading'

export const card =
  'bg-jl-card border border-jl-card-border rounded-lg p-5 hover:border-jl-purple/40 transition-colors duration-300'

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export const Stagger = ({ className, children }) => (
  <motion.div
    variants={containerVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-50px' }}
    className={className}
  >
    {children}
  </motion.div>
)

export const Item = ({ className, children }) => (
  <motion.div variants={itemVariants} className={className}>
    {children}
  </motion.div>
)

/** Internal route button, or an external link when `href` is given. */
export function CtaButton({ to, href, variant = 'primary', children }) {
  const cls = variant === 'primary' ? 'btn-primary' : 'btn-outline'
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>
  ) : (
    <Link to={to} className={cls}>{children}</Link>
  )
}

export function Section({ width = 'max-w-5xl', className = '', children }) {
  return (
    <section className={`py-16 ${className}`}>
      <div className={`${width} mx-auto px-4 sm:px-6 lg:px-8`}>{children}</div>
    </section>
  )
}

export function CtaSection({ title, subtitle, primary, secondary }) {
  return (
    <section className="py-20">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <SectionHeading subtitle={subtitle}>{title}</SectionHeading>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {primary && <CtaButton {...primary}>{primary.label}</CtaButton>}
          {secondary && <CtaButton {...secondary} variant="outline">{secondary.label}</CtaButton>}
        </div>
      </div>
    </section>
  )
}

/** Small "VIEW PROFILE" style link; renders nothing when there is no URL, so no dead links. */
export function ProfileLink({ url, children }) {
  if (!url) return null
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
       className="inline-block mt-3 text-[11px] font-heading tracking-widest uppercase text-jl-purple hover:text-jl-pink transition-colors">
      {children} →
    </a>
  )
}
