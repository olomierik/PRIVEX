import { useReducer, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { PrivexContext, privexReducer, initialState, type NavSection } from './lib/store'
import PrivexLayout from './components/PrivexLayout'
import HomeSection from './components/sections/HomeSection'
import MessagingSection from './components/sections/MessagingSection'
import CallsSection from './components/sections/CallsSection'
import EmailSection from './components/sections/EmailSection'
import PaymentsSection from './components/sections/PaymentsSection'
import SwapSection from './components/sections/SwapSection'
import BridgeSection from './components/sections/BridgeSection'
import VPNSection from './components/sections/VPNSection'
import ContactsSection from './components/sections/ContactsSection'
import IdentitySection from './components/sections/IdentitySection'
import SecuritySection from './components/sections/SecuritySection'
import SettingsSection from './components/sections/SettingsSection'
import AdminSection from './components/sections/AdminSection'
import { healthCheck, setWalletAddress, publishPubkey } from './lib/relay'
import { loadOrCreateKeys } from './lib/crypto'

function SectionContent({ section }: { section: NavSection }) {
  switch (section) {
    case 'home':     return <HomeSection />
    case 'messages': return <MessagingSection />
    case 'calls':    return <CallsSection />
    case 'email':    return <EmailSection />
    case 'payments': return <PaymentsSection />
    case 'swap':     return <SwapSection />
    case 'bridge':   return <BridgeSection />
    case 'vpn':      return <VPNSection />
    case 'contacts': return <ContactsSection />
    case 'identity': return <IdentitySection />
    case 'security': return <SecuritySection />
    case 'settings': return <SettingsSection />
    case 'admin':    return <AdminSection />
    default:         return <HomeSection />
  }
}

function AppInner() {
  const [state, dispatch] = useReducer(privexReducer, initialState)
  const { address } = useAccount()

  // Keep relay wallet address in sync with connected wallet
  useEffect(() => {
    setWalletAddress(address ?? null)
  }, [address])

  // Auto-load/create encryption keys when wallet connects — no signature needed.
  // Keys are derived from a wallet-specific seed stored in IndexedDB (local only).
  // This makes all encryption status items show Active as soon as wallet connects.
  useEffect(() => {
    if (!address) return
    void (async () => {
      try {
        const { privKeys, bundle } = await loadOrCreateKeys(address)
        const handle = state.privexHandle ?? ''
        dispatch({ type: 'SET_IDENTITY', handle, keyBundle: bundle, privKeys })
        dispatch({ type: 'AUTH_SUCCESS', token: address })
        // Publish public key to Supabase so contacts can encrypt messages to us
        if (bundle?.encryptionPubkey) {
          void publishPubkey(bundle.encryptionPubkey as string)
        }
      } catch {
        // silent — user can retry from Security section
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  useEffect(() => {
    const check = async () => {
      const ok = await healthCheck()
      dispatch({ type: 'SET_BACKEND_ONLINE', online: ok })
    }
    void check()
    const interval = setInterval(() => { void check() }, 30_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <PrivexContext.Provider value={{ state, dispatch }}>
      <PrivexLayout>
        <SectionContent section={state.activeSection} />
      </PrivexLayout>
    </PrivexContext.Provider>
  )
}

export default function App() {
  return <AppInner />
}
