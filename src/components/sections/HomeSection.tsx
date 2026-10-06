/**
 * PRIVEX — Cosmic Landing Page
 * Dynamic starfield with galaxies, fire meteors, and real 3D-style motion.
 */
import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock, Shield, ShieldCheck, MessageSquare, Phone, Mail, CreditCard,
  Zap, Globe, ArrowRight, Star, Activity, CheckCircle2, Eye
} from 'lucide-react'
import { usePrivex } from '../../lib/store'

// ─── Cosmic Canvas ────────────────────────────────────────────────────────────

interface StarParticle {
  x: number; y: number; z: number
  r: number; vx: number; vy: number; vz: number
  baseAlpha: number; pulse: number; pulseSpeed: number
  type: 'star' | 'galaxy' | 'dust'
  color: string
}

interface Meteor {
  x: number; y: number
  vx: number; vy: number
  len: number; alpha: number
  color: string; tail: { x: number; y: number }[]
  type: 'blue' | 'fire'
}

const STAR_COLORS = [
  '#ffffff', '#e8f0fe', '#bfdbfe', '#93c5fd', '#67e8f9',
  '#a5b4fc', '#c4b5fd', '#fde68a', '#fdba74',
]
const FIRE_COLORS = ['#ff6b00', '#ff4500', '#ff2200', '#ffa500', '#ffcc00', '#ff7700']
const GALAXY_COLORS = ['rgba(96,165,250,', 'rgba(129,140,248,', 'rgba(34,211,238,', 'rgba(167,139,250,']

function initParticles(w: number, h: number): StarParticle[] {
  const particles: StarParticle[] = []

  // Stars (dense field)
  for (let i = 0; i < 380; i++) {
    const type = Math.random() < 0.05 ? 'galaxy' : 'star'
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random() * 1000,
      r: type === 'galaxy' ? 2 + Math.random() * 3 : 0.3 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 0.06,
      vy: (Math.random() - 0.5) * 0.04,
      vz: -0.3 - Math.random() * 0.5,
      baseAlpha: 0.3 + Math.random() * 0.7,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.005 + Math.random() * 0.025,
      type,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
    })
  }

  // Dust particles
  for (let i = 0; i < 120; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      z: 500 + Math.random() * 500,
      r: 0.2 + Math.random() * 0.7,
      vx: (Math.random() - 0.5) * 0.02,
      vy: (Math.random() - 0.5) * 0.015,
      vz: -0.1,
      baseAlpha: 0.1 + Math.random() * 0.35,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.003,
      type: 'dust',
      color: STAR_COLORS[Math.floor(Math.random() * 4)],
    })
  }

  return particles
}

function initMeteor(w: number, h: number): Meteor {
  const isFire = Math.random() < 0.35
  const startEdge = Math.random()
  let x: number, y: number
  if (startEdge < 0.5) { x = Math.random() * w; y = -20 }
  else { x = -20; y = Math.random() * h * 0.6 }

  const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.6
  const speed = 3 + Math.random() * 6

  return {
    x, y,
    vx: Math.cos(angle) * speed * (isFire ? 1.4 : 1),
    vy: Math.sin(angle) * speed * (isFire ? 1.4 : 1),
    len: 60 + Math.random() * 140,
    alpha: 0.7 + Math.random() * 0.3,
    color: isFire
      ? FIRE_COLORS[Math.floor(Math.random() * FIRE_COLORS.length)]
      : STAR_COLORS[Math.floor(Math.random() * 5)],
    tail: [],
    type: isFire ? 'fire' : 'blue',
  }
}

function CosmicCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    let w = window.innerWidth
    let h = window.innerHeight
    canvas.width = w
    canvas.height = h

    let particles = initParticles(w, h)
    const meteors: Meteor[] = []
    let frame = 0
    let raf: number
    const cx = w / 2
    const cy = h / 2

    const resize = () => {
      w = window.innerWidth; h = window.innerHeight
      canvas.width = w; canvas.height = h
      particles = initParticles(w, h)
    }
    window.addEventListener('resize', resize)

    function drawGalaxy(ctx: CanvasRenderingContext2D, p: StarParticle, scale: number, alpha: number) {
      const gColor = GALAXY_COLORS[Math.floor(p.pulse * 1000) % GALAXY_COLORS.length]
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * scale * 4)
      grd.addColorStop(0, gColor + '0.9)')
      grd.addColorStop(0.3, gColor + '0.5)')
      grd.addColorStop(1, gColor + '0)')
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r * scale * 4, 0, Math.PI * 2)
      ctx.fillStyle = grd
      ctx.globalAlpha = alpha * 0.6
      ctx.fill()
      // Core
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r * scale * 0.8, 0, Math.PI * 2)
      ctx.fillStyle = '#ffffff'
      ctx.globalAlpha = alpha * 0.9
      ctx.fill()
    }

    function tick() {
      frame++
      ctx.clearRect(0, 0, w, h)

      // Deep space background
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h))
      bg.addColorStop(0, 'rgba(6, 12, 28, 1)')
      bg.addColorStop(0.4, 'rgba(3, 8, 20, 1)')
      bg.addColorStop(1, 'rgba(1, 4, 12, 1)')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      // Nebula clouds
      if (frame % 3 === 0 || frame < 5) {
        const nPositions = [
          { x: w * 0.15, y: h * 0.25, r: 200, c: 'rgba(59,130,246,' },
          { x: w * 0.80, y: h * 0.15, r: 160, c: 'rgba(129,140,248,' },
          { x: w * 0.55, y: h * 0.70, r: 220, c: 'rgba(34,211,238,' },
          { x: w * 0.10, y: h * 0.75, r: 140, c: 'rgba(167,139,250,' },
          { x: w * 0.90, y: h * 0.60, r: 180, c: 'rgba(249,115,22,' },
        ]
        nPositions.forEach(n => {
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r)
          g.addColorStop(0, n.c + '0.12)')
          g.addColorStop(0.5, n.c + '0.05)')
          g.addColorStop(1, n.c + '0)')
          ctx.globalAlpha = 1
          ctx.fillStyle = g
          ctx.fillRect(0, 0, w, h)
        })
      }

      // Stars
      particles.forEach(p => {
        p.pulse += p.pulseSpeed
        const pulseMult = 0.7 + Math.sin(p.pulse) * 0.3

        // Perspective projection
        const fov = 600
        const scale = fov / (fov - p.z * 0.8)
        const sx = cx + (p.x - cx) * scale
        const sy = cy + (p.y - cy) * scale
        const sr = p.r * scale

        if (p.type === 'galaxy') {
          ctx.globalAlpha = 1
          drawGalaxy(ctx, { ...p, x: sx, y: sy }, scale, p.baseAlpha * pulseMult)
        } else {
          const alpha = p.baseAlpha * pulseMult * (p.type === 'dust' ? 0.4 : 1)
          ctx.globalAlpha = alpha
          if (p.r > 1.2 && p.type === 'star') {
            // Glow star
            const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 3)
            grd.addColorStop(0, p.color)
            grd.addColorStop(0.4, p.color + 'aa')
            grd.addColorStop(1, 'transparent')
            ctx.fillStyle = grd
            ctx.beginPath()
            ctx.arc(sx, sy, sr * 3, 0, Math.PI * 2)
            ctx.fill()
            // Spike cross for bright stars
            if (p.r > 1.5) {
              ctx.strokeStyle = p.color
              ctx.globalAlpha = alpha * 0.25
              ctx.lineWidth = 0.5
              ctx.beginPath()
              ctx.moveTo(sx - sr * 5, sy); ctx.lineTo(sx + sr * 5, sy)
              ctx.moveTo(sx, sy - sr * 5); ctx.lineTo(sx, sy + sr * 5)
              ctx.stroke()
            }
            ctx.globalAlpha = alpha
          }
          ctx.fillStyle = p.color
          ctx.beginPath()
          ctx.arc(sx, sy, sr, 0, Math.PI * 2)
          ctx.fill()
        }

        // Move
        p.x += p.vx; p.y += p.vy; p.z += p.vz
        if (p.z < 0) { p.z = 1000; p.x = Math.random() * w; p.y = Math.random() * h }
        if (sx < -20 || sx > w + 20 || sy < -20 || sy > h + 20) {
          p.x = Math.random() * w; p.y = Math.random() * h; p.z = Math.random() * 500
        }
      })

      // Meteors
      if (frame % 90 === 0 && meteors.length < 6) {
        meteors.push(initMeteor(w, h))
      }

      ctx.globalAlpha = 1
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i]
        m.tail.unshift({ x: m.x, y: m.y })
        if (m.tail.length > 24) m.tail.pop()
        m.x += m.vx; m.y += m.vy
        m.alpha *= 0.992

        if (m.x > w + 100 || m.y > h + 100 || m.alpha < 0.05) {
          meteors.splice(i, 1); continue
        }

        // Draw tail
        if (m.tail.length > 1) {
          const grad = ctx.createLinearGradient(
            m.tail[m.tail.length - 1].x, m.tail[m.tail.length - 1].y, m.x, m.y
          )
          if (m.type === 'fire') {
            grad.addColorStop(0, 'rgba(0,0,0,0)')
            grad.addColorStop(0.3, 'rgba(255,100,0,0.2)')
            grad.addColorStop(0.7, 'rgba(255,200,0,0.7)')
            grad.addColorStop(1, 'rgba(255,255,200,0.95)')
          } else {
            grad.addColorStop(0, 'rgba(0,0,0,0)')
            grad.addColorStop(0.5, `rgba(96,165,250,0.3)`)
            grad.addColorStop(1, 'rgba(255,255,255,0.9)')
          }
          ctx.strokeStyle = grad
          ctx.lineWidth = m.type === 'fire' ? 2.5 : 1.5
          ctx.shadowColor = m.type === 'fire' ? '#ff6600' : '#60a5fa'
          ctx.shadowBlur = m.type === 'fire' ? 12 : 6
          ctx.globalAlpha = m.alpha
          ctx.beginPath()
          ctx.moveTo(m.tail[m.tail.length - 1].x, m.tail[m.tail.length - 1].y)
          m.tail.forEach(pt => ctx.lineTo(pt.x, pt.y))
          ctx.lineTo(m.x, m.y)
          ctx.stroke()

          // Fire particle sparks
          if (m.type === 'fire' && Math.random() < 0.4) {
            for (let s = 0; s < 3; s++) {
              ctx.globalAlpha = m.alpha * Math.random()
              ctx.fillStyle = FIRE_COLORS[Math.floor(Math.random() * FIRE_COLORS.length)]
              ctx.beginPath()
              ctx.arc(
                m.x + (Math.random() - 0.5) * 8,
                m.y + (Math.random() - 0.5) * 8,
                Math.random() * 2, 0, Math.PI * 2
              )
              ctx.fill()
            }
          }

          ctx.shadowBlur = 0
          ctx.globalAlpha = 1
        }

        // Head glow
        ctx.globalAlpha = m.alpha
        const headGrd = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.type === 'fire' ? 6 : 4)
        headGrd.addColorStop(0, m.type === 'fire' ? '#ffffff' : '#93c5fd')
        headGrd.addColorStop(0.5, m.color)
        headGrd.addColorStop(1, 'transparent')
        ctx.fillStyle = headGrd
        ctx.beginPath()
        ctx.arc(m.x, m.y, m.type === 'fire' ? 6 : 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none', zIndex: 0 }}
    />
  )
}

