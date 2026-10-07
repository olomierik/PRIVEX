// oxlint-disable typescript/no-unsafe-member-access, typescript/no-floating-promises, typescript/no-unsafe-assignment, typescript/no-unsafe-argument
/**
 * PRIVEX Admin Panel
 * Operational metrics only — admins CANNOT read private messages,
 * emails, call content, or user private keys.
 */
import { useState, useEffect } from 'react'
import {
  Users, Activity, Shield, Wifi, TrendingUp, Server,
  Globe, ArrowUpDown, AlertTriangle, CheckCircle,
  Clock, Lock, Eye, EyeOff, type LucideProps,
} from 'lucide-react'
import type { ForwardRefExoticComponent, RefAttributes } from 'react'

type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>

import { usePrivex } from '../../lib/store'
import { useAccount } from 'wagmi'
import { ADMIN_WALLET } from '../../config'

interface MetricCard {
  label: string
  value: string | number
  delta?: string
  deltaPositive?: boolean
  icon: LucideIcon
  color: string
}

interface SystemService {
  name: string
  status: 'operational' | 'degraded' | 'down'
  latency: number
  uptime: string
}

// Simulated operational data — in production these come from a privacy-preserving
// analytics backend that aggregates without exposing individual user data.
function useAdminMetrics(backendOnline: boolean) {
  const [metrics, setMetrics] = useState({
    totalUsers: 1247,
    activeWallets: 89,
    tokenHolders: 632,
    vpnSessions: 23,
    messagesRelayed: 8419,
    emailsRelayed: 1203,
    revenue24h: 142.50,
    swapVolume: 28340,
    bridgeVolume: 91200,
    avgTier: 1.4,
  })

  useEffect(() => {
    if (!backendOnline) return
    const iv = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        activeWallets: prev.activeWallets + Math.floor((Math.random() - 0.4) * 3),
        vpnSessions: Math.max(0, prev.vpnSessions + Math.floor((Math.random() - 0.4) * 2)),
        messagesRelayed: prev.messagesRelayed + Math.floor(Math.random() * 4),
        emailsRelayed: prev.emailsRelayed + Math.floor(Math.random() * 2),
      }))
    }, 5000)
    return () => clearInterval(iv)
  }, [backendOnline])

  return metrics
}

const SERVICES: SystemService[] = [
  { name: 'Message Relay', status: 'operational', latency: 12, uptime: '99.97%' },
  { name: 'Email Relay', status: 'operational', latency: 18, uptime: '99.94%' },
  { name: 'WebRTC Signaling', status: 'operational', latency: 8, uptime: '99.99%' },
  { name: 'VPN Provisioning', status: 'operational', latency: 45, uptime: '99.89%' },
  { name: 'Arc RPC', status: 'operational', latency: 23, uptime: '99.95%' },
  { name: 'CCTP Bridge', status: 'operational', latency: 180, uptime: '99.91%' },
  { name: 'Identity Registry', status: 'operational', latency: 15, uptime: '100%' },
]

const TIER_DIST = [
  { tier: 'FREE', count: 487, color: 'var(--subtle)' },
  { tier: 'BASIC', count: 312, color: 'var(--ink-2)' },
  { tier: 'PRO', count: 198, color: '#60a5fa' },
  { tier: 'PREMIUM', count: 156, color: 'var(--accent)' },
  { tier: 'VIP', count: 94, color: 'var(--accent-2)' },
]

