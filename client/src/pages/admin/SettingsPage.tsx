import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { Save, ShieldCheck, KeyRound, RefreshCw, Copy, Check, QrCode, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

function generateBase32Secret(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)
  const [testCode, setTestCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verifiedSuccess, setVerifiedSuccess] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then(r => r.data),
  })

  useEffect(() => {
    if (data) setFormData(data)
  }, [data])

  const mutation = useMutation({
    mutationFn: (newData: Record<string, string>) => api.put('/settings', newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      queryClient.invalidateQueries({ queryKey: ['publicSettings'] })
      toast.success('Settings saved successfully')
    },
    onError: () => toast.error('Failed to save settings'),
  })

  if (isLoading) return <div className="animate-pulse h-[60vh] bg-zinc-900/50 rounded-3xl" />

  const fields = [
    { key: 'site_title', label: 'Site Title', placeholder: 'Nishanth | Portfolio' },
    { key: 'site_description', label: 'Site Description', placeholder: 'Full Stack Developer Portfolio' },
    { key: 'contact_email', label: 'Contact Email', placeholder: 'hello@example.com' },
    { key: 'seo_keywords', label: 'SEO Keywords', placeholder: 'developer, portfolio, react, node' },
    { key: 'google_analytics_id', label: 'Google Analytics ID', placeholder: 'G-XXXXXXXXXX' },
    { key: 'email_signature', label: 'Custom HTML Email Signature', placeholder: '<p>Best Regards,<br>Nishanth</p>', type: 'textarea' },
  ]

  const currentSecret = formData.totp_secret || ''
  const totpUri = currentSecret 
    ? `otpauth://totp/NPAdmin:admin?secret=${currentSecret}&issuer=NishanthPortfolio`
    : ''
  const qrCodeUrl = totpUri
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&data=${encodeURIComponent(totpUri)}`
    : ''

  const handleGenerateTotp = () => {
    const newSecret = generateBase32Secret(16)
    setFormData({ ...formData, totp_secret: newSecret })
    setVerifiedSuccess(false)
    toast.info('New TOTP Secret Key generated. Click "Save Settings" to make it permanent.')
  }

  const handleCopySecret = () => {
    if (!currentSecret) return
    navigator.clipboard.writeText(currentSecret)
    setCopied(true)
    toast.success('TOTP Secret copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTestTotp = async () => {
    if (!currentSecret) {
      toast.error('Please enter or generate a TOTP secret first')
      return
    }
    if (!testCode || testCode.trim().length !== 6) {
      toast.error('Please enter a 6-digit verification code')
      return
    }
    setVerifying(true)
    try {
      const res = await api.post('/test-totp', { secret: currentSecret, code: testCode.trim() })
      toast.success(res.data.message || 'TOTP Code verified successfully!')
      setVerifiedSuccess(true)
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Verification failed. Code is invalid or expired.'
      toast.error(msg)
      setVerifiedSuccess(false)
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Global Settings</h1>
        <p className="text-zinc-400">Manage site-wide metadata, SEO parameters, and 2FA authentication security.</p>
      </div>

      <form 
        onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData) }}
        className="space-y-8"
      >
        {/* Site & SEO Configuration */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
          <h2 className="text-lg font-semibold text-white mb-4 border-b border-zinc-800 pb-3">Site Metadata & SEO</h2>
          {fields.map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-zinc-300 mb-2">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  value={formData[field.key] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  rows={4}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand transition-colors font-mono"
                />
              ) : (
                <input
                  type="text"
                  value={formData[field.key] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand transition-colors"
                />
              )}
            </div>
          ))}
        </div>

        {/* 2FA & TOTP Authenticator Security */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Two-Factor Authentication (2FA)</h2>
                <p className="text-xs text-zinc-400">Email OTP + Google Authenticator / Authy TOTP Setup</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Active
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-brand" /> TOTP Secret Key (Base32)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.totp_secret || ''}
                  onChange={(e) => setFormData({ ...formData, totp_secret: e.target.value.toUpperCase().replace(/[^A-Z2-7]/g, '') })}
                  placeholder="e.g. JBSWY3DPEHPK3PXP"
                  className="flex-1 bg-zinc-800 border border-zinc-700 text-white font-mono tracking-widest text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand transition-colors"
                />
                <button
                  type="button"
                  onClick={handleGenerateTotp}
                  className="px-4 py-3 bg-zinc-800 border border-zinc-700 hover:border-brand text-zinc-300 hover:text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Generate New Secret
                </button>
                {currentSecret && (
                  <>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="px-4 py-3 bg-zinc-800 border border-zinc-700 hover:border-brand text-zinc-300 hover:text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, totp_secret: '' })
                        setVerifiedSuccess(false)
                        setTestCode('')
                        toast.info('TOTP Secret removed. Click "Save Settings" below to disable TOTP.')
                      }}
                      className="px-4 py-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      Remove TOTP
                    </button>
                  </>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                Add this secret key into <strong>Google Authenticator</strong>, <strong>Authy</strong>, or <strong>1Password</strong> to generate instant 6-digit login codes.
              </p>
            </div>

            {/* QR Code and Instructions */}
            {currentSecret && (
              <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl grid md:grid-cols-[180px_1fr] gap-6 items-center">
                <div className="bg-white p-2.5 rounded-2xl border border-zinc-700 shadow-md flex items-center justify-center">
                  <img
                    src={qrCodeUrl}
                    alt="Authenticator QR Code"
                    className="w-40 h-40 object-contain rounded-lg"
                  />
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-brand" /> Scan QR Code with Authenticator App
                  </h3>
                  <ol className="text-xs text-zinc-400 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>Open <strong>Google Authenticator</strong> or <strong>Authy</strong> on your mobile phone.</li>
                    <li>Tap <strong>+</strong> and select <strong>Scan a QR code</strong>.</li>
                    <li>Scan the QR code image on the left.</li>
                    <li>Enter the generated 6-digit code below to verify your setup.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Test Verification Input */}
            {currentSecret && (
              <div className="p-5 bg-zinc-800/40 border border-zinc-800 rounded-2xl space-y-3">
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Test Authenticator App 6-Digit Code
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={testCode}
                    onChange={(e) => setTestCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    className="w-40 bg-zinc-800 border border-zinc-700 text-white font-mono text-center tracking-[4px] text-lg rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleTestTotp}
                    disabled={verifying || testCode.length !== 6}
                    className="px-5 py-2.5 bg-brand text-white font-medium text-xs rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {verifying ? 'Verifying...' : 'Test Verification Code'}
                  </button>
                </div>
                {verifiedSuccess && (
                  <p className="text-xs text-green-400 font-medium flex items-center gap-1.5 mt-1">
                    <CheckCircle2 className="w-4 h-4" /> Authenticator code verified! Don't forget to click "Save Settings" below.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center gap-2 bg-brand text-white px-8 py-3.5 rounded-xl font-medium hover:bg-brand-dark transition-colors disabled:opacity-50 shadow-lg shadow-brand/20"
          >
            <Save className="w-4 h-4" />
            {mutation.isPending ? 'Saving Settings...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
