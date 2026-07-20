import GenericAdminCRUD from '@/components/admin/GenericAdminCRUD'
import { Star } from 'lucide-react'

export default function TestimonialsPage() {
  return (
    <GenericAdminCRUD
      title="Testimonials"
      description="Manage reviews and recommendations from clients and colleagues."
      endpoint="/testimonials"
      icon={Star}
      defaultValues={{ rating: 5, isFeatured: true, sortOrder: 0, cardStyle: 'light' }}
      fields={[
        { name: 'quote', label: 'Quote / Review', type: 'textarea', required: true },
        { name: 'authorName', label: 'Author Name', type: 'text', required: true },
        { name: 'authorTitle', label: 'Author Title', type: 'text' },
        { name: 'authorCompany', label: 'Author Company', type: 'text' },
        { name: 'authorImage', label: 'Author Image URL', type: 'text' },
        { name: 'rating', label: 'Rating (1-5)', type: 'number' },
        { name: 'cardStyle', label: 'Card Style', type: 'select', options: [{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }] },
        { name: 'isFeatured', label: 'Show on Homepage', type: 'checkbox' },
        { name: 'sortOrder', label: 'Sort Order', type: 'number' },
      ]}
      renderItem={(item) => (
        <div>
          <h3 className="font-semibold text-white flex items-center gap-2">
            {item.authorName} {item.isFeatured && <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">Featured</span>}
          </h3>
          <p className="text-sm text-zinc-400">{item.authorTitle} at {item.authorCompany}</p>
          <p className="text-sm text-zinc-500 mt-1 line-clamp-1 italic">"{item.quote}"</p>
        </div>
      )}
    />
  )
}
