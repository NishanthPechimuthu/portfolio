import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Mail, Check, Trash2, Reply, Send, X } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'

export default function MessagesPage() {
  const queryClient = useQueryClient()
  
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyForm, setReplyForm] = useState({ subject: '', content: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: () => api.get('/messages').then(r => r.data),
  })

  const readMutation = useMutation({
    mutationFn: (id: number) => api.put(`/messages/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/messages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      toast.success('Message deleted')
    },
  })

  const replyMutation = useMutation({
    mutationFn: (data: { id: number, subject: string, content: string }) => 
      api.post(`/messages/${data.id}/reply`, data),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      const providerName = response.data?.result?.provider === 'resend' ? 'Resend' : 'Gmail SMTP';
      toast.success(`Reply sent successfully via ${providerName}`)
      setReplyingTo(null)
      setReplyForm({ subject: '', content: '' })
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to send reply')
  })

  const handleReplySubmit = (id: number) => {
    if (!replyForm.subject.trim() || !replyForm.content.trim()) {
      toast.error('Subject and content are required')
      return
    }
    replyMutation.mutate({ id, ...replyForm })
  }

  if (isLoading) return <div className="animate-pulse h-[60vh] bg-zinc-900/50 rounded-3xl" />

  const messages = data?.messages || []

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Mail className="w-6 h-6 text-brand" /> Inbox
        </h1>
        <p className="text-zinc-400">View and manage contact form submissions.</p>
      </div>

      <div className="space-y-4">
        {messages.map((msg: any) => (
          <div 
            key={msg.id} 
            className={`bg-zinc-900 border rounded-2xl p-6 transition-colors ${
              msg.isRead ? 'border-zinc-800 opacity-75' : 'border-zinc-700 shadow-sm'
            }`}
          >
            <div className="flex flex-col md:flex-row gap-4 items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white text-lg flex items-center gap-3">
                  {msg.name}
                  {!msg.isRead && <span className="text-xs bg-brand text-white px-2 py-0.5 rounded-full font-medium">New</span>}
                </h3>
                <p className="text-sm text-brand font-medium">{msg.email}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-zinc-500">{formatDate(msg.createdAt)}</span>
                <div className="flex items-center gap-2">
                  {!msg.isRead && (
                    <button
                      onClick={() => readMutation.mutate(msg.id)}
                      className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 flex items-center justify-center transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setReplyingTo(replyingTo === msg.id ? null : msg.id)
                      if (replyingTo !== msg.id) {
                        setReplyForm({ subject: `Re: ${msg.subject || 'Your message'}`, content: `<p>Hi ${msg.name},</p><br><br><br><blockquote>${msg.message.replace(/\n/g, '<br>')}</blockquote>` })
                      }
                    }}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      replyingTo === msg.id 
                        ? 'bg-brand text-white' 
                        : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                    }`}
                    title="Reply"
                  >
                    <Reply className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this message?')) deleteMutation.mutate(msg.id)
                    }}
                    className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-red-500 flex items-center justify-center transition-colors"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            {msg.subject && <p className="font-medium text-white mb-2 text-sm">Subject: {msg.subject}</p>}
            <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800">
              <p className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
            </div>
            
            {replyingTo === msg.id && (
              <div className="mt-4 pt-4 border-t border-zinc-800 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <Reply className="w-4 h-4 text-brand" /> Reply to {msg.email}
                  </h4>
                  <button 
                    onClick={() => setReplyingTo(null)}
                    className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Subject"
                      value={replyForm.subject}
                      onChange={e => setReplyForm({ ...replyForm, subject: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder="Message (HTML supported)"
                      value={replyForm.content}
                      onChange={e => setReplyForm({ ...replyForm, content: e.target.value })}
                      rows={6}
                      className="w-full bg-zinc-950 border border-zinc-800 text-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-brand font-mono"
                    />
                    <p className="text-xs text-zinc-500 mt-1">You can use basic HTML like &lt;p&gt;, &lt;br&gt;, &lt;strong&gt;, etc.</p>
                  </div>
                  
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => handleReplySubmit(msg.id)}
                      disabled={replyMutation.isPending}
                      className="flex items-center gap-2 bg-brand text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" /> 
                      {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {messages.length === 0 && (
          <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 rounded-3xl text-zinc-500">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Your inbox is empty.</p>
          </div>
        )}
      </div>
    </div>
  )
}
