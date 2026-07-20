import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import api from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, KeyRound, ArrowRight, RefreshCw } from 'lucide-react'

export default function AdminLoginPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [tempToken, setTempToken] = useState('')
  const [destinationEmail, setDestinationEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  
  const { login } = useAuthStore()
  const navigate = useNavigate()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { username, password })
      
      if (data.requires2FA) {
        setTempToken(data.tempToken)
        setDestinationEmail(data.destinationEmail || 'your email')
        setStep(2)
        toast.info(data.message || 'Verification code sent to your email')
      } else if (data.token) {
        login(data.token, data.username)
        navigate('/admin')
        toast.success('Welcome back, ' + data.username)
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Login failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault()
    if (!code || code.trim().length < 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/verify-2fa', { tempToken, code: code.trim() })
      if (data.token) {
        login(data.token, data.username)
        navigate('/admin')
        toast.success('Welcome back, ' + data.username)
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Verification failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleResendCode() {
    if (!tempToken) return
    setResending(true)
    try {
      const { data } = await api.post('/auth/resend-2fa', { tempToken })
      toast.success(data.message || 'New code sent to your email!')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to resend code'
      toast.error(msg)
    } finally {
      setResending(false)
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
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 font-bold text-3xl tracking-tight text-white">
            <span className="text-brand">NP</span>
          </a>
          <p className="text-zinc-500 text-sm mt-2">Admin CMS</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleLogin}
              className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl p-8 border border-zinc-800"
            >
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
                className="w-full mt-7 shimmer bg-brand text-white font-semibold text-sm py-3.5 rounded-xl hover:bg-brand-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Signing in...' : <>Sign in <ArrowRight className="w-4 h-4" /></>}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleVerify2FA}
              className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl p-8 border border-zinc-800"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mb-6 mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <h1 className="font-bold text-xl text-white text-center mb-2">2-Step Verification</h1>
              <p className="text-zinc-400 text-xs text-center mb-6 leading-relaxed">
                Enter the 6-digit code sent to <span className="text-brand font-medium">{destinationEmail}</span> or from your Authenticator app.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-brand" /> Verification Code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                    autoFocus
                    placeholder="123456"
                    className="w-full bg-zinc-800 border border-zinc-700 text-white text-center font-mono text-2xl tracking-[8px] rounded-xl px-4 py-3 placeholder-zinc-600 focus:outline-none focus:border-brand transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit" disabled={loading || code.length < 6}
                className="w-full mt-6 shimmer bg-brand text-white font-semibold text-sm py-3.5 rounded-xl hover:bg-brand-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Verifying...' : 'Verify & Continue →'}
              </button>

              <div className="mt-5 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resending}
                  className="text-zinc-400 hover:text-brand transition-colors flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} /> Resend code
                </button>
                <button
                  type="button"
                  onClick={() => { setStep(1); setCode(''); }}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  ← Back to login
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="text-center mt-6 text-xs text-zinc-600">
          <a href="/" className="hover:text-brand transition-colors">← Back to site</a>
        </p>
      </motion.div>
    </div>
  )
}
