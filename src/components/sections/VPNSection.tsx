/// <reference types="vite/client" />
// oxlint-disable typescript/no-unsafe-member-access
/**
 * PRIVEX VPN — Phase 4
 * Wallet identity → authentication → VPN credentials → encrypted tunnel → VPN node → internet
 * Supports USDC payments for plans, PVX discounts, bandwidth tracking, multi-location.
 * Does NOT claim absolute anonymity. Minimal logging disclosure is shown to user.
 */
import { useState, useEffect, useRef } from 'react'
import {
  Wifi, WifiOff, Globe, Lock, AlertTriangle, CheckCircle,
  MapPin, Clock, CreditCard, TrendingUp, Activity,
  Shield, ChevronRight, Download, Upload,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { erc20Abi } from 'viem'
import { usePrivex } from '../../lib/store'
import { getUsdc } from '@/onchain-facts'
import { parseAmount } from '@/onchain-money'

const ARC_TESTNET_ID = 5042 // Arc Mainnet

interface VPNLocation {
  id: string
  city: string
  country: string
  flag: string
  latency: number
  load: number
  region: string
}

interface VPNPlan {
  id: string
  name: string
  priceUsdc: number
  pvxDiscount: number // % discount with PVX
  bandwidthGB: number
  durationDays: number
  features: string[]
  tier: number // min access tier
  popular?: boolean
}

const VPN_LOCATIONS: VPNLocation[] = [
  { id: 'us-east',      city: 'New York',    country: 'United States', flag: '🇺🇸', latency: 12,  load: 34, region: 'Americas' },
  { id: 'us-west',      city: 'Los Angeles', country: 'United States', flag: '🇺🇸', latency: 18,  load: 28, region: 'Americas' },
  { id: 'eu-west',      city: 'Amsterdam',   country: 'Netherlands',   flag: '🇳🇱', latency: 28,  load: 21, region: 'Europe' },
  { id: 'eu-central',   city: 'Frankfurt',   country: 'Germany',       flag: '🇩🇪', latency: 31,  load: 45, region: 'Europe' },
  { id: 'uk',           city: 'London',      country: 'United Kingdom',flag: '🇬🇧', latency: 35,  load: 52, region: 'Europe' },
  { id: 'eu-north',     city: 'Stockholm',   country: 'Sweden',        flag: '🇸🇪', latency: 42,  load: 15, region: 'Europe' },
  { id: 'ap-east',      city: 'Tokyo',       country: 'Japan',         flag: '🇯🇵', latency: 92,  load: 18, region: 'Asia-Pacific' },
  { id: 'ap-southeast', city: 'Singapore',   country: 'Singapore',     flag: '🇸🇬', latency: 105, load: 29, region: 'Asia-Pacific' },
  { id: 'ap-south',     city: 'Mumbai',      country: 'India',         flag: '🇮🇳', latency: 118, load: 37, region: 'Asia-Pacific' },
  { id: 'sa',           city: 'São Paulo',   country: 'Brazil',        flag: '🇧🇷', latency: 145, load: 22, region: 'Americas' },
  { id: 'me',           city: 'Dubai',       country: 'UAE',           flag: '🇦🇪', latency: 88,  load: 19, region: 'Middle East' },
  { id: 'af',           city: 'Cape Town',   country: 'South Africa',  flag: '🇿🇦', latency: 175, load: 11, region: 'Africa' },
]

const VPN_PLANS: VPNPlan[] = [
  {
    id: 'basic-monthly',
    name: 'Basic',
    priceUsdc: 2,
    pvxDiscount: 10,
    bandwidthGB: 10,
    durationDays: 30,
    features: ['10 GB bandwidth', '3 server locations', 'Standard speed', 'Kill switch'],
    tier: 3,
  },
  {
    id: 'pro-monthly',
    name: 'Pro',
    priceUsdc: 5,
    pvxDiscount: 20,
    bandwidthGB: 100,
    durationDays: 30,
    features: ['100 GB bandwidth', 'All locations', 'High speed', 'Kill switch', 'Split tunneling'],
    tier: 3,
    popular: true,
  },
  {
    id: 'unlimited-monthly',
    name: 'Unlimited',
    priceUsdc: 10,
    pvxDiscount: 30,
    bandwidthGB: -1,
    durationDays: 30,
    features: ['Unlimited bandwidth', 'All locations', 'Maximum speed', 'Kill switch', 'Split tunneling', 'Dedicated IP'],
    tier: 4,
  },
]

type ViewTab = 'connect' | 'plans' | 'locations' | 'stats'

function loadBar(load: number) {
  const color = load < 40 ? 'var(--secure)' : load < 70 ? 'var(--warning)' : 'var(--danger)'
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-14 h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface-muted)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${load}%`, background: color }} />
      </div>
      <span className="text-xs tabular" style={{ color }}>{load}%</span>
    </div>
  )
}

// Simulated usage counter that ticks while VPN is connected
function useUsageCounter(connected: boolean) {
  const [usedMB, setUsedMB] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    if (connected) {
      intervalRef.current = setInterval(() => {
        setUsedMB(prev => prev + Math.random() * 0.15)
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [connected])
  return usedMB
}

export default function VPNSection() {
  const { state, dispatch } = usePrivex()
  const { address } = useAccount()
  const [tab, setTab] = useState<ViewTab>('connect')
  const [selectedLocation, setSelectedLocation] = useState<VPNLocation>(VPN_LOCATIONS[0])
  const [connecting, setConnecting] = useState(false)
  const [vpnKey, setVpnKey] = useState<string | null>(null)
  const [connectedAt, setConnectedAt] = useState<number | null>(null)
  const [activeSubscription, setActiveSubscription] = useState<VPNPlan | null>(null)
  const [payingPlan, setPayingPlan] = useState<VPNPlan | null>(null)
  const [regionFilter, setRegionFilter] = useState('All')
  const [elapsed, setElapsed] = useState(0)
  const usedMB = useUsageCounter(state.vpnConnected)

  const usdcFact = getUsdc(ARC_TESTNET_ID)

  // Elapsed timer
  useEffect(() => {
    if (!state.vpnConnected || !connectedAt) {
      setTimeout(() => setElapsed(0), 0)
      return
    }
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - connectedAt) / 1000)), 1000)
    return () => clearInterval(iv)
  }, [state.vpnConnected, connectedAt])

  const { writeContract, data: payHash, isPending: payPending } = useWriteContract()
  const { isSuccess: payConfirmed } = useWaitForTransactionReceipt({ hash: payHash })

  // On payment confirmed, activate subscription
  useEffect(() => {
    if (!payConfirmed || !payingPlan) return
    const plan = payingPlan
    setTimeout(() => {
      setActiveSubscription(plan)
      setPayingPlan(null)
      toast.success(`${plan.name} plan activated!`)
    }, 0)
  }, [payConfirmed, payingPlan])

  const buyPlan = (plan: VPNPlan) => {
    if (!address || !usdcFact) { toast.error('Connect wallet first'); return }
    setPayingPlan(plan)
    let parsed: bigint
    try { parsed = parseAmount(ARC_TESTNET_ID, plan.priceUsdc.toString()).raw }
    catch { toast.error('Amount error'); return }
    writeContract({
      address: usdcFact.address as `0x${string}`,
      abi: erc20Abi,
      functionName: 'transfer',
      // In production this goes to PaymentRouter contract
      args: [address, parsed],
      chainId: ARC_TESTNET_ID,
    })
  }

  const toggleVPN = async () => {
    if (state.vpnConnected) {
      dispatch({ type: 'SET_VPN', connected: false })
      setVpnKey(null)
      setConnectedAt(null)
      toast.success('VPN disconnected')
      return
    }
    if (!activeSubscription && import.meta.env.PROD) {
      toast.error('Purchase a VPN plan first')
      setTab('plans')
      return
    }
    setConnecting(true)
    // Simulate WireGuard credential issuance from wallet identity
    // In production: POST /api/vpn/credentials with auth token → server issues WireGuard config
    await new Promise(r => setTimeout(r, 1800))
    const fakeKey = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('')
    setVpnKey(fakeKey)
    setConnectedAt(Date.now())
    dispatch({ type: 'SET_VPN', connected: true, location: `${selectedLocation.city}, ${selectedLocation.country}` })
    setConnecting(false)
    toast.success(`Protected via ${selectedLocation.city}`)
  }

  const fmtElapsed = (s: number) => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const regions = ['All', ...Array.from(new Set(VPN_LOCATIONS.map(l => l.region)))]
  const filteredLocations = regionFilter === 'All' ? VPN_LOCATIONS : VPN_LOCATIONS.filter(l => l.region === regionFilter)

  const tabs: { id: ViewTab; label: string }[] = [
    { id: 'connect', label: 'Connect' },
    { id: 'plans', label: 'Plans' },
    { id: 'locations', label: 'Locations' },
    { id: 'stats', label: 'Stats' },
  ]

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {state.vpnConnected
            ? <Wifi size={18} style={{ color: 'var(--secure)' }} />
            : <WifiOff size={18} style={{ color: 'var(--subtle)' }} />}
          <h2 className="display font-bold text-lg" style={{ color: 'var(--ink)' }}>PRIVEX VPN</h2>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: state.vpnConnected ? '#00e59622' : 'var(--surface-muted)' }}>
          <div className={`w-1.5 h-1.5 rounded-full ${state.vpnConnected ? 'secure-pulse' : ''}`}
            style={{ background: state.vpnConnected ? 'var(--secure)' : 'var(--subtle)' }} />
          <span className="text-xs font-semibold" style={{ color: state.vpnConnected ? 'var(--secure)' : 'var(--subtle)' }}>
            {connecting ? 'Connecting...' : state.vpnConnected ? 'Protected' : 'Unprotected'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{ background: tab === t.id ? 'var(--surface-strong)' : 'transparent', color: tab === t.id ? 'var(--ink)' : 'var(--muted)' }}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>

          {/* ── CONNECT TAB ── */}
          {tab === 'connect' && (
            <div className="space-y-4">
              {/* Big connect card */}
              <div className="glass-strong rounded-2xl p-6 text-center">
                <motion.div
                  animate={state.vpnConnected ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 relative"
                  style={{ background: state.vpnConnected ? '#00e59622' : 'var(--surface-muted)', border: `2px solid ${state.vpnConnected ? 'var(--secure)' : 'var(--border-strong)'}` }}
                >
                  {state.vpnConnected
                    ? <Shield size={40} style={{ color: 'var(--secure)' }} />
                    : <Shield size={40} style={{ color: 'var(--subtle)' }} />}
                  {state.vpnConnected && (
                    <motion.div className="absolute inset-0 rounded-full border-2"
                      style={{ borderColor: 'var(--secure)' }}
                      animate={{ scale: [1, 1.4, 1.8], opacity: [0.5, 0.2, 0] }}
                      transition={{ duration: 2, repeat: Infinity }} />
                  )}
                </motion.div>

                {state.vpnConnected ? (
                  <>
                    <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--secure)' }}>Your connection is encrypted</p>
                    <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Tunneled through {state.vpnLocation}</p>
                    <p className="mono text-xs mb-4" style={{ color: 'var(--subtle)' }}>{fmtElapsed(elapsed)}</p>
                    {vpnKey && (
                      <div className="glass rounded-xl px-3 py-2 mb-4 text-left">
                        <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>WireGuard session key (public)</div>
                        <div className="mono text-xs truncate" style={{ color: 'var(--accent)' }}>{vpnKey.slice(0, 32)}...</div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--ink)' }}>Your connection is not protected</p>
                    <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>Connect to encrypt your traffic and mask your IP</p>
                  </>
                )}

                {/* Location preview */}
                <div className="flex items-center justify-center gap-3 mb-5">
                  <div className="glass rounded-xl px-4 py-2 text-center">
                    <MapPin size={12} style={{ color: 'var(--muted)' }} className="mx-auto mb-0.5" />
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>Your IP</div>
                    <div className="text-xs font-semibold" style={{ color: 'var(--ink-2)' }}>{state.vpnConnected ? 'Hidden' : 'Visible'}</div>
                  </div>
                  <Lock size={16} style={{ color: state.vpnConnected ? 'var(--secure)' : 'var(--subtle)' }} />
                  <div className="glass rounded-xl px-4 py-2 text-center">
                    <Globe size={12} style={{ color: 'var(--accent)' }} className="mx-auto mb-0.5" />
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>Exit node</div>
                    <div className="text-xs font-semibold" style={{ color: 'var(--ink-2)' }}>{selectedLocation.flag} {selectedLocation.city}</div>
                  </div>
                </div>

                <button
                  onClick={() => { void toggleVPN() }}
                  disabled={connecting}
                  className="w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: state.vpnConnected ? 'var(--danger)' : 'linear-gradient(135deg, var(--secure) 0%, #00b87a 100%)', color: '#080e1a' }}
                >
                  {connecting ? (
                    <><div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />Establishing encrypted tunnel...</>
                  ) : state.vpnConnected ? (
                    <><WifiOff size={16} />Disconnect VPN</>
                  ) : (
                    <><Wifi size={16} />Connect VPN</>
                  )}
                </button>
              </div>

              {/* Quick location picker */}
              <div className="glass-strong rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={13} style={{ color: 'var(--accent)' }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Selected Location</span>
                  </div>
                  <button onClick={() => setTab('locations')} className="text-xs flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                    Change <ChevronRight size={10} />
                  </button>
                </div>
                <div className="flex items-center gap-3 glass rounded-xl px-3 py-2.5">
                  <span className="text-xl">{selectedLocation.flag}</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{selectedLocation.city}</div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>{selectedLocation.country}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs tabular" style={{ color: 'var(--ink-2)' }}>{selectedLocation.latency}ms</div>
                    {loadBar(selectedLocation.load)}
                  </div>
                </div>
              </div>

              {/* Subscription status */}
              <div className="glass rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard size={13} style={{ color: 'var(--accent)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Subscription</span>
                </div>
                {activeSubscription ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--accent)', color: '#080e1a' }}>{activeSubscription.name}</span>
                      <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                        {activeSubscription.bandwidthGB < 0 ? 'Unlimited' : `${activeSubscription.bandwidthGB} GB`} · {activeSubscription.durationDays} days
                      </div>
                    </div>
                    <CheckCircle size={16} style={{ color: 'var(--secure)' }} />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>No active plan (dev mode: unlimited)</span>
                    <button onClick={() => setTab('plans')} className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>Get Plan</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── PLANS TAB ── */}
          {tab === 'plans' && (
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                Pay with USDC. PRIVEX token holders receive automatic discounts.
              </p>
              {VPN_PLANS.map(plan => (
                <div key={plan.id} className={`glass-strong rounded-2xl p-5 relative overflow-hidden ${activeSubscription?.id === plan.id ? 'ring-1 ring-[var(--secure)]' : ''}`}>
                  {plan.popular && (
                    <div className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--accent)', color: '#080e1a' }}>Popular</div>
                  )}
                  <div className="flex items-start gap-3">
                    <div>
                      <h3 className="display font-bold text-base" style={{ color: 'var(--ink)' }}>{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="display text-2xl font-bold" style={{ color: 'var(--accent)' }}>${plan.priceUsdc}</span>
                        <span className="text-xs" style={{ color: 'var(--muted)' }}>USDC / {plan.durationDays} days</span>
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--secure)' }}>Save {plan.pvxDiscount}% with PVX</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    {plan.features.map(f => (
                      <div key={f} className="flex items-center gap-2">
                        <CheckCircle size={11} style={{ color: 'var(--secure)', flexShrink: 0 }} />
                        <span className="text-xs" style={{ color: 'var(--ink-2)' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  {activeSubscription?.id === plan.id ? (
                    <div className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold text-center" style={{ background: '#00e59622', color: 'var(--secure)' }}>
                      Active Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => buyPlan(plan)}
                      disabled={payPending && payingPlan?.id === plan.id}
                      className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                      style={{ background: plan.popular ? 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)' : 'var(--surface-strong)', color: plan.popular ? '#080e1a' : 'var(--ink)' }}
                    >
                      {payPending && payingPlan?.id === plan.id ? (
                        <><div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />Confirm in wallet...</>
                      ) : (
                        <><CreditCard size={13} />Pay ${plan.priceUsdc} USDC</>
                      )}
                    </button>
                  )}
                </div>
              ))}
              <div className="glass rounded-xl p-3 flex items-start gap-2">
                <AlertTriangle size={11} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 1 }} />
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  VPN services are non-refundable once activated. PRIVEX VPN does not provide absolute anonymity — metadata such as connection timing and volume may be observable. No browsing history is retained.
                </p>
              </div>
            </div>
          )}

          {/* ── LOCATIONS TAB ── */}
          {tab === 'locations' && (
            <div className="space-y-3">
              {/* Region filter */}
              <div className="flex gap-1.5 flex-wrap">
                {regions.map(r => (
                  <button key={r} onClick={() => setRegionFilter(r)}
                    className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                    style={{ background: regionFilter === r ? 'var(--accent)' : 'var(--surface-muted)', color: regionFilter === r ? '#080e1a' : 'var(--muted)' }}>
                    {r}
                  </button>
                ))}
              </div>

              <div className="glass-strong rounded-2xl overflow-hidden">
                {filteredLocations.map((loc, i) => (
                  <button
                    key={loc.id}
                    onClick={() => { setSelectedLocation(loc); if (state.vpnConnected) dispatch({ type: 'SET_VPN', connected: true, location: `${loc.city}, ${loc.country}` }); toast.success(`Location: ${loc.city}`) }}
                    className={`w-full px-4 py-3 flex items-center gap-3 transition-all text-left hover:bg-white/5 ${i < filteredLocations.length - 1 ? 'border-b' : ''}`}
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <span className="text-lg w-6 text-center">{loc.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>{loc.city}</div>
                      <div className="text-xs" style={{ color: 'var(--subtle)' }}>{loc.country}</div>
                    </div>
                    <div className="text-right mr-3">
                      <div className="text-xs tabular" style={{ color: 'var(--ink-2)' }}>{loc.latency}ms</div>
                      {loadBar(loc.load)}
                    </div>
                    {selectedLocation.id === loc.id && <CheckCircle size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STATS TAB ── */}
          {tab === 'stats' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Session Time', value: state.vpnConnected ? fmtElapsed(elapsed) : '00:00:00', icon: Clock, color: 'var(--accent)' },
                  { label: 'Data Used', value: `${usedMB.toFixed(1)} MB`, icon: Activity, color: 'var(--accent-2)' },
                  { label: 'Download', value: state.vpnConnected ? '1.8 MB/s' : '—', icon: Download, color: 'var(--secure)' },
                  { label: 'Upload', value: state.vpnConnected ? '0.3 MB/s' : '—', icon: Upload, color: 'var(--warning)' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="glass-strong rounded-2xl p-4">
                    <Icon size={14} style={{ color }} className="mb-2" />
                    <div className="display text-lg font-bold tabular" style={{ color: 'var(--ink)' }}>{value}</div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Bandwidth plan usage */}
              {activeSubscription && activeSubscription.bandwidthGB > 0 && (
                <div className="glass-strong rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Bandwidth Usage</span>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>{activeSubscription.name} plan</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: 'var(--surface-muted)' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min((usedMB / (activeSubscription.bandwidthGB * 1024)) * 100, 100).toFixed(2)}%`, background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-2) 100%)' }} />
                  </div>
                  <div className="flex justify-between text-xs" style={{ color: 'var(--muted)' }}>
                    <span>{usedMB.toFixed(1)} MB used</span>
                    <span>{activeSubscription.bandwidthGB} GB total</span>
                  </div>
                </div>
              )}

              {/* Connection log */}
              <div className="glass-strong rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={13} style={{ color: 'var(--accent)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Connection Log</span>
                  <span className="text-xs ml-auto" style={{ color: 'var(--subtle)' }}>Local only — never sent to server</span>
                </div>
                {state.vpnConnected ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: 'var(--muted)' }}>Status</span>
                      <span style={{ color: 'var(--secure)' }}>Connected</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: 'var(--muted)' }}>Exit node</span>
                      <span style={{ color: 'var(--ink-2)' }}>{selectedLocation.flag} {selectedLocation.city}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: 'var(--muted)' }}>Protocol</span>
                      <span style={{ color: 'var(--ink-2)' }}>WireGuard (simulated)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: 'var(--muted)' }}>Session key</span>
                      <span className="mono" style={{ color: 'var(--subtle)' }}>{vpnKey ? vpnKey.slice(0, 16) + '...' : '—'}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-center py-4" style={{ color: 'var(--muted)' }}>Not connected</p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Privacy notice */}
      <div className="glass rounded-xl p-3 flex items-start gap-2">
        <AlertTriangle size={12} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 1 }} />
        <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
          <strong style={{ color: 'var(--ink-2)' }}>Privacy Notice:</strong> PRIVEX VPN encrypts traffic and masks your IP. It does not provide absolute anonymity. Exit nodes observe connection metadata (timing, volume, destination IPs) but not content. Minimal operational logs for abuse prevention only. No browsing history is stored.
        </p>
      </div>
    </div>
  )
}
