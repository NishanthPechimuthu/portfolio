import GenericAdminCRUD from '@/components/admin/GenericAdminCRUD'
import { BookOpen } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export default function BlogPage() {
  const { data: categories = [] } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: () => api.get('/blog-categories').then(r => r.data),
  })

  return (
    <GenericAdminCRUD
      title="Blog Posts"
      description="Write and manage your articles and tutorials."
      endpoint="/blog"
      icon={BookOpen}
      defaultValues={{ isPublished: true, categoryId: categories[0]?.id || 1 }}
      fields={[
        { name: 'title', label: 'Post Title', type: 'text', required: true },
        { 
          name: 'categoryId', 
          label: 'Category', 
          type: 'select', 
          options: categories.map((c: any) => ({ value: c.id, label: c.name })),
          required: true 
        },
        { name: 'excerpt', label: 'Short Excerpt', type: 'textarea', required: true },
        { name: 'content', label: 'Post Content (HTML allowed)', type: 'textarea', required: true },
        { name: 'featuredImage', label: 'Featured Image (URL)', type: 'image' },
        { name: 'readTime', label: 'Read Time (e.g. 5 min read)', type: 'text' },
        { name: 'seoTitle', label: 'SEO Title', type: 'text' },
        { name: 'seoDesc', label: 'SEO Description', type: 'text' },
        { name: 'isPublished', label: 'Published', type: 'checkbox' },
      ]}
      renderItem={(item) => (
        <div className="flex gap-4">
          <div className="w-20 h-16 rounded-xl bg-zinc-800 overflow-hidden shrink-0">
            <img src={item.featuredImage || 'https://picsum.photos/seed/b/100/100'} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              {item.title} {!item.isPublished && <span className="text-xs bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full">Draft</span>}
            </h3>
            <p className="text-sm text-zinc-400">Views: {item.views} • Read time: {item.readTime}</p>
          </div>
        </div>
      )}
    />
  )
}
