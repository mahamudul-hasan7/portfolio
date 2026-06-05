'use client'

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import type { ContactMessage, PortfolioStore, SiteContent } from '@/lib/portfolio-data'

type Mode = 'loading' | 'login' | 'dashboard'

type Credentials = {
  username: string
  password: string
}

const emptyContent: SiteContent = {
  hero: {
    eyebrow: '',
    name: '',
    title: '',
    primaryCta: { label: '', href: '' },
    secondaryCta: { label: '', href: '' },
  },
  story: { paragraphs: [''] },
  skills: { title: '', intro: '', defaultGroup: '', groups: [{ name: '', skills: [''] }] },
  projects: { title: '', intro: '', items: [{ id: '', title: '', desc: '', stack: '', live: '', code: '' }] },
  contact: { title: '', intro: '', successMessage: '' },
}

function cloneContent(content: SiteContent): SiteContent {
  return JSON.parse(JSON.stringify(content)) as SiteContent
}

function createId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function splitSkills(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function joinSkills(values: string[]): string {
  return values.join(', ')
}

export default function AdminPage() {
  const [mode, setMode] = useState<Mode>('loading')
  const [credentials, setCredentials] = useState<Credentials>({ username: '', password: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [store, setStore] = useState<PortfolioStore | null>(null)
  const [draft, setDraft] = useState<SiteContent>(emptyContent)

  async function loadDashboard() {
    setLoadingData(true)
    setError('')
    try {
      const response = await fetch('/api/admin/content', { credentials: 'include' })
      if (response.status === 401) {
        setMode('login')
        setStore(null)
        return
      }

      if (!response.ok) {
        throw new Error('Failed to load admin data')
      }

      const data = (await response.json()) as PortfolioStore
      setStore(data)
      setDraft(cloneContent(data.content))
      setMode('dashboard')
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load admin data')
      setMode('login')
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    void loadDashboard()
  }, [])

  const unreadCount = useMemo(
    () => (store?.messages ?? []).filter((message) => message.status === 'unread').length,
    [store],
  )

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(result?.error || 'Login failed')
      }

      await loadDashboard()
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed')
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setStore(null)
    setDraft(emptyContent)
    setMode('login')
  }

  async function saveContent() {
    setSaving(true)
    setError('')
    try {
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: draft }),
      })

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(result?.error || 'Save failed')
      }

      const result = (await response.json()) as { content: SiteContent }
      setDraft(cloneContent(result.content))
      await loadDashboard()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function updateMessage(id: string, status: 'read' | 'unread') {
    await fetch(`/api/admin/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    })
    await loadDashboard()
  }

  async function removeMessage(id: string) {
    await fetch(`/api/admin/messages/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    await loadDashboard()
  }

  const content = draft

  if (mode === 'loading') {
    return (
      <main className="min-h-screen bg-deep px-4 py-8 text-[#f5f5f7]">
        <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center rounded-3xl border border-white/10 bg-card/80">
          <p className="text-sm text-[#a1a1aa]">Loading admin session...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-deep via-surface to-deep text-[#f5f5f7] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-white/10 bg-card/80 p-6 backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-accent">Admin Panel</p>
              <h1 className="mt-2 text-3xl font-bold font-display">Portfolio Control Center</h1>
              <p className="mt-2 text-sm text-[#a1a1aa]">Update content, moderate messages, and keep the site locked down.</p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-white/10 px-4 py-2 text-[#a1a1aa]">Unread: {unreadCount}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-white/10 px-4 py-2 hover:border-accent/50 hover:text-accent"
              >
                Logout
              </button>
            </div>
          </div>
          {error ? <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}
        </header>

        {mode !== 'dashboard' ? (
          <section className="mx-auto max-w-md rounded-3xl border border-white/10 bg-card p-6 shadow-2xl shadow-black/30">
            <h2 className="text-2xl font-semibold">Admin Login</h2>
            <p className="mt-2 text-sm text-[#a1a1aa]">Sign in with your private admin credentials.</p>
            <form className="mt-6 space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="mb-2 block text-sm text-[#a1a1aa]" htmlFor="username">Username</label>
                <input
                  id="username"
                  value={credentials.username}
                  onChange={(event) => setCredentials((current) => ({ ...current, username: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-deep px-4 py-3 outline-none focus:border-accent/50"
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-[#a1a1aa]" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-deep px-4 py-3 outline-none focus:border-accent/50"
                  autoComplete="current-password"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-deep transition-colors hover:bg-accent/90"
                disabled={loadingData}
              >
                {loadingData ? 'Checking...' : 'Sign In'}
              </button>
            </form>
          </section>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
            <section className="space-y-6">
              <Panel title="Hero">
                <Field label="Eyebrow" value={content.hero.eyebrow} onChange={(value) => setDraft((current) => ({ ...current, hero: { ...current.hero, eyebrow: value } }))} />
                <Field label="Name" value={content.hero.name} onChange={(value) => setDraft((current) => ({ ...current, hero: { ...current.hero, name: value } }))} />
                <Field label="Title" value={content.hero.title} onChange={(value) => setDraft((current) => ({ ...current, hero: { ...current.hero, title: value } }))} multiline />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Primary CTA Label" value={content.hero.primaryCta.label} onChange={(value) => setDraft((current) => ({ ...current, hero: { ...current.hero, primaryCta: { ...current.hero.primaryCta, label: value } } }))} />
                  <Field label="Primary CTA Link" value={content.hero.primaryCta.href} onChange={(value) => setDraft((current) => ({ ...current, hero: { ...current.hero, primaryCta: { ...current.hero.primaryCta, href: value } } }))} />
                  <Field label="Secondary CTA Label" value={content.hero.secondaryCta.label} onChange={(value) => setDraft((current) => ({ ...current, hero: { ...current.hero, secondaryCta: { ...current.hero.secondaryCta, label: value } } }))} />
                  <Field label="Secondary CTA Link" value={content.hero.secondaryCta.href} onChange={(value) => setDraft((current) => ({ ...current, hero: { ...current.hero, secondaryCta: { ...current.hero.secondaryCta, href: value } } }))} />
                </div>
              </Panel>

              <Panel title="Story">
                <div className="space-y-4">
                  {content.story.paragraphs.map((paragraph, index) => (
                    <div key={`${index}-${paragraph.slice(0, 12)}`} className="space-y-2">
                      <Field
                        label={`Paragraph ${index + 1}`}
                        value={paragraph}
                        onChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            story: {
                              paragraphs: current.story.paragraphs.map((item, itemIndex) => (itemIndex === index ? value : item)),
                            },
                          }))
                        }
                        multiline
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            story: { paragraphs: current.story.paragraphs.filter((_, itemIndex) => itemIndex !== index) },
                          }))
                        }
                        className="text-sm text-red-300 hover:text-red-200"
                      >
                        Remove paragraph
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setDraft((current) => ({ ...current, story: { paragraphs: [...current.story.paragraphs, ''] } }))}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm hover:border-accent/50 hover:text-accent"
                  >
                    Add paragraph
                  </button>
                </div>
              </Panel>

              <Panel title="Skills">
                <Field label="Title" value={content.skills.title} onChange={(value) => setDraft((current) => ({ ...current, skills: { ...current.skills, title: value } }))} />
                <Field label="Intro" value={content.skills.intro} onChange={(value) => setDraft((current) => ({ ...current, skills: { ...current.skills, intro: value } }))} />
                <Field label="Default Group" value={content.skills.defaultGroup} onChange={(value) => setDraft((current) => ({ ...current, skills: { ...current.skills, defaultGroup: value } }))} />
                <div className="space-y-4">
                  {content.skills.groups.map((group, index) => (
                    <div key={`${index}-${group.name}`} className="rounded-2xl border border-white/10 p-4 space-y-3">
                      <div className="grid gap-3 md:grid-cols-[1fr_2fr]">
                        <Field
                          label="Group Name"
                          value={group.name}
                          onChange={(value) =>
                            setDraft((current) => ({
                              ...current,
                              skills: {
                                ...current.skills,
                                groups: current.skills.groups.map((item, itemIndex) => (itemIndex === index ? { ...item, name: value } : item)),
                              },
                            }))
                          }
                        />
                        <Field
                          label="Skills (comma separated)"
                          value={joinSkills(group.skills)}
                          onChange={(value) =>
                            setDraft((current) => ({
                              ...current,
                              skills: {
                                ...current.skills,
                                groups: current.skills.groups.map((item, itemIndex) =>
                                  itemIndex === index ? { ...item, skills: splitSkills(value) } : item,
                                ),
                              },
                            }))
                          }
                          multiline
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            skills: { ...current.skills, groups: current.skills.groups.filter((_, itemIndex) => itemIndex !== index) },
                          }))
                        }
                        className="text-sm text-red-300 hover:text-red-200"
                      >
                        Remove group
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        skills: { ...current.skills, groups: [...current.skills.groups, { name: 'New Group', skills: [''] }] },
                      }))
                    }
                    className="rounded-full border border-white/10 px-4 py-2 text-sm hover:border-accent/50 hover:text-accent"
                  >
                    Add group
                  </button>
                </div>
              </Panel>

              <Panel title="Projects">
                <Field label="Title" value={content.projects.title} onChange={(value) => setDraft((current) => ({ ...current, projects: { ...current.projects, title: value } }))} />
                <Field label="Intro" value={content.projects.intro} onChange={(value) => setDraft((current) => ({ ...current, projects: { ...current.projects, intro: value } }))} />
                <div className="space-y-4">
                  {content.projects.items.map((item, index) => (
                    <div key={item.id} className="rounded-2xl border border-white/10 p-4 space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <Field
                          label="Title"
                          value={item.title}
                          onChange={(value) =>
                            setDraft((current) => ({
                              ...current,
                              projects: {
                                ...current.projects,
                                items: current.projects.items.map((project, projectIndex) =>
                                  projectIndex === index ? { ...project, title: value } : project,
                                ),
                              },
                            }))
                          }
                        />
                        <Field
                          label="Stack"
                          value={item.stack}
                          onChange={(value) =>
                            setDraft((current) => ({
                              ...current,
                              projects: {
                                ...current.projects,
                                items: current.projects.items.map((project, projectIndex) =>
                                  projectIndex === index ? { ...project, stack: value } : project,
                                ),
                              },
                            }))
                          }
                        />
                        <Field
                          label="Live Link"
                          value={item.live}
                          onChange={(value) =>
                            setDraft((current) => ({
                              ...current,
                              projects: {
                                ...current.projects,
                                items: current.projects.items.map((project, projectIndex) =>
                                  projectIndex === index ? { ...project, live: value } : project,
                                ),
                              },
                            }))
                          }
                        />
                        <Field
                          label="Code Link"
                          value={item.code}
                          onChange={(value) =>
                            setDraft((current) => ({
                              ...current,
                              projects: {
                                ...current.projects,
                                items: current.projects.items.map((project, projectIndex) =>
                                  projectIndex === index ? { ...project, code: value } : project,
                                ),
                              },
                            }))
                          }
                        />
                      </div>
                      <Field
                        label="Description"
                        value={item.desc}
                        onChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            projects: {
                              ...current.projects,
                              items: current.projects.items.map((project, projectIndex) =>
                                projectIndex === index ? { ...project, desc: value } : project,
                              ),
                            },
                          }))
                        }
                        multiline
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            projects: { ...current.projects, items: current.projects.items.filter((_, projectIndex) => projectIndex !== index) },
                          }))
                        }
                        className="text-sm text-red-300 hover:text-red-200"
                      >
                        Remove project
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        projects: {
                          ...current.projects,
                          items: [
                            ...current.projects.items,
                            { id: createId(), title: '', desc: '', stack: '', live: '#', code: '#' },
                          ],
                        },
                      }))
                    }
                    className="rounded-full border border-white/10 px-4 py-2 text-sm hover:border-accent/50 hover:text-accent"
                  >
                    Add project
                  </button>
                </div>
              </Panel>

              <Panel title="Contact">
                <Field label="Title" value={content.contact.title} onChange={(value) => setDraft((current) => ({ ...current, contact: { ...current.contact, title: value } }))} />
                <Field label="Intro" value={content.contact.intro} onChange={(value) => setDraft((current) => ({ ...current, contact: { ...current.contact, intro: value } }))} />
                <Field label="Success Message" value={content.contact.successMessage} onChange={(value) => setDraft((current) => ({ ...current, contact: { ...current.contact, successMessage: value } }))} />
              </Panel>

              <div className="flex justify-end gap-3 pb-4">
                <button
                  type="button"
                  onClick={() => setDraft(store ? cloneContent(store.content) : emptyContent)}
                  className="rounded-full border border-white/10 px-5 py-3 text-sm hover:border-white/20"
                >
                  Reset Draft
                </button>
                <button
                  type="button"
                  onClick={saveContent}
                  className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-deep hover:bg-accent/90 disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Content'}
                </button>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-card p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-accent">Security</p>
                <h2 className="mt-2 text-xl font-semibold">Access and protection</h2>
                <ul className="mt-4 space-y-2 text-sm text-[#a1a1aa]">
                  <li>• Admin APIs require a signed httpOnly session cookie.</li>
                  <li>• Login is rate limited and backed by environment secrets.</li>
                  <li>• Contact submissions are honeypot filtered and rate limited.</li>
                  <li>• Links are sanitized before saving to the content store.</li>
                </ul>
              </div>

              <div className="rounded-3xl border border-white/10 bg-card p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-accent">Messages</p>
                <h2 className="mt-2 text-xl font-semibold">Inbox</h2>
                <div className="mt-4 space-y-3">
                  {(store?.messages ?? []).length === 0 ? (
                    <p className="text-sm text-[#a1a1aa]">No contact messages yet.</p>
                  ) : (
                    store?.messages.map((message: ContactMessage) => (
                      <article key={message.id} className="rounded-2xl border border-white/10 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">{message.name}</p>
                            <p className="text-xs text-[#a1a1aa]">{message.email}</p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] ${message.status === 'read' ? 'bg-white/10 text-[#a1a1aa]' : 'bg-accent/15 text-accent'}`}>
                            {message.status}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-[#f5f5f7] whitespace-pre-wrap">{message.message}</p>
                        <p className="mt-3 text-xs text-[#71717a]">{new Date(message.createdAt).toLocaleString()}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button type="button" onClick={() => updateMessage(message.id, message.status === 'read' ? 'unread' : 'read')} className="rounded-full border border-white/10 px-3 py-2 text-xs hover:border-accent/50 hover:text-accent">
                            Mark {message.status === 'read' ? 'Unread' : 'Read'}
                          </button>
                          <button type="button" onClick={() => removeMessage(message.id)} className="rounded-full border border-red-500/30 px-3 py-2 text-xs text-red-300 hover:border-red-400 hover:text-red-200">
                            Delete
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-card p-5 shadow-2xl shadow-black/20">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <span className="text-xs uppercase tracking-[0.25em] text-accent">Editable</span>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm text-[#a1a1aa]">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-deep px-4 py-3 text-sm outline-none focus:border-accent/50"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-deep px-4 py-3 text-sm outline-none focus:border-accent/50"
        />
      )}
    </label>
  )
}
