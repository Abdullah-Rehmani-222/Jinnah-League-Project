import { motion } from 'framer-motion'

/**
 * Section title with an optional subheading.
 *
 * Keeping the subheading inside this component means every page gets the same
 * spacing, colour, and entrance animation instead of re-implementing a
 * <motion.p> with slightly different classes each time.
 */
export default function SectionHeading({ children, subtitle, className = '' }) {
  return (
    <>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
        className={`font-display text-3xl md:text-4xl lg:text-5xl text-center gradient-text-pink ${className}`}
      >
        {children}
      </motion.h2>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-4 mx-auto max-w-3xl text-center text-gray-300 text-sm md:text-base leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </>
  )
}
