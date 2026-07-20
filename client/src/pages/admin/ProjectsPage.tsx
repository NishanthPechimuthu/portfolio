import GenericAdminCRUD from '@/components/admin/GenericAdminCRUD'
import { Briefcase } from 'lucide-react'

export default function ProjectsPage() {
  return (
    <GenericAdminCRUD
      title="Projects"
      description="Manage your portfolio projects."
      endpoint="/projects"
      icon={Briefcase}
      defaultValues={{ isFeatured: false, showLive: true, showSource: true, sortOrder: 0 }}
      fields={[
        { name: 'title', label: 'Project Title', type: 'text', required: true },
        { name: 'category', label: 'Category (e.g. Web, Mobile, SaaS)', type: 'text' },
        { name: 'description', label: 'Short Description', type: 'textarea', required: true },
        { name: 'content', label: 'Case Study (HTML allowed)', type: 'textarea' },
        { name: 'featuredImage', label: 'Featured Image (URL)', type: 'image' },
        { name: 'liveUrl', label: 'Live Demo URL', type: 'text' },
        { name: 'sourceUrl', label: 'Source Code URL', type: 'text' },
        { name: 'clientName', label: 'Client Name', type: 'text' },
        { name: 'roleTitle', label: 'Your Role', type: 'text' },
        { name: 'timeline', label: 'Timeline', type: 'text' },
        { name: 'deliverables', label: 'Deliverables', type: 'text' },
        { name: 'year', label: 'Year', type: 'text' },
        { name: 'tags', label: 'Tags (comma separated)', type: 'text' },
        { name: 'isFeatured', label: 'Featured on Homepage', type: 'checkbox' },
        { name: 'showLive', label: 'Show Live Button', type: 'checkbox' },
        { name: 'showSource', label: 'Show Source Button', type: 'checkbox' },
        { name: 'sortOrder', label: 'Sort Order', type: 'number' },
      ]}
      renderItem={(item) => (
        <div className="flex gap-4">
          <div className="w-20 h-16 rounded-xl bg-zinc-800 overflow-hidden shrink-0">
            <img src={item.featuredImage || 'https://picsum.photos/seed/p/100/100'} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              {item.title} {item.isFeatured && <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">Featured</span>}
            </h3>
            <p className="text-sm text-zinc-400 line-clamp-1">{item.description}</p>
          </div>
        </div>
      )}
    />
  )
}
