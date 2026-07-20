import GenericAdminCRUD from '@/components/admin/GenericAdminCRUD'
import { Navigation } from 'lucide-react'

export default function NavigationPage() {
  return (
    <GenericAdminCRUD
      title="Navigation Menu"
      description="Manage the main navigation links on the site."
      endpoint="/menu"
      icon={Navigation}
      defaultValues={{ isActive: true, sortOrder: 0 }}
      fields={[
        { name: 'label', label: 'Link Label', type: 'text', required: true },
        { name: 'url', label: 'URL (e.g. /#contact or /blog)', type: 'text', required: true },
        { name: 'isActive', label: 'Active', type: 'checkbox' },
        { name: 'sortOrder', label: 'Sort Order', type: 'number' },
      ]}
      renderItem={(item) => (
        <div>
          <h3 className="font-semibold text-white flex items-center gap-2">
            {item.label} {!item.isActive && <span className="text-xs bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full">Hidden</span>}
          </h3>
          <p className="text-sm text-brand">{item.url}</p>
        </div>
      )}
    />
  )
}
