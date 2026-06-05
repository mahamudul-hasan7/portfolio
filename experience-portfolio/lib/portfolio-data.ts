import { randomUUID } from 'crypto'
import fs from 'fs/promises'
import path from 'path'

export type SkillsGroup = {
  name: string
  skills: string[]
}

export type ProjectItem = {
  id: string
  title: string
  desc: string
  stack: string
  live: string
  code: string
}

export type SiteContent = {
  hero: {
    eyebrow: string
    name: string
    title: string
    primaryCta: { label: string; href: string }
    secondaryCta: { label: string; href: string }
  }
  story: {
    paragraphs: string[]
  }
  skills: {
    title: string
    intro: string
    groups: SkillsGroup[]
    defaultGroup: string
  }
  projects: {
    title: string
    intro: string
    items: ProjectItem[]
  }
  contact: {
    title: string
    intro: string
    successMessage: string
  }
}

export type ContactMessage = {
  id: string
  name: string
  email: string
  message: string
  createdAt: string
  status: 'unread' | 'read'
  source: 'website'
}

export type PortfolioStore = {
  content: SiteContent
  messages: ContactMessage[]
}

const storeFilePath = path.join(process.cwd(), 'data', 'portfolio-store.json')

const defaultContent: SiteContent = {
  hero: {
    eyebrow: "Hi, I'm",
    name: 'Rakib',
    title: 'I build immersive digital experiences.',
    primaryCta: { label: 'Explore Work', href: '#work' },
    secondaryCta: { label: 'Enter Experience', href: '#story' },
  },
  story: {
    paragraphs: [
      "I'm a Creative Engineer and CSE student at United International University. I don't just write code — I craft experiences that feel alive: smooth scrolls, thoughtful motion, and interfaces that respond to you.",
      'This site is built with Next.js, Framer Motion, and a focus on performance. Scroll-triggered reveals and a cinematic hero set the tone — more layers (GSAP, Three.js) can be added step by step.',
    ],
  },
  skills: {
    title: 'Skills',
    intro: 'Filter by area — hover for focus.',
    defaultGroup: 'Frontend',
    groups: [
      { name: 'Frontend', skills: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Framer Motion'] },
      { name: 'Backend', skills: ['Node.js', 'Python', 'REST APIs'] },
      { name: 'Tools', skills: ['Git', 'VS Code', 'Figma'] },
    ],
  },
  projects: {
    title: 'Selected Work',
    intro: 'Premium showcase — add hover distortion & dedicated case study pages in Phase 3.',
    items: [
      {
        id: randomUUID(),
        title: 'Portfolio Experience',
        desc: 'This site — cinematic hero, smooth scroll, premium stack.',
        stack: 'Next.js · Tailwind · Framer Motion',
        live: '#',
        code: 'https://github.com/yourusername/experience-portfolio',
      },
      {
        id: randomUUID(),
        title: 'Project Two',
        desc: 'Add your next project: hover distortion & case study page ready.',
        stack: 'React · Node · MongoDB',
        live: '#',
        code: '#',
      },
    ],
  },
  contact: {
    title: 'Get in Touch',
    intro: 'Have a project in mind? Say hello.',
    successMessage: "Thanks! I\'ll get back to you soon.",
  },
}

function defaultStore(): PortfolioStore {
  return {
    content: defaultContent,
    messages: [],
  }
}

function ensureString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') {
    return value.trim()
  }
  return fallback
}

function sanitizeHref(value: unknown, fallback = '#'): string {
  const href = ensureString(value, fallback)
  if (!href) {
    return fallback
  }

  if (href.startsWith('#') || href.startsWith('/') || href.startsWith('mailto:')) {
    return href
  }

  try {
    const url = new URL(href)
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.toString()
    }
  } catch {
    return fallback
  }

  return fallback
}

function sanitizeSkills(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return []
  }

  return values
    .map((value) => ensureString(value))
    .filter(Boolean)
    .slice(0, 16)
}

