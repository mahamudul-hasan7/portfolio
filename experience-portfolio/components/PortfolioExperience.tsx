'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Loader from '@/components/Loader'
import Hero from '@/components/Hero'
import StorySection from '@/components/StorySection'
import SkillsSection from '@/components/SkillsSection'
import ProjectsSection from '@/components/ProjectsSection'
import ContactSection from '@/components/ContactSection'
import type { SiteContent } from '@/lib/portfolio-data'

type PortfolioExperienceProps = {
  content: SiteContent
}

export default function PortfolioExperience({ content }: PortfolioExperienceProps) {
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
        <Hero content={content.hero} />
        <StorySection paragraphs={content.story.paragraphs} />
        <SkillsSection
          title={content.skills.title}
          intro={content.skills.intro}
          defaultGroup={content.skills.defaultGroup}
          groups={content.skills.groups}
        />
        <ProjectsSection title={content.projects.title} intro={content.projects.intro} items={content.projects.items} />
        <ContactSection title={content.contact.title} intro={content.contact.intro} successMessage={content.contact.successMessage} />
      </motion.main>
    </>
  )
}
