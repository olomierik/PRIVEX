/**
 * PRIVEX — Interactive Landing Page
 * Hero + animated stats + feature grid + tier showcase + CTA
 */
import { useEffect, useRef, useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { erc20Abi, formatUnits } from 'viem'
import {
  Shield, Lock, Wifi, MessageSquare, Phone, Mail,
  ArrowLeftRight, Globe, ShieldCheck,
  Zap, Eye, Key, CheckCircle, ArrowRight, Activity,
  Star, ChevronRight,
} from 'lucide-react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { ConnectKitButton } from 'connectkit'
import { usePrivex } from '../../lib/store'
import { getUsdc } from '@/onchain-facts'
import { TokenUSDC } from '@web3icons/react'

const ARC_TESTNET_ID = 5042002

const TIER_CONFIG = [
  { label: 'FREE',    pvx: '0',       color: '#64748b', bg: 'rgba(100,116,139,0.12)', features: ['Identity Registration', 'Limited Messaging (50/day)'] },
  { label: 'BASIC',   pvx: '1,000',   color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  features: ['Unlimited Messaging', 'File Sharing', 'Contacts'] },
  { label: 'PRO',     pvx: '10,000',  color: '#22d3ee', bg: 'rgba(34,211,238,0.12)',  features: ['Voice & Video Calls', 'Private Email', 'Advanced Crypto'] },
  { label: 'PREMIUM', pvx: '50,000',  color: '#818cf8', bg: 'rgba(129,140,248,0.12)', features: ['VPN Access', 'All PRO features', 'Priority Support'] },
  { label: 'VIP',     pvx: '100,000', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  features: ['All Features', 'Zero Protocol Fees', 'Governance Voting'] },
]

const FEATURES = [
  { icon: MessageSquare, label: 'E2E Messaging',      desc: 'AES-GCM 256 encrypted. Server never sees plaintext.', color: '#3b82f6', section: 'messages' as const },
  { icon: Phone,         label: 'Private Calls',      desc: 'Peer-to-peer WebRTC. Server handles SDP/ICE only.', color: '#22d3ee', section: 'calls' as const },
  { icon: Mail,          label: 'Encrypted Email',    desc: 'End-to-end email relay. Disappearing messages.', color: '#818cf8', section: 'email' as const },
  { icon: Wifi,          label: 'VPN',                desc: 'Privacy layer. Your IP stays hidden from observers.', color: '#34d399', section: 'vpn' as const },
  { icon: Lock,          label: 'USDC Payments',      desc: 'Send, receive, and request USDC with low fees.', color: '#fbbf24', section: 'payments' as const },
  { icon: ArrowLeftRight,label: 'Token Swap',         desc: 'Swap tokens directly from your private wallet.', color: '#60a5fa', section: 'swap' as const },
  { icon: Globe,         label: 'Cross-Chain Bridge', desc: 'Move USDC across chains via Circle CCTP.', color: '#a78bfa', section: 'bridge' as const },
  { icon: ShieldCheck,   label: 'Wallet Identity',    desc: 'On-chain handle registry. No passwords ever.', color: '#f472b6', section: 'identity' as const },
]

const STATS = [
  { value: '256',  unit: 'bit',  label: 'AES-GCM Encryption' },
  { value: 'P2P',  unit: '',     label: 'WebRTC Call Routing' },
  { value: '3',    unit: 'x',    label: 'Smart Contracts Live' },
  { value: '100%', unit: '',     label: 'Non-Custodial' },
]

const ACCESS_MANAGER_ABI = [
  { type: 'function', name: 'getAccessTier', inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: '', type: 'uint8' }], stateMutability: 'view' },
  { type: 'function', name: 'isRegistered',  inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: '', type: 'bool'   }], stateMutability: 'view' },
] as const

