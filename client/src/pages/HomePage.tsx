import { useQuery } from '@tanstack/react-query'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Download, Eye, Star, ExternalLink, Github,
  CheckCircle, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useInView } from 'framer-motion'
import api from '@/lib/api'
import { formatDate, formatViews } from '@/lib/utils'
import { toast } from 'sonner'
import { Seo } from '@/components/Seo'

// ── Intersection observer hook ─────────────────────────────────────────────
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: threshold })
  return { ref, isInView }
}

// ── Stagger container ──────────────────────────────────────────────────────
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const } },
}

// ── Count-up animation ─────────────────────────────────────────────────────
function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const duration = 1500
    const step = (to / duration) * 16
    const timer = setInterval(() => {
      start += step
      if (start >= to) { setCount(to); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [isInView, to])

  return <span ref={ref}>{count}{suffix}</span>
}

// ── Typewriter ─────────────────────────────────────────────────────────────
const ROLES = ['Full Stack Developer', 'UI/UX Designer', 'Open Source Enthusiast', 'Problem Solver']

function Typewriter() {
  const [roleIdx, setRoleIdx] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = ROLES[roleIdx]
    let timeout: ReturnType<typeof setTimeout>
    if (!deleting && text === current) {
      timeout = setTimeout(() => setDeleting(true), 2000)
    } else if (deleting && text === '') {
      setDeleting(false)
      setRoleIdx((i) => (i + 1) % ROLES.length)
    } else {
      timeout = setTimeout(
        () => setText(deleting ? text.slice(0, -1) : current.slice(0, text.length + 1)),
        deleting ? 40 : 80
      )
    }
    return () => clearTimeout(timeout)
  }, [text, deleting, roleIdx])

  return (
    <span className="text-brand">
      {text}
      <span className="animate-pulse">|</span>
    </span>
  )
}

// ── Magnetic button ────────────────────────────────────────────────────────
function MagneticButton({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 350, damping: 25 })
  const sy = useSpring(y, { stiffness: 350, damping: 25 })

  const handleMouse = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3)
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3)
  }, [x, y])

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── Floating tech icon ─────────────────────────────────────────────────────
function FloatingIcon({ label, style }: { label: string; style: React.CSSProperties }) {
  return (
    <motion.div
      className="absolute hidden lg:flex items-center gap-2 bg-white/10 dark:bg-zinc-900/80 backdrop-blur-md border border-white/20 dark:border-zinc-700/50 rounded-2xl px-4 py-2 text-sm font-medium shadow-lg"
      style={style}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 2 }}
    >
      <span className="text-brand font-bold text-xs">⚡</span>
      {label}
    </motion.div>
  )
}

