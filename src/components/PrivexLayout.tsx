import { type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, MessageSquare, Phone, Mail, CreditCard, ArrowLeftRight,
  Globe, Wifi, Users, ShieldCheck, Lock, Settings, Menu, X,
  Shield, ChevronRight, LayoutDashboard, type LucideProps
} from 'lucide-react'
import { type ForwardRefExoticComponent, type RefAttributes } from 'react'
import { usePrivex, type NavSection } from '../lib/store'
import { useAccount } from 'wagmi'
import { ConnectKitButton } from 'connectkit'

type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>

interface NavItem {
  id: NavSection
  label: string
  icon: LucideIcon
  badge?: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'calls', label: 'Calls', icon: Phone },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'swap', label: 'Swap', icon: ArrowLeftRight },
  { id: 'bridge', label: 'Bridge', icon: Globe },
  { id: 'vpn', label: 'VPN', icon: Wifi },
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'identity', label: 'Identity', icon: ShieldCheck },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'admin', label: 'Admin', icon: LayoutDashboard },
]

export default function PrivexLayout({ children }: { children: ReactNode }) {
  const { state, dispatch } = usePrivex()
  const { address } = useAccount()

  const setSection = (section: NavSection) => {
    dispatch({ type: 'SET_SECTION', section })
    if (window.innerWidth < 768) dispatch({ type: 'TOGGLE_SIDEBAR' })
  }

  return (
    <div className="flex min-h-dvh" style={{ background: 'var(--bg-gradient)' }}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {state.sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-20 md:hidden"
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {(state.sidebarOpen || window.innerWidth >= 768) && (
          <motion.aside
            key="sidebar"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed md:sticky top-0 left-0 h-dvh w-64 z-30 flex flex-col glass border-r"
            style={{ borderColor: 'var(--border)' }}
          >
            {/* Logo */}
            <div className="px-5 py-5 flex items-center justify-between border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)' }}>
                  <Shield size={16} className="text-[#080e1a]" />
                </div>
                <div>
                  <div className="display font-bold text-sm tracking-wider" style={{ color: 'var(--ink)', letterSpacing: '0.12em' }}>PRIVEX</div>
                  <div className="text-xs" style={{ color: 'var(--subtle)', letterSpacing: '0.04em' }}>Private Digital Life</div>
                </div>
              </div>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
                className="md:hidden p-1 rounded"
                style={{ color: 'var(--muted)' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* User identity */}
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              {address ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--surface-strong)', color: 'var(--accent)' }}>
                    {state.privexHandle ? state.privexHandle[0].toUpperCase() : address.slice(2, 4).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    {state.privexHandle ? (
                      <div className="text-xs font-semibold truncate" style={{ color: 'var(--ink)' }}>{state.privexHandle}@privex</div>
                    ) : (
                      <div className="text-xs font-semibold truncate mono" style={{ color: 'var(--ink)' }}>{address.slice(0, 6)}...{address.slice(-4)}</div>
                    )}
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full secure-pulse" style={{ background: 'var(--secure)' }} />
                      <span className="text-xs" style={{ color: 'var(--secure)' }}>Authenticated</span>
                    </div>
                  </div>
                  <ChevronRight size={12} style={{ color: 'var(--subtle)' }} />
                </div>
              ) : (
                <div className="text-xs" style={{ color: 'var(--muted)' }}>Not connected</div>
              )}
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-2">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon
                const active = state.activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors relative ${active ? 'nav-active' : 'hover:bg-white/5'}`}
                    style={{ color: active ? 'var(--accent)' : 'var(--muted)' }}
                  >
                    <Icon size={16} />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--danger)', color: 'white' }}>{item.badge}</span>
                    )}
                  </button>
                )
              })}
            </nav>

            {/* Status bar */}
            <div className="px-4 py-3 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${state.backendOnline ? 'secure-pulse' : ''}`} style={{ background: state.backendOnline ? 'var(--secure)' : 'var(--danger)' }} />
                  <span className="text-xs" style={{ color: 'var(--subtle)' }}>Relay {state.backendOnline ? 'Online' : 'Offline'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wifi size={10} style={{ color: state.vpnConnected ? 'var(--secure)' : 'var(--subtle)' }} />
                  <span className="text-xs" style={{ color: state.vpnConnected ? 'var(--secure)' : 'var(--subtle)' }}>
                    {state.vpnConnected ? state.vpnLocation : 'VPN Off'}
                  </span>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b glass"
          style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
              style={{ color: 'var(--muted)' }}
            >
              <Menu size={18} />
            </button>
            <h1 className="display font-semibold text-sm capitalize tracking-wide" style={{ color: 'var(--ink)' }}>
              {state.activeSection}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ConnectKitButton.Custom>
              {({ isConnected, show, address: addr }) => (
                <button
                  onClick={show}
                  className="glass-strong px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all hover:border-[var(--accent)]"
                  style={{ color: isConnected ? 'var(--ink-2)' : 'var(--accent)' }}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'secure-pulse' : ''}`}
                    style={{ background: isConnected ? 'var(--secure)' : 'var(--subtle)' }} />
                  {isConnected ? `${addr?.slice(0, 6)}...${addr?.slice(-4)}` : 'Connect Wallet'}
                </button>
              )}
            </ConnectKitButton.Custom>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
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
