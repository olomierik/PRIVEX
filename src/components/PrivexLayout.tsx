import { type ReactNode, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, MessageSquare, Phone, Mail, CreditCard, ArrowLeftRight,
  Globe, Wifi, Users, ShieldCheck, Lock, Settings, Menu, X,
  ChevronRight, LayoutDashboard, Sun, Moon
} from 'lucide-react'
import { usePrivex, type NavSection } from '../lib/store'
import { useAccount } from 'wagmi'
import { ConnectKitButton } from 'connectkit'


const NAV_GROUPS = [
  {
    label: 'Communication',
    items: [
      { id: 'home' as NavSection,     label: 'Home',     icon: Home },
      { id: 'messages' as NavSection, label: 'Messages', icon: MessageSquare },
      { id: 'calls' as NavSection,    label: 'Calls',    icon: Phone },
      { id: 'email' as NavSection,    label: 'Email',    icon: Mail },
    ],
  },
  {
    label: 'Finance',
    items: [
      { id: 'payments' as NavSection, label: 'Payments', icon: CreditCard },
      { id: 'swap' as NavSection,     label: 'Swap',     icon: ArrowLeftRight },
      { id: 'bridge' as NavSection,   label: 'Bridge',   icon: Globe },
    ],
  },
  {
    label: 'Privacy',
    items: [
      { id: 'vpn' as NavSection,      label: 'VPN',      icon: Wifi },
      { id: 'contacts' as NavSection, label: 'Contacts', icon: Users },
      { id: 'identity' as NavSection, label: 'Identity', icon: ShieldCheck },
      { id: 'security' as NavSection, label: 'Security', icon: Lock },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'settings' as NavSection, label: 'Settings', icon: Settings },
      { id: 'admin' as NavSection,    label: 'Admin',    icon: LayoutDashboard },
    ],
  },
]

