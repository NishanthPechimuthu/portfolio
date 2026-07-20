import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Save, FileText } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'

export default function ResumePage() {
  const [form, setForm] = useState({
    resume_pdf_url: '',
    resume_markdown: '',
    resume_latex: '',
    resume_theme_icons: 'true',
    resume_theme_colors: 'true'
  })

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then(r => r.data)
  })

  useEffect(() => {
    if (data) {
      setForm({
        resume_pdf_url: data.resume_pdf_url || '',
        resume_markdown: data.resume_markdown || '',
        resume_latex: data.resume_latex || '',
        resume_theme_icons: data.resume_theme_icons || 'true',
        resume_theme_colors: data.resume_theme_colors || 'true'
      })
    }
  }, [data])

  const mutation = useMutation({
    mutationFn: (newSettings: typeof form) => api.put('/settings', newSettings),
    onSuccess: () => toast.success('Resume settings saved successfully'),
    onError: () => toast.error('Failed to save resume settings')
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(form)
  }

  if (isLoading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
          <FileText className="w-6 h-6 text-brand" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Resume Manager</h1>
          <p className="text-muted-foreground text-sm">Manage your interactive web resume and ATS PDF download.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-border rounded-xl p-6 space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Show Icons (Web View)</label>
              <select 
                value={form.resume_theme_icons}
                onChange={e => setForm({...form, resume_theme_icons: e.target.value})}
                className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm text-foreground"
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Show Brand Colors (Web View)</label>
              <select 
                value={form.resume_theme_colors}
                onChange={e => setForm({...form, resume_theme_colors: e.target.value})}
                className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm text-foreground"
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Resume PDF (Overleaf Export)</label>
            <p className="text-xs text-muted-foreground mb-2">Upload your Overleaf PDF to display on the web and for downloads.</p>
            <div className="space-y-3">
              <input 
                type="file"
                accept="application/pdf"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const fd = new FormData();
                  fd.append('file', file);
                  fd.append('subdir', 'resume');
                  try {
                    const res = await api.post('/upload/file', fd);
                    setForm({ ...form, resume_pdf_url: res.data.url });
                    toast.success('PDF uploaded successfully');
                  } catch (err) {
                    toast.error('PDF upload failed');
                  }
                }}
                className="w-full bg-muted border border-border text-foreground text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-brand file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand/10 file:text-brand hover:file:bg-brand/20 cursor-pointer"
              />
              <input 
                type="text"
                value={form.resume_pdf_url}
                onChange={e => setForm({...form, resume_pdf_url: e.target.value})}
                className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-brand"
                placeholder="Or paste PDF URL..."
              />
            </div>
            {form.resume_pdf_url && (
              <div className="mt-4 p-4 border border-border rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                <iframe src={form.resume_pdf_url} className="w-full h-[300px] rounded" title="PDF Preview" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Resume LaTeX Code (Optional Fallback)</label>
            <p className="text-xs text-muted-foreground mb-2">Write your raw LaTeX code here. This will be compiled on the fly when downloaded if no PDF is provided.</p>
            <textarea 
              rows={6}
              value={form.resume_latex}
              onChange={e => setForm({...form, resume_latex: e.target.value})}
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm font-mono text-foreground"
              placeholder="\documentclass{article}&#10;\begin{document}&#10;...&#10;\end{document}"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center gap-2 bg-brand text-white px-6 py-2.5 rounded-lg font-medium hover:bg-brand-dark transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Save Resume Settings
          </button>
        </div>
      </form>
    </div>
  )
}
