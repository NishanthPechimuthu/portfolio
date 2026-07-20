import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import api from '@/lib/api'
import { motion } from 'framer-motion'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { username, password })
      login(data.token, data.username)
      navigate('/admin')
      toast.success('Welcome back, ' + data.username)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Login failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 opacity-30"
        style={{ backgroundImage: 'radial-gradient(#FF6B2B 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <motion.div
        className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full bg-brand/10 blur-3xl"
        animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 6, repeat: Infinity }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <a href="/" className="inline-flex items-center gap-2 font-bold text-3xl tracking-tight text-white">
            <span className="text-brand">NP</span>
          </a>
          <p className="text-zinc-500 text-sm mt-2">Admin CMS</p>
        </div>

        <form onSubmit={handleLogin}
          className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl p-8 border border-zinc-800">
          <h1 className="font-bold text-xl text-white mb-7">Sign in to continue</h1>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Username</label>
              <input
                type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                required autoComplete="username" placeholder="admin"
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 placeholder-zinc-600 focus:outline-none focus:border-brand transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                required autoComplete="current-password" placeholder="••••••••"
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 placeholder-zinc-600 focus:outline-none focus:border-brand transition-colors"
              />
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full mt-7 shimmer bg-brand text-white font-semibold text-sm py-3.5 rounded-xl hover:bg-brand-dark transition-all disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <p className="text-center mt-6 text-xs text-zinc-600">
          <a href="/" className="hover:text-brand transition-colors">← Back to site</a>
        </p>
      </motion.div>
    </div>
  )
}
