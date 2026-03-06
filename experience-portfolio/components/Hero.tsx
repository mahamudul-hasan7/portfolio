'use client'

import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background: gradient + subtle grid (WebGL placeholder) */}
      <div className="absolute inset-0 bg-gradient-to-b from-deep via-surface to-deep" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.p
          className="font-body text-accent text-sm md:text-base tracking-[0.3em] uppercase mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Hi, I&apos;m
        </motion.p>
        <motion.h1
          className="font-display font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-[#f5f5f7]"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Rakib
        </motion.h1>
        <motion.p
          className="font-display font-semibold text-xl sm:text-2xl md:text-3xl text-[#a1a1aa] mt-4 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          I build immersive digital experiences.
        </motion.p>
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 mt-12"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          <a
            href="#work"
            className="group px-8 py-4 rounded-full bg-accent text-deep font-semibold text-sm tracking-wide hover:bg-accent/90 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(0,255,136,0.3)]"
          >
            Explore Work
          </a>
          <a
            href="#story"
            className="group px-8 py-4 rounded-full border border-white/20 text-[#f5f5f7] font-medium text-sm tracking-wide hover:border-accent/50 hover:text-accent transition-all duration-300"
          >
            Enter Experience
          </a>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <span className="text-xs text-[#71717a] tracking-widest uppercase">Scroll</span>
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2"
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <div className="w-1 h-2 rounded-full bg-accent" />
        </motion.div>
      </motion.div>
    </section>
  )
}
