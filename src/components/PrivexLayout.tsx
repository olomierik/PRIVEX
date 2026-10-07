import { type ReactNode, useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, MessageSquare, Phone, Mail, CreditCard, ArrowLeftRight,
  Globe, Wifi, Users, ShieldCheck, Lock, Settings, Menu, X,
  LayoutDashboard,
} from 'lucide-react'
import { usePrivex, type NavSection } from '../lib/store'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { WC_PROJECT_ID } from '../config'

const NAV_GROUPS = [
  {
    label: 'Communication',
    items: [
      { id: 'home'     as NavSection, label: 'Home',     icon: Home },
      { id: 'messages' as NavSection, label: 'Messages', icon: MessageSquare },
      { id: 'calls'    as NavSection, label: 'Calls',    icon: Phone },
      { id: 'email'    as NavSection, label: 'Email',    icon: Mail },
    ],
  },
  {
    label: 'Finance',
    items: [
      { id: 'payments' as NavSection, label: 'Payments', icon: CreditCard },
      { id: 'swap'     as NavSection, label: 'Swap',     icon: ArrowLeftRight },
      { id: 'bridge'   as NavSection, label: 'Bridge',   icon: Globe },
    ],
  },
  {
    label: 'Privacy',
    items: [
      { id: 'vpn'      as NavSection, label: 'VPN',      icon: Wifi },
      { id: 'contacts' as NavSection, label: 'Contacts', icon: Users },
      { id: 'identity' as NavSection, label: 'Identity', icon: ShieldCheck },
      { id: 'security' as NavSection, label: 'Security', icon: Lock },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'settings' as NavSection, label: 'Settings', icon: Settings },
      { id: 'admin'    as NavSection, label: 'Admin',    icon: LayoutDashboard },
    ],
  },
]

const SECTION_TITLES: Partial<Record<NavSection, string>> = {
  home: 'Home', messages: 'Messages', calls: 'Calls', email: 'Email',
  payments: 'Payments', swap: 'Swap', bridge: 'Bridge',
  vpn: 'VPN', contacts: 'Contacts', identity: 'Identity',
  security: 'Security', settings: 'Settings', admin: 'Admin',
}

