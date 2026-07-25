import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import api from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, KeyRound, ArrowRight, RefreshCw, Mail, Smartphone } from 'lucide-react'

type Step = 'credentials' | 'choose-method' | 'verify'
type Method = 'email' | 'totp'

export default function AdminLoginPage() {
  const [step, setStep] = useState<Step>('credentials')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [tempToken, setTempToken] = useState('')
  const [destinationEmail, setDestinationEmail] = useState('')
  const [hasTOTP, setHasTOTP] = useState(false)
  const [method, setMethod] = useState<Method>('email')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const { login } = useAuthStore()
  const navigate = useNavigate()

  // Step 1: Verify credentials
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim() || !password) return
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', {
        username: username.trim(),
        password,
      })

      if (data.requires2FA) {
        setTempToken(data.tempToken || '')
        setDestinationEmail(data.destinationEmail || 'your email')
        setHasTOTP(!!data.hasTOTP)
        // If only email is available, skip method chooser and go straight to sending email
        if (!data.hasTOTP) {
          await sendEmailCode(data.tempToken)
          setMethod('email')
          setStep('verify')
        } else {
          setStep('choose-method')
        }
      } else if (data.success && data.token && data.username) {
        login(data.token, data.username)
        toast.success(`Welcome back, ${data.username}!`)
        navigate('/admin', { replace: true })
      } else {
        toast.error('Unexpected response. Please try again.')
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Login failed. Please check your credentials.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // Send email OTP
  async function sendEmailCode(token?: string) {
    const t = token || tempToken
    if (!t) return
    try {
      const { data } = await api.post('/auth/send-email-otp', { tempToken: t })
      toast.success(data.message || 'Verification code sent to your email!')
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to send code. Please try again.'
      toast.error(msg)
      throw err
    }
  }

  // Step 1.5: Choose method
  async function handleChooseMethod(chosen: Method) {
    setMethod(chosen)
    if (chosen === 'email') {
      setLoading(true)
      try {
        await sendEmailCode()
        setStep('verify')
      } catch {
        // error already toasted
      } finally {
        setLoading(false)
      }
    } else {
      // TOTP — go straight to verify (no need to send anything)
      setStep('verify')
      toast.info('Open your Authenticator App and enter the 6-digit code.')
    }
  }

  // Step 2: Verify the code (email OTP or TOTP)
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    const trimmedCode = code.trim()
    if (trimmedCode.length !== 6 || !/^\d{6}$/.test(trimmedCode)) {
      toast.error('Please enter a valid 6-digit numeric code')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/verify-2fa', {
        tempToken,
        code: trimmedCode,
      })
      if (data.success && data.token && data.username) {
        login(data.token, data.username)
        toast.success(`Welcome back, ${data.username}!`)
        navigate('/admin', { replace: true })
      } else {
        toast.error('Verification failed. Please try again.')
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Invalid code. Please try again.'
      toast.error(msg)
      setCode('')
    } finally {
      setLoading(false)
    }
  }

  // Resend email OTP (only relevant in email mode)
  async function handleResend() {
    if (!tempToken) return
    setResending(true)
    try {
      await sendEmailCode()
      setCode('')
    } catch {
      // error already toasted
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

          {/* ── Step 1: Credentials ─────────────────────────── */}
          {step === 'credentials' && (
            <motion.form
              key="credentials"
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
                    type="text" value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required autoComplete="username" placeholder="np"
                    className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 placeholder-zinc-600 focus:outline-none focus:border-brand transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
                  <input
                    type="password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required autoComplete="current-password" placeholder="••••••••"
                    className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 placeholder-zinc-600 focus:outline-none focus:border-brand transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !username.trim() || !password}
                className="w-full mt-7 shimmer bg-brand text-white font-semibold text-sm py-3.5 rounded-xl hover:bg-brand-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Verifying...' : <>Continue <ArrowRight className="w-4 h-4" /></>}
              </button>
            </motion.form>
          )}

          {/* ── Step 1.5: Choose 2FA Method ──────────────────── */}
          {step === 'choose-method' && (
            <motion.div
              key="choose-method"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl p-8 border border-zinc-800"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mb-6 mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="font-bold text-xl text-white text-center mb-2">2-Step Verification</h1>
              <p className="text-zinc-400 text-xs text-center mb-7 leading-relaxed">
                Choose how you want to verify your identity
              </p>

              <div className="space-y-3">
                {/* Email OTP */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleChooseMethod('email')}
                  className="w-full flex items-center gap-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-brand/50 rounded-2xl px-5 py-4 transition-all group disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0 group-hover:bg-brand/20 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-white text-sm font-semibold">Email OTP</p>
                    <p className="text-zinc-500 text-xs mt-0.5">Send a code to {destinationEmail}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-brand ml-auto transition-colors" />
                </button>

                {/* Authenticator App (TOTP) */}
                {hasTOTP && (
                  <button
                    type="button"
                    onClick={() => handleChooseMethod('totp')}
                    className="w-full flex items-center gap-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-brand/50 rounded-2xl px-5 py-4 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0 group-hover:bg-brand/20 transition-colors">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-white text-sm font-semibold">Authenticator App</p>
                      <p className="text-zinc-500 text-xs mt-0.5">Use Google Authenticator or Authy</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-brand ml-auto transition-colors" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => { setStep('credentials'); setCode(''); setTempToken('') }}
                className="mt-6 w-full text-center text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                ← Back to login
              </button>
            </motion.div>
          )}

          {/* ── Step 2: Enter Code ───────────────────────────── */}
          {step === 'verify' && (
            <motion.form
              key="verify"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleVerify}
              className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl p-8 border border-zinc-800"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mb-6 mx-auto">
                {method === 'email' ? <Mail className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
              </div>

              <h1 className="font-bold text-xl text-white text-center mb-2">
                {method === 'email' ? 'Check Your Email' : 'Authenticator Code'}
              </h1>
              <p className="text-zinc-400 text-xs text-center mb-6 leading-relaxed">
                {method === 'email'
                  ? <>Enter the 6-digit code sent to <span className="text-brand font-medium">{destinationEmail}</span></>
                  : 'Enter the 6-digit code from your Authenticator App'
                }
              </p>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-brand" /> Verification Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  autoFocus
                  placeholder="123456"
                  className="w-full bg-zinc-800 border border-zinc-700 text-white text-center font-mono text-2xl tracking-[8px] rounded-xl px-4 py-3 placeholder-zinc-600 focus:outline-none focus:border-brand transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full mt-6 shimmer bg-brand text-white font-semibold text-sm py-3.5 rounded-xl hover:bg-brand-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Verifying...' : 'Verify & Sign In →'}
              </button>

              <div className="mt-5 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs">
                {method === 'email' ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="text-zinc-400 hover:text-brand transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                    {resending ? 'Sending...' : 'Resend code'}
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setCode('')
                    // If both methods available, go back to chooser; else go to credentials
                    setStep(hasTOTP ? 'choose-method' : 'credentials')
                  }}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  ← Back
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