// ─── Floating privacy indicator ───────────────────────────────────────────────
function PrivacyOrb({ label, color, delay = 0, repeatDelay = 4 }: { label: string; color: string; delay?: number; repeatDelay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: [0, 1, 1, 0.7, 1], scale: [0.5, 1, 1.03, 1, 1] }}
      transition={{ delay, duration: 1.2, repeat: Infinity, repeatDelay }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
      style={{
        background: `${color}22`,
        border: `1px solid ${color}44`,
        color,
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {label}
    </motion.div>
  )
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: MessageSquare, label: 'E2E Messaging', desc: 'All messages are encrypted client-side. The relay never sees plaintext.', color: '#60a5fa', badge: 'FREE' },
  { icon: Phone, label: 'Encrypted Calls', desc: 'WebRTC DTLS-SRTP. Media streams peer-to-peer — never touch the server.', color: '#34d399', badge: 'PRO' },
  { icon: Mail, label: 'Private Email', desc: 'ECDH-encrypted subject + body. Only you and the recipient can read it.', color: '#a78bfa', badge: 'FREE' },
  { icon: CreditCard, label: 'USDC Payments', desc: 'Native USDC on Arc Mainnet. Instant, sub-cent fees.', color: '#22d3ee', badge: 'FREE' },
  { icon: Globe, label: 'CCTP Bridge', desc: 'Move USDC across chains via Circle CCTP v2 — audited, permissionless.', color: '#f59e0b', badge: 'FREE' },
  { icon: Eye, label: 'Zero Knowledge', desc: 'No KYC, no sign-up. Your wallet address is your identity.', color: '#f87171', badge: 'ALWAYS' },
]