export default function PrivexLayout({ children }: { children: ReactNode }) {
  const { state, dispatch } = usePrivex()
  const { address, isConnected } = useAccount()
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()
  const [walletMenuOpen, setWalletMenuOpen] = useState(false)
  const [wcConnecting, setWcConnecting] = useState(false)
  // Track whether we're on desktop (md+) — initialized directly from matchMedia
  const desktopMq = typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)') : null
  const [isDesktop, setIsDesktop] = useState(() => desktopMq?.matches ?? true)
  const walletBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!desktopMq) return
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    desktopMq.addEventListener('change', handler)
    return () => desktopMq.removeEventListener('change', handler)
  }, [desktopMq])

  // Close wallet menu on outside click
  useEffect(() => {
    if (!walletMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (walletBtnRef.current && !walletBtnRef.current.closest('.wallet-picker-root')?.contains(e.target as Node)) {
        setWalletMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [walletMenuOpen])

  const connectWalletConnect = () => {
    if (!WC_PROJECT_ID) return
    const wc = connectors.find(c => c.id === 'walletConnect')
    if (!wc) return
    setWcConnecting(true)
    setWalletMenuOpen(false)
    connect(
      { connector: wc },
      { onSettled: () => setWcConnecting(false) },
    )
  }

  // Always dark mode
  useEffect(() => {
    document.documentElement.removeAttribute('data-theme')
    localStorage.removeItem('privex-theme')
  }, [])

  const setSection = (section: NavSection) => {
    dispatch({ type: 'SET_SECTION', section })
    // Only close sidebar on mobile
    if (!isDesktop) dispatch({ type: 'TOGGLE_SIDEBAR' })
  }

  // Whether the sidebar drawer should be visible
  const showSidebar = isDesktop || state.sidebarOpen

  return (
    // h-dvh + overflow-hidden prevents the page-level bounce/shake
    <div className="flex h-dvh overflow-hidden relative" style={{ background: 'var(--bg-gradient)' }}>
      {/* Ambient orbs — contained inside the viewport */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="grid-overlay" />

      {/* Mobile backdrop */}
      <AnimatePresence>
        {state.sidebarOpen && !isDesktop && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-20"
            style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <AnimatePresence initial={false}>
        {showSidebar && (
          <motion.aside
            key="sidebar"
            initial={isDesktop ? false : { x: -264 }}
            animate={{ x: 0 }}
            exit={isDesktop ? {} : { x: -264 }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="flex-shrink-0 h-dvh z-30 flex flex-col"
            style={{
              width: 260,
              // Mobile: fixed overlay. Desktop: part of flex row (no fixed)
              position: isDesktop ? 'relative' : 'fixed',
              top: 0, left: 0,
              background: 'rgba(8,14,28,0.98)',
              borderRight: '1px solid var(--border)',
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)',
            }}
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[1px]"
              style={{ background: 'linear-gradient(90deg, transparent 0%, var(--accent) 50%, transparent 100%)', opacity: 0.4 }} />

            {/* Logo */}
            <div className="px-5 flex items-center justify-between flex-shrink-0"
              style={{ height: 58, borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(96,165,250,0.18) 0%, rgba(79,70,229,0.22) 100%)', border: '1px solid rgba(140,180,255,0.25)' }}>
                  <img src="/privex-icon.svg" alt="PRIVEX" className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold tracking-[0.18em] text-[13px] truncate"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#f0f6ff' }}>
                    PRIVEX
                  </div>
                  <div className="text-[10px] tracking-[0.10em] uppercase truncate" style={{ color: 'var(--subtle)' }}>
                    Encrypted · Private
                  </div>
                </div>
              </div>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
                className="flex-shrink-0 p-2 rounded-lg transition-colors hover:bg-white/8"
                style={{ color: 'var(--subtle)' }}
                aria-label="Close sidebar"
              >
                <X size={14} />
              </button>
            </div>

            {/* Wallet identity chip */}
            {address ? (
              <button
                onClick={() => setSection('identity')}
                className="mx-3 mt-3 flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-white/5 text-left"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', flexShrink: 0 }}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #4f46e5 100%)', color: '#fff' }}>
                  {address.slice(2, 4).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold mono truncate" style={{ color: 'var(--ink)' }}>
                    {address.slice(0, 7)}…{address.slice(-5)}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full secure-pulse flex-shrink-0" style={{ background: 'var(--secure)' }} />
                    <span className="text-[10px]" style={{ color: 'var(--secure)' }}>Connected</span>
                  </div>
                </div>
              </button>
            ) : (
              <div className="mx-3 mt-3 px-3 py-2 rounded-xl text-[11px]" style={{ flexShrink: 0,
                background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--subtle)' }}>
                No wallet connected
              </div>
            )}

            {/* Nav — scrollable */}
            <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4 overscroll-contain">
              {NAV_GROUPS.map(group => (
                <div key={group.label}>
                  <p className="label-caps px-3 mb-1">{group.label}</p>
                  <div className="space-y-0.5">
                    {group.items.map(item => {
                      const Icon = item.icon
                      const active = state.activeSection === item.id
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSection(item.id)}
                          className={`w-full flex items-center gap-3 px-3 rounded-xl transition-all relative text-[13px] font-medium ${active ? 'nav-active' : 'hover:bg-white/5'}`}
                          style={{
                            color: active ? 'var(--accent)' : 'var(--muted)',
                            height: 40,
                          }}
                        >
                          {active && (
                            <motion.div
                              layoutId="nav-pill"
                              className="absolute inset-0 rounded-xl"
                              style={{ background: 'rgba(96,165,250,0.09)', border: '1px solid rgba(96,165,250,0.14)' }}
                              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                            />
                          )}
                          <Icon size={15} className="relative z-10 flex-shrink-0" />
                          <span className="relative z-10">{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Footer status */}
            <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${state.backendOnline ? 'secure-pulse' : ''}`}
                    style={{ background: state.backendOnline ? 'var(--secure)' : 'var(--danger)' }} />
                  <span className="text-[10px] truncate" style={{ color: 'var(--subtle)' }}>
                    {state.backendOnline ? 'Relay online' : 'Offline'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Wifi size={10} style={{ color: state.vpnConnected ? 'var(--secure)' : 'var(--subtle)' }} />
                  <span className="text-[10px]" style={{ color: state.vpnConnected ? 'var(--secure)' : 'var(--subtle)' }}>
                    {state.vpnConnected ? state.vpnLocation : 'VPN Off'}
                  </span>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main column ── */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden">
        {/* Topbar */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-3 sm:px-4"
          style={{
            height: 58,
            background: 'rgba(8,14,28,0.92)',
            borderBottom: '1px solid var(--border)',
            backdropFilter: 'blur(24px) saturate(170%)',
            WebkitBackdropFilter: 'blur(24px) saturate(170%)',
            position: 'relative',
            zIndex: 20,
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Hamburger */}
            <button
              onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
              className="flex-shrink-0 flex items-center justify-center rounded-xl transition-all"
              style={{
                color: 'var(--muted)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                width: 38, height: 38,
              }}
              aria-label="Open menu"
            >
              <Menu size={15} />
            </button>

            {/* Mobile logo mark */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(96,165,250,0.18) 0%, rgba(79,70,229,0.22) 100%)', border: '1px solid rgba(140,180,255,0.2)' }}>
                <img src="/privex-icon.svg" alt="PRIVEX" className="w-4.5 h-4.5" />
              </div>
              <span className="font-bold tracking-[0.16em] text-[12px] sm:text-[13px] md:hidden"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#f0f6ff' }}>
                PRIVEX
              </span>
              <h1 className="hidden md:block font-semibold text-[15px]"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--ink-2)', letterSpacing: '-0.01em' }}>
                {SECTION_TITLES[state.activeSection] ?? state.activeSection}
              </h1>
            </div>
          </div>

          {/* Wallet button — right side */}
          <div className="relative wallet-picker-root flex-shrink-0">
            <motion.button
              ref={walletBtnRef}
              onClick={() => isConnected ? void disconnect() : setWalletMenuOpen(v => !v)}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 sm:gap-2 rounded-xl font-semibold transition-all"
              style={isConnected ? {
                background: 'var(--surface-mid)',
                border: '1px solid var(--border-strong)',
                color: 'var(--ink-2)',
                height: 38,
                paddingLeft: 12, paddingRight: 12,
                fontSize: 12,
              } : {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%)',
                border: '1px solid rgba(140,180,255,0.3)',
                color: '#ffffff',
                height: 38,
                paddingLeft: 12, paddingRight: 12,
                fontSize: 12,
              }}
            >
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isConnected ? 'secure-pulse' : ''}`}
                style={{ background: isConnected ? 'var(--secure)' : 'rgba(255,255,255,0.6)' }} />
              <span className="whitespace-nowrap">
                {isConnected && address
                  ? `${address.slice(0, 5)}…${address.slice(-4)}`
                  : 'Connect'}
              </span>
            </motion.button>

            {/* Wallet picker — positioned to stay on screen */}
            <AnimatePresence>
              {walletMenuOpen && !isConnected && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.14 }}
                  // max-w-[calc(100vw-1rem)] prevents the dropdown from going off-screen on phones
                  className="absolute right-0 top-full mt-2 z-50 rounded-2xl overflow-hidden"
                  style={{
                    width: 'min(260px, calc(100vw - 1rem))',
                    background: 'rgba(10,18,32,0.98)',
                    border: '1px solid rgba(126,179,245,0.18)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                  }}
                >
                  <div className="px-4 pt-4 pb-2">
                    <div className="text-[13px] font-semibold" style={{ color: 'var(--ink)' }}>Connect a Wallet</div>
                    <div className="text-[11px] mt-0.5" style={{ color: 'var(--subtle)' }}>Choose how to connect</div>
                  </div>
                  <div className="px-2 pb-3 space-y-1">
                    {connectors.map(connector => (
                      <button
                        key={connector.id}
                        onClick={() => { connect({ connector }); setWalletMenuOpen(false) }}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all hover:bg-white/6 text-left"
                        style={{ minHeight: 48 }}
                      >
                        {connector.icon
                          ? <img src={connector.icon} alt={connector.name} className="w-8 h-8 rounded-xl flex-shrink-0" />
                          : <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-[12px] font-bold"
                              style={{ background: 'rgba(126,179,245,0.12)', color: 'var(--accent)' }}>
                              {connector.name[0]}
                            </div>
                        }
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium" style={{ color: 'var(--ink)' }}>{connector.name}</div>
                          <div className="text-[11px]" style={{ color: 'var(--subtle)' }}>Browser extension</div>
                        </div>
                      </button>
                    ))}
                    {WC_PROJECT_ID && (
                      <button
                        onClick={connectWalletConnect}
                        disabled={wcConnecting}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all hover:bg-white/6 text-left disabled:opacity-60"
                        style={{ minHeight: 48 }}
                      >
                        <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center"
                          style={{ background: 'rgba(59,130,246,0.15)' }}>
                          <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                            <path d="M3.68 2.42C6.62-.52 11.38-.52 14.32 2.42l.4.4a.41.41 0 0 1 0 .58l-1.38 1.38a.21.21 0 0 1-.3 0l-.55-.55C10.27 1.97 7.73 1.97 5.51 4.23l-.58.58a.21.21 0 0 1-.3 0L3.25 3.43a.41.41 0 0 1 0-.58l.43-.43Zm8.47 3.58 1.23 1.23a.41.41 0 0 1 0 .58l-3.64 3.64a.42.42 0 0 1-.59 0L6.7 9.1a.1.1 0 0 0-.15 0L4.1 11.45a.42.42 0 0 1-.59 0L-.13 7.81a.41.41 0 0 1 0-.58l1.23-1.23a.42.42 0 0 1 .59 0L4.17 8.5a.1.1 0 0 0 .15 0l2.44-2.44a.42.42 0 0 1 .59 0l2.44 2.44a.1.1 0 0 0 .15 0l2.44-2.44a.42.42 0 0 1 .59 0Z" fill="#3b82f6"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium" style={{ color: 'var(--ink)' }}>
                            {wcConnecting ? 'Opening…' : 'WalletConnect'}
                          </div>
                          <div className="text-[11px]" style={{ color: 'var(--subtle)' }}>QR code · all mobile wallets</div>
                        </div>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.activeSection}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.13, ease: [0.25, 0.1, 0.25, 1.0] }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
