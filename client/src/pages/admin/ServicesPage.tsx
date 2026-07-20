import GenericAdminCRUD from '@/components/admin/GenericAdminCRUD'
import { Zap } from 'lucide-react'

export default function ServicesPage() {
  return (
    <GenericAdminCRUD
      title="Services"
      description="Manage the services you offer."
      endpoint="/services"
      icon={Zap}
      defaultValues={{ isFeatured: true, isVisible: true, sortOrder: 0, cardStyle: 'light' }}
      fields={[
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea', required: true },
        { name: 'iconSvg', label: 'Icon (SVG code)', type: 'textarea' },
        { name: 'cardStyle', label: 'Card Style', type: 'select', options: [{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }] },
        { name: 'sortOrder', label: 'Sort Order', type: 'number' },
        { name: 'isVisible', label: 'Is Visible', type: 'checkbox' },
      ]}
      renderItem={(item) => (
        <div>
          <h3 className="font-semibold text-white">{item.title}</h3>
          <p className="text-sm text-zinc-400 line-clamp-1">{item.description}</p>
        </div>
      )}
    />
  )
}
