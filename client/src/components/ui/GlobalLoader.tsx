import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function GlobalLoader({ isLoading }: { isLoading: boolean }) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShow(false), 500)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative pointer-events-auto"
          >
            {/* Dark theme logo (white logo on dark bg) */}
            <img 
              src="/logo/png/NP-64-WT.png" 
              alt="Loading" 
              className="w-24 h-24 md:w-32 md:h-32 object-contain hidden dark:block animate-pulse drop-shadow-2xl" 
            />
            {/* Light theme logo (black logo on white bg) */}
            <img 
              src="/logo/png/NP-64-BT.png" 
              alt="Loading" 
              className="w-24 h-24 md:w-32 md:h-32 object-contain dark:hidden animate-pulse drop-shadow-2xl" 
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