export default function PrivexLayout({ children }: { children: ReactNode }) {
  const { state, dispatch } = usePrivex()
  const { address } = useAccount()

  // Dark/light mode — persisted in localStorage
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('privex-theme') as 'dark' | 'light') ?? 'dark'
    }
    return 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('privex-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

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

      {/* Grid overlay */}
      <div className="grid-overlay" />

      {/* Mobile overlay */}
      <AnimatePresence>
        {state.sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-20 md:hidden backdrop-blur-sm"
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {(state.sidebarOpen || typeof window !== 'undefined' && window.innerWidth >= 768) && (
          <motion.aside
            key="sidebar"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed md:sticky top-0 left-0 h-dvh w-64 z-30 flex flex-col"
            style={{
              background: theme === 'dark' ? 'rgba(3, 8, 15, 0.92)' : 'rgba(240, 244, 255, 0.92)',
              borderRight: '1px solid var(--border)',
              backdropFilter: 'blur(24px) saturate(180%)',
            }}
          >
            {/* Sidebar top glow strip */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }} />

            {/* Logo */}
            <div className="px-5 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <img
                  src="/privex-logo.svg"
                  alt="PRIVEX"
                  className="w-10 h-10 rounded-xl flex-shrink-0"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.55))' }}
                />
                <div>
                  <div className="display font-bold text-base tracking-[0.14em]" style={{ color: 'var(--ink)', letterSpacing: '0.14em' }}>PRIVEX</div>
                  <div className="text-[10px] font-medium tracking-wider" style={{ color: 'var(--subtle)', letterSpacing: '0.06em' }}>Private Digital Life</div>
                </div>
              </div>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
                className="md:hidden p-1.5 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: 'var(--muted)' }}
              >
                <X size={15} />
              </button>
            </div>

            {/* User identity row */}
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              {address ? (
                <motion.div
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2.5 cursor-pointer group"
                  onClick={() => setSection('identity')}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #818cf8 100%)', color: '#fff' }}>
                    {address.slice(2, 4).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold mono truncate" style={{ color: 'var(--ink)' }}>
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full secure-pulse" style={{ background: 'var(--secure)' }} />
                      <span className="text-[10px]" style={{ color: 'var(--secure)' }}>Connected</span>
                    </div>
                  </div>
                  <ChevronRight size={11} style={{ color: 'var(--subtle)' }} className="group-hover:translate-x-0.5 transition-transform" />
                </motion.div>
              ) : (
                <div className="text-xs" style={{ color: 'var(--subtle)' }}>Wallet not connected</div>
              )}
            </div>

            {/* Nav groups */}
            <nav className="flex-1 overflow-y-auto py-3 space-y-4 px-2">
              {NAV_GROUPS.map(group => (
                <div key={group.label}>
                  <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.10em]" style={{ color: 'var(--subtle)' }}>
                    {group.label}
                  </div>
                  {group.items.map(item => {
                    const Icon = item.icon
                    const active = state.activeSection === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSection(item.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg mb-0.5 transition-all relative ${active ? 'nav-active' : 'hover:bg-white/5'}`}
                        style={{ color: active ? 'var(--accent)' : 'var(--muted)' }}
                      >
                        {active && (
                          <motion.div
                            layoutId="nav-indicator"
                            className="absolute inset-0 rounded-lg"
                            style={{ background: 'rgba(96,165,250,0.08)' }}
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                        <Icon size={15} className="relative z-10 flex-shrink-0" />
                        <span className="font-medium relative z-10">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              ))}
            </nav>

            {/* Status bar */}
            <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${state.backendOnline ? 'secure-pulse' : ''}`}
                    style={{ background: state.backendOnline ? 'var(--secure)' : 'var(--danger)' }} />
                  <span className="text-xs" style={{ color: 'var(--subtle)' }}>
                    Relay {state.backendOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wifi size={10} style={{ color: state.vpnConnected ? 'var(--secure)' : 'var(--subtle)' }} />
                  <span className="text-xs" style={{ color: state.vpnConnected ? 'var(--secure)' : 'var(--subtle)' }}>
                    {state.vpnConnected ? state.vpnLocation : 'VPN Off'}
                  </span>
                </div>
              </div>
              <div className="text-[10px] text-center" style={{ color: 'var(--subtle)' }}>
                Arc Mainnet · End-to-End Encrypted
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 md:px-6 py-3"
          style={{
            background: theme === 'dark' ? 'rgba(3, 8, 15, 0.82)' : 'rgba(240, 244, 255, 0.85)',
            borderBottom: '1px solid var(--border)',
            backdropFilter: 'blur(20px) saturate(180%)',
          }}>
          {/* Left — menu + section title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
              className="p-2 rounded-lg transition-all hover:bg-white/8"
              style={{ color: 'var(--muted)' }}
            >
              <Menu size={17} />
            </button>

            {/* Brand mark visible on mobile */}
            <div className="flex items-center gap-2 md:hidden">
              <img
                src="/privex-logo.svg"
                alt="PRIVEX"
                className="w-7 h-7"
                style={{ filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.6))' }}
              />
              <span className="display font-bold text-sm tracking-widest" style={{ color: 'var(--ink)' }}>PRIVEX</span>
            </div>

            <h1 className="hidden md:block display font-semibold text-sm capitalize tracking-wide" style={{ color: 'var(--ink-2)' }}>
              {state.activeSection}
            </h1>
          </div>

          {/* Right — network pill + theme toggle + connect wallet */}
          <div className="flex items-center gap-2.5">
            {/* Network pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'var(--surface-mid)', border: '1px solid var(--border)' }}>
              <div className="w-1.5 h-1.5 rounded-full secure-pulse" style={{ background: 'var(--secure)' }} />
              <span className="text-[10px] font-medium" style={{ color: 'var(--muted)' }}>Arc Mainnet</span>
            </div>

            {/* Theme toggle */}
            <motion.button
              onClick={toggleTheme}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-xl transition-all"
              style={{ background: 'var(--surface-mid)', border: '1px solid var(--border)', color: 'var(--muted)' }}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.span key="sun" initial={{ opacity: 0, rotate: -30 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 30 }}>
                    <Sun size={14} />
                  </motion.span>
                ) : (
                  <motion.span key="moon" initial={{ opacity: 0, rotate: 30 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -30 }}>
                    <Moon size={14} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Connect Wallet button */}
            <ConnectKitButton.Custom>
              {({ isConnected, show, address: addr }) => (
                <motion.button
                  onClick={show}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={isConnected ? {
                    background: 'var(--surface-mid)',
                    border: '1px solid var(--border-strong)',
                    color: 'var(--ink-2)',
                  } : {
                    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                    border: '1px solid transparent',
                    color: '#fff',
                    boxShadow: '0 0 16px rgba(59,130,246,0.35)',
                  }}
                >
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isConnected ? 'secure-pulse' : ''}`}
                    style={{ background: isConnected ? 'var(--secure)' : 'rgba(255,255,255,0.6)' }} />
                  <span>{isConnected ? `${addr?.slice(0, 6)}...${addr?.slice(-4)}` : 'Connect Wallet'}</span>
                </motion.button>
              )}
            </ConnectKitButton.Custom>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1.0] }}
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
