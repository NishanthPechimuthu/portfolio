import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useEffect } from 'react'

export default function ResumeViewPage() {
  const { data: homeData = {}, isLoading } = useQuery({
    queryKey: ['publicHome'],
    queryFn: () => api.get('/public/home').then(r => r.data)
  })
  const settings = homeData.settings || {}

  useEffect(() => {
    if (!isLoading) {
      const isExternal = settings.resume_pdf_url?.startsWith('http')
      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api'
      const pdfUrl = settings.resume_pdf_url
        ? (isExternal ? settings.resume_pdf_url : `${apiUrl.replace('/api', '')}${settings.resume_pdf_url}`)
        : `${apiUrl}/public/resume/download`

      window.location.replace(pdfUrl)
    }
  }, [isLoading, settings.resume_pdf_url])

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand mx-auto mb-4"></div>
        <p className="text-zinc-400 text-sm">Opening Resume PDF...</p>
      </div>
    </div>
  )
}
