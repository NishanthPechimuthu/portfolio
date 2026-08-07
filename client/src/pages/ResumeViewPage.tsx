import { Download, FileText } from 'lucide-react'
import { useState } from 'react'

export default function ResumeViewPage() {
  const [isLoading, setIsLoading] = useState(true)

  const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api'
  const pdfUrl = `${apiUrl}/public/resume/download?inline=true`
  const downloadUrl = `${apiUrl}/public/resume/download`

  const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Nishanth-P-Resume.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download PDF', err);
      // Fallback
      window.open(downloadUrl, '_blank');
    }
  }

  return (
    <div className="h-[100dvh] bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand" />
          <h1 className="text-zinc-100 font-medium">Nishanth-P-Resume.pdf</h1>
        </div>
        <a 
          href={downloadUrl}
          onClick={handleDownload}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-brand text-black hover:bg-brand/90 gap-2"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </a>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 w-full h-full p-4 md:p-8 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand mx-auto mb-4"></div>
              <p className="text-zinc-400 text-sm">Loading Resume...</p>
            </div>
          </div>
        )}
        <div className="w-full h-full max-w-5xl mx-auto rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl relative z-10">
          <iframe 
            src={pdfUrl} 
            className="w-full h-full"
            title="Resume PDF Viewer"
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </div>
    </div>
  )
}
