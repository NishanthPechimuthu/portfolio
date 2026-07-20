import GenericAdminCRUD from '@/components/admin/GenericAdminCRUD'
import { Award } from 'lucide-react'

export default function CertificatesPage() {
  return (
    <GenericAdminCRUD
      title="Certifications"
      description="Manage your professional certificates and credentials."
      endpoint="/certificates"
      icon={Award}
      defaultValues={{ isFeatured: false, sortOrder: 0, category: 'general' }}
      fields={[
        { name: 'title', label: 'Certificate Title', type: 'text', required: true },
        { name: 'issuer', label: 'Issuing Organization', type: 'text', required: true },
        { name: 'issueDate', label: 'Issue Date', type: 'text' },
        { name: 'credentialId', label: 'Credential ID', type: 'text' },
        { name: 'credentialUrl', label: 'Credential URL', type: 'text' },
        { name: 'imageUrl', label: 'Certificate Image (URL)', type: 'image' },
        { name: 'logo', label: 'Provider Logo', type: 'image' },
        { name: 'category', label: 'Category', type: 'text' },
        { name: 'skills', label: 'Skills Acquired (comma separated)', type: 'textarea' },
        { name: 'isFeatured', label: 'Feature on Homepage', type: 'checkbox' },
        { name: 'sortOrder', label: 'Sort Order', type: 'number' },
      ]}
      renderItem={(item) => (
        <div>
          <h3 className="font-semibold text-white flex items-center gap-2">
            {item.title} {item.isFeatured && <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">Featured</span>}
          </h3>
          <p className="text-sm text-zinc-400">{item.issuer} • {item.issueDate}</p>
        </div>
      )}
    />
  )
}
