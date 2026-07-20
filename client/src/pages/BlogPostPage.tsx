import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Clock, Eye, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Seo } from '@/components/Seo'
import { formatDate, formatViews } from '@/lib/utils'

export default function BlogPostPage() {
  const { slug } = useParams()
  const queryClient = useQueryClient()

  const { data: post, isLoading } = useQuery({
    queryKey: ['blogPost', slug],
    queryFn: () => api.get(`/public/blog/${slug}`).then(r => r.data),
  })

  const viewMutation = useMutation({
    mutationFn: () => api.post(`/public/blog/${slug}/view`),
    onSuccess: (res) => {
      if (res.data?.counted) {
        queryClient.setQueryData(['blogPost', slug], (old: any) => 
          old ? { ...old, views: res.data.views } : old
        )
      }
    }
  })

  useEffect(() => {
    if (post) {
      // Small timeout to count as a "meaningful" view
      const timer = setTimeout(() => {
        viewMutation.mutate()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [post])

  if (isLoading) return <div className="min-h-screen pt-24" />
  
  if (!post) return (
    <div className="min-h-screen pt-32 text-center">
      <h1 className="text-2xl font-bold mb-4">Post not found</h1>
      <Link to="/blog" className="text-brand hover:underline">← Back to blog</Link>
    </div>
  )

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        })
      } catch (err) {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  return (
    <div className="pt-24 pb-24 px-6 max-w-3xl mx-auto min-h-screen">
      <Seo 
        title={`${post.title} - Blog`} 
        description={post.metaDescription || post.excerpt}
        image={post.featuredImage}
        url={`/blog/${slug}`}
        type="article"
      />
      <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10">
        <ArrowLeft className="w-4 h-4" /> Back to blog
      </Link>

      <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground mb-6">
            <span className="bg-brand/10 text-brand px-3 py-1.5 rounded-full">
              {post.category?.name || 'Blog'}
            </span>
            {post.publishedAt && (
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {formatDate(post.publishedAt)}</span>
            )}
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {post.readTime}</span>
            <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {formatViews(post.views)} Views</span>
          </div>

          <h1 className="font-bold text-4xl md:text-5xl text-foreground leading-tight mb-6">
            {post.title}
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed">
            {post.excerpt}
          </p>
        </header>

        <div className="rounded-3xl overflow-hidden bg-muted mb-12 aspect-[21/9] border border-border">
          <img 
            src={post.featuredImage || 'https://picsum.photos/seed/post/1200/630'} 
            alt={`Featured image for blog post: ${post.title}`} 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="prose prose-zinc dark:prose-invert prose-brand max-w-none prose-lg prose-headings:font-bold prose-img:rounded-2xl"
             dangerouslySetInnerHTML={{ __html: post.content }} />
        
        <footer className="mt-16 pt-8 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="https://picsum.photos/seed/nishanth/100/100" alt="Nishanth" className="w-12 h-12 rounded-full object-cover" />
            <div>
              <p className="font-semibold text-foreground">Written by Nishanth</p>
              <p className="text-sm text-muted-foreground">Full Stack Developer & UI/UX Enthusiast</p>
            </div>
          </div>

          <button onClick={handleShare} className="w-10 h-10 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-brand hover:text-white transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </footer>
      </motion.article>
    </div>
  )
}
