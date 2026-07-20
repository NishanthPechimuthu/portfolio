import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '@/lib/api'
import { formatDate, formatViews } from '@/lib/utils'
import { Seo } from '@/components/Seo'

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)

  const { data, isLoading } = useQuery({
    queryKey: ['blog', category, search, page],
    queryFn: () => api.get('/public/blog', { params: { category, search, page, limit: 9 } }).then(r => r.data),
  })

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
              <div className="h-4 bg-zinc-800 rounded-lg w-full" />
              <div className="h-4 bg-zinc-800 rounded-lg w-5/6" />
            </div>
            <div className="flex justify-between items-center mt-6">
              <div className="h-4 bg-zinc-800 rounded-full w-20" />
              <div className="h-4 bg-zinc-800 rounded-full w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const { posts = [], total = 0, categories = [], limit = 9 } = data || {}
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="pt-32 pb-24 px-6 max-w-6xl mx-auto min-h-screen">
      <Seo 
        title="Blog" 
        description="Thoughts, learnings, and tutorials on web development."
        url="/blog"
      />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <h1 className="font-bold text-4xl md:text-5xl mb-4 text-foreground">Blog</h1>
        <p className="text-muted-foreground text-lg">Thoughts, learnings, and tutorials on web development.</p>
      </motion.div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between mb-10">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              const params = new URLSearchParams(searchParams)
              params.delete('category')
              params.set('page', '1')
              setSearchParams(params)
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!category ? 'bg-brand text-white' : 'bg-muted text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
          >
            All Posts
          </button>
          {categories.map((c: any) => (
            <button
              key={c.id}
              onClick={() => {
                const params = new URLSearchParams(searchParams)
                params.set('category', c.slug)
                params.set('page', '1')
                setSearchParams(params)
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === c.slug ? 'bg-brand text-white' : 'bg-muted text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="w-full md:w-64">
          <input
            type="search"
            placeholder="Search posts..."
            defaultValue={search}
            onBlur={(e) => {
              const params = new URLSearchParams(searchParams)
              if (e.target.value) params.set('search', e.target.value)
              else params.delete('search')
              params.set('page', '1')
              setSearchParams(params)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur()
            }}
            className="w-full bg-muted border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-brand transition-colors"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post: any, i: number) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-border hover:border-brand transition-all hover:-translate-y-1 flex flex-col"
          >
            <div className="overflow-hidden h-48 relative">
              <img
                src={post.featuredImage || 'https://picsum.photos/seed/post/1200/630'}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="text-xs bg-brand/10 text-brand px-2.5 py-1 rounded-full">
                  {post.category?.name || 'Blog'}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="w-3.5 h-3.5" /> {formatViews(post.views)}
                </div>
              </div>
              <Link to={`/blog/${post.slug}`}>
                <h3 className="font-bold text-xl text-foreground mb-3 group-hover:text-brand transition-colors leading-tight">
                  {post.title}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground mb-6 flex-1 line-clamp-3 leading-relaxed">{post.excerpt}</p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-4 border-t border-border">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
                {post.publishedAt && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {formatDate(post.publishedAt)}</span>}
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          No posts found matching your criteria.
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-12 gap-2">
          <button
            disabled={page === 1}
            onClick={() => {
              const params = new URLSearchParams(searchParams)
              params.set('page', String(page - 1))
              setSearchParams(params)
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-border hover:bg-muted disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                const params = new URLSearchParams(searchParams)
                params.set('page', String(i + 1))
                setSearchParams(params)
              }}
              className={`w-10 h-10 flex items-center justify-center rounded-full border text-sm font-medium transition-colors ${page === i + 1 ? 'bg-brand border-brand text-white' : 'border-border hover:bg-muted text-foreground'}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={page === totalPages}
            onClick={() => {
              const params = new URLSearchParams(searchParams)
              params.set('page', String(page + 1))
              setSearchParams(params)
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-border hover:bg-muted disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
