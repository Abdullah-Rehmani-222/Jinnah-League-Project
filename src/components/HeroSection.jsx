import { motion } from 'framer-motion'

export default function HeroSection({
  title,
  subtitle,
  description,
  primaryBtn,
  secondaryBtn,
  children,
}) {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, rgba(88, 28, 135, 0.6) 0%, rgba(30, 10, 60, 0.4) 40%, transparent 70%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, rgba(139, 92, 246, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl gradient-text-pink mb-2 leading-tight"
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-heading font-bold text-lg md:text-xl tracking-[0.2em] uppercase text-gray-200 mb-3"
          >
            {subtitle}
          </motion.p>
        )}

        {description && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="font-heading text-xs md:text-sm tracking-[0.15em] uppercase text-jl-purple mb-8"
          >
            {description}
          </motion.p>
        )}

        {(primaryBtn || secondaryBtn) && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            {primaryBtn}
            {secondaryBtn}
          </motion.div>
        )}

        {children}
      </div>
    </section>
  )
}
