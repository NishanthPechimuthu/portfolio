import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useRef } from 'react'
import { Image as ImageIcon, Trash2, Upload, Copy, Check, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { formatBytes, formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function MediaPage() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [renamingFile, setRenamingFile] = useState<string | null>(null)
  const [newName, setNewName] = useState('')

  const { data: media = [], isLoading } = useQuery({
    queryKey: ['media'],
    queryFn: () => api.get('/media').then(r => r.data),
  })

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('subdir', 'media')
      return api.post('/upload', formData).then(r => r.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] })
      toast.success('File uploaded successfully')
    },
    onError: () => toast.error('Upload failed'),
    onSettled: () => setUploading(false)
  })

  const deleteMutation = useMutation({
    mutationFn: (filename: string) => api.delete(`/media/${encodeURIComponent(filename)}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] })
      toast.success('File deleted')
    },
    onError: () => toast.error('Failed to delete file')
  })

  const renameMutation = useMutation({
    mutationFn: (data: { oldName: string, newName: string }) => api.put('/media/rename', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] })
      toast.success('File renamed successfully')
      setRenamingFile(null)
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to rename file')
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploading(true)
      uploadMutation.mutate(file)
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    toast.success('URL copied to clipboard')
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  if (isLoading) return <div className="animate-pulse h-[60vh] bg-zinc-900/50 rounded-3xl" />

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-brand" /> Media Library
          </h1>
          <p className="text-zinc-400">Manage all uploaded images and files.</p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center justify-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl font-medium hover:bg-brand-dark transition-colors disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          className="hidden" 
          accept="image/*"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {media.map((file: any) => (
          <motion.div
            key={file.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all"
          >
            <div className="aspect-square bg-zinc-800 relative">
              <img 
                src={file.url} 
                alt={file.name} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                <button
                  onClick={() => copyUrl(file.url)}
                  className="w-10 h-10 rounded-full bg-zinc-800 text-white flex items-center justify-center hover:bg-brand transition-colors"
                  title="Copy URL"
                >
                  {copiedUrl === file.url ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this file?')) {
                      deleteMutation.mutate(file.name)
                    }
                  }}
                  className="w-10 h-10 rounded-full bg-zinc-800 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                  title="Delete File"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setRenamingFile(file.name)
                    setNewName(file.name)
                  }}
                  className="w-10 h-10 rounded-full bg-zinc-800 text-white flex items-center justify-center hover:bg-blue-500 transition-colors"
                  title="Rename File"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {renamingFile === file.name ? (
              <div className="p-3 border-t border-zinc-800 bg-zinc-800/50">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg px-2 py-1 mb-2 focus:outline-none focus:border-brand"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => renameMutation.mutate({ oldName: file.name, newName })}
                    disabled={renameMutation.isPending || !newName.trim() || newName === file.name}
                    className="flex-1 bg-brand text-white text-xs py-1.5 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setRenamingFile(null)}
                    className="flex-1 bg-zinc-700 text-white text-xs py-1.5 rounded-lg hover:bg-zinc-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3">
                <p className="text-sm font-medium text-white truncate mb-1" title={file.name}>{file.name}</p>
                <div className="flex justify-between items-center text-xs text-zinc-500">
                  <span>{formatBytes(file.size)}</span>
                  <span>{formatDate(new Date(file.time).toISOString())}</span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {media.length === 0 && (
        <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 rounded-3xl mt-6 text-zinc-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Your media library is empty.</p>
          <p className="text-sm mt-1">Upload images to use them in your content.</p>
        </div>
      )}
    </div>
  )
}
