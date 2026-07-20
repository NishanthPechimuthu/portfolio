import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { Save, Palette } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

const RECOMMENDED_FONTS = [
  'Inter',
  'Roboto',
  'Poppins',
  'Montserrat',
  'Playfair Display',
  'Lora',
  'Oswald',
  'Lato',
  'Open Sans',
  'Outfit',
  'Space Grotesk'
]

export default function ThemePage() {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    accentColor: '#FF6B2B',
    accentLightColor: '#FF8F5C',
    displayFont: 'Inter',
    bodyFont: 'Inter'
  })

  const { data, isLoading } = useQuery({
    queryKey: ['theme'],
    queryFn: () => api.get('/theme').then(r => r.data),
  })

  useEffect(() => {
    if (data) {
      setFormData({
        accentColor: data.accentColor,
        accentLightColor: data.accentLightColor,
        displayFont: data.displayFont,
        bodyFont: data.bodyFont
      })
    }
  }, [data])

  const mutation = useMutation({
    mutationFn: (newData: typeof formData) => api.put('/theme', newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme'] })
      queryClient.invalidateQueries({ queryKey: ['home'] }) // Invalidate home query to apply to RootLayout immediately
      toast.success('Theme updated successfully')
    },
    onError: () => toast.error('Failed to update theme'),
  })

  if (isLoading) return <div className="animate-pulse h-[60vh] bg-zinc-900/50 rounded-3xl" />

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Palette className="w-6 h-6 text-brand" /> Theme Editor
        </h1>
        <p className="text-zinc-400">Customize the look and feel of your portfolio.</p>
      </div>

      <form 
        onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData) }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-8"
      >
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Colors</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Primary Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-12 h-12 rounded cursor-pointer bg-zinc-800 border border-zinc-700"
                />
                <input
                  type="text"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="flex-1 bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Secondary Light Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.accentLightColor}
                  onChange={(e) => setFormData({ ...formData, accentLightColor: e.target.value })}
                  className="w-12 h-12 rounded cursor-pointer bg-zinc-800 border border-zinc-700"
                />
                <input
                  type="text"
                  value={formData.accentLightColor}
                  onChange={(e) => setFormData({ ...formData, accentLightColor: e.target.value })}
                  className="flex-1 bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Typography (Google Fonts)</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Display Font</label>
              <select
                value={RECOMMENDED_FONTS.includes(formData.displayFont) ? formData.displayFont : 'custom'}
                onChange={(e) => {
                  if (e.target.value !== 'custom') {
                    setFormData({ ...formData, displayFont: e.target.value })
                  } else {
                    setFormData({ ...formData, displayFont: '' })
                  }
                }}
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 mb-2 focus:outline-none focus:border-brand"
              >
                {RECOMMENDED_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                <option value="custom">Custom Font...</option>
              </select>
              {(!RECOMMENDED_FONTS.includes(formData.displayFont) || formData.displayFont === '') && (
                <input
                  type="text"
                  value={formData.displayFont}
                  onChange={(e) => setFormData({ ...formData, displayFont: e.target.value })}
                  placeholder="Type Google Font name manually..."
                  className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Body Font</label>
              <select
                value={RECOMMENDED_FONTS.includes(formData.bodyFont) ? formData.bodyFont : 'custom'}
                onChange={(e) => {
                  if (e.target.value !== 'custom') {
                    setFormData({ ...formData, bodyFont: e.target.value })
                  } else {
                    setFormData({ ...formData, bodyFont: '' })
                  }
                }}
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 mb-2 focus:outline-none focus:border-brand"
              >
                {RECOMMENDED_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                <option value="custom">Custom Font...</option>
              </select>
              {(!RECOMMENDED_FONTS.includes(formData.bodyFont) || formData.bodyFont === '') && (
                <input
                  type="text"
                  value={formData.bodyFont}
                  onChange={(e) => setFormData({ ...formData, bodyFont: e.target.value })}
                  placeholder="Type Google Font name manually..."
                  className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand"
                />
              )}
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-3">Select a recommended font or type the exact name from Google Fonts.</p>
        </div>

        <div className="pt-4 flex justify-end border-t border-zinc-800">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-dark transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {mutation.isPending ? 'Saving...' : 'Save Theme'}
          </button>
        </div>
      </form>
    </div>
  )
}
