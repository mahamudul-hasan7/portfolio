'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'

export default function ContactSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [sent, setSent] = useState(false)

  return (
    <section id="contact" className="relative py-24 md:py-32 px-6" ref={ref}>
      <div className="max-w-xl mx-auto">
        <motion.h2
          className="font-display font-bold text-3xl md:text-4xl text-[#f5f5f7] mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Get in Touch
        </motion.h2>
        <motion.p
          className="font-body text-[#a1a1aa] text-lg mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Have a project in mind? Say hello.
        </motion.p>

        {sent ? (
          <motion.div
            className="p-8 rounded-2xl bg-accent/10 border border-accent/30 text-accent font-medium text-center"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            Thanks! I&apos;ll get back to you soon.
          </motion.div>
        ) : (
          <motion.form
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={(e) => {
              e.preventDefault()
              setSent(true)
            }}
          >
            <div>
              <label htmlFor="name" className="block font-medium text-sm text-[#a1a1aa] mb-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                className="w-full px-5 py-4 rounded-xl bg-card border border-white/10 text-[#f5f5f7] placeholder-[#71717a] focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block font-medium text-sm text-[#a1a1aa] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-5 py-4 rounded-xl bg-card border border-white/10 text-[#f5f5f7] placeholder-[#71717a] focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label htmlFor="message" className="block font-medium text-sm text-[#a1a1aa] mb-2">
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                required
                className="w-full px-5 py-4 rounded-xl bg-card border border-white/10 text-[#f5f5f7] placeholder-[#71717a] focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all resize-none"
                placeholder="Your message..."
              />
            </div>
            <motion.button
              type="submit"
              className="w-full py-4 rounded-xl bg-accent text-deep font-semibold text-sm tracking-wide hover:bg-accent/90 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Send Message
            </motion.button>
          </motion.form>
        )}
      </div>
    </section>
  )
}
