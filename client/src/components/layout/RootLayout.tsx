import { useEffect, useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Moon, Sun, Menu, X, ArrowRight } from 'lucide-react'
import api from '@/lib/api'
import GlobalLoader from '@/components/ui/GlobalLoader'

export default function RootLayout() {
  const [dark, setDark] = useState(() =>
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  )
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const { data: navItems = [] } = useQuery({
    queryKey: ['nav'],
    queryFn: () => api.get('/public/nav').then((r) => r.data),
    staleTime: Infinity,
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const { data: homeData, isLoading: isHomeLoading } = useQuery({
    queryKey: ['home'],
    queryFn: () => api.get('/public/home').then((r) => r.data),
    staleTime: 600000,
  })

  useEffect(() => {
    if (homeData?.theme) {
      const { accentColor, accentLightColor, displayFont, bodyFont, googleFontsUrl } = homeData.theme
      const root = document.documentElement
      
      root.style.setProperty('--brand', accentColor || '#FF6B2B')
      root.style.setProperty('--brand-light', accentLightColor || '#FF8F5C')
      root.style.setProperty('--brand-dark', accentColor || '#e55a1f')
      root.style.setProperty('--font-display', displayFont || 'Inter')
      root.style.setProperty('--font-body', bodyFont || 'Inter')

      if (googleFontsUrl) {
        let link = document.getElementById('dynamic-google-fonts') as HTMLLinkElement
        if (!link) {
          link = document.createElement('link')
          link.id = 'dynamic-google-fonts'
          link.rel = 'stylesheet'
          document.head.appendChild(link)
        }
        link.href = googleFontsUrl
      }
    }
  }, [homeData])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <GlobalLoader isLoading={isHomeLoading} />
      {/* ── NAV ─────────────────────────────────────────────────── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md shadow-sm shadow-black/5' : ''
        }`}
      >
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
            <img src="/logo/png/NP-64-BT.png" alt="NP" className="h-8 w-auto object-contain dark:hidden" />
            <img src="/logo/png/NP-64-WT.png" alt="NP" className="h-8 w-auto object-contain hidden dark:block" />
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-8 text-sm">
            {navItems.map((item: { id: number; label: string; url: string }) => (
              <li key={item.id}>
                <a
                  href={item.url.startsWith('#') && location.pathname !== '/' ? `/${item.url}` : item.url}
                  className="text-muted-foreground hover:text-foreground transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-brand group-hover:w-full transition-all duration-200" />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark(!dark)}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
              aria-label={dark ? 'Light mode' : 'Dark mode'}
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <a
              href={location.pathname === '/' ? '#contact' : '/#contact'}
              className="hidden md:inline-flex items-center gap-2 shimmer bg-brand text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-brand-light transition-colors"
            >
              Hire me <ArrowRight className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full border border-border"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="md:hidden bg-background border-t border-border"
            >
              <ul className="flex flex-col px-6 py-5 gap-4 text-sm">
                {navItems.map((item: { id: number; label: string; url: string }) => (
                  <li key={item.id}>
                    <a href={item.url} className="block text-muted-foreground hover:text-foreground transition-colors">
                      {item.label}
                    </a>
                  </li>
                ))}
                <li className="pt-2 border-t border-border">
                  <a href="#contact" className="inline-flex shimmer bg-brand text-white font-medium text-sm px-5 py-2.5 rounded-full">
                    Hire me →
                  </a>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <Footer />
    </div>
  )
}

function Footer() {
  const { data: homeData } = useQuery({
    queryKey: ['home'],
    queryFn: () => api.get('/public/home').then((r) => r.data),
  })

  const desc = homeData?.about?.paragraph1 || "I design and build premium web applications with a focus on speed, design, and user experience."
  const socialLinks = homeData?.contactLinks || []

  return (
    <footer className="border-t border-border bg-zinc-50 dark:bg-zinc-950/20 py-16 mt-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-4">
            <div className="font-bold text-xl tracking-tight flex items-center gap-2">
              <img src="/logo/png/NP-64-BT.png" alt="NP" className="h-8 w-auto object-contain dark:hidden" />
              <img src="/logo/png/NP-64-WT.png" alt="NP" className="h-8 w-auto object-contain hidden dark:block" />
              <span className="text-foreground">Nishanth</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
              {desc}
            </p>
            {/* Social Icons */}
            <div className="flex gap-4 pt-2">
              {socialLinks.map((link: any) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-brand hover:border-brand transition-colors bg-background"
                >
                  {link.iconClass ? (
                    <i className={link.iconClass} />
                  ) : (
                    <span className="text-xs font-semibold">{link.label.slice(0, 2)}</span>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-foreground uppercase tracking-wider">Navigation</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-brand transition-colors">Home</Link>
              <Link to="/projects" className="hover:text-brand transition-colors">Projects</Link>
              <Link to="/blog" className="hover:text-brand transition-colors">Blog</Link>
              <Link to="/certifications" className="hover:text-brand transition-colors">Certifications</Link>
              <Link to="/resume" className="hover:text-brand transition-colors">Resume</Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Nishanth. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
