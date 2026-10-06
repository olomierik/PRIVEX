import { type ReactNode, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, MessageSquare, Phone, Mail, CreditCard, ArrowLeftRight,
  Globe, Wifi, Users, ShieldCheck, Lock, Settings, Menu, X,
  LayoutDashboard,
} from 'lucide-react'
import { usePrivex, type NavSection } from '../lib/store'
import { useAccount } from 'wagmi'
import { ConnectKitButton } from 'connectkit'

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
  const { address } = useAccount()

  // Always dark mode — purge any stale light setting
  useEffect(() => {
    document.documentElement.removeAttribute('data-theme')
    localStorage.removeItem('privex-theme')
  }, [])

  const setSection = (section: NavSection) => {
    dispatch({ type: 'SET_SECTION', section })
    if (window.innerWidth < 768) dispatch({ type: 'TOGGLE_SIDEBAR' })
  }

  return (
    <div className="flex min-h-dvh relative" style={{ background: 'var(--bg-gradient)' }}>
      {/* Ambient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="grid-overlay" />

      {/* Mobile backdrop */}
      <AnimatePresence>
        {state.sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-20 md:hidden"
            style={{ backdropFilter: 'blur(4px)' }}
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <AnimatePresence initial={false}>
        {(state.sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
          <motion.aside
            key="sidebar"
            initial={{ x: -264 }}
            animate={{ x: 0 }}
            exit={{ x: -264 }}
            transition={{ type: 'spring', stiffness: 360, damping: 36 }}
            className="fixed md:sticky top-0 left-0 h-dvh z-30 flex flex-col"
            style={{
              width: 264,
              background: 'rgba(8,14,28,0.97)',
              borderRight: '1px solid var(--border)',
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)',
            }}
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[1px]"
              style={{ background: 'linear-gradient(90deg, transparent 0%, var(--accent) 50%, transparent 100%)', opacity: 0.5 }} />

            {/* Logo */}
            <div className="px-5 h-[58px] flex items-center justify-between flex-shrink-0"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                {/* Logo mark — white on dark, always visible */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(96,165,250,0.18) 0%, rgba(79,70,229,0.22) 100%)', border: '1px solid rgba(140,180,255,0.25)' }}>
                  <img src="/privex-logo.svg" alt="PRIVEX" className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold tracking-[0.18em] text-[14px]"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#f0f6ff' }}>
                    PRIVEX
                  </div>
                  <div className="text-[10px] tracking-[0.12em] uppercase" style={{ color: 'var(--subtle)' }}>
                    Encrypted · Private
                  </div>
                </div>
              </div>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
                className="md:hidden p-1.5 rounded-lg"
                style={{ color: 'var(--subtle)' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Wallet identity */}
            {address ? (
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={() => setSection('identity')}
                className="mx-3 mt-3 flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-white/5"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #4f46e5 100%)', color: '#fff' }}>
                  {address.slice(2, 4).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-[12px] font-semibold mono truncate" style={{ color: 'var(--ink)' }}>
                    {address.slice(0, 8)}…{address.slice(-5)}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full secure-pulse flex-shrink-0" style={{ background: 'var(--secure)' }} />
                    <span className="text-[11px]" style={{ color: 'var(--secure)' }}>Connected</span>
                  </div>
                </div>
              </motion.button>
            ) : (
              <div className="mx-3 mt-3 px-3 py-2.5 rounded-xl text-[12px]"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--subtle)' }}>
                No wallet connected
              </div>
            )}

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
              {NAV_GROUPS.map(group => (
                <div key={group.label}>
                  <p className="label-caps px-3 mb-1.5">{group.label}</p>
                  <div className="space-y-0.5">
                    {group.items.map(item => {
                      const Icon = item.icon
                      const active = state.activeSection === item.id
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSection(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative text-[13px] font-medium ${active ? 'nav-active' : ''}`}
                          style={{
                            color: active ? 'var(--accent)' : 'var(--muted)',
                            minHeight: 42,
                          }}
                        >
                          {active && (
                            <motion.div
                              layoutId="nav-pill"
                              className="absolute inset-0 rounded-xl"
                              style={{ background: 'rgba(172,198,233,0.09)', border: '1px solid rgba(172,198,233,0.14)' }}
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

            {/* Footer — status only, no branding */}
            <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${state.backendOnline ? 'secure-pulse' : ''}`}
                    style={{ background: state.backendOnline ? 'var(--secure)' : 'var(--danger)' }} />
                  <span className="text-[11px]" style={{ color: 'var(--subtle)' }}>
                    {state.backendOnline ? 'Secure relay online' : 'Offline'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wifi size={10} style={{ color: state.vpnConnected ? 'var(--secure)' : 'var(--subtle)' }} />
                  <span className="text-[11px]" style={{ color: state.vpnConnected ? 'var(--secure)' : 'var(--subtle)' }}>
                    {state.vpnConnected ? state.vpnLocation : 'VPN Off'}
                  </span>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Topbar */}
        <header
          className="sticky top-0 z-20 flex items-center justify-between px-4 md:px-5"
          style={{
            background: 'rgba(8,14,28,0.90)',
            borderBottom: '1px solid var(--border)',
            backdropFilter: 'blur(24px) saturate(170%)',
            WebkitBackdropFilter: 'blur(24px) saturate(170%)',
            height: 58,
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
              className="p-2 rounded-xl transition-all"
              style={{
                color: 'var(--muted)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                minHeight: 38, minWidth: 38,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Menu size={15} />
            </button>

            {/* Mobile logo */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(96,165,250,0.18) 0%, rgba(79,70,229,0.22) 100%)', border: '1px solid rgba(140,180,255,0.2)' }}>
                <img src="/privex-logo.svg" alt="PRIVEX" className="w-5 h-5" />
              </div>
              <span className="font-bold tracking-[0.18em] text-[13px]"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#f0f6ff' }}>
                PRIVEX
              </span>
            </div>

            {/* Desktop section title */}
            <h1 className="hidden md:block font-semibold text-[15px]"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--ink-2)', letterSpacing: '-0.01em' }}>
              {SECTION_TITLES[state.activeSection] ?? state.activeSection}
            </h1>
          </div>

          {/* Connect Wallet only */}
          <ConnectKitButton.Custom>
            {({ isConnected, show, address: addr }) => (
              <motion.button
                onClick={show}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-[13px] transition-all"
                style={isConnected ? {
                  background: 'var(--surface-mid)',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--ink-2)',
                  minHeight: 38,
                } : {
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%)',
                  border: '1px solid rgba(140,180,255,0.3)',
                  color: '#ffffff',
                  minHeight: 38,
                }}
              >
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isConnected ? 'secure-pulse' : ''}`}
                  style={{ background: isConnected ? 'var(--secure)' : 'rgba(255,255,255,0.6)' }} />
                <span>{isConnected ? `${addr?.slice(0, 6)}…${addr?.slice(-4)}` : 'Connect Wallet'}</span>
              </motion.button>
            )}
          </ConnectKitButton.Custom>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.activeSection}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.14, ease: [0.25, 0.1, 0.25, 1.0] }}
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
