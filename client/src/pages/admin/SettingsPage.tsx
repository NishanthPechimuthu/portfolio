import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<Record<string, string>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then(r => r.data),
  })

  useEffect(() => {
    if (data) setFormData(data)
  }, [data])

  const mutation = useMutation({
    mutationFn: (newData: Record<string, string>) => api.put('/settings', newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Settings saved successfully')
    },
    onError: () => toast.error('Failed to save settings'),
  })

  if (isLoading) return <div className="animate-pulse h-[60vh] bg-zinc-900/50 rounded-3xl" />

  const fields = [
    { key: 'site_title', label: 'Site Title', placeholder: 'Nishanth | Portfolio' },
    { key: 'site_description', label: 'Site Description', placeholder: 'Full Stack Developer Portfolio' },
    { key: 'contact_email', label: 'Contact Email', placeholder: 'hello@example.com' },
    { key: 'seo_keywords', label: 'SEO Keywords', placeholder: 'developer, portfolio, react, node' },
    { key: 'google_analytics_id', label: 'Google Analytics ID', placeholder: 'G-XXXXXXXXXX' },
    { key: 'email_signature', label: 'Custom HTML Email Signature', placeholder: '<p>Best Regards,<br>Nishanth</p>', type: 'textarea' },
  ]

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Global Settings</h1>
        <p className="text-zinc-400">Manage site-wide metadata and configuration.</p>
      </div>

      <form 
        onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData) }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6"
      >
        {fields.map(field => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-zinc-300 mb-2">{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                value={formData[field.key] || ''}
                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                rows={4}
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand transition-colors font-mono"
              />
            ) : (
              <input
                type="text"
                value={formData[field.key] || ''}
                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand transition-colors"
              />
            )}
          </div>
        ))}

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-dark transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {mutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
