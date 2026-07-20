import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center justify-center text-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <h1 className="font-bold text-9xl text-brand/20 mb-6">404</h1>
        <h2 className="font-bold text-3xl md:text-4xl text-foreground mb-4">Page not found</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand text-white font-medium rounded-full hover:bg-brand-light transition-colors"
        >
          <Home className="w-4 h-4" /> Back to Home
        </Link>
      </motion.div>
    </div>
  )
}