const ACCESS_MANAGER_ADDRESS  = import.meta.env.VITE_ACCESS_MANAGER_ADDRESS  as `0x${string}` | undefined
const PRIVEX_TOKEN_ADDRESS     = import.meta.env.VITE_PRIVEX_TOKEN_ADDRESS    as `0x${string}` | undefined

// Particle canvas
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf: number
    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number; color: string }[] = []
    const COLORS = ['#3b82f6', '#60a5fa', '#22d3ee', '#818cf8', '#6366f1']

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.4 + 0.4,
        alpha: Math.random() * 0.5 + 0.15,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(96,165,250,${(1 - dist / 120) * 0.12})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2, '0')
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}

// Animated counter
function AnimatedNumber({ value }: { value: string }) {
  const [displayed, setDisplayed] = useState('0')
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && !started) setStarted(true) },
      { threshold: 0.5 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    const num = parseFloat(value.replace(/[^0-9.]/g, ''))
    let timer: ReturnType<typeof setInterval>
    if (isNaN(num)) {
      // schedule the update outside the synchronous effect body
      timer = setInterval(() => {
        setDisplayed(value)
        clearInterval(timer)
      }, 0)
    } else {
      let start = 0
      const step = num / 40
      timer = setInterval(() => {
        start = Math.min(start + step, num)
        setDisplayed(value.includes(',') ? Math.round(start).toLocaleString() : String(Math.round(start * 10) / 10))
        if (start >= num) clearInterval(timer)
      }, 30)
    }
    return () => clearInterval(timer)
  }, [started, value])

  return <span ref={ref}>{started ? displayed : '0'}</span>
}

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
}

