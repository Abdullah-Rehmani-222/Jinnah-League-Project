import { motion } from 'framer-motion'
import SectionHeading from './SectionHeading'
import SectionDivider from './SectionDivider'
import SmartLink from './SmartLink'
import { fileUrl } from '../lib/publicApi'

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }

function Body({ text, className = '' }) {
  if (!text) return null
  return (
    <div className={`space-y-4 text-sm leading-relaxed text-gray-300 ${className}`}>
      {String(text).split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
    </div>
  )
}

function Section({ section }) {
  const { sectionType: type, title, content: c = {} } = section
  const items = Array.isArray(c.items) ? c.items : []
  const width = type === 'cards' || type === 'stats' ? 'max-w-6xl' : 'max-w-4xl'

  return (
    <section className="py-20">
      <div className={`${width} mx-auto px-4 sm:px-6 lg:px-8`}>
        {title && <SectionHeading>{title}</SectionHeading>}

        {type === 'text' && <div className="mt-8 text-center"><Body text={c.body} /></div>}

        {type === 'cards' && (
          <>
            <Body text={c.body} className="mt-6 text-center" />
            <motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((it, i) => (
                <motion.div key={i} variants={item} className="rounded-lg border border-jl-card-border bg-jl-card p-6 transition-all duration-300 hover:border-jl-purple/40">
                  <h3 className="mb-2 font-heading text-sm font-bold uppercase tracking-widest text-white">{it.title}</h3>
                  <p className="text-xs leading-relaxed text-gray-400">{it.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}

        {type === 'stats' && (
          <>
            <Body text={c.body} className="mt-6 text-center" />
            <motion.dl variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
              {items.map((it, i) => (
                <motion.div key={i} variants={item} className="text-center">
                  <dd className="font-heading text-2xl font-bold text-white md:text-3xl">{it.value}</dd>
                  <dt className="mt-1 font-heading text-xs uppercase tracking-widest text-gray-400">{it.label}</dt>
                </motion.div>
              ))}
            </motion.dl>
          </>
        )}

        {type === 'timeline' && (
          <>
            <Body text={c.body} className="mt-6 text-center" />
            <ol className="mt-10 space-y-6 border-l border-jl-purple/30 pl-6">
              {items.map((it, i) => (
                <li key={i} className="relative">
                  <span aria-hidden="true" className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full bg-jl-pink" />
                  {it.year && <p className="font-heading text-xs tracking-widest text-jl-purple">{it.year}</p>}
                  <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-white">{it.title}</h3>
                  <p className="mt-1 text-sm text-gray-400">{it.description}</p>
                </li>
              ))}
            </ol>
          </>
        )}

        {type === 'image' && c.imageUrl && (
          <figure className="mt-8">
            <img src={fileUrl(c.imageUrl)} alt={c.altText || ''} loading="lazy" className="mx-auto max-h-[32rem] w-full rounded-lg border border-jl-card-border object-cover" />
            {c.body && <figcaption className="mt-3 text-center text-xs text-gray-400">{c.body}</figcaption>}
          </figure>
        )}

        {type === 'cta' && (
          <div className="mt-6 text-center">
            <Body text={c.body} />
            {c.buttonUrl && c.buttonText && <SmartLink href={c.buttonUrl} className="btn-primary mt-8">{c.buttonText}</SmartLink>}
          </div>
        )}
      </div>
    </section>
  )
}

/** Renders the published sections of a CMS page, each separated by the site's divider. */
export default function CmsSections({ sections = [], leadingDivider = false }) {
  if (!sections.length) return null
  return (
    <>
      {leadingDivider && <SectionDivider />}
      {sections.map((s, i) => (
        <div key={s.id}>
          {i > 0 && <SectionDivider />}
          <Section section={s} />
        </div>
      ))}
    </>
  )
}
