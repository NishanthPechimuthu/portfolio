import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'

export default function ResumePage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    resume_latex: '',
    resume_theme_icons: 'true',
    resume_theme_colors: 'true'
  })
  const [compileStatus, setCompileStatus] = useState<'idle' | 'compiling' | 'success' | 'error'>('idle')

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then(r => r.data)
  })

  useEffect(() => {
    if (data) {
      setForm({
        resume_latex: data.resume_latex || '',
        resume_theme_icons: data.resume_theme_icons || 'true',
        resume_theme_colors: data.resume_theme_colors || 'true'
      })
      // If we have a PDF URL, show success status
      if (data.resume_pdf_url) {
        setCompileStatus('success')
      }
    }
  }, [data])

  const mutation = useMutation({
    mutationFn: async (newSettings: typeof form) => {
      setCompileStatus('compiling')
      return api.put('/settings', newSettings)
    },
    onSuccess: () => {
      setCompileStatus('success')
      toast.success('Resume saved & PDF compiled successfully')
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
    onError: (err: any) => {
      setCompileStatus('error')
      const msg = err.response?.data?.error || 'Failed to compile LaTeX'
      toast.error(msg)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.resume_latex.trim()) {
      toast.error('Please enter LaTeX code before saving')
      return
    }
    mutation.mutate(form)
  }

  const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api'
  const previewUrl = `${apiUrl}/public/resume/download?inline=true&t=${Date.now()}`

  if (isLoading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
          <FileText className="w-6 h-6 text-brand" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Resume Manager</h1>
          <p className="text-muted-foreground text-sm">Write LaTeX code and auto-generate your resume PDF.</p>
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-foreground">Resume LaTeX Source</label>
              <div className="flex items-center gap-2 text-xs">
                {compileStatus === 'compiling' && (
                  <span className="flex items-center gap-1 text-amber-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Compiling...
                  </span>
                )}
                {compileStatus === 'success' && (
                  <span className="flex items-center gap-1 text-emerald-500">
                    <CheckCircle className="w-3.5 h-3.5" /> PDF compiled
                  </span>
                )}
                {compileStatus === 'error' && (
                  <span className="flex items-center gap-1 text-red-500">
                    <AlertCircle className="w-3.5 h-3.5" /> Compilation failed
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-2">Paste your full LaTeX document here. When you save, it will be compiled to PDF automatically via texlive.net.</p>
            <textarea 
              rows={18}
              value={form.resume_latex}
              onChange={e => {
                setForm({...form, resume_latex: e.target.value})
                if (compileStatus !== 'idle') setCompileStatus('idle')
              }}
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm font-mono text-foreground focus:outline-none focus:border-brand resize-y"
              placeholder={'\\documentclass{article}\n\\begin{document}\n  Your resume content here...\n\\end{document}'}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center gap-2 bg-brand text-white px-6 py-2.5 rounded-lg font-medium hover:bg-brand-dark transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Compiling & Saving...</>
            ) : (
              <><Save className="w-4 h-4" /> Save & Compile PDF</>
            )}
          </button>
        </div>
      </form>

      {/* PDF Preview */}
      {compileStatus === 'success' && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">Generated PDF Preview</h2>
          <div className="border border-border rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-800/50 p-1">
            <iframe 
              src={previewUrl} 
              className="w-full h-[600px] rounded-lg" 
              title="Resume PDF Preview" 
            />
          </div>
        </div>
      )}
    </div>
  )
}
