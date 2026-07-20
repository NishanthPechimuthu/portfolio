import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, File, Lock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { formatBytes } from '@/lib/utils'

export default function SharePage() {
  const [searchParams] = useSearchParams()
  const key = searchParams.get('key')
  const [password, setPassword] = useState('')
  const [downloading, setDownloading] = useState(false)

  const { data: file, isLoading, error } = useQuery({
    queryKey: ['share', key],
    queryFn: () => api.get(`/public/share/${key}`).then(r => r.data),
    enabled: !!key,
    retry: false
  })

  if (!key) return (
    <div className="min-h-screen pt-32 text-center text-muted-foreground px-6">
      <h1 className="text-2xl font-bold text-foreground mb-4">Invalid Link</h1>
      <p>No share key was provided in the URL.</p>
    </div>
  )

  if (isLoading) return <div className="min-h-screen pt-32" />

  if (error) return (
    <div className="min-h-screen pt-32 text-center px-6">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 mb-6">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-4">Link Expired or Invalid</h1>
      <p className="text-muted-foreground">This file is no longer available. It may have expired or been deleted by the owner.</p>
    </div>
  )

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault()
    setDownloading(true)
    try {
      const response = await api.post(`/public/share/${key}/download`, { password }, { responseType: 'blob' })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', file.originalName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      toast.success('Download started')
    } catch (err: any) {
      if (err.response?.status === 403) toast.error('Incorrect password')
      else toast.error('Failed to download file')
    } finally {
      setDownloading(false)
    }
  }

  const isExpired = new Date() > new Date(file.expiresAt)

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        
        <div className="bg-white dark:bg-zinc-900 border border-border rounded-3xl p-8 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto mb-6">
            <File className="w-8 h-8" />
          </div>
          
          <h1 className="text-2xl font-bold text-center text-foreground mb-2 line-clamp-1" title={file.originalName}>
            {file.originalName}
          </h1>
          
          <p className="text-center text-sm font-medium text-muted-foreground mb-8">
            {formatBytes(file.fileSize)}
          </p>

          {isExpired ? (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-xl text-center text-sm font-medium">
              This link has expired
            </div>
          ) : (
            <form onSubmit={handleDownload} className="space-y-5">
              {file.isProtected && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Password Required
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Enter file password"
                    className="w-full bg-muted border border-border text-foreground text-sm rounded-xl px-4 py-3 placeholder-muted-foreground focus:outline-none focus:border-brand"
                  />
                </div>
              )}
              
              <button
                type="submit"
                disabled={downloading}
                className="w-full bg-brand text-white font-semibold py-3.5 rounded-xl hover:bg-brand-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {downloading ? 'Downloading...' : <>Download File <Download className="w-4 h-4" /></>}
              </button>
            </form>
          )}
          
          <p className="text-center text-xs text-muted-foreground mt-6">
            Link expires on {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(file.expiresAt))}
          </p>
        </div>
      </motion.div>
    </div>
  )
}
