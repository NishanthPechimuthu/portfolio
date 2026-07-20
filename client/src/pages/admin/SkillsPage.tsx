import GenericAdminCRUD from '@/components/admin/GenericAdminCRUD'
import { Zap } from 'lucide-react'

export default function SkillsPage() {
  return (
    <GenericAdminCRUD
      title="Skills"
      description="Manage your technical skills and tools."
      endpoint="/skills"
      icon={Zap}
      defaultValues={{ isFeatured: true, sortOrder: 0, iconType: 'class', iconNetwork: 'fontawesome' }}
      fields={[
        { name: 'name', label: 'Skill Name', type: 'text', required: true },
        { name: 'iconType', label: 'Icon Type', type: 'select', options: [{ value: 'class', label: 'CSS Class' }, { value: 'image', label: 'Image URL' }] },
        { name: 'iconNetwork', label: 'Icon Network (if class)', type: 'text' },
        { name: 'iconClass', label: 'Icon Class', type: 'text' },
        { name: 'iconImage', label: 'Icon Image URL', type: 'text' },
        { name: 'isFeatured', label: 'Show in top skills', type: 'checkbox' },
        { name: 'sortOrder', label: 'Sort Order', type: 'number' },
      ]}
      renderItem={(item) => (
        <div>
          <h3 className="font-semibold text-white flex items-center gap-2">
            {item.name} {item.isFeatured && <span className="text-xs bg-brand/20 text-brand px-2 py-0.5 rounded-full">Featured</span>}
          </h3>
        </div>
      )}
    />
  )
}
