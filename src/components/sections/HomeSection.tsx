/**
 * PRIVEX — Professional Dark Tech Landing Page
 */
import { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Lock, Shield, MessageSquare, Phone, Mail, CreditCard,
  ArrowLeftRight, Globe, ArrowRight, CheckCircle2, Eye, EyeOff,
  Zap, ShieldCheck,
} from 'lucide-react'
import { usePrivex, type NavSection } from '../../lib/store'
import { ConnectKitButton } from 'connectkit'

// ─── Cosmic Canvas ────────────────────────────────────────────────────────────

interface Particle {
  x: number; y: number; z: number
  r: number; vx: number; vy: number; vz: number
  alpha: number; pulse: number; pulseSpeed: number
  color: string; type: 'star' | 'dust' | 'cluster'
}

interface Meteor {
  x: number; y: number; vx: number; vy: number
  len: number; alpha: number
  color: string; tail: { x: number; y: number }[]
  fire: boolean
}

const STAR_COLS = ['#ffffff','#e0edff','#bfdbfe','#93c5fd','#a5b4fc','#c4b5fd','#7dd3fc','#fde68a','#fdba74']
const FIRE_COLS = ['#ff6200','#ff4000','#ff8c00','#ffb700','#ff3000','#ffa200']

function CosmicCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef   = useRef<number>(0)
  const particles = useRef<Particle[]>([])
  const meteors   = useRef<Meteor[]>([])
  const lastMeteor = useRef(0)

  const resize = useCallback(() => {
    const c = canvasRef.current
    if (!c) return
    c.width  = window.innerWidth
    c.height = window.innerHeight
    particles.current = initParticles(c.width, c.height)
  }, [])

  useEffect(() => {
    resize()
    window.addEventListener('resize', resize)
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    const tick = (now: number) => {
      animRef.current = requestAnimationFrame(tick)
      const w = ctx.canvas.width
      const h = ctx.canvas.height

      // Deep space background — very subtle fade for trails
      ctx.fillStyle = 'rgba(6,9,15,0.18)'
      ctx.fillRect(0, 0, w, h)

      // ── Particles ──
      for (const p of particles.current) {
        p.pulse += p.pulseSpeed
        const a = Math.max(0.05, Math.min(1, p.alpha * (0.6 + 0.4 * Math.sin(p.pulse))))

        // Perspective projection from z
        const fov = 600
        const scale = fov / (fov + p.z)
        const px = (p.x - w / 2) * scale + w / 2
        const py = (p.y - h / 2) * scale + h / 2
        const pr = Math.max(0.2, p.r * scale)

        if (px < -10 || px > w + 10 || py < -10 || py > h + 10) {
          p.x = Math.random() * w
          p.y = Math.random() * h
          p.z = Math.random() * 1000
          continue
        }

        if (p.type === 'cluster') {
          // Galaxy cluster — soft radial glow
          const grd = ctx.createRadialGradient(px, py, 0, px, py, pr * 4)
          grd.addColorStop(0, p.color.replace('rgba(', 'rgba(').replace(',0)', `,${(a * 0.7).toFixed(2)})`))
          grd.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.beginPath()
          ctx.arc(px, py, pr * 4, 0, Math.PI * 2)
          ctx.fillStyle = grd
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.arc(px, py, pr, 0, Math.PI * 2)
          ctx.fillStyle = p.color + Math.round(a * 255).toString(16).padStart(2, '0')
          ctx.fill()
        }

        p.x += p.vx; p.y += p.vy; p.z += p.vz
        if (p.z < 1) { p.z = 1000; p.x = Math.random() * w; p.y = Math.random() * h }
      }

      // ── Meteors ──
      if (now - lastMeteor.current > 2200 + Math.random() * 3000) {
        lastMeteor.current = now
        const fire = Math.random() < 0.35
        const startEdge = Math.random()
        let mx: number, my: number
        if (startEdge < 0.5) { mx = -40; my = Math.random() * h * 0.7 }
        else { mx = Math.random() * w * 0.6; my = -40 }
        const speed = 6 + Math.random() * 8
        const angle = (Math.PI / 6) + Math.random() * (Math.PI / 6)
        meteors.current.push({
          x: mx, y: my,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          len: 40 + Math.random() * 80,
          alpha: 1,
          color: fire ? FIRE_COLS[Math.floor(Math.random() * FIRE_COLS.length)] : '#a5c8ff',
          tail: [],
          fire,
        })
      }

      meteors.current = meteors.current.filter(m => {
        m.tail.push({ x: m.x, y: m.y })
        if (m.tail.length > m.len / 3) m.tail.shift()
        m.x += m.vx; m.y += m.vy
        m.alpha -= 0.012

        if (m.alpha <= 0 || m.x > w + 60 || m.y > h + 60) return false

        // Draw tail
        for (let i = 0; i < m.tail.length - 1; i++) {
          const t = i / m.tail.length
          ctx.beginPath()
          ctx.moveTo(m.tail[i].x, m.tail[i].y)
          ctx.lineTo(m.tail[i + 1].x, m.tail[i + 1].y)
          const lw = m.fire ? t * 2.5 : t * 1.5
          ctx.lineWidth = Math.max(0.3, lw)
          const alpha = t * m.alpha
          if (m.fire) {
            // Fire gradient along tail
            const fireCol = i % 3 === 0 ? '#ff6200' : i % 3 === 1 ? '#ff9500' : '#ffcc00'
            ctx.strokeStyle = fireCol + Math.round(alpha * 200).toString(16).padStart(2, '0')
          } else {
            ctx.strokeStyle = m.color + Math.round(alpha * 180).toString(16).padStart(2, '0')
          }
          ctx.stroke()
        }

        // Head glow
        const headGrd = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.fire ? 6 : 4)
        headGrd.addColorStop(0, m.fire ? `rgba(255,200,80,${m.alpha})` : `rgba(180,210,255,${m.alpha})`)
        headGrd.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.beginPath()
        ctx.arc(m.x, m.y, m.fire ? 6 : 4, 0, Math.PI * 2)
        ctx.fillStyle = headGrd
        ctx.fill()
        return true
      })
    }

    animRef.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [resize])

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: '#06090f' }} />
}

