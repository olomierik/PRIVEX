// oxlint-disable typescript/no-unsafe-member-access, typescript/no-floating-promises, typescript/no-unsafe-assignment, typescript/no-unsafe-argument
/**
 * PRIVEX Authentication Gate
 * Wallet-signature challenge/response flow.
 * The server issues a nonce-based message; the wallet signs it; the server verifies.
 * No password required. No private key leaves the user's device.
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, Key, AlertTriangle } from 'lucide-react'
import { useAccount, useSignMessage } from 'wagmi'
import { toast } from 'sonner'
import { usePrivex } from '../lib/store'
import { fetchChallenge, verifySignature, setToken, healthCheck } from '../lib/relay'
import { loadOrCreateKeys, computeCommitment } from '../lib/crypto'

export default function AuthGate() {
  const { address, isConnected } = useAccount()
  const { state, dispatch } = usePrivex()
  const [authenticating, setAuthenticating] = useState(false)
  const [error, setError] = useState('')
  const [backendOk, setBackendOk] = useState(false)

  const { signMessageAsync } = useSignMessage()

  useEffect(() => {
    void healthCheck().then(ok => {
      setBackendOk(ok)
      dispatch({ type: 'SET_BACKEND_ONLINE', online: ok })
    })
  }, [])

  const authenticate = async () => {
    if (!address) return
    setAuthenticating(true)
    setError('')

    try {
      // 1. Load or create local keys (private keys never leave browser)
      const { privKeys, bundle } = await loadOrCreateKeys(address)

      // 2. Get challenge from relay
      let message: string
      if (backendOk) {
        const challenge = await fetchChallenge(address)
        message = challenge.message
      } else {
        // Offline: sign a local challenge for demo purposes
        message = `PRIVEX Authentication\n\nWallet: ${address}\nNonce: ${Date.now()}\n\nSign to authenticate your PRIVEX identity.`
      }

      // 3. Sign with wallet
      const signature = await signMessageAsync({ message })

      // 4. Verify with relay (or proceed locally if offline)
      let token: string
      if (backendOk) {
        const result = await verifySignature(address, signature, message)
        token = result.token
        setToken(token)
      } else {
        token = `local:${Date.now()}`
        toast.info('Backend offline — running in local demo mode')
      }

      // 5. Compute commitment for on-chain registration
      const commitment = await computeCommitment(bundle)

      dispatch({ type: 'AUTH_SUCCESS', token })
      dispatch({ type: 'SET_IDENTITY', handle: state.privexHandle ?? '', keyBundle: bundle, privKeys })
      toast.success('Authenticated — private keys loaded locally')
    } catch (err: unknown) {
      const msg = (err as Error)?.message ?? ''
      if (msg.toLowerCase().includes('user rejected') || msg.includes('4001')) {
        setError('Signature cancelled')
      } else {
        setError(msg || 'Authentication failed')
        console.error('[PRIVEX auth error]', err)
      }
    } finally {
      setAuthenticating(false)
    }
  }

  if (state.isAuthenticated) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'var(--bg-gradient)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="glass-strong rounded-3xl p-8 w-full max-w-sm space-y-6"
      >
        {/* Logo */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)' }}>
            <Shield size={32} className="text-[#080e1a]" />
          </div>
          <h1 className="display text-2xl font-bold" style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}>PRIVEX</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>One Wallet. One Identity. Private Digital Life.</p>
        </div>

        {/* Features */}
        <div className="space-y-2">
          {[
            { icon: Lock, label: 'End-to-end encrypted messaging' },
            { icon: Key, label: 'Keys generated locally — never shared' },
            { icon: Shield, label: 'Wallet-anchored identity' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--secure-dim)' }}>
                <Icon size={12} style={{ color: 'var(--secure)' }} />
              </div>
              <span className="text-xs" style={{ color: 'var(--ink-2)' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Backend status */}
        {!backendOk && (
          <div className="glass rounded-xl p-3 flex items-center gap-2">
            <AlertTriangle size={12} style={{ color: 'var(--warning)' }} />
            <span className="text-xs" style={{ color: 'var(--warning)' }}>Relay server offline — messaging requires the backend</span>
          </div>
        )}

        {/* Auth buttons */}
        {!isConnected ? (
          <button
            onClick={() => { window.dispatchEvent(new CustomEvent('privex:open-wallet')) }}
            className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)', color: '#080e1a' }}
          >
            Connect Wallet
          </button>
        ) : (
          <button
            onClick={() => { void authenticate() }}
            disabled={authenticating}
            className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)', color: '#080e1a' }}
          >
            {authenticating ? (
              <>
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                Signing challenge...
              </>
            ) : (
              <><Key size={14} />Sign to Authenticate</>
            )}
          </button>
        )}

        {error && (
          <p className="text-xs text-center" style={{ color: 'var(--danger)' }}>{error}</p>
        )}

        <p className="text-xs text-center" style={{ color: 'var(--subtle)' }}>
          No password required. Sign a cryptographic challenge with your wallet. Gas-free authentication.
        </p>
      </motion.div>
    </div>
  )
}
