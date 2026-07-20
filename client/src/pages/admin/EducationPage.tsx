import GenericAdminCRUD from '@/components/admin/GenericAdminCRUD'
import { GraduationCap } from 'lucide-react'

export default function EducationPage() {
  return (
    <GenericAdminCRUD
      title="Education"
      description="Manage your educational background."
      endpoint="/education"
      icon={GraduationCap}
      defaultValues={{ isCurrent: false, sortOrder: 0 }}
      fields={[
        { name: 'title', label: 'Degree / Title', type: 'text', required: true },
        { name: 'institution', label: 'Institution', type: 'text', required: true },
        { name: 'period', label: 'Period (e.g. 2018 - 2022)', type: 'text', required: true },
        { name: 'grade', label: 'Grade / GPA', type: 'text' },
        { name: 'logo', label: 'Institution Logo (URL)', type: 'image' },
        { name: 'isCurrent', label: 'Currently Studying', type: 'checkbox' },
        { name: 'sortOrder', label: 'Sort Order', type: 'number' },
      ]}
      renderItem={(item) => (
        <div>
          <h3 className="font-semibold text-white">{item.title}</h3>
          <p className="text-sm text-zinc-400">{item.institution} • {item.period}</p>
        </div>
      )}
    />
  )
}
