'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function StorySection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="story" className="relative py-32 md:py-48 px-6" ref={ref}>
      <div className="max-w-3xl mx-auto">
        <motion.p
          className="font-body text-[#a1a1aa] text-lg md:text-xl leading-relaxed"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          I&apos;m a <span className="text-accent font-medium">Creative Engineer</span> and CSE student at United International University.
          I don&apos;t just write code — I craft experiences that feel alive: smooth scrolls, thoughtful motion, and interfaces that respond to you.
        </motion.p>
        <motion.p
          className="font-body text-[#a1a1aa] text-lg md:text-xl leading-relaxed mt-8"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          This site is built with Next.js, Framer Motion, and a focus on performance. Scroll-triggered reveals and a cinematic hero set the tone — more layers (GSAP, Three.js) can be added step by step.
        </motion.p>
      </div>
    </section>
  )
}
