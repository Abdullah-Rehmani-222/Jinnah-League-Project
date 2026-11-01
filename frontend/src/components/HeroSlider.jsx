import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import HeroSection from './HeroSection'
import SmartLink from './SmartLink'
import { fileUrl, usePublic } from '../lib/publicApi'

const INTERVAL = 7000

const fallback = {
  title: 'JINNAH LEAGUE',
  subtitle: 'BIGGER. BOLDER. BETTER.',
  description: 'NATIONAL INTER-UNIVERSITY TECH & GAMING FESTIVAL • ACM MAJU STUDENT CHAPTER',
}
const fallbackButtons = {
  primaryBtn: <Link to="/jl26" className="btn-primary">EXPLORE JL'26</Link>,
  secondaryBtn: <Link to="/sponsors" className="btn-outline">PARTNER WITH US</Link>,
}

/** Homepage hero. Shows the published slides from the CMS; falls back to the built-in hero if there are none. */
export default function HeroSlider() {
  const { data } = usePublic('/hero-slides')
  const slides = data ?? []
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL)
    return () => clearInterval(t)
  }, [slides.length, index])

  if (!slides.length) return <HeroSection {...fallback} {...fallbackButtons} />

  const s = slides[index % slides.length]
  return (
    <div className="relative">
      <HeroSection
        key={s.id}
        title={s.title}
        subtitle={s.subtitle}
        description={s.description}
        image={s.mediaAsset ? fileUrl(s.mediaAsset) : undefined}
        primaryBtn={s.buttonUrl && s.buttonText ? <SmartLink href={s.buttonUrl} className="btn-primary">{s.buttonText.toUpperCase()}</SmartLink> : undefined}
      />
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-center gap-2" role="tablist" aria-label="Hero slides">
          {slides.map((sl, i) => (
            <button
              key={sl.id}
              role="tab"
              aria-selected={i === index}
              aria-label={`Slide ${i + 1}: ${sl.title}`}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === index ? 'w-6 bg-jl-pink' : 'w-2 bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
