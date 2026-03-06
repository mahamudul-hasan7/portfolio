'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'

const categories = ['Frontend', 'Backend', 'Tools'] as const
const skills: Record<string, string[]> = {
  Frontend: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Framer Motion'],
  Backend: ['Node.js', 'Python', 'REST APIs'],
  Tools: ['Git', 'VS Code', 'Figma'],
}

export default function SkillsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [filter, setFilter] = useState<string>('Frontend')

  return (
    <section id="work" className="relative py-24 md:py-32 px-6" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <motion.h2
          className="font-display font-bold text-3xl md:text-4xl text-[#f5f5f7] mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Skills
        </motion.h2>
        <motion.p
          className="font-body text-[#a1a1aa] text-lg mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Filter by area — hover for focus.
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-2 mb-10"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${
                filter === cat
                  ? 'bg-accent text-deep'
                  : 'bg-card border border-white/10 text-[#a1a1aa] hover:border-accent/30 hover:text-[#f5f5f7]'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        <motion.div
          className="flex flex-wrap gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {skills[filter]?.map((skill, i) => (
            <motion.span
              key={skill}
              className="px-5 py-3 rounded-xl bg-card border border-white/10 text-[#f5f5f7] font-medium text-sm hover:border-accent/40 hover:bg-accent/10 transition-colors duration-300"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.4 + i * 0.05, duration: 0.4 }}
            >
              {skill}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