function initParticles(w: number, h: number): Particle[] {
  const ps: Particle[] = []
  for (let i = 0; i < 420; i++) {
    const cluster = Math.random() < 0.06
    ps.push({
      x: Math.random() * w, y: Math.random() * h,
      z: Math.random() * 900,
      r: cluster ? 3 + Math.random() * 3 : 0.3 + Math.random() * 1.6,
      vx: (Math.random() - 0.5) * 0.05,
      vy: (Math.random() - 0.5) * 0.03,
      vz: -0.25 - Math.random() * 0.4,
      alpha: 0.3 + Math.random() * 0.7,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.006 + Math.random() * 0.022,
      color: cluster
        ? ['rgba(96,165,250,','rgba(129,140,248,','rgba(34,211,238,'][Math.floor(Math.random() * 3)] + '0)'
        : STAR_COLS[Math.floor(Math.random() * STAR_COLS.length)],
      type: cluster ? 'cluster' : Math.random() < 0.12 ? 'dust' : 'star',
    })
  }
  return ps
}

// ─── Feature data ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: MessageSquare,
    title: 'E2E Encrypted Messaging',
    desc: 'Zero-knowledge messages. No server reads your content. Keys never leave your device.',
    color: '#60a5fa',
    section: 'messages' as const,
  },
  {
    icon: Phone,
    title: 'Encrypted Voice & Video',
    desc: 'Peer-to-peer calls with WebRTC encryption. No MITM. No recording.',
    color: '#4ade80',
    section: 'calls' as const,
  },
  {
    icon: Mail,
    title: 'Private Email',
    desc: 'End-to-end encrypted email between PRIVEX identities. No metadata leaks.',
    color: '#a78bfa',
    section: 'email' as const,
  },
  {
    icon: CreditCard,
    title: 'Onchain Payments',
    desc: 'Send and receive USDC instantly. Your wallet is your identity.',
    color: '#34d399',
    section: 'payments' as const,
  },
  {
    icon: ArrowLeftRight,
    title: 'Token Swap',
    desc: 'Swap tokens directly in-app. Non-custodial, no accounts.',
    color: '#f59e0b',
    section: 'swap' as const,
  },
  {
    icon: Globe,
    title: 'Cross-chain Bridge',
    desc: 'Bridge USDC across chains via CCTP. Fast, trustless, direct.',
    color: '#38bdf8',
    section: 'bridge' as const,
  },
]