// ── Main HomePage ──────────────────────────────────────────────────────────
export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['home'],
    queryFn: () => api.get('/public/home').then((r) => r.data),
  })

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const gradX = useSpring(useTransform(mouseX, [0, window.innerWidth], ['20%', '80%']), { stiffness: 80, damping: 20 })
  const gradY = useSpring(useTransform(mouseY, [0, window.innerHeight], ['20%', '80%']), { stiffness: 80, damping: 20 })

  useEffect(() => {
    const move = (e: MouseEvent) => { mouseX.set(e.clientX); mouseY.set(e.clientY) }
    window.addEventListener('mousemove', move, { passive: true })
    return () => window.removeEventListener('mousemove', move)
  }, [mouseX, mouseY])

  // Contact form state
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)

  async function sendContact(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    try {
      await api.post('/public/contact', form)
      toast.success('Message sent! I\'ll get back to you soon.')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      toast.error('Failed to send. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (isLoading) return <div className="min-h-screen bg-zinc-950" />

  const {
    hero, services = [], featuredProjects = [], about, skills = [],
    testimonials = [], blogPosts = [], experiences = [], educations = [],
    featuredCerts = [], contactSection, contactLinks = [], stats
  } = data || {}

  const TECH_ICONS = [
    { label: 'React 19', style: { top: '15%', left: '5%' } },
    { label: 'Node.js', style: { top: '25%', right: '8%' } },
    { label: 'TypeScript', style: { bottom: '35%', left: '3%' } },
    { label: 'PostgreSQL', style: { bottom: '25%', right: '5%' } },
  ]

  return (
    <>
      <Seo 
        title="Home"
        description={hero?.subheadline?.replace(/<[^>]+>/g, '') || "Welcome to my portfolio"}
        image={hero?.heroImage}
        url="/"
      />
      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section id="hero" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Mouse-following gradient */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: `radial-gradient(600px circle at ${gradX.get()} ${gradY.get()}, rgba(255,107,43,0.08), transparent 60%)`,
          }}
        />

        {/* Animated background dots */}
        <div className="absolute inset-0 z-0 opacity-30 dark:opacity-20"
          style={{ backgroundImage: 'radial-gradient(#FF6B2B 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />

        {/* Floating blobs */}
        <motion.div
          className="absolute top-1/4 right-10 w-80 h-80 rounded-full bg-brand/10 blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.1, 1], x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 left-10 w-64 h-64 rounded-full bg-zinc-200/50 dark:bg-zinc-800/30 blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.15, 1], y: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        {/* Floating tech icons */}
        {TECH_ICONS.map((t) => <FloatingIcon key={t.label} {...t} />)}

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-16 md:py-24 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.p
                className="text-sm font-medium text-brand tracking-widest uppercase mb-4 flex items-center gap-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="inline-block w-2 h-2 rounded-full bg-brand animate-pulse" />
                {hero?.availabilityText || 'Open to opportunities'}
              </motion.p>

              <h1 className="font-bold text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-4">
                <motion.span
                  className="block text-foreground"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  Hi, I'm{' '}
                  <span className="text-gradient">Nishanth</span>
                </motion.span>
              </h1>

              <motion.div
                className="text-2xl md:text-3xl font-semibold text-muted-foreground mb-6 min-h-[2.5rem]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Typewriter />
              </motion.div>

              <motion.p
                className="text-lg text-muted-foreground leading-relaxed max-w-md mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                {hero?.subheadline || 'Building fast, accessible, and beautiful web applications with modern technologies.'}
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-4 items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <MagneticButton>
                  <a
                    href={hero?.ctaPrimaryUrl || '#work'}
                    className="shimmer inline-flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold px-7 py-3.5 rounded-full hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors text-sm"
                  >
                    {hero?.ctaPrimaryText || 'View my work'}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </MagneticButton>

                <MagneticButton>
                  <a
                    href={hero?.ctaSecondaryUrl || '#contact'}
                    className="inline-flex items-center gap-2 border border-border text-muted-foreground font-medium px-7 py-3.5 rounded-full hover:bg-muted transition-colors text-sm"
                  >
                    {hero?.ctaSecondaryText || 'Get in touch'}
                  </a>
                </MagneticButton>

                <MagneticButton>
                  <Link
                    to="/resume"
                    className="inline-flex items-center gap-2 border border-border text-brand font-medium px-7 py-3.5 rounded-full hover:bg-brand/10 hover:border-brand/30 transition-colors text-sm"
                  >
                    Resume <Download className="w-4 h-4" />
                  </Link>
                </MagneticButton>
              </motion.div>

              {/* Stats */}
              <motion.div
                className="flex flex-wrap gap-8 mt-14 pt-8 border-t border-border"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                {hero?.showProjectsStat && (
                  <div>
                    <p className="font-bold text-3xl text-foreground">
                      <CountUp to={stats?.totalProjects || 20} suffix="+" />
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Projects done</p>
                  </div>
                )}
                {hero?.showClientsStat && (
                  <div>
                    <p className="font-bold text-3xl text-foreground">
                      <CountUp to={stats?.totalClients || 10} suffix="+" />
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Happy clients</p>
                  </div>
                )}
                {hero?.showExperienceStat && (
                  <div>
                    <p className="font-bold text-3xl text-foreground">
                      <CountUp to={4} suffix="+" />
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Years experience</p>
                  </div>
                )}
              </motion.div>
            </motion.div>

            {/* Profile image */}
            <motion.div
              className="flex justify-center md:justify-end"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="relative w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96">

                <div className="w-full h-full rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                  <img
                    src={hero?.heroImage || 'https://picsum.photos/seed/nishanth/800/800'}
                    alt="Nishanth — Full Stack Developer"
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                <motion.div
                  className="absolute -bottom-4 -left-4 bg-brand text-white font-bold text-sm px-4 py-2.5 rounded-2xl shadow-lg shadow-brand/30"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, type: 'spring' }}
                >
                  {hero?.badgeText || 'Open to projects'}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────────────── */}
      {services.length > 0 && (
        <Section id="services" bg="muted">
          <SectionHeader label="What I do" title="Services" />
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((svc: Record<string, string>) => (
              <motion.article
                key={svc.id}
                variants={item}
                className={`group rounded-2xl p-8 border transition-all hover:border-brand hover:-translate-y-1 ${
                  svc.cardStyle === 'dark'
                    ? 'bg-zinc-900 dark:bg-zinc-800 border-zinc-800'
                    : 'bg-white dark:bg-zinc-900 border-border'
                }`}
              >
                {svc.iconSvg && (
                  <div
                    className="w-12 h-12 flex items-center justify-center bg-brand/10 rounded-xl mb-6 group-hover:bg-brand/20 transition-colors text-brand"
                    dangerouslySetInnerHTML={{ __html: svc.iconSvg }}
                  />
                )}
                <h3 className="font-bold text-xl text-foreground mb-3">{svc.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{svc.description}</p>
              </motion.article>
            ))}
          </div>
        </Section>
      )}

      {/* ── WORK / PROJECTS ───────────────────────────────────────────── */}
      {featuredProjects.length > 0 && (
        <Section id="work">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
            <div>
              <p className="text-xs font-medium text-brand tracking-widest uppercase mb-3">Portfolio</p>
              <h2 className="font-bold text-4xl md:text-5xl text-foreground">Selected work</h2>
            </div>
            <Link to="/projects" className="text-sm font-medium text-muted-foreground hover:text-brand transition-colors">
              All projects →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {featuredProjects.map((proj: Record<string, unknown>, i: number) => (
              <motion.article
                key={proj.id as string}
                variants={item}
                className={`group rounded-2xl overflow-hidden bg-[#F4F4F5] dark:bg-[#18181B] border border-border hover:border-brand transition-all hover:-translate-y-1 ${i === 0 ? 'md:row-span-2' : ''}`}
              >
                <div className={`overflow-hidden ${i === 0 ? 'h-64 md:h-80' : 'h-48'}`}>
                  <img
                    src={proj.featuredImage as string || 'https://picsum.photos/seed/proj/1200/800'}
                    alt={proj.title as string}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className={i === 0 ? 'p-7' : 'p-6'}>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(proj.tags as { tagName: string }[])?.map((tag, ti) => (
                      <span key={tag.tagName} className={`text-xs px-3 py-1 rounded-full ${ti === 0 ? 'bg-brand/10 text-brand border border-brand/20' : 'bg-muted text-muted-foreground'}`}>
                        {tag.tagName}
                      </span>
                    ))}
                  </div>
                  <Link to={`/project/${proj.slug as string}`}>
                    <h3 className={`font-bold text-foreground mb-2 hover:text-brand transition-colors ${i === 0 ? 'text-2xl' : 'text-xl'}`}>
                      {proj.title as string}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">{proj.description as string}</p>
                  <div className="flex gap-3">
                    {Boolean(proj.showLive) && Boolean(proj.liveUrl) && (
                      <a href={proj.liveUrl as string} target="_blank" rel="noopener noreferrer"
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium rounded-2xl hover:bg-brand hover:text-white transition-all text-sm">
                        Live Demo <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {Boolean(proj.showSource) && Boolean(proj.sourceUrl) && (
                      <a href={proj.sourceUrl as string} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 border border-border hover:border-brand font-medium rounded-2xl transition-all text-sm text-muted-foreground hover:text-foreground">
                        Source <Github className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </Section>
      )}

      {/* ── ABOUT + SKILLS ────────────────────────────────────────────── */}
      {about && (
        <Section id="about" bg="muted">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div variants={item} className="order-2 md:order-1">
              <div className="rounded-3xl overflow-hidden aspect-square max-w-sm mx-auto">
                <img src={about.image} alt="About" className="w-full h-full object-cover" loading="lazy" />
              </div>
            </motion.div>
            <div className="order-1 md:order-2">
              <motion.p variants={item} className="text-xs font-medium text-brand tracking-widest uppercase mb-3">
                {about.subtitle}
              </motion.p>
              <motion.h2 variants={item} className="font-bold text-4xl md:text-5xl text-foreground leading-tight mb-6"
                dangerouslySetInnerHTML={{ __html: about.title }} />
              <motion.p variants={item} className="text-muted-foreground leading-relaxed mb-4">{about.paragraph1}</motion.p>
              <motion.p variants={item} className="text-muted-foreground leading-relaxed mb-8">{about.paragraph2}</motion.p>

              {/* Skills */}
              {skills.length > 0 && (
                <motion.div variants={item}>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Stack & Tools</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.filter((s: { isFeatured: boolean }) => s.isFeatured).map((skill: { id: number; name: string }) => (
                      <span key={skill.id}
                        className="text-sm bg-white dark:bg-zinc-800 border border-border text-muted-foreground px-4 py-2 rounded-full hover:border-brand transition-colors">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </Section>
      )}

      {/* ── TESTIMONIALS ──────────────────────────────────────────────── */}
      {testimonials.length > 0 && (
        <Section id="reviews">
          <SectionHeader label="Social proof" title="What clients say" />
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((t: Record<string, unknown>) => (
              <motion.blockquote
                key={t.id as string}
                variants={item}
                className="flex flex-col rounded-2xl p-7 bg-[#F4F4F5] dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800/80 transition-colors hover:border-brand text-zinc-900 dark:text-zinc-100"
              >
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: Math.max(0, Math.min(5, Math.floor(Number(t.rating) || 5))) }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-brand fill-brand" />
                  ))}
                </div>
                {Boolean(t.quote) && <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic flex-1">"{t.quote as string}"</p>}
                <footer className="flex items-center gap-3 pt-4 border-t border-border">
                  {Boolean(t.authorImage) && (
                    <img src={t.authorImage as string} alt={t.authorName as string} className="w-10 h-10 rounded-full object-cover" loading="lazy" />
                  )}
                  <div>
                    <p className="font-medium text-sm text-foreground">{t.authorName as string}</p>
                    <p className="text-xs text-muted-foreground">{t.authorTitle as string}, {t.authorCompany as string}</p>
                  </div>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </Section>
      )}

      {/* ── EXPERIENCE ────────────────────────────────────────────────── */}
      {experiences.length > 0 && (
        <Section id="experience" bg="muted">
          <SectionHeader label="Journey" title="Experience" />
          <div className="max-w-4xl mx-auto relative before:absolute before:inset-0 before:ml-[5px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[2px] before:bg-black dark:before:bg-white pb-4">
            {experiences.map((exp: Record<string, unknown>) => {
              const isCurrent = exp.isCurrent || (typeof exp.period === 'string' && exp.period.toLowerCase().includes('present'));
              return (
                <motion.div
                  key={exp.id as string}
                  variants={item}
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mb-12 last:mb-0"
                >
                  <div className="w-3 h-3 rounded-full bg-black dark:bg-white shrink-0 md:order-1 md:-translate-x-1/2 ml-0 absolute left-0 md:left-1/2 z-10" />
                  
                  <div className={`w-[calc(100%-2rem)] md:w-[calc(50%-3rem)] ml-auto md:ml-0 p-8 rounded-3xl transition-all bg-[#F4F4F5] dark:bg-[#18181B] text-zinc-900 dark:text-zinc-100 hover:-translate-y-1 border-2 ${
                    isCurrent ? 'border-brand' : 'border-transparent'
                  }`}>
                    <div className="flex gap-4 items-start mb-5">
                      <div className="w-12 h-12 rounded-full bg-[#ccc] flex items-center justify-center text-black font-bold text-xs shrink-0 overflow-hidden">
                        {exp.logo ? <img src={exp.logo as string} alt="" className="w-full h-full object-cover" /> : 'LOGO'}
                      </div>
                      <div>
                        <h4 className="font-bold text-xl md:text-2xl leading-tight">{exp.title as string}</h4>
                        <p className="text-brand font-medium mt-1">
                          {exp.company as string} {Boolean(exp.location) && `• ${exp.location}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-medium mb-3 text-zinc-300">
                      {exp.period as string}
                    </div>
                    {Boolean(exp.description) && <p className="text-sm text-zinc-400 leading-relaxed mb-4">{exp.description as string}</p>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── EDUCATION ─────────────────────────────────────────────────── */}
      {educations.length > 0 && (
        <Section id="education">
          <SectionHeader label="Academic Background" title="Education" />
          <div className="max-w-4xl mx-auto relative before:absolute before:inset-0 before:ml-[5px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[2px] before:bg-black dark:before:bg-white pb-4">
            {educations.map((edu: Record<string, unknown>) => {
              const isCurrent = edu.isCurrent || (typeof edu.period === 'string' && edu.period.toLowerCase().includes('present'));
              return (
                <motion.div
                  key={edu.id as string}
                  variants={item}
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mb-12 last:mb-0"
                >
                  <div className="w-3 h-3 rounded-full bg-black dark:bg-white shrink-0 md:order-1 md:-translate-x-1/2 ml-0 absolute left-0 md:left-1/2 z-10" />
                  
                  <div className={`w-[calc(100%-2rem)] md:w-[calc(50%-3rem)] ml-auto md:ml-0 p-8 rounded-3xl transition-all bg-[#F4F4F5] dark:bg-[#18181B] text-zinc-900 dark:text-zinc-100 hover:-translate-y-1 border-2 ${
                    isCurrent ? 'border-brand' : 'border-transparent'
                  }`}>
                    <div className="flex gap-4 items-start mb-5">
                      <div className="w-12 h-12 rounded-full bg-[#ccc] flex items-center justify-center text-black font-bold text-xs shrink-0 overflow-hidden">
                        {edu.logo ? <img src={edu.logo as string} alt="" className="w-full h-full object-cover" /> : 'LOGO'}
                      </div>
                      <div>
                        <h4 className="font-bold text-xl md:text-2xl leading-tight">{edu.title as string}</h4>
                        <p className="text-brand font-medium mt-1">
                          {edu.institution as string}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-medium mb-3 text-zinc-300">
                      {edu.period as string}
                    </div>
                    {Boolean(edu.description) && <p className="text-sm text-zinc-400 leading-relaxed mb-4">{edu.description as string}</p>}
                    {Boolean(edu.grade) && (
                      <span className="inline-block px-3 py-1 bg-brand text-black font-bold text-xs rounded-full">
                        {edu.grade as string}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── CERTIFICATIONS ────────────────────────────────────────────── */}
      {featuredCerts.length > 0 && (
        <Section id="certifications" className="bg-[#0F0F12]">
          <div className="flex flex-col mb-10">
            <span className="text-brand text-xs font-bold tracking-widest uppercase mb-3">CREDENTIALS</span>
            <div className="flex items-end justify-between">
              <h2 className="font-bold text-4xl md:text-5xl text-white">Certifications</h2>
              <Link to="/certifications" className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1">View all →</Link>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mb-6">
            <button className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors bg-zinc-950">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors bg-zinc-950">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCerts.slice(0, 3).map((cert: Record<string, unknown>, i: number) => (
              <motion.div
                key={cert.id as string}
                variants={item}
                className={`bg-[#F4F4F5] dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800/80 hover:border-brand transition-all rounded-[2rem] p-6 sm:p-8 flex flex-col ${
                  i === 0 ? 'flex' : i === 1 ? 'hidden sm:flex' : 'hidden lg:flex'
                }`}
              >
                <div className="flex gap-4 items-start mb-8">
                  <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50 flex items-center justify-center text-zinc-500 font-bold text-xs shrink-0 overflow-hidden">
                    {cert.logo ? (
                      <img src={cert.logo as string} alt="" className="w-full h-full object-cover" />
                    ) : (
                      'LOGO'
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-foreground leading-tight">{cert.title as string}</h3>
                    <p className="text-brand font-bold mt-1 text-sm">{cert.issuer as string}</p>
                  </div>
                </div>
                
                <div className="mb-8">
                  <p className="text-muted-foreground font-semibold text-xs uppercase tracking-wider mb-3">Skills acquired</p>
                  <div className="flex flex-wrap gap-2">
                    {(cert.skills as string)?.split(',').map((skill: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 rounded-full bg-brand/10 text-brand border border-brand/20 text-xs font-medium shadow-sm">
                        {skill.trim()}
                      </span>
                    ))}
                    {!(cert.skills as string) && (
                      <span className="px-3 py-1 rounded-full bg-brand/10 text-brand border border-brand/20 text-xs font-medium shadow-sm">
                        Tag1
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mt-auto flex flex-wrap gap-3">
                  <a
                    href={(cert.imageUrl as string) || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-100/50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white rounded-full text-xs font-medium transition-all shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Certificate
                  </a>
                  <a 
                    href={(cert.credentialUrl as string) || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-100/50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white rounded-full text-xs font-medium transition-all shadow-sm"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> verify Certificate
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="sm:hidden mt-6">
            <Link
              to="/certifications"
              className="inline-flex items-center justify-center w-full px-6 py-4 bg-zinc-900 border border-zinc-800 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-colors text-sm"
            >
              See rest certificates
            </Link>
          </div>
        </Section>
      )}

      {/* ── BLOG ─────────────────────────────────────────────────────── */}
      {blogPosts.length > 0 && (
        <Section id="blog">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
            <div>
              <p className="text-xs font-medium text-brand tracking-widest uppercase mb-3">Thoughts</p>
              <h2 className="font-bold text-4xl md:text-5xl text-foreground">From the blog</h2>
            </div>
            <Link to="/blog" className="text-sm font-medium text-muted-foreground hover:text-brand transition-colors">All articles →</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {blogPosts.map((post: Record<string, unknown>) => (
              <motion.article
                key={post.id as string}
                variants={item}
                className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-border hover:border-brand transition-all hover:-translate-y-1"
              >
                <div className="overflow-hidden h-44">
                  <img
                    src={post.featuredImage as string || 'https://picsum.photos/seed/post/1200/630'}
                    alt={post.title as string}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="text-xs bg-brand/10 text-brand border border-brand/20 px-2.5 py-1 rounded-full">
                      {(post.category as { name: string })?.name || 'Blog'}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="w-3.5 h-3.5" />
                      {formatViews(post.views as number)}
                    </div>
                  </div>
                  <Link to={`/blog/${post.slug as string}`}>
                    <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-brand transition-colors leading-tight">
                      {post.title as string}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">{post.excerpt as string}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{post.readTime as string}</span>
                    {Boolean(post.publishedAt) && <span>{formatDate(post.publishedAt as string)}</span>}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </Section>
      )}

      {/* ── CONTACT ───────────────────────────────────────────────────── */}
      <Section id="contact" bg="muted">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-xs font-medium text-brand tracking-widest uppercase mb-3">
              {contactSection?.subtitle || 'Get in touch'}
            </p>
            <h2
              className="font-bold text-4xl md:text-5xl text-foreground leading-tight mb-6"
              dangerouslySetInnerHTML={{ __html: contactSection?.title || "Let's work<br>together" }}
            />
            <p className="text-muted-foreground leading-relaxed mb-8">
              {contactSection?.description || "Have a project in mind? I'd love to hear about it."}
            </p>

            <div className="space-y-4">
              {contactLinks.map((link: Record<string, string>) => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 group hover:text-brand transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-border flex items-center justify-center group-hover:border-brand transition-colors">
                    {link.iconClass ? (
                      <i className={`${link.iconClass} text-brand text-lg`}></i>
                    ) : (
                      <span className="text-brand text-sm">↗</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-brand transition-colors">{link.label}</span>
                </a>
              ))}
            </div>
          </div>

          <motion.form
            variants={item}
            onSubmit={sendContact}
            className="bg-white dark:bg-zinc-900 border border-border rounded-3xl p-8 space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Name</label>
                <input
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required placeholder="John Doe"
                  className="w-full bg-muted border border-border text-foreground text-sm rounded-xl px-4 py-3 placeholder-muted-foreground focus:outline-none focus:border-brand transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
                <input
                  type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required placeholder="john@example.com"
                  className="w-full bg-muted border border-border text-foreground text-sm rounded-xl px-4 py-3 placeholder-muted-foreground focus:outline-none focus:border-brand transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Subject</label>
              <input
                value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Project collaboration"
                className="w-full bg-muted border border-border text-foreground text-sm rounded-xl px-4 py-3 placeholder-muted-foreground focus:outline-none focus:border-brand transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Message</label>
              <textarea
                value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                required rows={4} placeholder="Tell me about your project..."
                className="w-full bg-muted border border-border text-foreground text-sm rounded-xl px-4 py-3 placeholder-muted-foreground focus:outline-none focus:border-brand transition-colors resize-none"
              />
            </div>
            <button
              type="submit" disabled={sending}
              className="shimmer w-full bg-brand text-white font-semibold py-3.5 rounded-xl hover:bg-brand-dark transition-all disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send message →'}
            </button>
          </motion.form>
        </div>
      </Section>
    </>
  )
}

// ── Reusable Section wrapper ───────────────────────────────────────────────
function Section({ id, children, bg, className = '' }: { id: string; children: React.ReactNode; bg?: string; className?: string }) {
  const { ref, isInView } = useReveal()
  return (
    <section id={id} className={`py-24 ${bg === 'muted' ? 'bg-muted/50 dark:bg-zinc-900/40' : ''} ${className}`}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
        >
          {children}
        </motion.div>
      </div>
    </section>
  )
}



function SectionHeader({ label, title, inline }: { label: string; title: string; inline?: boolean }) {
  if (inline) return (
    <div>
      <p className="text-xs font-medium text-brand tracking-widest uppercase mb-3">{label}</p>
      <h2 className="font-bold text-4xl md:text-5xl text-foreground">{title}</h2>
    </div>
  )
  return (
    <motion.div variants={item} className="mb-14">
      <p className="text-xs font-medium text-brand tracking-widest uppercase mb-3">{label}</p>
      <h2 className="font-bold text-4xl md:text-5xl text-foreground">{title}</h2>
    </motion.div>
  )
}
