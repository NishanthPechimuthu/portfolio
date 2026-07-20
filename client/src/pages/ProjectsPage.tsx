import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { ExternalLink, Github } from 'lucide-react'
import api from '@/lib/api'
import { Seo } from '@/components/Seo'

export default function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || ''

  const { data, isLoading } = useQuery({
    queryKey: ['projects', category],
    queryFn: () => api.get('/public/projects', { params: { category, limit: 100 } }).then(r => r.data),
  })

  const CATEGORIES = [
    { id: '', label: 'All Projects' },
    { id: 'saas', label: 'SaaS' },
    { id: 'ecommerce', label: 'E-Commerce' },
    { id: 'landing', label: 'Landing Pages' },
  ]

  if (isLoading) return (
    <div className="pt-32 pb-24 px-6 max-w-6xl mx-auto min-h-screen space-y-12">
      <div className="space-y-4">
        <div className="h-12 w-48 bg-zinc-800 rounded-2xl animate-pulse" />
        <div className="h-6 w-96 bg-zinc-800 rounded-lg animate-pulse" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="bg-zinc-900 border border-zinc-850 rounded-2xl h-80 animate-pulse p-6 flex flex-col justify-between">
            <div className="h-32 bg-zinc-800 rounded-xl w-full" />
            <div className="h-6 bg-zinc-800 rounded-lg w-3/4 mt-4" />
            <div className="h-4 bg-zinc-800 rounded-lg w-1/2 mt-2" />
            <div className="flex gap-4 mt-6">
              <div className="h-8 bg-zinc-800 rounded-full w-20" />
              <div className="h-8 bg-zinc-800 rounded-full w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const projects = data?.projects || []

  return (
    <div className="pt-32 pb-24 px-6 max-w-6xl mx-auto min-h-screen">
      <Seo 
        title="Projects" 
        description="A collection of my recent work and side projects."
        url="/projects"
      />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <h1 className="font-bold text-4xl md:text-5xl mb-4 text-foreground">Projects</h1>
        <p className="text-muted-foreground text-lg">A collection of my recent work and side projects.</p>
      </motion.div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-10">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              if (c.id) setSearchParams({ category: c.id })
              else setSearchParams({})
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              category === c.id
                ? 'bg-brand text-white'
                : 'bg-muted text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-foreground'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj: any, i: number) => (
          <motion.article
            key={proj.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-border hover:border-brand transition-all hover:-translate-y-1 flex flex-col"
          >
            <div className="overflow-hidden h-48 relative">
              <img
                src={proj.featuredImage || 'https://picsum.photos/seed/proj/1200/800'}
                alt={proj.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                {proj.tags?.map((tag: any, ti: number) => (
                  <span key={tag.tagName} className={`text-xs px-2.5 py-1 rounded-full ${ti === 0 ? 'bg-brand/10 text-brand' : 'bg-muted text-muted-foreground'}`}>
                    {tag.tagName}
                  </span>
                ))}
              </div>
              <Link to={`/project/${proj.slug}`}>
                <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-brand transition-colors">
                  {proj.title}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground mb-6 flex-1 line-clamp-3">{proj.description}</p>
              
              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border">
                {proj.showLive && proj.liveUrl && (
                  <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-brand transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                  </a>
                )}
                {proj.showSource && proj.sourceUrl && (
                  <a href={proj.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors ml-auto">
                    <Github className="w-3.5 h-3.5" /> Source Code
                  </a>
                )}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
      
      {projects.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          No projects found in this category.
        </div>
      )}
    </div>
  )
}