const STATS = [
  { value: '0 ms', label: 'Server read time', sub: 'All data encrypted on device' },
  { value: 'AES-256', label: 'Encryption standard', sub: 'ECDH + GCM authenticated' },
  { value: 'P2P', label: 'Call routing', sub: 'No relay media path' },
  { value: 'USDC', label: 'Native gas', sub: 'Arc Mainnet — no ETH needed' },
]

const TIERS = [
  { name: 'FREE', pvx: '0 PVX', color: '#60a5fa', features: ['Encrypted messaging', 'Private email', 'USDC payments', 'CCTP bridge'] },
  { name: 'PRO', pvx: '10,000 PVX', color: '#818cf8', features: ['Everything in FREE', 'Encrypted voice & video', 'Priority relay routing', 'Custom handle'] },
  { name: 'ELITE', pvx: '50,000 PVX', color: '#34d399', features: ['Everything in PRO', 'Dedicated relay node', 'Multi-device sync', 'Enterprise SLA'] },
]

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HomeSection() {
  const { dispatch } = usePrivex()
  const [activeFeature, setActiveFeature] = useState<number | null>(null)
  const [visibleStats, setVisibleStats] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisibleStats(true) },
      { threshold: 0.3 }
    )
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  const navigate = (section: import('../../lib/store').NavSection) =>
    dispatch({ type: 'SET_SECTION', section })

  return (
    <div className="relative overflow-hidden min-h-screen" style={{ background: 'transparent' }}>
      {/* Cosmic canvas — full page */}
      <CosmicCanvas />

      <div className="relative z-10">
        {/* ─── Hero ─── */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16 pb-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-6 px-4 py-2 rounded-full"
            style={{
              background: 'rgba(96,165,250,0.10)',
              border: '1px solid rgba(96,165,250,0.30)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="w-2 h-2 rounded-full secure-pulse" style={{ background: '#34d399' }} />
            <span className="text-xs font-semibold tracking-wider" style={{ color: '#34d399' }}>
              LIVE ON ARC MAINNET
            </span>
            <Zap size={11} style={{ color: '#fbbf24' }} />
          </motion.div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="mb-6"
          >
            <img
              src="/privex-logo.svg"
              alt="PRIVEX"
              className="w-24 h-24 mx-auto"
              style={{ filter: 'drop-shadow(0 0 32px rgba(59,130,246,0.7)) drop-shadow(0 0 80px rgba(59,130,246,0.3))' }}
            />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="display font-bold text-5xl md:text-7xl mb-4 leading-none"
          >
            <span className="gradient-text">PRIVEX</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-2xl font-medium mb-3 max-w-2xl"
            style={{ color: 'var(--ink-2)' }}
          >
            Your private digital life, onchain.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm md:text-base max-w-xl mb-8"
            style={{ color: 'var(--muted)' }}
          >
            End-to-end encrypted messaging, calls, and email. USDC payments and cross-chain bridging.
            No accounts, no KYC — just your wallet.
          </motion.p>

          {/* Floating privacy orbs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            <PrivacyOrb label="Zero-Knowledge" color="#60a5fa" delay={0} repeatDelay={4} />
            <PrivacyOrb label="E2E Encrypted" color="#34d399" delay={0.2} repeatDelay={5} />
            <PrivacyOrb label="Non-Custodial" color="#a78bfa" delay={0.4} repeatDelay={6} />
            <PrivacyOrb label="On-Chain ID" color="#22d3ee" delay={0.6} repeatDelay={4.5} />
            <PrivacyOrb label="Arc Mainnet" color="#f59e0b" delay={0.8} repeatDelay={5.5} />
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(59,130,246,0.5)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('messages')}
              className="btn-primary flex items-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-xl"
            >
              <MessageSquare size={16} />
              Start Messaging
              <ArrowRight size={14} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('payments')}
              className="btn-ghost flex items-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-xl"
            >
              <CreditCard size={16} />
              Send USDC
            </motion.button>
          </motion.div>

          {/* Scroll cue */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ color: 'var(--subtle)' }}
          >
            <Activity size={16} />
          </motion.div>
        </section>

        {/* ─── Stats ─── */}
        <section ref={statsRef} className="py-16 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 30 }}
                animate={visibleStats ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className="card-glow rounded-2xl p-5 text-center"
              >
                <div className="display text-2xl font-bold stat-glow mb-1" style={{ color: 'var(--accent)' }}>
                  {s.value}
                </div>
                <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--ink-2)' }}>{s.label}</div>
                <div className="text-[10px]" style={{ color: 'var(--subtle)' }}>{s.sub}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── Features ─── */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="display text-3xl font-bold mb-3 gradient-text">Built for Privacy</div>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>Every feature is encrypted by default. No exceptions.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((f, i) => {
                const Icon = f.icon
                const isActive = activeFeature === i
                return (
                  <motion.div
                    key={f.label}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="feature-card card-glow rounded-2xl p-5 cursor-pointer transition-all"
                    style={{ borderColor: isActive ? f.color + '55' : undefined }}
                    onMouseEnter={() => setActiveFeature(i)}
                    onMouseLeave={() => setActiveFeature(null)}
                    onClick={() => {
                      const sectionMap: Record<string, import('../../lib/store').NavSection> = {
                        'E2E Messaging': 'messages',
                        'Encrypted Calls': 'calls',
                        'Private Email': 'email',
                        'USDC Payments': 'payments',
                        'CCTP Bridge': 'bridge',
                        'Zero Knowledge': 'identity',
                      }
                      const s = sectionMap[f.label]
                      if (s) navigate(s)
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: f.color + '20' }}>
                        <Icon size={18} style={{ color: f.color }} />
                      </div>
                      <span className="tier-badge" style={{ background: f.color + '20', color: f.color }}>
                        {f.badge}
                      </span>
                    </div>
                    <h3 className="display font-semibold text-sm mb-2" style={{ color: 'var(--ink)' }}>{f.label}</h3>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{f.desc}</p>

                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 overflow-hidden"
                        >
                          <div className="flex items-center gap-1 text-xs" style={{ color: f.color }}>
                            <span>Open {f.label}</span>
                            <ArrowRight size={11} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ─── Tiers ─── */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="display text-3xl font-bold mb-3 gradient-text">PVX Tiers</div>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>Hold PVX tokens to unlock more powerful features.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {TIERS.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, type: 'spring', stiffness: 180 }}
                  whileHover={{ y: -4, boxShadow: `0 0 40px ${t.color}33` }}
                  className="card-glow rounded-2xl p-5"
                  style={{ borderColor: t.color + '33' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="tier-badge" style={{ background: t.color + '20', color: t.color }}>
                      {t.name}
                    </span>
                    <Star size={14} style={{ color: t.color }} />
                  </div>
                  <div className="display font-bold text-xl mb-1" style={{ color: t.color }}>{t.pvx}</div>
                  <div className="text-xs mb-4" style={{ color: 'var(--subtle)' }}>minimum balance</div>
                  <div className="space-y-2">
                    {t.features.map(feat => (
                      <div key={feat} className="flex items-center gap-2">
                        <CheckCircle2 size={11} style={{ color: t.color, flexShrink: 0 }} />
                        <span className="text-xs" style={{ color: 'var(--ink-2)' }}>{feat}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Security Pillars ─── */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card-glow rounded-3xl p-8 text-center"
            >
              <Shield size={36} style={{ color: '#34d399' }} className="mx-auto mb-4" />
              <h2 className="display text-2xl font-bold mb-3" style={{ color: 'var(--ink)' }}>
                Security by Design
              </h2>
              <p className="text-sm max-w-md mx-auto mb-6" style={{ color: 'var(--muted)' }}>
                Every byte that leaves your device is encrypted. PRIVEX servers store and forward ciphertext only.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: Lock, label: 'ECDH Key Exchange' },
                  { icon: Shield, label: 'AES-256-GCM' },
                  { icon: Eye, label: 'Client-Side Decrypt' },
                  { icon: Activity, label: 'Disappearing Msgs' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="glass rounded-xl p-3 text-center">
                    <Icon size={18} style={{ color: '#34d399' }} className="mx-auto mb-1.5" />
                    <div className="text-[11px] font-medium" style={{ color: 'var(--ink-2)' }}>{label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section className="py-20 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="display text-3xl font-bold mb-4 gradient-text">Start Now</h2>
            <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
              Connect your wallet. No sign-up. No email. No password.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('messages')}
                className="btn-primary flex items-center gap-2 px-8 py-4 text-sm font-semibold rounded-xl"
              >
                <MessageSquare size={16} />
                Send First Message
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('identity')}
                className="btn-ghost flex items-center gap-2 px-8 py-4 text-sm font-semibold rounded-xl"
              >
                <ShieldCheck size={16} />
                Register Identity
              </motion.button>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  )
}


