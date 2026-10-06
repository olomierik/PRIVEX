import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Shield, Key, Copy, Check, RefreshCw, QrCode, AlertTriangle, CheckCircle, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { usePrivex } from '../../lib/store'
import { computeCommitment, loadOrCreateKeys, deleteLocalKeys } from '../../lib/crypto'
import { ACCESS_MANAGER_ABI } from '../../lib/abis'
import { buildTxExplorerUrl } from '@/onchain-facts'

import { ARC_CHAIN_ID } from '../../config'

const ACCESS_MANAGER_ADDRESS = import.meta.env.VITE_ACCESS_MANAGER_ADDRESS as `0x${string}` | undefined

const ARC_TESTNET_ID = ARC_CHAIN_ID  // Arc Mainnet (5042)

/**
 * PVX tiers are UPGRADES, not gates.
 * Every user gets full access to messaging, calls, and email for free.
 * Tiers unlock power features and signal support for the network.
 */
const TIER_INFO = [
  {
    label: 'EXPLORER', pvx: '0', color: 'var(--subtle)',
    badge: 'Free forever',
    features: [
      'Unlimited encrypted messages',
      'Encrypted voice & video calls',
      'Private encrypted email',
      'USDC payments',
      'Wallet identity + handle',
    ],
  },
  {
    label: 'SUPPORTER', pvx: '1,000', color: 'var(--ink-2)',
    badge: 'Hold 1K PVX',
    features: [
      'Everything in Explorer',
      'Disappearing messages (1h / 24h)',
      'Group chats (up to 10)',
      'Custom @privex handle priority',
    ],
  },
  {
    label: 'BUILDER', pvx: '10,000', color: '#60a5fa',
    badge: 'Hold 10K PVX',
    features: [
      'Everything in Supporter',
      'Group calls (up to 8 peers)',
      'Screen sharing + recording',
      'Encrypted file storage (5 GB)',
      'Payment fee discount (0.5%)',
    ],
  },
  {
    label: 'GUARDIAN', pvx: '50,000', color: 'var(--accent)',
    badge: 'Hold 50K PVX',
    features: [
      'Everything in Builder',
      'VPN access (when available)',
      'Encrypted file storage (25 GB)',
      'Faster CCTP bridge routing',
      'Payment fee discount (1%)',
    ],
  },
  {
    label: 'SOVEREIGN', pvx: '100,000', color: 'var(--accent-2)',
    badge: 'Hold 100K PVX',
    features: [
      'Everything in Guardian',
      'Team/org workspace (Phase 2)',
      'API access',
      'Priority support',
      'Maximum fee discount (2%)',
      'Governance voting rights',
    ],
  },
]

