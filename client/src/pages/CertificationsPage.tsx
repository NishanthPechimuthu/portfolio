import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Award, ExternalLink, Calendar } from 'lucide-react'
import api from '@/lib/api'
import { useState } from 'react'
import { Seo } from '@/components/Seo'

export default function CertificationsPage() {
  const { data: certs = [], isLoading } = useQuery({
    queryKey: ['certifications'],
    queryFn: () => api.get('/public/certifications').then(r => r.data),
  })

  const [filter, setFilter] = useState('')

  if (isLoading) return (
    <div className="pt-32 pb-24 px-6 max-w-6xl mx-auto min-h-screen space-y-12">
      <div className="space-y-4">
        <div className="h-12 w-48 bg-zinc-800 rounded-2xl animate-pulse" />
        <div className="h-6 w-96 bg-zinc-800 rounded-lg animate-pulse" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="bg-zinc-900 border border-zinc-850 rounded-2xl h-80 animate-pulse p-6 flex flex-col justify-between">
            <div className="h-40 bg-zinc-800 rounded-xl w-full" />
            <div className="space-y-2 mt-4 flex-1">
              <div className="h-6 bg-zinc-800 rounded-lg w-3/4" />
              <div className="h-4 bg-zinc-800 rounded-lg w-1/2" />
            </div>
            <div className="flex gap-4 mt-6">
              <div className="h-8 bg-zinc-800 rounded-full w-20" />
              <div className="h-8 bg-zinc-800 rounded-full w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const categories = Array.from(new Set(certs.map((c: any) => c.category))).filter(Boolean) as string[]
  
  const filteredCerts = filter ? certs.filter((c: any) => c.category === filter) : certs

  return (
    <div className="pt-32 pb-24 px-6 max-w-6xl mx-auto min-h-screen">
      <Seo 
        title="Certifications" 
        description="My professional credentials and continuous learning journey."
        url="/certifications"
      />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <h1 className="font-bold text-4xl md:text-5xl mb-4 text-foreground">Certifications</h1>
        <p className="text-muted-foreground text-lg">My professional credentials and continuous learning journey.</p>
      </motion.div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => setFilter('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!filter ? 'bg-brand text-white' : 'bg-muted text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${filter === cat ? 'bg-brand text-white' : 'bg-muted text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCerts.map((cert: any, i: number) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#111] border border-zinc-800 rounded-3xl overflow-hidden hover:border-brand transition-all flex flex-col group relative"
          >
            {cert.imageUrl && (
              <div className="relative w-full h-48 overflow-hidden bg-zinc-800">
                <img 
                  src={cert.imageUrl} 
                  alt={cert.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                  {cert.credentialUrl && (
                    <a 
                      href={cert.credentialUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="px-5 py-2.5 bg-brand text-black font-semibold rounded-full text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl"
                    >
                      <Award className="w-4 h-4" /> Verify Certificate
                    </a>
                  )}
                  <a
                    href={cert.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-white text-black font-semibold rounded-full text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl delay-75"
                  >
                    <ExternalLink className="w-4 h-4" /> View Certificate
                  </a>
                </div>
              </div>
            )}
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <span className="text-brand text-xs font-bold tracking-wider uppercase">
                  {cert.category || 'CERTIFICATION'}
                </span>
                {cert.issueDate && (
                  <span className="text-zinc-500 text-xs">
                    {cert.issueDate}
                  </span>
                )}
              </div>
              
              <h3 className="font-bold text-xl text-white leading-tight mb-2">{cert.title}</h3>
              <p className="text-sm text-zinc-400 mb-2">Issued by <span className="text-zinc-300 font-medium">{cert.issuer}</span></p>
              
              {cert.credentialId && (
                <p className="text-xs text-zinc-500 font-mono mb-4">ID: {cert.credentialId}</p>
              )}
              
              <div className="mt-auto pt-6 flex flex-wrap gap-2">
                {cert.skills?.split(',').map((skill: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 rounded-full border border-zinc-700 bg-zinc-800 text-zinc-300 text-xs font-medium">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
