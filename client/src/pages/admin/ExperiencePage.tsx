import GenericAdminCRUD from '@/components/admin/GenericAdminCRUD'
import { Briefcase } from 'lucide-react'

export default function ExperiencePage() {
  return (
    <GenericAdminCRUD
      title="Experience"
      description="Manage your work history."
      endpoint="/experience"
      icon={Briefcase}
      defaultValues={{ isCurrent: false, sortOrder: 0 }}
      fields={[
        { name: 'title', label: 'Job Title', type: 'text', required: true },
        { name: 'company', label: 'Company', type: 'text', required: true },
        { name: 'location', label: 'Location', type: 'text' },
        { name: 'period', label: 'Period (e.g. 2020 - Present)', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'logo', label: 'Company Logo (URL)', type: 'image' },
        { name: 'isCurrent', label: 'Current Role', type: 'checkbox' },
        { name: 'sortOrder', label: 'Sort Order', type: 'number' },
      ]}
      renderItem={(item) => (
        <div>
          <h3 className="font-semibold text-white flex items-center gap-2">
            {item.title} {item.isCurrent && <span className="text-xs bg-brand/20 text-brand px-2 py-0.5 rounded-full">Current</span>}
          </h3>
          <p className="text-sm text-zinc-400">{item.company} • {item.period}</p>
        </div>
      )}
    />
  )
}
