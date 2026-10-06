import { useReducer, useEffect } from 'react'
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
import { healthCheck } from './lib/relay'

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