const PILLARS = [
  { icon: EyeOff,     label: 'Zero Knowledge',    desc: 'Messages encrypted client-side. Servers see ciphertext only.' },
  { icon: ShieldCheck, label: 'No KYC',            desc: 'Your wallet is your identity. No ID, no email, no tracking.' },
  { icon: Zap,         label: 'Instant Settlement', desc: 'Sub-second finality. Payments confirm in one block.' },
  { icon: Lock,        label: 'Self-Custody',       desc: 'Private keys stay in your wallet. No custodians.' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomeSection() {
  const { dispatch } = usePrivex()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  const go = (section: NavSection) => {
    dispatch({ type: 'SET_SECTION', section })
  }

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 22 },
    animate: visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 },
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
  })

  return (
    <div className="relative min-h-full overflow-x-hidden" style={{ zIndex: 1 }}>
      <CosmicCanvas />

      {/* ── HERO ── */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 min-h-[90vh]">

        {/* Top badge */}
        <motion.div {...fadeUp(0.05)} className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full"
          style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.22)', color: 'var(--muted)' }}>
          <div className="w-1.5 h-1.5 rounded-full secure-pulse" style={{ background: '#4ade80' }} />
          <span className="text-[12px] font-medium tracking-wide">End-to-End Encrypted · No KYC · Your wallet is your identity</span>
        </motion.div>

        {/* Logo mark */}
        <motion.div {...fadeUp(0.10)} className="mb-7">
          <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.25) 0%, rgba(79,70,229,0.30) 100%)',
              border: '1px solid rgba(96,165,250,0.30)',
              boxShadow: '0 0 40px rgba(96,165,250,0.20), 0 0 80px rgba(79,70,229,0.10)',
            }}>
            <img src="/privex-logo.svg" alt="PRIVEX" className="w-12 h-12" />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1 {...fadeUp(0.15)}
          className="display font-bold text-[clamp(2.4rem,6vw,4.5rem)] leading-[1.08] tracking-[-0.03em] mb-5 max-w-4xl">
          <span style={{ color: 'var(--ink)' }}>Private by design.</span><br />
          <span className="gradient-text">Onchain by default.</span>
        </motion.h1>

        {/* Subline */}
        <motion.p {...fadeUp(0.20)} className="text-[clamp(1rem,2vw,1.2rem)] max-w-xl mx-auto mb-10 leading-relaxed"
          style={{ color: 'var(--muted)' }}>
          Encrypted messaging, voice &amp; video calls, private email, and USDC payments — all in one app. No accounts. No surveillance.
        </motion.p>

        {/* CTA row */}
        <motion.div {...fadeUp(0.25)} className="flex flex-col sm:flex-row items-center gap-3">
          <ConnectKitButton.Custom>
            {({ isConnected, show }) => (
              <button onClick={isConnected ? () => go('messages') : show}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-semibold text-[15px] transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%)',
                  color: '#ffffff',
                  boxShadow: '0 0 24px rgba(79,70,229,0.40), 0 4px 16px rgba(0,0,0,0.30)',
                }}>
                {isConnected ? <><MessageSquare size={16} />Open Messages</> : <><Shield size={16} />Connect &amp; Enter</>}
              </button>
            )}
          </ConnectKitButton.Custom>
          <button onClick={() => go('identity')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-medium text-[14px] transition-all hover:bg-white/10"
            style={{ color: 'var(--muted)', border: '1px solid var(--border-strong)' }}>
            View Identity<ArrowRight size={14} />
          </button>
        </motion.div>

        {/* Trust strip */}
        <motion.div {...fadeUp(0.30)} className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 mt-10">
          {['No accounts','No tracking','Open source contracts','Self-custody'].map(t => (
            <div key={t} className="flex items-center gap-1.5">
              <CheckCircle2 size={13} style={{ color: '#4ade80' }} />
              <span className="text-[13px]" style={{ color: 'var(--subtle)' }}>{t}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── PRIVACY PILLARS ── */}
      <section className="relative z-10 px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp(0.05)}
            className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PILLARS.map((p, i) => {
              const Icon = p.icon
              return (
                <motion.div key={p.label} {...fadeUp(0.08 + i * 0.06)}
                  className="glass rounded-2xl p-5 text-center flex flex-col items-center gap-3 hover:border-[rgba(96,165,250,0.3)] transition-all duration-200"
                  style={{ borderColor: 'var(--border)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(96,165,250,0.10)', border: '1px solid rgba(96,165,250,0.18)' }}>
                    <Icon size={18} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <div className="font-semibold text-[13px] mb-1" style={{ color: 'var(--ink)' }}>{p.label}</div>
                    <div className="text-[12px] leading-snug" style={{ color: 'var(--subtle)' }}>{p.desc}</div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp(0.05)} className="text-center mb-10">
            <div className="label-caps mb-3">Everything you need</div>
            <h2 className="display font-bold text-[clamp(1.6rem,4vw,2.4rem)] tracking-tight" style={{ color: 'var(--ink)' }}>
              Built for your digital privacy
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.button
                  key={f.title}
                  {...fadeUp(0.06 + i * 0.05)}
                  onClick={() => go(f.section)}
                  className="feature-card glass rounded-2xl p-5 text-left transition-all duration-200 hover:border-[rgba(96,165,250,0.28)] group"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: f.color + '18', border: `1px solid ${f.color}30` }}>
                    <Icon size={20} style={{ color: f.color }} />
                  </div>
                  <div className="font-semibold text-[14px] mb-1.5" style={{ color: 'var(--ink)' }}>{f.title}</div>
                  <div className="text-[13px] leading-relaxed" style={{ color: 'var(--muted)' }}>{f.desc}</div>
                  <div className="flex items-center gap-1 mt-4 text-[12px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: f.color }}>
                    Open <ArrowRight size={12} />
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="relative z-10 px-6 pb-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="glass-mid rounded-3xl p-10"
            style={{ boxShadow: '0 0 60px rgba(79,70,229,0.12)' }}>
            <Eye size={32} className="mx-auto mb-5" style={{ color: 'var(--accent)' }} />
            <h2 className="display font-bold text-[clamp(1.4rem,3.5vw,2rem)] tracking-tight mb-3" style={{ color: 'var(--ink)' }}>
              Reclaim your privacy
            </h2>
            <p className="text-[14px] leading-relaxed mb-7" style={{ color: 'var(--muted)' }}>
              No accounts. No email sign-up. No phone number. Your wallet key is your identity — connect once and everything follows.
            </p>
            <ConnectKitButton.Custom>
              {({ isConnected, show }) => (
                <button onClick={isConnected ? () => go('messages') : show}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-[15px] transition-all hover:opacity-90"
                  style={{
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%)',
                    color: '#ffffff',
                    boxShadow: '0 0 20px rgba(79,70,229,0.35)',
                  }}>
                  {isConnected ? 'Go to Messages' : 'Connect Wallet — it\'s free'}
                  <ArrowRight size={15} />
                </button>
              )}
            </ConnectKitButton.Custom>
          </div>
        </div>
      </section>
    </div>
  )
}
