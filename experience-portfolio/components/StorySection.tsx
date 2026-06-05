'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

type StoryProps = {
  paragraphs: string[]
}

export default function StorySection({ paragraphs }: StoryProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="story" className="relative py-32 md:py-48 px-6" ref={ref}>
      <div className="max-w-3xl mx-auto">
        {paragraphs.map((paragraph, index) => (
          <motion.p
            key={`${index}-${paragraph.slice(0, 20)}`}
            className="font-body text-[#a1a1aa] text-lg md:text-xl leading-relaxed"
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            {paragraph}
          </motion.p>
        ))}
      </div>
    </section>
  )
}
