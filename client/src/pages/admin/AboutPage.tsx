import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { Save, User } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

export default function AboutPage() {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<Record<string, string>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['about'],
    queryFn: () => api.get('/about').then(r => r.data),
  })

  useEffect(() => {
    if (data) setFormData(data)
  }, [data])

  const mutation = useMutation({
    mutationFn: (newData: any) => api.put('/about', newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about'] })
      toast.success('About section updated')
    },
    onError: () => toast.error('Failed to update about section'),
  })

  if (isLoading) return <div className="animate-pulse h-[60vh] bg-zinc-900/50 rounded-3xl" />

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <User className="w-6 h-6 text-brand" /> About Section
        </h1>
        <p className="text-zinc-400">Manage the content of your About Me section.</p>
      </div>

      <form 
        onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData) }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Subtitle</label>
          <input
            type="text"
            value={formData.subtitle || ''}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Title (HTML allowed)</label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Image URL</label>
          <input
            type="text"
            value={formData.image || ''}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Paragraph 1</label>
          <textarea
            value={formData.paragraph1 || ''}
            onChange={(e) => setFormData({ ...formData, paragraph1: e.target.value })}
            rows={4}
            className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Paragraph 2</label>
          <textarea
            value={formData.paragraph2 || ''}
            onChange={(e) => setFormData({ ...formData, paragraph2: e.target.value })}
            rows={4}
            className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand resize-none"
          />
        </div>

        <div className="pt-4 flex justify-end border-t border-zinc-800">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-dark transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
