'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'

type ContactProps = {
  title: string
  intro: string
  successMessage: string
}

export default function ContactSection({ title, intro, successMessage }: ContactProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')

  return (
    <section id="contact" className="relative py-24 md:py-32 px-6" ref={ref}>
      <div className="max-w-xl mx-auto">
        <motion.h2
          className="font-display font-bold text-3xl md:text-4xl text-[#f5f5f7] mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {title}
        </motion.h2>
        <motion.p
          className="font-body text-[#a1a1aa] text-lg mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {intro}
        </motion.p>

        {sent ? (
          <motion.div
            className="p-8 rounded-2xl bg-accent/10 border border-accent/30 text-accent font-medium text-center"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            {successMessage}
          </motion.div>
        ) : (
          <motion.form
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={async (e) => {
              e.preventDefault()
              setError('')

              if (honeypot.trim()) {
                setSent(true)
                return
              }

              setSending(true)
              try {
                const response = await fetch('/api/contact', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name, email, message, _hp: honeypot }),
                })

                if (!response.ok) {
                  const result = (await response.json().catch(() => null)) as { error?: string } | null
                  throw new Error(result?.error || 'Message could not be sent')
                }

                setSent(true)
              } catch (submitError) {
                setError(submitError instanceof Error ? submitError.message : 'Message could not be sent')
              } finally {
                setSending(false)
              }
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
                value={name}
                onChange={(event) => setName(event.target.value)}
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
                value={email}
                onChange={(event) => setEmail(event.target.value)}
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
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="w-full px-5 py-4 rounded-xl bg-card border border-white/10 text-[#f5f5f7] placeholder-[#71717a] focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all resize-none"
                placeholder="Your message..."
              />
            </div>
            <input
              type="text"
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
              autoComplete="off"
              tabIndex={-1}
              aria-hidden="true"
              className="hidden"
              name="website"
            />
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            <motion.button
              type="submit"
              className="w-full py-4 rounded-xl bg-accent text-deep font-semibold text-sm tracking-wide hover:bg-accent/90 transition-colors disabled:opacity-60"
              disabled={sending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {sending ? 'Sending...' : 'Send Message'}
            </motion.button>
          </motion.form>
        )}
      </div>
    </section>
  )
}