export default function IdentitySection() {
  const { address } = useAccount()
  const { state, dispatch } = usePrivex()
  const [handle, setHandle] = useState('')
  const [copied, setCopied] = useState(false)
  const [generatingKeys, setGeneratingKeys] = useState(false)
  const [registering, setRegistering] = useState(false)

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard')
  }

  const generateOrLoadKeys = async () => {
    if (!address) return
    setGeneratingKeys(true)
    try {
      const { privKeys, bundle } = await loadOrCreateKeys(address)
      const commitment = await computeCommitment(bundle)
      dispatch({ type: 'SET_IDENTITY', handle: state.privexHandle ?? '', keyBundle: bundle, privKeys })
      toast.success('Cryptographic keys ready — stored locally only')
      return { bundle, commitment }
    } catch (err) {
      toast.error('Key generation failed')
      console.error(err)
    } finally {
      setGeneratingKeys(false)
    }
  }

  const registerIdentity = async () => {
    if (!address || !handle.trim()) return
    if (!ACCESS_MANAGER_ADDRESS) {
      toast.error('Contracts not deployed yet — deploy first in the Contracts panel')
      return
    }

    setRegistering(true)
    try {
      let bundle = state.keyBundle
      let commitment: `0x${string}`

      if (!bundle) {
        const result = await generateOrLoadKeys()
        if (!result) { setRegistering(false); return }
        bundle = result.bundle
        commitment = result.commitment
      } else {
        commitment = await computeCommitment(bundle)
      }

      writeContract({
        address: ACCESS_MANAGER_ADDRESS,
        abi: ACCESS_MANAGER_ABI,
        functionName: 'registerIdentity',
        args: [handle.toLowerCase().trim(), commitment],
        chainId: ARC_TESTNET_ID,
      })
      dispatch({ type: 'SET_IDENTITY', handle: handle.toLowerCase().trim(), keyBundle: bundle, privKeys: state.privKeys! })
    } catch (err) {
      toast.error('Registration failed')
      console.error(err)
    } finally {
      setRegistering(false)
    }
  }

  const rotateKeys = async () => {
    if (!address || !ACCESS_MANAGER_ADDRESS) return
    const confirmed = window.confirm('Rotating keys will make previous encrypted messages unreadable. Continue?')
    if (!confirmed) return

    await deleteLocalKeys(address)
    const result = await generateOrLoadKeys()
    if (!result) return

    const newCommitment = await computeCommitment(result.bundle)
    writeContract({
      address: ACCESS_MANAGER_ADDRESS,
      abi: ACCESS_MANAGER_ABI,
      functionName: 'updateCommitment',
      args: [newCommitment],
      chainId: ARC_TESTNET_ID,
    })
    toast.success('Key rotation initiated — transaction pending')
  }

  const handleValid = /^[a-z0-9]{3,32}$/.test(handle)

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
      {/* Keys section */}
      <div className="glass-strong rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Key size={16} style={{ color: 'var(--accent)' }} />
          <h2 className="display font-semibold text-sm" style={{ color: 'var(--ink)' }}>Cryptographic Identity</h2>
        </div>

        {!address ? (
          <div className="text-sm text-center py-8" style={{ color: 'var(--muted)' }}>Connect your wallet to manage identity</div>
        ) : (
          <div className="space-y-4">
            <div className="glass rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--muted)' }}>Wallet Address</span>
                <button onClick={() => copyToClipboard(address)} className="flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}>
                  {copied ? <Check size={10} /> : <Copy size={10} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="mono text-xs" style={{ color: 'var(--ink-2)' }}>{address}</div>
            </div>

            {state.keyBundle ? (
              <>
                <div className="glass rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full secure-pulse" style={{ background: 'var(--secure)' }} />
                    <span className="text-xs font-semibold" style={{ color: 'var(--secure)' }}>Keys Generated Locally</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>Messaging Public Key</span>
                      <span className="text-xs" style={{ color: 'var(--subtle)' }}>ECDH P-256</span>
                    </div>
                    <div className="mono text-xs break-all" style={{ color: 'var(--ink-2)' }}>{state.keyBundle.messagingPublicKey.slice(0, 32)}...</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>Email Public Key</span>
                      <span className="text-xs" style={{ color: 'var(--subtle)' }}>ECDH P-256</span>
                    </div>
                    <div className="mono text-xs break-all" style={{ color: 'var(--ink-2)' }}>{state.keyBundle.emailPublicKey.slice(0, 32)}...</div>
                  </div>
                  <div className="pt-1 text-xs flex items-center gap-1.5" style={{ color: 'var(--muted)' }}>
                    <AlertTriangle size={10} />
                    Private keys stored in your browser's IndexedDB only — never sent to any server
                  </div>
                </div>
                <button
                  onClick={() => { void rotateKeys() }}
                  disabled={isPending || isConfirming}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-colors hover:opacity-80"
                  style={{ background: 'var(--surface-muted)', color: 'var(--warning)' }}
                >
                  <RefreshCw size={12} />
                  Rotate Keys
                </button>
              </>
            ) : (
              <button
                onClick={() => { void generateOrLoadKeys() }}
                disabled={generatingKeys}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)', color: '#080e1a' }}
              >
                {generatingKeys ? 'Generating Keys...' : 'Generate Cryptographic Keys'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Handle registration */}
      <div className="glass-strong rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} style={{ color: 'var(--accent)' }} />
          <h2 className="display font-semibold text-sm" style={{ color: 'var(--ink)' }}>PRIVEX Handle</h2>
        </div>

        {state.privexHandle ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle size={14} style={{ color: 'var(--secure)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{state.privexHandle}@privex</span>
            </div>
            <div className="glass rounded-xl p-3 flex items-center gap-3">
              <QrCode size={14} style={{ color: 'var(--muted)' }} />
              <span className="text-xs" style={{ color: 'var(--muted)' }}>Share your handle: privex.io/u/{state.privexHandle}</span>
              <button onClick={() => copyToClipboard(`privex.io/u/${state.privexHandle}`)} className="ml-auto">
                <Copy size={12} style={{ color: 'var(--accent)' }} />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--muted)' }}>Choose a handle (3–32 lowercase letters/numbers)</label>
              <div className="flex items-center gap-2">
                <div className="glass rounded-xl px-3 py-2.5 flex-1 flex items-center gap-1.5">
                  <input
                    value={handle}
                    onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                    placeholder="yourhandle"
                    maxLength={32}
                    className="bg-transparent flex-1 text-sm outline-none"
                    style={{ color: 'var(--ink)', fontFamily: "'DM Sans', sans-serif" }}
                  />
                  <span className="text-xs" style={{ color: 'var(--subtle)' }}>@privex</span>
                </div>
                {handle && (
                  <span className="text-xs" style={{ color: handleValid ? 'var(--secure)' : 'var(--danger)' }}>
                    {handleValid ? 'Valid' : 'Invalid'}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => { void registerIdentity() }}
              disabled={!handleValid || isPending || isConfirming || registering || !address}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)', color: '#080e1a' }}
            >
              {isPending ? 'Confirm in wallet...' : isConfirming ? 'Registering...' : registering ? 'Preparing...' : 'Register Identity On-Chain'}
            </button>
            {isSuccess && hash && (
              <div className="glass rounded-xl p-3 flex items-center gap-2">
                <CheckCircle size={12} style={{ color: 'var(--secure)' }} />
                <span className="text-xs" style={{ color: 'var(--secure)' }}>Registered on-chain</span>
                <a href={buildTxExplorerUrl(ARC_TESTNET_ID, hash)} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs" style={{ color: 'var(--accent)' }}>View</a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PVX Upgrade Tiers */}
      <div className="glass-strong rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={16} style={{ color: 'var(--accent)' }} />
          <h2 className="display font-semibold text-sm" style={{ color: 'var(--ink)' }}>PVX Upgrade Tiers</h2>
        </div>
        <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
          All core features are free. Holding PVX unlocks power features — the more you hold, the more you unlock.
        </p>
        <div className="space-y-2">
          {TIER_INFO.map((t) => (
            <div key={t.label} className="glass rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-wider" style={{ color: t.color }}>{t.label}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: t.color + '18', color: t.color }}>{t.badge}</span>
                </div>
                <span className="mono text-xs font-semibold" style={{ color: 'var(--muted)' }}>{t.pvx} PVX</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {t.features.map(f => (
                  <span key={f} className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'var(--surface-muted)', color: 'var(--ink-2)' }}>{f}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 glass rounded-xl p-3 flex items-start gap-2">
          <Lock size={11} style={{ color: 'var(--secure)', flexShrink: 0, marginTop: 1 }} />
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            <strong style={{ color: 'var(--ink-2)' }}>How revenue works:</strong> USDC payments through the app carry a small fee that routes to the treasury and burns PVX. Higher-tier users pay lower fees. As PVX is burned, the supply shrinks — every holder benefits from network growth.
          </p>
        </div>
      </div>
    </div>
  )
}
