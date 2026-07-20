import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useRef } from 'react'
import { Share2, Trash2, Link as LinkIcon, Plus, Check, Lock } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { formatBytes, formatDate } from '@/lib/utils'

export default function SharePage() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [uploading, setUploading] = useState(false)
  const [password, setPassword] = useState('')
  const [expiry, setExpiry] = useState('24')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['adminShare'],
    queryFn: () => api.get('/share').then(r => r.data),
  })

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      if (password) formData.append('password', password)
      formData.append('expiry', expiry)
      return api.post('/share', formData).then(r => r.data)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminShare'] })
      toast.success('File shared successfully')
      setPassword('')
      
      // Auto copy link to clipboard
      const url = `${window.location.origin}/share?key=${data.key}`
      navigator.clipboard.writeText(url)
      toast.success('Share link copied to clipboard')
    },
    onError: () => toast.error('Failed to share file'),
    onSettled: () => setUploading(false)
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/share/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminShare'] })
      toast.success('Shared file deleted')
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploading(true)
      uploadMutation.mutate(file)
    }
  }

  const copyLink = (key: string) => {
    const url = `${window.location.origin}/share?key=${key}`
    navigator.clipboard.writeText(url)
    setCopiedKey(key)
    toast.success('Share link copied to clipboard')
    setTimeout(() => setCopiedKey(null), 2000)
  }

  if (isLoading) return <div className="animate-pulse h-[60vh] bg-zinc-900/50 rounded-3xl" />

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Share2 className="w-6 h-6 text-brand" /> Temporary File Sharing
        </h1>
        <p className="text-zinc-400">Securely share files with clients using expiring, password-protected links.</p>
      </div>

      <div className="grid md:grid-cols-[300px_1fr] gap-8 items-start">
        {/* Upload Form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sticky top-8">
          <h2 className="text-lg font-bold text-white mb-6">Create New Share</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Password (Optional)</label>
              <input
                type="text"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Leave blank for open access"
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Expiry (Hours)</label>
              <select
                value={expiry}
                onChange={e => setExpiry(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand"
              >
                <option value="1">1 Hour</option>
                <option value="24">24 Hours (1 Day)</option>
                <option value="72">72 Hours (3 Days)</option>
                <option value="168">168 Hours (7 Days)</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 bg-brand text-white px-5 py-3 rounded-xl font-medium hover:bg-brand-dark transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Select & Share File'}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
          />
        </div>

        {/* Files List */}
        <div className="space-y-4">
          {files.map((file: any) => {
            const isExpired = new Date() > new Date(file.expiresAt)
            return (
              <div key={file.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-zinc-700 transition-colors">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white flex items-center gap-2 mb-1">
                    {file.originalName}
                    {file.isProtected && <span title="Password Protected"><Lock className="w-3.5 h-3.5 text-yellow-500" /></span>}
                    {isExpired && <span className="text-xs bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full">Expired</span>}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-zinc-400">
                    <span>{formatBytes(file.fileSize)}</span>
                    <span>Expires: {formatDate(file.expiresAt)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => copyLink(file.fileKey)}
                    disabled={isExpired}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-brand disabled:opacity-50 transition-colors"
                    title="Copy Link"
                  >
                    {copiedKey === file.fileKey ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this shared file?')) deleteMutation.mutate(file.id)
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}

          {files.length === 0 && (
            <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 rounded-3xl text-zinc-500">
              <Share2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No active shared files.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