export default function HomeSection() {
  const { address } = useAccount()
  const { dispatch } = usePrivex()
  const [activeTier, setActiveTier] = useState(1)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.4])
  const heroY = useTransform(scrollY, [0, 300], [0, 40])

  const usdcFact = getUsdc(ARC_TESTNET_ID)

  const { data: usdcBalance } = useReadContract({
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

  const tier = typeof accessTier === 'number' ? accessTier : 0
  const formattedUsdc = usdcBalance !== undefined ? parseFloat(formatUnits(usdcBalance, 6)).toFixed(2) : null
  const formattedPvx  = pvxBalance  !== undefined ? parseFloat(formatUnits(pvxBalance,  18)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : null

  // Auto-cycle tier showcase
  useEffect(() => {
    const t = setInterval(() => setActiveTier(i => (i + 1) % TIER_CONFIG.length), 3200)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="relative">
      <ParticleCanvas />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-6 pt-16 pb-20"
      >
        {/* Scanning line inside hero */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-none">
          <div className="scan-line" />
        </div>

        {/* Hero logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.75, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="mb-8"
        >
          <img
            src="/privex-logo.svg"
            alt="PRIVEX"
            className="w-28 h-28 mx-auto"
            style={{ filter: 'drop-shadow(0 0 28px rgba(59,130,246,0.7)) drop-shadow(0 0 8px rgba(109,40,217,0.5))' }}
          />
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
          style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)' }}
        >
          <div className="w-1.5 h-1.5 rounded-full secure-pulse" style={{ background: '#34d399' }} />
          <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#60a5fa' }}>
            Live on Arc Testnet · 3 Contracts Deployed
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="max-w-4xl"
        >
          <motion.h1 variants={fadeUp} className="display font-bold leading-tight mb-4" style={{ fontSize: 'clamp(2.6rem, 6vw, 5rem)', letterSpacing: '-0.04em' }}>
            <span style={{ color: 'var(--ink)' }}>One Wallet.</span>
            <br />
            <span className="gradient-text">One Identity.</span>
            <br />
            <span style={{ color: 'var(--ink-2)' }}>Complete Privacy.</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-base md:text-lg leading-relaxed mb-10 max-w-2xl mx-auto" style={{ color: 'var(--muted)' }}>
            PRIVEX is a Web3 privacy protocol on Arc — encrypted messaging, private calls, email, VPN, and USDC payments, all secured by your wallet.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3">
            <ConnectKitButton.Custom>
              {({ isConnected, show }) =>
                !isConnected ? (
                  <motion.button
                    onClick={show}
                    whileTap={{ scale: 0.97 }}
                    className="btn-primary flex items-center gap-2 px-7 py-3.5 text-sm"
                  >
                    <Shield size={15} />
                    Connect Wallet to Start
                    <ArrowRight size={14} />
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={() => dispatch({ type: 'SET_SECTION', section: 'messages' })}
                    whileTap={{ scale: 0.97 }}
                    className="btn-primary flex items-center gap-2 px-7 py-3.5 text-sm"
                  >
                    <MessageSquare size={15} />
                    Open Dashboard
                    <ArrowRight size={14} />
                  </motion.button>
                )
              }
            </ConnectKitButton.Custom>

            <motion.button
              onClick={() => dispatch({ type: 'SET_SECTION', section: 'identity' })}
              whileTap={{ scale: 0.97 }}
              className="btn-ghost flex items-center gap-2 px-6 py-3.5 text-sm"
            >
              <Key size={14} />
              Register Identity
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Live wallet cards (when connected) */}
        <AnimatePresence>
          {address && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.2, duration: 0.35 }}
              className="mt-12 flex flex-wrap justify-center gap-4"
            >
              {/* USDC card */}
              <div className="card-glow rounded-2xl px-5 py-4 flex items-center gap-3 min-w-[180px]">
                <TokenUSDC variant="branded" size={28} />
                <div>
                  <div className="text-xs font-medium" style={{ color: 'var(--subtle)' }}>USDC Balance</div>
                  <div className="display text-xl font-bold tabular" style={{ color: 'var(--ink)' }}>
                    {formattedUsdc ?? '—'}
                  </div>
                </div>
              </div>

              {/* PVX card */}
              <div className="card-glow rounded-2xl px-5 py-4 flex items-center gap-3 min-w-[180px]">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #818cf8 100%)', fontSize: '12px', color: '#fff', fontFamily: 'Space Grotesk', fontWeight: 700 }}>
                  P
                </div>
                <div>
                  <div className="text-xs font-medium" style={{ color: 'var(--subtle)' }}>PVX Balance</div>
                  <div className="display text-xl font-bold tabular" style={{ color: 'var(--ink)' }}>
                    {formattedPvx ?? '—'}
                  </div>
                </div>
              </div>

              {/* Tier card */}
              <div className="card-glow rounded-2xl px-5 py-4 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: TIER_CONFIG[tier].bg, border: `1px solid ${TIER_CONFIG[tier].color}44` }}>
                  <Star size={13} style={{ color: TIER_CONFIG[tier].color }} />
                </div>
                <div>
                  <div className="text-xs font-medium" style={{ color: 'var(--subtle)' }}>Access Tier</div>
                  <div className="display text-xl font-bold" style={{ color: TIER_CONFIG[tier].color }}>
                    {TIER_CONFIG[tier].label}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        >
          <div className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
            style={{ border: '1.5px solid var(--border-strong)' }}>
            <div className="w-1 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
          </div>
        </motion.div>
      </motion.section>

      {/* ── STATS ────────────────────────────────────────────────── */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="relative px-6 py-16 max-w-5xl mx-auto"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ value, unit, label }) => (
            <motion.div
              key={label}
              variants={fadeUp}
              className="card-glow rounded-2xl px-5 py-6 text-center"
            >
              <div className="display text-3xl font-bold mb-1 stat-glow" style={{ color: 'var(--accent)' }}>
                <AnimatedNumber value={value} />{unit}
              </div>
              <div className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── FEATURES GRID ───────────────────────────────────────── */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="relative px-6 py-16 max-w-5xl mx-auto"
      >
        <motion.div variants={fadeUp} className="text-center mb-12">
          <h2 className="display text-3xl md:text-4xl font-bold mb-3" style={{ letterSpacing: '-0.03em', color: 'var(--ink)' }}>
            Everything Private. <span className="gradient-text">Everything Onchain.</span>
          </h2>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Eight integrated features secured by your wallet identity. No middlemen, no passwords.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, label, desc, color, section }) => (
            <motion.button
              key={label}
              variants={fadeUp}
              onClick={() => dispatch({ type: 'SET_SECTION', section })}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.97 }}
              className="feature-card card-glow rounded-2xl p-5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                style={{ background: `${color}18`, border: `1px solid ${color}33` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div className="display text-sm font-bold mb-1.5" style={{ color: 'var(--ink)' }}>{label}</div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{desc}</p>
              <div className="flex items-center gap-1 mt-3 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color }}>
                Open <ChevronRight size={11} />
              </div>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* ── TIER SHOWCASE ────────────────────────────────────────── */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="relative px-6 py-20 max-w-5xl mx-auto"
      >
        <motion.div variants={fadeUp} className="text-center mb-12">
          <h2 className="display text-3xl md:text-4xl font-bold mb-3" style={{ letterSpacing: '-0.03em', color: 'var(--ink)' }}>
            Hold <span className="gradient-text">PVX</span> to Unlock More
          </h2>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Your PVX balance determines your access tier. The more you hold, the more you unlock.
          </p>
        </motion.div>

        {/* Tier selector tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {TIER_CONFIG.map((t, i) => (
            <button
              key={t.label}
              onClick={() => setActiveTier(i)}
              className="tier-badge transition-all"
              style={activeTier === i ? {
                background: t.bg,
                color: t.color,
                border: `1px solid ${t.color}55`,
                boxShadow: `0 0 12px ${t.color}33`,
              } : {
                background: 'var(--surface)',
                color: 'var(--subtle)',
                border: '1px solid var(--border)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Active tier card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTier}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ duration: 0.22 }}
            className="max-w-xl mx-auto rounded-3xl p-8"
            style={{
              background: TIER_CONFIG[activeTier].bg,
              border: `1px solid ${TIER_CONFIG[activeTier].color}44`,
              boxShadow: `0 0 40px ${TIER_CONFIG[activeTier].color}22`,
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: `${TIER_CONFIG[activeTier].color}22`, border: `1px solid ${TIER_CONFIG[activeTier].color}55` }}>
                <Star size={20} style={{ color: TIER_CONFIG[activeTier].color }} />
              </div>
              <div>
                <div className="display text-2xl font-bold" style={{ color: TIER_CONFIG[activeTier].color }}>
                  {TIER_CONFIG[activeTier].label}
                </div>
                <div className="text-sm" style={{ color: 'var(--muted)' }}>
                  {TIER_CONFIG[activeTier].pvx === '0' ? 'No PVX required' : `Hold ${TIER_CONFIG[activeTier].pvx} PVX`}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {TIER_CONFIG[activeTier].features.map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `${TIER_CONFIG[activeTier].color}22` }}>
                    <CheckCircle size={12} style={{ color: TIER_CONFIG[activeTier].color }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>{f}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => dispatch({ type: 'SET_SECTION', section: 'swap' })}
              className="mt-6 w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
              style={{
                background: `${TIER_CONFIG[activeTier].color}18`,
                border: `1px solid ${TIER_CONFIG[activeTier].color}44`,
                color: TIER_CONFIG[activeTier].color,
              }}
            >
              <ArrowLeftRight size={14} />
              Get PVX via Swap
            </button>
          </motion.div>
        </AnimatePresence>
      </motion.section>

      {/* ── PRIVACY PILLARS ──────────────────────────────────────── */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="relative px-6 py-20 max-w-5xl mx-auto"
      >
        <motion.div variants={fadeUp} className="text-center mb-12">
          <h2 className="display text-3xl md:text-4xl font-bold mb-3" style={{ letterSpacing: '-0.03em', color: 'var(--ink)' }}>
            Privacy by <span className="gradient-text">Architecture</span>
          </h2>
          <p className="text-sm max-w-lg mx-auto" style={{ color: 'var(--muted)' }}>
            Not a promise — a technical guarantee. Each privacy property is enforced by cryptography, not policy.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: Lock,    title: 'Zero-Knowledge Server', body: 'The relay server receives only ciphertext. It physically cannot read your messages, emails, or call content. Ever.', color: '#3b82f6' },
            { icon: Key,     title: 'Keys Never Leave',      body: 'Your ECDH P-256 private keys are generated locally in your browser and stored in IndexedDB only. They are never transmitted.', color: '#22d3ee' },
            { icon: Eye,     title: 'No Metadata Leaks',     body: 'WebRTC calls are peer-to-peer. The signaling server only handles SDP and ICE — never call audio, video, or identities.', color: '#818cf8' },
            { icon: Shield,  title: 'Wallet Identity',       body: 'Your identity is your wallet. No username, no email, no phone number. Your cryptographic keypair IS your PRIVEX account.', color: '#34d399' },
            { icon: Zap,     title: 'On-Chain Transparency', body: 'Tier access, payments, and identity commitments are enforced by smart contracts on Arc — open, auditable, and immutable.', color: '#fbbf24' },
            { icon: Activity,title: 'Honest VPN Claims',     body: 'VPN status is displayed factually — no false anonymity claims. What the VPN covers and what it does not is shown clearly.', color: '#f472b6' },
          ].map(({ icon: Icon, title, body, color }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="feature-card card-glow rounded-2xl p-6"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${color}18`, border: `1px solid ${color}33` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <h3 className="display text-sm font-bold mb-2" style={{ color: 'var(--ink)' }}>{title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{body}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── BOTTOM CTA ───────────────────────────────────────────── */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="relative px-6 py-24 text-center"
      >
        {/* Glow backdrop */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[300px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', filter: 'blur(60px)' }} />
        </div>

        <motion.div variants={fadeUp} className="relative max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', boxShadow: '0 0 32px rgba(59,130,246,0.5)' }}>
            <Shield size={28} className="text-white" />
          </div>

          <h2 className="display text-3xl md:text-4xl font-bold mb-4" style={{ letterSpacing: '-0.03em', color: 'var(--ink)' }}>
            Start Your <span className="gradient-text">Private Life</span>
          </h2>
          <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--muted)' }}>
            Connect your wallet. No passwords, no registration, no data collection. Your wallet is your key.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <ConnectKitButton.Custom>
              {({ isConnected, show }) => (
                <motion.button
                  onClick={isConnected ? () => dispatch({ type: 'SET_SECTION', section: 'identity' }) : show}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary flex items-center gap-2 px-8 py-4 text-sm"
                >
                  {isConnected ? <><ShieldCheck size={15} /> Register Identity</> : <><Shield size={15} /> Connect Wallet</>}
                  <ArrowRight size={14} />
                </motion.button>
              )}
            </ConnectKitButton.Custom>

            <motion.button
              onClick={() => dispatch({ type: 'SET_SECTION', section: 'messages' })}
              whileTap={{ scale: 0.97 }}
              className="btn-ghost flex items-center gap-2 px-6 py-4 text-sm"
            >
              <MessageSquare size={14} />
              Try Messaging
            </motion.button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            {[
              { icon: Lock,  text: 'E2E Encrypted' },
              { icon: Key,   text: 'Non-Custodial' },
              { icon: Shield,text: 'Arc Onchain' },
              { icon: Eye,   text: 'Open Source' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--subtle)' }}>
                <Icon size={11} style={{ color: 'var(--accent)' }} />
                {text}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.section>
    </div>
  )
}
