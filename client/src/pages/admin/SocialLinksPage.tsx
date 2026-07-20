import GenericAdminCRUD from '@/components/admin/GenericAdminCRUD'
import { Link2 } from 'lucide-react'

export default function SocialLinksPage() {
  return (
    <GenericAdminCRUD
      title="Social Links"
      description="Manage your social media and contact links."
      endpoint="/contact-info"
      icon={Link2}
      defaultValues={{ sortOrder: 0 }}
      fields={[
        { name: 'platform', label: 'Platform (e.g. GitHub, LinkedIn)', type: 'text', required: true },
        { name: 'url', label: 'URL', type: 'text', required: true },
        { name: 'iconClass', label: 'Icon Class (e.g. fab fa-github)', type: 'text' },
        { name: 'label', label: 'Display Label', type: 'text' },
        { name: 'sortOrder', label: 'Sort Order', type: 'number' },
      ]}
      renderItem={(item) => (
        <div>
          <h3 className="font-semibold text-white">{item.platform}</h3>
          <p className="text-sm text-brand">{item.url}</p>
        </div>
      )}
    />
  )
}
