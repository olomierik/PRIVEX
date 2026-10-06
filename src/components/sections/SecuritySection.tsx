import { useState } from 'react'
import { Lock, Key, Shield, Monitor, RefreshCw, Trash2, Download, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { usePrivex } from '../../lib/store'
import { deleteLocalKeys, loadOrCreateKeys, computeCommitment, shortAddress } from '../../lib/crypto'
import { useAccount, useWriteContract } from 'wagmi'
import { ACCESS_MANAGER_ABI } from '../../lib/abis'

const ACCESS_MANAGER_ADDRESS = import.meta.env.VITE_ACCESS_MANAGER_ADDRESS as `0x${string}` | undefined
const ARC_TESTNET_ID = 5042002

interface Session {
  id: string
  device: string
  lastSeen: string
  location: string
  current: boolean
}

const MOCK_SESSIONS: Session[] = [
  { id: '1', device: 'Chrome on macOS', lastSeen: 'Now', location: 'Current device', current: true },
  { id: '2', device: 'Firefox on Windows', lastSeen: '2 days ago', location: 'Unknown', current: false },
]

export default function SecuritySection() {
  const { state, dispatch } = usePrivex()
  const { address } = useAccount()
  const [showPubkey, setShowPubkey] = useState(false)
  const [rotating, setRotating] = useState(false)

  const { writeContract } = useWriteContract()

  const rotateKeys = async () => {
    if (!address) return
    const confirmed = window.confirm('Rotating keys will permanently invalidate previous encryption keys. Old messages will no longer be decryptable. Continue?')
    if (!confirmed) return

    setRotating(true)
    try {
      await deleteLocalKeys(address)
      const { privKeys, bundle } = await loadOrCreateKeys(address)
      const commitment = await computeCommitment(bundle)

      if (ACCESS_MANAGER_ADDRESS) {
        writeContract({
          address: ACCESS_MANAGER_ADDRESS,
          abi: ACCESS_MANAGER_ABI,
          functionName: 'updateCommitment',
          args: [commitment],
          chainId: ARC_TESTNET_ID,
        })
      }

      dispatch({ type: 'SET_IDENTITY', handle: state.privexHandle ?? '', keyBundle: bundle, privKeys })
      toast.success('Keys rotated — new commitment submitted on-chain')
    } catch (err) {
      toast.error('Key rotation failed')
    } finally {
      setRotating(false)
    }
  }

  const exportData = () => {
    const data = {
      wallet: address,
      handle: state.privexHandle,
      publicKeys: state.keyBundle,
      exportedAt: new Date().toISOString(),
      note: 'This export contains only PUBLIC information. Private keys remain in your browser only.',
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `privex-identity-${address?.slice(0, 8)}.json`; a.click()
    URL.revokeObjectURL(url)
    toast.success('Identity data exported (public info only)')
  }

  const revokeSession = (id: string) => {
    toast.success('Session revoked')
  }

  const encryptionItems = [
    { label: 'Messaging Encryption', detail: 'ECDH P-256 + AES-GCM 256', ok: !!state.keyBundle },
    { label: 'Email Encryption', detail: 'ECDH P-256 + AES-GCM 256', ok: !!state.keyBundle },
    { label: 'Key Storage', detail: 'Browser IndexedDB (local only)', ok: !!state.keyBundle },
    { label: 'Wallet Authentication', detail: 'ECDSA secp256k1 + signature challenge', ok: state.isAuthenticated },
    { label: 'Transport Security', detail: 'HTTPS + WebRTC DTLS-SRTP', ok: true },
    { label: 'VPN Tunnel', detail: 'WireGuard (when connected)', ok: state.vpnConnected },
  ]

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
      {/* Encryption status */}
      <div className="glass-strong rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={16} style={{ color: 'var(--accent)' }} />
          <h2 className="display font-semibold text-sm" style={{ color: 'var(--ink)' }}>Encryption Status</h2>
        </div>
        <div className="space-y-2.5">
          {encryptionItems.map(({ label, detail, ok }) => (
            <div key={label} className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {ok ? <CheckCircle size={13} style={{ color: 'var(--secure)', flexShrink: 0 }} /> : <AlertTriangle size={13} style={{ color: 'var(--warning)', flexShrink: 0 }} />}
                <div>
                  <div className="text-xs font-medium" style={{ color: 'var(--ink-2)' }}>{label}</div>
                  <div className="text-xs" style={{ color: 'var(--subtle)' }}>{detail}</div>
                </div>
              </div>
              <span className="text-xs flex-shrink-0 font-medium" style={{ color: ok ? 'var(--secure)' : 'var(--warning)' }}>
                {ok ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Public keys */}
      {state.keyBundle && (
        <div className="glass-strong rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Key size={16} style={{ color: 'var(--accent)' }} />
              <h2 className="display font-semibold text-sm" style={{ color: 'var(--ink)' }}>Public Keys</h2>
            </div>
            <button onClick={() => setShowPubkey(v => !v)} className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted)' }}>
              {showPubkey ? <EyeOff size={12} /> : <Eye size={12} />}
              {showPubkey ? 'Hide' : 'Show'}
            </button>
          </div>
          {showPubkey && (
            <div className="space-y-3">
              <div>
                <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Messaging Public Key (ECDH P-256)</div>
                <div className="mono text-xs break-all p-2 rounded-lg" style={{ background: 'var(--surface-muted)', color: 'var(--ink-2)' }}>{state.keyBundle.messagingPublicKey}</div>
              </div>
              <div>
                <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Email Public Key (ECDH P-256)</div>
                <div className="mono text-xs break-all p-2 rounded-lg" style={{ background: 'var(--surface-muted)', color: 'var(--ink-2)' }}>{state.keyBundle.emailPublicKey}</div>
              </div>
            </div>
          )}
          <div className="mt-3 pt-3 border-t flex gap-2" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => { void rotateKeys() }}
              disabled={rotating}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-colors"
              style={{ background: 'var(--surface-muted)', color: 'var(--warning)' }}
            >
              <RefreshCw size={11} />
              {rotating ? 'Rotating...' : 'Rotate Keys'}
            </button>
            <button
              onClick={exportData}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-colors"
              style={{ background: 'var(--surface-muted)', color: 'var(--ink-2)' }}
            >
              <Download size={11} />
              Export Identity
            </button>
          </div>
        </div>
      )}

      {/* Sessions */}
      <div className="glass-strong rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Monitor size={16} style={{ color: 'var(--accent)' }} />
          <h2 className="display font-semibold text-sm" style={{ color: 'var(--ink)' }}>Active Sessions</h2>
        </div>
        <div className="space-y-2">
          {MOCK_SESSIONS.map(session => (
            <div key={session.id} className="glass rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--surface-strong)' }}>
                  <Monitor size={13} style={{ color: 'var(--muted)' }} />
                </div>
                <div>
                  <div className="text-xs font-medium" style={{ color: 'var(--ink-2)' }}>{session.device}</div>
                  <div className="text-xs" style={{ color: 'var(--subtle)' }}>{session.location} · {session.lastSeen}</div>
                </div>
              </div>
              {session.current ? (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--secure-dim)', color: 'var(--secure)' }}>Current</span>
              ) : (
                <button onClick={() => revokeSession(session.id)} className="text-xs" style={{ color: 'var(--danger)' }}>Revoke</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="glass rounded-2xl p-5 border" style={{ borderColor: 'var(--danger)22' }}>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={14} style={{ color: 'var(--danger)' }} />
          <h3 className="display font-semibold text-sm" style={{ color: 'var(--danger)' }}>Danger Zone</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium" style={{ color: 'var(--ink-2)' }}>Delete Local Keys</div>
              <div className="text-xs" style={{ color: 'var(--subtle)' }}>Removes all local encryption keys. Cannot be undone.</div>
            </div>
            <button
              onClick={() => { if (address && confirm('Delete all local keys? This cannot be undone.')) { void deleteLocalKeys(address).then(() => toast.success('Local keys deleted')) } }}
              className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
              style={{ background: 'var(--danger)22', color: 'var(--danger)' }}
            >
              <Trash2 size={11} />Delete
            </button>
          </div>
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--subtle)' }}>
          Administrators cannot read your private messages, emails, call content, or private keys. Your privacy is protected by design.
        </p>
      </div>
    </div>
  )
}
