import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, Github, Calendar, User, Briefcase, CheckCircle } from 'lucide-react'
import { Seo } from '@/components/Seo'
import api from '@/lib/api'

export default function ProjectDetailPage() {
  const { slug } = useParams()

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', slug],
    queryFn: () => api.get(`/public/projects/${slug}`).then(r => r.data),
  })

  if (isLoading) return <div className="min-h-screen pt-24" />
  
  if (!project) return (
    <div className="min-h-screen pt-32 text-center">
      <h1 className="text-2xl font-bold mb-4">Project not found</h1>
      <Link to="/projects" className="text-brand hover:underline">← Back to projects</Link>
    </div>
  )

  return (
    <div className="pt-24 pb-24 px-6 max-w-4xl mx-auto min-h-screen">
      <Seo 
        title={`${project.title} - Project`} 
        description={project.description || `Read about my work on ${project.title}`}
        image={project.featuredImage}
        url={`/project/${slug}`}
        type="article"
      />
      <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to projects
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags?.map((tag: any, i: number) => (
            <span key={tag.tagName} className={`text-xs px-3 py-1 rounded-full ${i === 0 ? 'bg-brand/10 text-brand' : 'bg-muted text-muted-foreground'}`}>
              {tag.tagName}
            </span>
          ))}
        </div>
        
        <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-6 leading-tight">
          {project.title}
        </h1>
        
        <p className="text-xl text-muted-foreground leading-relaxed mb-10">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-4 mb-12">
          {project.showLive && project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand text-white font-medium rounded-full hover:bg-brand-light transition-colors">
              Visit Live Site <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {project.showSource && project.sourceUrl && (
            <a href={project.sourceUrl} target="_blank" rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-border font-medium rounded-full hover:bg-muted transition-colors text-foreground">
              Source Code <Github className="w-4 h-4" />
            </a>
          )}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
        className="rounded-3xl overflow-hidden bg-muted mb-16 aspect-[16/9] border border-border"
      >
        <img 
          src={project.featuredImage || 'https://picsum.photos/seed/proj/1200/800'} 
          alt={`Screenshot or preview of ${project.title} project`} 
          className="w-full h-full object-cover"
        />
      </motion.div>

      <div className="grid md:grid-cols-[1fr_300px] gap-12 items-start">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="prose prose-zinc dark:prose-invert prose-brand max-w-none">
          {project.content ? (
            <div dangerouslySetInnerHTML={{ __html: project.content }} />
          ) : (
            <div className="text-muted-foreground italic">Detailed case study coming soon.</div>
          )}
        </motion.div>

        <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="space-y-6">
          <div className="bg-muted/50 border border-border rounded-2xl p-6">
            <h3 className="font-semibold mb-4 text-foreground">Project Details</h3>
            <ul className="space-y-4 text-sm">
              {project.clientName && (
                <li className="flex items-start gap-3 text-muted-foreground">
                  <User className="w-4 h-4 mt-0.5 text-brand shrink-0" />
                  <div><span className="block font-medium text-foreground">Client</span>{project.clientName}</div>
                </li>
              )}
              {project.roleTitle && (
                <li className="flex items-start gap-3 text-muted-foreground">
                  <Briefcase className="w-4 h-4 mt-0.5 text-brand shrink-0" />
                  <div><span className="block font-medium text-foreground">My Role</span>{project.roleTitle}</div>
                </li>
              )}
              {project.timeline && (
                <li className="flex items-start gap-3 text-muted-foreground">
                  <Calendar className="w-4 h-4 mt-0.5 text-brand shrink-0" />
                  <div><span className="block font-medium text-foreground">Timeline</span>{project.timeline}</div>
                </li>
              )}
              {project.deliverables && (
                <li className="flex items-start gap-3 text-muted-foreground">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-brand shrink-0" />
                  <div><span className="block font-medium text-foreground">Deliverables</span>{project.deliverables}</div>
                </li>
              )}
              {project.year && (
                <li className="flex items-start gap-3 text-muted-foreground">
                  <Calendar className="w-4 h-4 mt-0.5 text-brand shrink-0" />
                  <div><span className="block font-medium text-foreground">Year</span>{project.year}</div>
                </li>
              )}
            </ul>
          </div>
        </motion.aside>
      </div>
    </div>
  )
}
