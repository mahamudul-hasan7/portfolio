'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Hero from '@/components/Hero'
import StorySection from '@/components/StorySection'
import SkillsSection from '@/components/SkillsSection'
import ProjectsSection from '@/components/ProjectsSection'
import ContactSection from '@/components/ContactSection'
import Loader from '@/components/Loader'

export default function Home() {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      <Loader onComplete={() => setLoaded(true)} isVisible={!loaded} />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={loaded ? '' : 'pointer-events-none'}
      >
        <Hero />
        <StorySection />
        <SkillsSection />
        <ProjectsSection />
        <ContactSection />
      </motion.main>
    </>
  )
}
