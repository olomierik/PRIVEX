/**
 * PRIVEX Home Dashboard
 * Live wallet balances, access tier, security status, real activity feed,
 * VPN status, quick actions, and service status map.
 */
import { useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { erc20Abi, formatUnits } from 'viem'
import {
  Shield, Lock, Wifi, MessageSquare, Phone, Mail, TrendingUp,
  AlertTriangle, CheckCircle, Clock, Globe, ArrowUpDown,
  Activity, RefreshCw,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { usePrivex } from '../../lib/store'
import { getUsdc } from '@/onchain-facts'
import { TokenUSDC } from '@web3icons/react'

const ARC_TESTNET_ID = 5042002

const TIER_LABELS = ['FREE', 'BASIC', 'PRO', 'PREMIUM', 'VIP']
const TIER_COLORS = ['var(--subtle)', 'var(--ink-2)', '#60a5fa', 'var(--accent)', 'var(--accent-2)']
const TIER_DESCRIPTIONS = [
  'Basic identity + limited messaging',
  'Enhanced messaging + file sharing',
  'Encrypted calls + email access',
  'VPN + advanced privacy features',
  'All features + discounts',
]

const ACCESS_MANAGER_ADDRESS = import.meta.env.VITE_ACCESS_MANAGER_ADDRESS as `0x${string}` | undefined
const PRIVEX_TOKEN_ADDRESS = import.meta.env.VITE_PRIVEX_TOKEN_ADDRESS as `0x${string}` | undefined

const ACCESS_MANAGER_ABI = [
  { type: 'function', name: 'getAccessTier', inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: '', type: 'uint8' }], stateMutability: 'view' },
  { type: 'function', name: 'isRegistered', inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
] as const

const ACTIVITY_ICONS: Record<string, typeof Shield> = {
  message: MessageSquare,
  call: Phone,
  email: Mail,
  payment: TrendingUp,
  vpn: Wifi,
  identity: Shield,
  security: Lock,
  swap: ArrowUpDown,
  bridge: Globe,
}

const ACTIVITY_COLORS: Record<string, string> = {
  message: 'var(--accent)',
  call: '#60a5fa',
  email: 'var(--accent-2)',
  payment: 'var(--warning)',
  vpn: 'var(--secure)',
  identity: 'var(--secure)',
  security: 'var(--danger)',
  swap: 'var(--accent)',
  bridge: 'var(--accent-2)',
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60_000) return 'just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}

export default function HomeSection() {
  const { address } = useAccount()
  const { state, dispatch } = usePrivex()
  const usdcFact = getUsdc(ARC_TESTNET_ID)

  const { data: usdcBalance, refetch: refetchUsdc } = useReadContract({
    address: usdcFact?.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: ARC_TESTNET_ID,
    query: { enabled: !!address && !!usdcFact },
  })

  const { data: pvxBalance } = useReadContract({
    address: PRIVEX_TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: ARC_TESTNET_ID,
    query: { enabled: !!address && !!PRIVEX_TOKEN_ADDRESS },
  })

  const { data: accessTier } = useReadContract({
    address: ACCESS_MANAGER_ADDRESS,
    abi: ACCESS_MANAGER_ABI,
    functionName: 'getAccessTier',
    args: address ? [address] : undefined,
    chainId: ARC_TESTNET_ID,
    query: { enabled: !!address && !!ACCESS_MANAGER_ADDRESS },
  })

  const { data: isRegistered } = useReadContract({
    address: ACCESS_MANAGER_ADDRESS,
    abi: ACCESS_MANAGER_ABI,
    functionName: 'isRegistered',
    args: address ? [address] : undefined,
    chainId: ARC_TESTNET_ID,
    query: { enabled: !!address && !!ACCESS_MANAGER_ADDRESS },
  })

  const tier = typeof accessTier === 'number' ? accessTier : 0
  const formattedUsdc = usdcBalance !== undefined ? parseFloat(formatUnits(usdcBalance, 6)).toFixed(2) : '—'
  const formattedPvx = pvxBalance !== undefined ? parseFloat(formatUnits(pvxBalance, 18)).toLocaleString() : '—'

  // Seed activity feed on auth
  useEffect(() => {
    if (!state.isAuthenticated || state.activityFeed.length > 0) return
    const seed = [
      { id: '1', type: 'Wallet authenticated', detail: 'Signed PRIVEX challenge', icon: 'identity' as const, timestamp: Date.now() - 30_000 },
      { id: '2', type: 'E2E encryption enabled', detail: 'Keypairs generated locally', icon: 'security' as const, timestamp: Date.now() - 25_000 },
    ]
    seed.forEach(e => dispatch({ type: 'ADD_ACTIVITY', event: e }))
  }, [state.isAuthenticated]) // eslint-disable-line

  const totalMessages = Object.values(state.messages).reduce((a, msgs) => a + msgs.length, 0)
  const unreadEmails = state.emails.filter(e => !e.read && e.folder === 'inbox').length

  const securityItems = [
    { label: 'E2E Encryption', ok: state.isAuthenticated, icon: Lock },
    { label: 'Wallet Auth', ok: !!address, icon: Shield },
    { label: 'Identity Registered', ok: !!isRegistered, icon: CheckCircle },
    { label: 'Relay Connected', ok: state.backendOnline, icon: Wifi },
    { label: 'VPN Protected', ok: state.vpnConnected, icon: Wifi },
  ]

  const quickActions = [
    { label: 'Send Message', icon: MessageSquare, section: 'messages' as const, tier: 0, badge: totalMessages > 0 ? totalMessages : undefined },
    { label: 'Start Call', icon: Phone, section: 'calls' as const, tier: 2 },
    { label: 'Send Email', icon: Mail, section: 'email' as const, tier: 2, badge: unreadEmails > 0 ? unreadEmails : undefined },
    { label: 'Connect VPN', icon: Wifi, section: 'vpn' as const, tier: 3 },
  ]

  const serviceStatuses = [
    { name: 'Message Relay', ok: state.backendOnline },
    { name: 'Email Relay', ok: state.backendOnline },
    { name: 'VPN', ok: state.vpnConnected },
    { name: 'Arc Network', ok: true },
  ]

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] px-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)' }}>
          <Shield size={40} className="text-[#080e1a]" />
        </motion.div>
        <h2 className="display text-3xl font-bold mb-2" style={{ color: 'var(--ink)' }}>One Wallet.</h2>
        <h2 className="display text-3xl font-bold mb-3" style={{ color: 'var(--accent)' }}>One Identity.</h2>
        <p className="text-sm mb-8 max-w-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
          Connect your wallet to access PRIVEX — your private digital life anchored to blockchain identity on Arc.
        </p>
        <div className="grid grid-cols-2 gap-2.5 max-w-xs w-full text-left mb-8">
          {[
            'E2E Encrypted Messaging',
            'Private Voice & Video Calls',
            'Encrypted Email',
            'VPN with USDC Plans',
            'USDC Payments',
            'DEX Swap + Bridge',
          ].map(f => (
            <div key={f} className="glass rounded-xl px-3 py-2.5 flex items-center gap-2">
              <CheckCircle size={11} style={{ color: 'var(--secure)', flexShrink: 0 }} />
              <span className="text-xs" style={{ color: 'var(--ink-2)' }}>{f}</span>
            </div>
          ))}
        </div>
        <p className="text-xs" style={{ color: 'var(--subtle)' }}>No password required. Sign with your wallet.</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      {/* Top cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tier */}
        <div className="glass-strong rounded-2xl p-4">
          <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--subtle)' }}>Access Tier</div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ background: TIER_COLORS[tier] }} />
            <span className="display text-2xl font-bold" style={{ color: TIER_COLORS[tier] }}>{TIER_LABELS[tier]}</span>
          </div>
          <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>{TIER_DESCRIPTIONS[tier]}</p>
          <button onClick={() => dispatch({ type: 'SET_SECTION', section: 'identity' })}
            className="text-xs font-medium px-3 py-1.5 rounded-lg w-full text-center transition-colors hover:opacity-80"
            style={{ background: 'var(--surface-strong)', color: 'var(--ink-2)' }}>
            {isRegistered ? 'Manage Identity' : 'Register Identity'}
          </button>
        </div>

        {/* USDC */}
        <div className="glass-strong rounded-2xl p-4">
          <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--subtle)' }}>USDC Balance</div>
          <div className="flex items-center gap-2 mb-1">
            <TokenUSDC variant="branded" size={22} />
            <span className="display text-2xl font-bold tabular" style={{ color: 'var(--ink)' }}>{formattedUsdc}</span>
            <button onClick={() => void refetchUsdc()} className="ml-auto p-1 rounded hover:bg-white/5">
              <RefreshCw size={11} style={{ color: 'var(--subtle)' }} />
            </button>
          </div>
          <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>Arc Testnet · Native USDC</p>
          <button onClick={() => dispatch({ type: 'SET_SECTION', section: 'payments' })}
            className="text-xs font-medium px-3 py-1.5 rounded-lg w-full text-center transition-colors hover:opacity-80"
            style={{ background: 'var(--surface-strong)', color: 'var(--ink-2)' }}>
            Send / Receive
          </button>
        </div>

        {/* PVX */}
        <div className="glass-strong rounded-2xl p-4">
          <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--subtle)' }}>PVX Balance</div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--accent-2)', fontSize: '10px', color: '#080e1a', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>P</div>
            <span className="display text-2xl font-bold tabular" style={{ color: 'var(--ink)' }}>{formattedPvx}</span>
          </div>
          <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>PRIVEX utility token</p>
          <button onClick={() => dispatch({ type: 'SET_SECTION', section: 'swap' })}
            className="text-xs font-medium px-3 py-1.5 rounded-lg w-full text-center transition-colors hover:opacity-80"
            style={{ background: 'var(--surface-strong)', color: 'var(--ink-2)' }}>
            Get PVX
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--subtle)' }}>Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map(({ label, icon: Icon, section, tier: reqTier, badge }) => {
            const locked = tier < reqTier
            return (
              <button key={label}
                onClick={() => !locked && dispatch({ type: 'SET_SECTION', section })}
                disabled={locked}
                className="glass rounded-xl p-4 flex flex-col items-start gap-2 transition-all disabled:opacity-40 text-left hover:glass-strong relative">
                {badge !== undefined && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'var(--danger)', color: '#fff' }}>{badge > 9 ? '9+' : badge}</div>
                )}
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--surface-strong)' }}>
                  <Icon size={16} style={{ color: locked ? 'var(--subtle)' : 'var(--accent)' }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: 'var(--ink-2)' }}>{label}</span>
                {locked && <span className="text-xs" style={{ color: 'var(--warning)' }}>Req. {TIER_LABELS[reqTier]}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Security + Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Security status */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={14} style={{ color: 'var(--accent)' }} />
            <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--subtle)' }}>Security Status</h3>
            <button onClick={() => dispatch({ type: 'SET_SECTION', section: 'security' })} className="ml-auto text-xs" style={{ color: 'var(--accent)' }}>Details</button>
          </div>
          <div className="space-y-2.5">
            {securityItems.map(({ label, ok, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={12} style={{ color: ok ? 'var(--secure)' : 'var(--subtle)' }} />
                  <span className="text-xs" style={{ color: 'var(--ink-2)' }}>{label}</span>
                </div>
                <span className="text-xs font-medium" style={{ color: ok ? 'var(--secure)' : 'var(--warning)' }}>
                  {ok ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={14} style={{ color: 'var(--accent)' }} />
            <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--subtle)' }}>Recent Activity</h3>
          </div>
          {state.activityFeed.length === 0 ? (
            <div className="flex items-center gap-2 py-4 text-xs" style={{ color: 'var(--muted)' }}>
              <Clock size={12} />
              <span>Activity will appear here after you use PRIVEX features</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {state.activityFeed.slice(0, 6).map(event => {
                const Icon = ACTIVITY_ICONS[event.icon] ?? Shield
                const color = ACTIVITY_COLORS[event.icon] ?? 'var(--accent)'
                return (
                  <div key={event.id} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${color}22` }}>
                      <Icon size={11} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate" style={{ color: 'var(--ink-2)' }}>{event.type}</p>
                      <p className="text-xs" style={{ color: 'var(--subtle)' }}>{event.detail}</p>
                    </div>
                    <span className="text-xs flex-shrink-0" style={{ color: 'var(--subtle)' }}>{timeAgo(event.timestamp)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Service status */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={13} style={{ color: 'var(--accent)' }} />
          <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--subtle)' }}>Service Status</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {serviceStatuses.map(({ name, ok }) => (
            <div key={name} className="glass rounded-xl px-3 py-2.5 flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ok ? 'secure-pulse' : ''}`}
                style={{ background: ok ? 'var(--secure)' : 'var(--subtle)' }} />
              <span className="text-xs" style={{ color: 'var(--ink-2)' }}>{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* VPN warning */}
      {!state.vpnConnected && (
        <div className="glass rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
          style={{ borderColor: 'var(--warning)', border: '1px solid' }}
          onClick={() => dispatch({ type: 'SET_SECTION', section: 'vpn' })}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={13} style={{ color: 'var(--warning)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--ink-2)' }}>VPN not connected — your IP address may be visible</span>
          </div>
          <button className="text-xs font-semibold flex-shrink-0 ml-2" style={{ color: 'var(--accent)' }}>Connect</button>
        </div>
      )}
    </div>
  )
}