function sanitizeContent(input: Partial<SiteContent> | undefined): SiteContent {
  const safe = input ?? {}
  const hero = safe.hero ?? defaultContent.hero
  const story = safe.story ?? defaultContent.story
  const skills = safe.skills ?? defaultContent.skills
  const projects = safe.projects ?? defaultContent.projects
  const contact = safe.contact ?? defaultContent.contact

  return {
    hero: {
      eyebrow: ensureString(hero.eyebrow, defaultContent.hero.eyebrow),
      name: ensureString(hero.name, defaultContent.hero.name),
      title: ensureString(hero.title, defaultContent.hero.title),
      primaryCta: {
        label: ensureString(hero.primaryCta?.label, defaultContent.hero.primaryCta.label),
        href: sanitizeHref(hero.primaryCta?.href, defaultContent.hero.primaryCta.href),
      },
      secondaryCta: {
        label: ensureString(hero.secondaryCta?.label, defaultContent.hero.secondaryCta.label),
        href: sanitizeHref(hero.secondaryCta?.href, defaultContent.hero.secondaryCta.href),
      },
    },
    story: {
      paragraphs: Array.isArray(story.paragraphs)
        ? story.paragraphs.map((paragraph) => ensureString(paragraph)).filter(Boolean).slice(0, 4)
        : defaultContent.story.paragraphs,
    },
    skills: {
      title: ensureString(skills.title, defaultContent.skills.title),
      intro: ensureString(skills.intro, defaultContent.skills.intro),
      defaultGroup: ensureString(skills.defaultGroup, defaultContent.skills.defaultGroup),
      groups: Array.isArray(skills.groups)
        ? skills.groups
            .map((group) => ({
              name: ensureString(group?.name),
              skills: sanitizeSkills(group?.skills),
            }))
            .filter((group) => group.name)
            .slice(0, 6)
        : defaultContent.skills.groups,
    },
    projects: {
      title: ensureString(projects.title, defaultContent.projects.title),
      intro: ensureString(projects.intro, defaultContent.projects.intro),
      items: Array.isArray(projects.items)
        ? projects.items
            .map((item) => ({
              id: ensureString(item?.id) || randomUUID(),
              title: ensureString(item?.title),
              desc: ensureString(item?.desc),
              stack: ensureString(item?.stack),
              live: sanitizeHref(item?.live, '#'),
              code: sanitizeHref(item?.code, '#'),
            }))
            .filter((item) => item.title)
            .slice(0, 8)
        : defaultContent.projects.items,
    },
    contact: {
      title: ensureString(contact.title, defaultContent.contact.title),
      intro: ensureString(contact.intro, defaultContent.contact.intro),
      successMessage: ensureString(contact.successMessage, defaultContent.contact.successMessage),
    },
  }
}

async function ensureStoreExists(): Promise<void> {
  await fs.mkdir(path.dirname(storeFilePath), { recursive: true })
  try {
    await fs.access(storeFilePath)
  } catch {
    const seed = JSON.stringify(defaultStore(), null, 2)
    await fs.writeFile(storeFilePath, seed, 'utf8')
  }
}

export async function getPortfolioStore(): Promise<PortfolioStore> {
  await ensureStoreExists()
  const raw = await fs.readFile(storeFilePath, 'utf8')
  try {
    const parsed = JSON.parse(raw) as Partial<PortfolioStore>
    return {
      content: sanitizeContent(parsed.content),
      messages: Array.isArray(parsed.messages)
        ? parsed.messages
            .map((message) => ({
              id: ensureString(message?.id) || randomUUID(),
              name: ensureString(message?.name),
              email: ensureString(message?.email),
              message: ensureString(message?.message),
              createdAt: ensureString(message?.createdAt) || new Date().toISOString(),
              status: message?.status === 'read' ? 'read' : 'unread',
              source: 'website' as const,
            }))
            .filter((message) => message.name && message.email && message.message)
        : [],
    }
  } catch {
    return defaultStore()
  }
}

export async function savePortfolioStore(store: PortfolioStore): Promise<PortfolioStore> {
  await ensureStoreExists()
  const normalized: PortfolioStore = {
    content: sanitizeContent(store.content),
    messages: Array.isArray(store.messages)
      ? store.messages.map((message) => ({
          id: ensureString(message.id) || randomUUID(),
          name: ensureString(message.name),
          email: ensureString(message.email),
          message: ensureString(message.message),
          createdAt: ensureString(message.createdAt) || new Date().toISOString(),
          status: message.status === 'read' ? 'read' : 'unread',
          source: 'website',
        }))
      : [],
  }

  await fs.writeFile(storeFilePath, JSON.stringify(normalized, null, 2), 'utf8')
  return normalized
}

export async function updatePortfolioContent(nextContent: Partial<SiteContent>): Promise<SiteContent> {
  const store = await getPortfolioStore()
  const updated = sanitizeContent({ ...store.content, ...nextContent })
  await savePortfolioStore({ ...store, content: updated })
  return updated
}

export async function addContactMessage(input: { name: string; email: string; message: string }): Promise<ContactMessage> {
  const store = await getPortfolioStore()
  const message: ContactMessage = {
    id: randomUUID(),
    name: ensureString(input.name),
    email: ensureString(input.email),
    message: ensureString(input.message),
    createdAt: new Date().toISOString(),
    status: 'unread',
    source: 'website',
  }

  store.messages = [message, ...store.messages].slice(0, 200)
  await savePortfolioStore(store)
  return message
}

export async function setMessageStatus(id: string, status: 'read' | 'unread'): Promise<ContactMessage | null> {
  const store = await getPortfolioStore()
  const index = store.messages.findIndex((message) => message.id === id)
  if (index === -1) {
    return null
  }

  store.messages[index] = { ...store.messages[index], status }
  await savePortfolioStore(store)
  return store.messages[index]
}

export async function deleteMessage(id: string): Promise<boolean> {
  const store = await getPortfolioStore()
  const nextMessages = store.messages.filter((message) => message.id !== id)
  if (nextMessages.length === store.messages.length) {
    return false
  }

  store.messages = nextMessages
  await savePortfolioStore(store)
  return true
}

export function getDefaultSiteContent(): SiteContent {
  return defaultContent
}
