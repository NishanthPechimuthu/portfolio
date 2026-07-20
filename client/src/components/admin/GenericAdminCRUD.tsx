import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

export interface FieldDef {
  name: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'image' | 'color'
  options?: { value: string; label: string }[]
  required?: boolean
}

export interface GenericAdminCRUDProps {
  title: string
  description: string
  endpoint: string
  icon: React.ElementType
  fields: FieldDef[]
  renderItem: (item: any) => React.ReactNode
  defaultValues?: Record<string, any>
}

export default function GenericAdminCRUD({
  title,
  description,
  endpoint,
  icon: Icon,
  fields,
  renderItem,
  defaultValues = {}
}: GenericAdminCRUDProps) {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>(defaultValues)

  const { data: items = [], isLoading } = useQuery({
    queryKey: [endpoint],
    queryFn: () => api.get(endpoint).then(r => {
      if (Array.isArray(r.data)) return r.data;
      const arrayVal = Object.values(r.data).find(v => Array.isArray(v));
      return arrayVal || [];
    }),
  })

  const saveMutation = useMutation({
    mutationFn: (data: any) => 
      editingId ? api.put(`${endpoint}/${editingId}`, data) : api.post(endpoint, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] })
      toast.success(`${title} saved successfully`)
      handleClose()
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to save')
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`${endpoint}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] })
      toast.success('Deleted successfully')
    },
    onError: () => toast.error('Failed to delete')
  })

  const handleEdit = (item: any) => {
    const processedItem = { ...item }
    if (processedItem.tags && Array.isArray(processedItem.tags)) {
      processedItem.tags = processedItem.tags.map((t: any) => typeof t === 'object' ? t.tagName || t.name : t).join(', ')
    }
    setFormData(processedItem)
    setEditingId(item.id)
    setIsEditing(true)
  }

  const handleClose = () => {
    setIsEditing(false)
    setEditingId(null)
    setFormData(defaultValues)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submitData = { ...formData }
    if (typeof submitData.tags === 'string') {
      submitData.tags = submitData.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
    }
    saveMutation.mutate(submitData)
  }

  if (isLoading) return <div className="animate-pulse h-[60vh] bg-zinc-900/50 rounded-3xl" />

  return (
    <div className="max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Icon className="w-6 h-6 text-brand" /> {title}
          </h1>
          <p className="text-zinc-400">{description}</p>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center justify-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl font-medium hover:bg-brand-dark transition-colors"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
            <h2 className="text-lg font-bold text-white">{editingId ? 'Edit Item' : 'Create New Item'}</h2>
            <button onClick={handleClose} className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              {fields.map(field => (
                <div key={field.name} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    {field.label} {field.required && <span className="text-brand">*</span>}
                  </label>
                  
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.name] || ''}
                      onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                      required={field.required}
                      rows={4}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand resize-none"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.name] || ''}
                      onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                      required={field.required}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand"
                    >
                      <option value="">Select an option</option>
                      {field.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-zinc-700 bg-zinc-800 cursor-pointer hover:border-zinc-600 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData[field.name] || false}
                        onChange={e => setFormData({ ...formData, [field.name]: e.target.checked })}
                        className="w-4 h-4 text-brand rounded border-zinc-600 focus:ring-brand accent-brand bg-zinc-900"
                      />
                      <span className="text-sm text-zinc-200">{field.label}</span>
                    </label>
                  ) : field.type === 'number' ? (
                    <input
                      type="number"
                      value={formData[field.name] || ''}
                      onChange={e => setFormData({ ...formData, [field.name]: e.target.value === '' ? '' : Number(e.target.value) })}
                      required={field.required}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand"
                    />
                  ) : field.type === 'image' ? (
                    <div className="flex gap-4 items-center">
                      {formData[field.name] && (
                        <div className="w-16 h-16 rounded-lg bg-zinc-800 border border-zinc-700 overflow-hidden shrink-0">
                          <img src={formData[field.name]} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const fd = new FormData();
                            fd.append('file', file);
                            try {
                              const res = await api.post('/upload', fd);
                              setFormData({ ...formData, [field.name]: res.data.url });
                              toast.success('Image uploaded');
                            } catch (err) {
                              toast.error('Image upload failed');
                            }
                          }}
                          className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-brand file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand/10 file:text-brand hover:file:bg-brand/20 cursor-pointer"
                        />
                        <div className="mt-2 text-xs text-zinc-500">Or paste URL:</div>
                        <input
                          type="text"
                          value={formData[field.name] || ''}
                          onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                          className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2 mt-1 focus:outline-none focus:border-brand"
                        />
                      </div>
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                      required={field.required}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 rounded-xl font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-dark transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saveMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item: any) => (
            <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-zinc-700 transition-colors">
              <div className="flex-1 min-w-0">
                {renderItem(item)}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleEdit(item)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this item?')) {
                      deleteMutation.mutate(item.id)
                    }
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-16 bg-zinc-900/50 border border-zinc-800 rounded-3xl text-zinc-500">
              No items found. Click "Add New" to create one.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