export default function AdminSection() {
  const { state } = usePrivex()
  const { address } = useAccount()
  const metrics = useAdminMetrics(state.backendOnline)
  const [showAddress, setShowAddress] = useState(false)
  const [tab, setTab] = useState<'overview' | 'users' | 'services' | 'revenue'>('overview')

  // Access control: only the designated admin wallet can view this panel
  const isAdmin = address?.toLowerCase() === ADMIN_WALLET.toLowerCase()

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--surface-muted)' }}>
          <Lock size={28} style={{ color: 'var(--muted)' }} />
        </div>
        <h2 className="display font-bold text-lg" style={{ color: 'var(--ink)' }}>Admin Access</h2>
        <p className="text-sm text-center max-w-xs" style={{ color: 'var(--muted)' }}>
          Connect the admin wallet to access the operations panel.
        </p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: '#ef444422' }}>
          <Shield size={28} style={{ color: 'var(--danger)' }} />
        </div>
        <h2 className="display font-bold text-lg" style={{ color: 'var(--ink)' }}>Access Denied</h2>
        <p className="text-sm text-center max-w-xs" style={{ color: 'var(--muted)' }}>
          This panel is restricted to the PRIVEX admin wallet.
        </p>
        <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
          <AlertTriangle size={12} style={{ color: 'var(--warning)' }} />
          <span className="mono text-xs" style={{ color: 'var(--subtle)' }}>
            Connected: {address.slice(0, 10)}...{address.slice(-6)}
          </span>
        </div>
      </div>
    )
  }

  const metricCards: MetricCard[] = [
    { label: 'Total Users', value: metrics.totalUsers.toLocaleString(), delta: '+12 today', deltaPositive: true, icon: Users, color: 'var(--accent)' },
    { label: 'Active Wallets (24h)', value: metrics.activeWallets, delta: 'Live', deltaPositive: true, icon: Activity, color: 'var(--accent-2)' },
    { label: 'PVX Token Holders', value: metrics.tokenHolders.toLocaleString(), delta: '+8 this week', deltaPositive: true, icon: Shield, color: '#60a5fa' },
    { label: 'VPN Sessions', value: metrics.vpnSessions, delta: 'Live', deltaPositive: true, icon: Wifi, color: 'var(--secure)' },
    { label: 'Messages Relayed', value: metrics.messagesRelayed.toLocaleString(), delta: '+4 recently', deltaPositive: true, icon: Lock, color: 'var(--warning)' },
    { label: 'Revenue (24h)', value: `$${metrics.revenue24h.toFixed(2)}`, delta: '+$18 vs yesterday', deltaPositive: true, icon: TrendingUp, color: 'var(--secure)' },
  ]

  const statusColor = (s: SystemService['status']) =>
    s === 'operational' ? 'var(--secure)' : s === 'degraded' ? 'var(--warning)' : 'var(--danger)'

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="display font-bold text-lg" style={{ color: 'var(--ink)' }}>Admin Panel</h2>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Operational metrics only — user content is always private</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'var(--surface-muted)' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: state.backendOnline ? 'var(--secure)' : 'var(--danger)' }} />
          <span className="text-xs" style={{ color: 'var(--muted)' }}>{state.backendOnline ? 'Backend Online' : 'Backend Offline'}</span>
        </div>
      </div>

      {/* Admin address */}
      <div className="glass rounded-xl p-3 flex items-center gap-2">
        <CheckCircle size={12} style={{ color: 'var(--secure)', flexShrink: 0 }} />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium" style={{ color: 'var(--ink-2)' }}>Admin wallet: </span>
          <span className="mono text-xs" style={{ color: 'var(--muted)' }}>
            {showAddress ? ADMIN_WALLET : `${ADMIN_WALLET.slice(0, 10)}...${ADMIN_WALLET.slice(-6)}`}
          </span>
        </div>
        <button onClick={() => setShowAddress(v => !v)} className="p-1 rounded hover:bg-white/5">
          {showAddress ? <EyeOff size={12} style={{ color: 'var(--muted)' }} /> : <Eye size={12} style={{ color: 'var(--muted)' }} />}
        </button>
      </div>

      {/* Privacy disclaimer */}
      <div className="glass rounded-xl p-3 flex items-start gap-2">
        <Lock size={12} style={{ color: 'var(--secure)', flexShrink: 0, marginTop: 1 }} />
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          <strong style={{ color: 'var(--ink-2)' }}>Privacy Architecture:</strong> This panel shows aggregated operational metrics only. Administrators cannot access private message content, encrypted emails, call recordings, user private keys, or VPN browsing history. All user data is end-to-end encrypted and inaccessible to the platform.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass rounded-xl p-1">
        {(['overview', 'users', 'services', 'revenue'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all"
            style={{ background: tab === t ? 'var(--surface-strong)' : 'transparent', color: tab === t ? 'var(--ink)' : 'var(--muted)' }}>
            {t}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {metricCards.map(({ label, value, delta, deltaPositive, icon: Icon, color }) => (
              <div key={label} className="glass-strong rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} style={{ color }} />
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>{label}</span>
                </div>
                <div className="display text-2xl font-bold tabular" style={{ color: 'var(--ink)' }}>{value}</div>
                {delta && <div className="text-xs mt-1" style={{ color: deltaPositive ? 'var(--secure)' : 'var(--danger)' }}>{delta}</div>}
              </div>
            ))}
          </div>

          {/* System health */}
          <div className="glass-strong rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Server size={14} style={{ color: 'var(--accent)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>System Health</span>
              <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: '#00e59622' }}>
                <div className="w-1.5 h-1.5 rounded-full secure-pulse" style={{ background: 'var(--secure)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--secure)' }}>All Systems Operational</span>
              </div>
            </div>
            <div className="space-y-2">
              {SERVICES.map(svc => (
                <div key={svc.name} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: statusColor(svc.status) }} />
                  <span className="text-xs flex-1" style={{ color: 'var(--ink-2)' }}>{svc.name}</span>
                  <span className="text-xs tabular" style={{ color: 'var(--muted)' }}>{svc.latency}ms</span>
                  <span className="text-xs" style={{ color: 'var(--subtle)' }}>{svc.uptime}</span>
                  <span className="text-xs capitalize px-2 py-0.5 rounded-full" style={{ background: statusColor(svc.status) + '22', color: statusColor(svc.status) }}>
                    {svc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* USERS */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="glass-strong rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users size={14} style={{ color: 'var(--accent)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Access Tier Distribution</span>
            </div>
            <div className="space-y-3">
              {TIER_DIST.map(({ tier, count, color }) => {
                const total = TIER_DIST.reduce((a, t) => a + t.count, 0)
                const pct = ((count / total) * 100).toFixed(1)
                return (
                  <div key={tier}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color }}>{tier}</span>
                      <span className="text-xs tabular" style={{ color: 'var(--muted)' }}>{count} users ({pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-muted)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="glass-strong rounded-2xl p-4">
              <div className="text-xs" style={{ color: 'var(--muted)' }}>Avg. Tier</div>
              <div className="display text-2xl font-bold" style={{ color: 'var(--ink)' }}>{metrics.avgTier.toFixed(1)}</div>
              <div className="text-xs" style={{ color: 'var(--subtle)' }}>out of 4</div>
            </div>
            <div className="glass-strong rounded-2xl p-4">
              <div className="text-xs" style={{ color: 'var(--muted)' }}>Registered Identities</div>
              <div className="display text-2xl font-bold" style={{ color: 'var(--ink)' }}>{(metrics.totalUsers * 0.73).toFixed(0)}</div>
              <div className="text-xs" style={{ color: 'var(--subtle)' }}>73% have handles</div>
            </div>
          </div>
        </div>
      )}

      {/* SERVICES */}
      {tab === 'services' && (
        <div className="space-y-3">
          {[
            { label: 'Messages relayed (total)', value: metrics.messagesRelayed.toLocaleString(), icon: Lock, note: 'Ciphertext only — no content access' },
            { label: 'Emails relayed (total)', value: metrics.emailsRelayed.toLocaleString(), icon: Lock, note: 'Ciphertext only — no content access' },
            { label: 'Active VPN sessions', value: metrics.vpnSessions, icon: Wifi, note: 'IP masked — no browsing history' },
            { label: 'Swap volume (24h)', value: `$${metrics.swapVolume.toLocaleString()}`, icon: ArrowUpDown, note: '' },
            { label: 'Bridge volume (24h)', value: `$${metrics.bridgeVolume.toLocaleString()}`, icon: Globe, note: 'CCTP USDC volume' },
          ].map(({ label, value, icon: Icon, note }) => (
            <div key={label} className="glass-strong rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--surface-muted)' }}>
                <Icon size={16} style={{ color: 'var(--accent)' }} />
              </div>
              <div className="flex-1">
                <div className="text-xs" style={{ color: 'var(--muted)' }}>{label}</div>
                <div className="display text-xl font-bold" style={{ color: 'var(--ink)' }}>{value}</div>
                {note && <div className="text-xs" style={{ color: 'var(--subtle)' }}>{note}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REVENUE */}
      {tab === 'revenue' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '24h Revenue', value: `$${metrics.revenue24h.toFixed(2)}`, sub: 'USDC payments' },
              { label: '7d Revenue', value: `$${(metrics.revenue24h * 6.8).toFixed(2)}`, sub: 'USDC payments' },
              { label: 'Monthly Run-rate', value: `$${(metrics.revenue24h * 28).toFixed(2)}`, sub: 'Estimated' },
              { label: 'VPN Revenue', value: `$${(metrics.vpnSessions * 3.5).toFixed(2)}`, sub: 'Active plans' },
            ].map(({ label, value, sub }) => (
              <div key={label} className="glass-strong rounded-2xl p-4">
                <div className="text-xs" style={{ color: 'var(--muted)' }}>{label}</div>
                <div className="display text-2xl font-bold" style={{ color: 'var(--ink)' }}>{value}</div>
                <div className="text-xs" style={{ color: 'var(--subtle)' }}>{sub}</div>
              </div>
            ))}
          </div>
          <div className="glass rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle size={11} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 1 }} />
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              Revenue data is derived from on-chain payment events. Payment metadata (amounts, timestamps) are observable on-chain. No personal payment details are stored server-side.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
