'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const projects = [
  {
    title: 'Portfolio Experience',
    desc: 'This site — cinematic hero, smooth scroll, premium stack.',
    stack: 'Next.js · Tailwind · Framer Motion',
    live: '#',
    code: 'https://github.com/yourusername/experience-portfolio',
  },
  {
    title: 'Project Two',
    desc: 'Add your next project: hover distortion & case study page ready.',
    stack: 'React · Node · MongoDB',
    live: '#',
    code: '#',
  },
]

export default function ProjectsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="relative py-24 md:py-32 px-6" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <motion.h2
          className="font-display font-bold text-3xl md:text-4xl text-[#f5f5f7] mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Selected Work
        </motion.h2>
        <motion.p
          className="font-body text-[#a1a1aa] text-lg mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Premium showcase — add hover distortion & dedicated case study pages in Phase 3.
        </motion.p>

        <div className="space-y-8">
          {projects.map((p, i) => (
            <motion.article
              key={p.title}
              className="group relative rounded-2xl bg-card border border-white/10 p-8 md:p-10 hover:border-accent/30 transition-all duration-500 overflow-hidden"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <h3 className="font-display font-semibold text-xl md:text-2xl text-[#f5f5f7] mb-2 relative">
                {p.title}
              </h3>
              <p className="font-body text-[#a1a1aa] text-base mb-4 relative">{p.desc}</p>
              <p className="font-body text-accent text-sm mb-6 relative">{p.stack}</p>
              <div className="flex gap-4 relative">
                <a
                  href={p.live}
                  className="px-5 py-2.5 rounded-full bg-accent text-deep font-medium text-sm hover:bg-accent/90 transition-colors"
                >
                  Live
                </a>
                <a
                  href={p.code}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-full border border-white/20 text-[#f5f5f7] font-medium text-sm hover:border-accent/50 hover:text-accent transition-colors"
                >
                  Code
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
