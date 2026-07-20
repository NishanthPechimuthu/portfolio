import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { Save, Home } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

export default function HeroPage() {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<Record<string, any>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['hero'],
    queryFn: () => api.get('/hero').then(r => r.data),
  })

  useEffect(() => {
    if (data) setFormData(data)
  }, [data])

  const mutation = useMutation({
    mutationFn: (newData: any) => api.put('/hero', newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero'] })
      toast.success('Hero section updated successfully')
    },
    onError: () => toast.error('Failed to update hero'),
  })

  if (isLoading) return <div className="animate-pulse h-[60vh] bg-zinc-900/50 rounded-3xl" />

  const fields = [
    { key: 'availabilityText', label: 'Availability Badge Text', placeholder: 'Open to opportunities' },
    { key: 'badgeText', label: 'Floating Badge Text', placeholder: 'Open to projects' },
    { key: 'subheadline', label: 'Subheadline', placeholder: 'Building fast, accessible...' },
    { key: 'heroImage', label: 'Hero Image URL', placeholder: 'https://...' },
    { key: 'ctaPrimaryText', label: 'Primary CTA Text', placeholder: 'View my work' },
    { key: 'ctaPrimaryUrl', label: 'Primary CTA URL', placeholder: '#work' },
    { key: 'ctaSecondaryText', label: 'Secondary CTA Text', placeholder: 'Get in touch' },
    { key: 'ctaSecondaryUrl', label: 'Secondary CTA URL', placeholder: '#contact' },
  ]

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Home className="w-6 h-6 text-brand" /> Hero Section
        </h1>
        <p className="text-zinc-400">Manage the content of the top section on your homepage.</p>
      </div>

      <form 
        onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData) }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6"
      >
        <div className="grid sm:grid-cols-2 gap-6">
          {fields.map(field => (
            <div key={field.key} className={field.key === 'subheadline' ? 'sm:col-span-2' : ''}>
              <label className="block text-sm font-medium text-zinc-300 mb-2">{field.label}</label>
              <input
                type="text"
                value={formData[field.key] || ''}
                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand transition-colors"
              />
            </div>
          ))}
        </div>

        <div className="pt-6 mt-6 border-t border-zinc-800">
          <h3 className="font-semibold text-white mb-4">Display Toggles</h3>
          <div className="flex flex-wrap gap-6">
            {['showProjectsStat', 'showClientsStat', 'showExperienceStat'].map(key => (
              <label key={key} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-700 bg-zinc-800 cursor-pointer hover:border-zinc-600 transition-colors">
                <input
                  type="checkbox"
                  checked={formData[key] || false}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                  className="w-4 h-4 text-brand rounded border-zinc-600 focus:ring-brand accent-brand bg-zinc-900"
                />
                <span className="text-sm text-zinc-200">Show {key.replace('show', '').replace('Stat', '')} Stat</span>
              </label>
            ))}
          </div>
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
