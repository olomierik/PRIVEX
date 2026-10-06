/**
 * PRIVEX Settings
 * Privacy preferences, theme, notifications, data export, session management.
 */
import { useState, useEffect } from 'react'
import {
  Bell, Globe, Shield, HelpCircle, ExternalLink, ChevronRight,
  Moon, Sun, Download, Trash2, RefreshCw, AlertTriangle, Lock,
  Smartphone, Eye, EyeOff,
} from 'lucide-react'
import { usePrivex } from '../../lib/store'
import { useAccount } from 'wagmi'
import { toast } from 'sonner'

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      className="w-10 h-5 rounded-full transition-all relative flex-shrink-0"
      style={{ background: value ? 'var(--secure)' : 'var(--surface-muted)' }}>
      <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow"
        style={{ left: value ? 22 : 2 }} />
    </button>
  )
}

function SettingRow({ label, detail, value, onChange }: { label: string; detail?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
      <div className="flex-1 pr-4">
        <div className="text-sm" style={{ color: 'var(--ink-2)' }}>{label}</div>
        {detail && <div className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>{detail}</div>}
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  )
}

interface Session {
  id: string
  device: string
  ip: string
  lastSeen: string
  current: boolean
}

const MOCK_SESSIONS: Session[] = [
  { id: '1', device: 'Chrome / macOS', ip: '***.***.**.42', lastSeen: 'Now', current: true },
  { id: '2', device: 'Firefox / Windows', ip: '***.***.**.88', lastSeen: '2 hours ago', current: false },
  { id: '3', device: 'Safari / iOS', ip: '***.***.**.16', lastSeen: '1 day ago', current: false },
]

export default function SettingsSection() {
  const { state, dispatch } = usePrivex()
  const { address } = useAccount()
  const [darkMode, setDarkMode] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [disappearingMessages, setDisappearingMessages] = useState(false)
  const [readReceipts, setReadReceipts] = useState(true)
  const [metadataMinimization, setMetadataMinimization] = useState(true)
  const [hideOnlineStatus, setHideOnlineStatus] = useState(false)
  const [screenshotProtection, setScreenshotProtection] = useState(false)
  const [twoFactorVPN, setTwoFactorVPN] = useState(true)
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS)
  const [tab, setTab] = useState<'privacy' | 'notifications' | 'sessions' | 'data' | 'about'>('privacy')
  const [exportReady, setExportReady] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showHandle, setShowHandle] = useState(true)

  useEffect(() => {
    document.documentElement.classList.toggle('light-mode', !darkMode)
  }, [darkMode])

  const exportData = async () => {
    setExporting(true)
    await new Promise(r => setTimeout(r, 1500))
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      wallet: address ?? 'unknown',
      handle: state.privexHandle,
      contactCount: state.contacts.length,
      emailCount: state.emails.length,
      note: 'This export contains your local contact list and email metadata. Private keys and message contents are NOT included — they never leave your device unencrypted.',
    }
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'privex-data-export.json'; a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
    setExportReady(true)
    toast.success('Data exported (no private keys or message content included)')
  }

  const revokeSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id === '1' || s.id !== id))
    toast.success('Session revoked')
  }

  const tabs = [
    { id: 'privacy' as const, label: 'Privacy' },
    { id: 'notifications' as const, label: 'Alerts' },
    { id: 'sessions' as const, label: 'Sessions' },
    { id: 'data' as const, label: 'Data' },
    { id: 'about' as const, label: 'About' },
  ]

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto space-y-5">
      {/* Tabs */}
      <div className="flex gap-1 glass rounded-xl p-1 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
            style={{ background: tab === t.id ? 'var(--surface-strong)' : 'transparent', color: tab === t.id ? 'var(--ink)' : 'var(--muted)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* PRIVACY */}
      {tab === 'privacy' && (
        <div className="space-y-4">
          <div className="glass-strong rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={15} style={{ color: 'var(--accent)' }} />
              <h2 className="display font-semibold text-sm" style={{ color: 'var(--ink)' }}>Privacy Settings</h2>
            </div>
            <SettingRow label="Disappearing Messages" detail="Messages auto-delete after 7 days" value={disappearingMessages} onChange={setDisappearingMessages} />
            <SettingRow label="Read Receipts" detail="Let contacts see when you've read messages" value={readReceipts} onChange={setReadReceipts} />
            <SettingRow label="Metadata Minimization" detail="Reduce timing and routing metadata exposure" value={metadataMinimization} onChange={setMetadataMinimization} />
            <SettingRow label="Hide Online Status" detail="Don't broadcast your last-seen time" value={hideOnlineStatus} onChange={setHideOnlineStatus} />
            <SettingRow label="Screenshot Protection" detail="Attempt to block screenshots in app (mobile)" value={screenshotProtection} onChange={setScreenshotProtection} />
            <SettingRow label="VPN 2FA" detail="Require wallet signature to connect VPN" value={twoFactorVPN} onChange={setTwoFactorVPN} />
          </div>

          <div className="glass-strong rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Moon size={15} style={{ color: 'var(--accent)' }} />
              <h2 className="display font-semibold text-sm" style={{ color: 'var(--ink)' }}>Appearance</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm" style={{ color: 'var(--ink-2)' }}>Theme</div>
                <div className="text-xs" style={{ color: 'var(--subtle)' }}>{darkMode ? 'Dark mode' : 'Light mode'}</div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => setDarkMode(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{ background: darkMode ? 'var(--surface-strong)' : 'var(--surface-muted)', color: darkMode ? 'var(--ink)' : 'var(--muted)', border: darkMode ? '1px solid var(--border-strong)' : 'none' }}>
                  <Moon size={11} />Dark
                </button>
                <button onClick={() => setDarkMode(false)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{ background: !darkMode ? 'var(--surface-strong)' : 'var(--surface-muted)', color: !darkMode ? 'var(--ink)' : 'var(--muted)', border: !darkMode ? '1px solid var(--border-strong)' : 'none' }}>
                  <Sun size={11} />Light
                </button>
              </div>
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Globe size={15} style={{ color: 'var(--accent)' }} />
              <h2 className="display font-semibold text-sm" style={{ color: 'var(--ink)' }}>Account</h2>
            </div>
            <div className="space-y-2">
              <div className="glass rounded-xl p-3 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium" style={{ color: 'var(--ink-2)' }}>PRIVEX Handle</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>
                    {state.privexHandle ? `${state.privexHandle}@privex` : 'Not registered'}
                  </div>
                </div>
                <button onClick={() => dispatch({ type: 'SET_SECTION', section: 'identity' })}
                  className="flex items-center gap-1 text-xs ml-3" style={{ color: 'var(--accent)' }}>
                  Manage <ChevronRight size={11} />
                </button>
              </div>
              <div className="glass rounded-xl p-3 flex items-center gap-2">
                <Lock size={12} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium" style={{ color: 'var(--ink-2)' }}>Wallet Address</div>
                  <div className="mono text-xs truncate" style={{ color: 'var(--muted)' }}>
                    {showHandle ? (address ?? 'Not connected') : (address ? `${address.slice(0, 10)}...${address.slice(-6)}` : 'Not connected')}
                  </div>
                </div>
                <button onClick={() => setShowHandle(v => !v)} className="p-1 rounded hover:bg-white/5">
                  {showHandle ? <EyeOff size={12} style={{ color: 'var(--muted)' }} /> : <Eye size={12} style={{ color: 'var(--muted)' }} />}
                </button>
              </div>
              {state.isAuthenticated && (
                <button onClick={() => { dispatch({ type: 'AUTH_LOGOUT' }); toast.success('Signed out') }}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-center transition-all hover:opacity-80"
                  style={{ background: 'var(--surface-muted)', color: 'var(--danger)' }}>
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS */}
      {tab === 'notifications' && (
        <div className="glass-strong rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={15} style={{ color: 'var(--accent)' }} />
            <h2 className="display font-semibold text-sm" style={{ color: 'var(--ink)' }}>Notifications</h2>
          </div>
          <SettingRow label="Push Notifications" detail="Receive alerts for messages and calls" value={notifications} onChange={setNotifications} />
          <SettingRow label="Message Alerts" detail="New encrypted message received" value={notifications} onChange={v => { setNotifications(v); toast.info(v ? 'Message alerts on' : 'Message alerts off') }} />
          <SettingRow label="Call Alerts" detail="Incoming encrypted call notification" value={notifications} onChange={v => toast.info(v ? 'Call alerts on' : 'Call alerts off')} />
          <SettingRow label="Email Alerts" detail="New encrypted email received" value={notifications} onChange={v => toast.info(v ? 'Email alerts on' : 'Email alerts off')} />
          <SettingRow label="VPN Disconnect Alert" detail="Alert when VPN connection drops" value={true} onChange={() => {}} />
          <SettingRow label="Security Alerts" detail="Unknown login or key rotation" value={true} onChange={() => {}} />
        </div>
      )}

      {/* SESSIONS */}
      {tab === 'sessions' && (
        <div className="glass-strong rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <Smartphone size={14} style={{ color: 'var(--accent)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Active Sessions</span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Sessions are authenticated by wallet signature — IP addresses are obfuscated</p>
          </div>
          {sessions.map(s => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3 border-b last:border-0 hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border)' }}>
              <Smartphone size={14} style={{ color: s.current ? 'var(--secure)' : 'var(--muted)', flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>
                  {s.device} {s.current && <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--secure)', color: '#080e1a' }}>Current</span>}
                </div>
                <div className="text-xs" style={{ color: 'var(--subtle)' }}>IP {s.ip} · {s.lastSeen}</div>
              </div>
              {!s.current && (
                <button onClick={() => revokeSession(s.id)}
                  className="text-xs px-2.5 py-1 rounded-lg transition-colors hover:opacity-80"
                  style={{ background: 'var(--surface-muted)', color: 'var(--danger)' }}>
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* DATA */}
      {tab === 'data' && (
        <div className="space-y-4">
          <div className="glass-strong rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Download size={15} style={{ color: 'var(--accent)' }} />
              <h2 className="display font-semibold text-sm" style={{ color: 'var(--ink)' }}>Export Your Data</h2>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
              Export a copy of your PRIVEX data. Private keys and message contents are NOT included — they are stored encrypted on your device only.
            </p>
            <div className="space-y-2 mb-4">
              {['Contact list (addresses + handles)', 'Email metadata (timestamps, subjects — decrypted)', 'Settings', 'Identity commitment (public key hash)'].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--secure)' }} />
                  <span className="text-xs" style={{ color: 'var(--ink-2)' }}>{item}</span>
                </div>
              ))}
              {['Private keys', 'Message ciphertext', 'Call recordings', 'VPN credentials'].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--danger)' }} />
                  <span className="text-xs" style={{ color: 'var(--subtle)' }}>{item} (never exported)</span>
                </div>
              ))}
            </div>
            <button onClick={() => { void exportData() }} disabled={exporting}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80 disabled:opacity-60"
              style={{ background: 'var(--surface-strong)', color: 'var(--ink)' }}>
              {exporting ? <><div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />Exporting...</>
                : exportReady ? <><RefreshCw size={14} />Export Again</>
                : <><Download size={14} />Export Data</>}
            </button>
          </div>

          <div className="glass-strong rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trash2 size={15} style={{ color: 'var(--danger)' }} />
              <h2 className="display font-semibold text-sm" style={{ color: 'var(--ink)' }}>Delete Data</h2>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
              Request deletion of your data from PRIVEX relay servers. On-chain data (identity commitments, token transactions) cannot be deleted as it is part of the immutable blockchain.
            </p>
            <button onClick={() => toast.error('Data deletion requires contract interaction — coming in Phase 10')}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{ background: 'var(--surface-muted)', color: 'var(--danger)' }}>
              Request Data Deletion
            </button>
          </div>

          <div className="glass rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle size={11} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 1 }} />
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              Encrypted relay data (messages, emails) is automatically deleted per your disappearing settings. Server-side retention is minimized by design.
            </p>
          </div>
        </div>
      )}

      {/* ABOUT */}
      {tab === 'about' && (
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle size={15} style={{ color: 'var(--accent)' }} />
            <h2 className="display font-semibold text-sm" style={{ color: 'var(--ink)' }}>About PRIVEX</h2>
          </div>
          <div className="space-y-3 text-xs" style={{ color: 'var(--muted)' }}>
            <p>PRIVEX is a Web3 privacy protocol providing E2E encrypted messaging, calls, email, VPN, payments, swaps, and cross-chain bridging — anchored by blockchain identity on Arc.</p>
            <p>PRIVEX token (PVX) provides service access tiers. It is a utility token — not a security, investment vehicle, or guaranteed-return product.</p>
            <p>All cryptographic operations use established libraries (WebCrypto API, ECDH P-256, AES-GCM 256-bit). No proprietary encryption algorithms are used.</p>
            <div className="flex gap-3 pt-2 flex-wrap">
              <a href="#" className="flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}><ExternalLink size={10} />Docs</a>
              <a href="#" className="flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}><ExternalLink size={10} />Privacy Policy</a>
              <a href="#" className="flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}><ExternalLink size={10} />Security Audit</a>
              <a href="#" className="flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}><ExternalLink size={10} />GitHub</a>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t space-y-1" style={{ borderColor: 'var(--border)' }}>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--subtle)' }}>Version</span>
              <span style={{ color: 'var(--muted)' }}>Phase 4–7 MVP</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--subtle)' }}>Network</span>
              <span style={{ color: 'var(--muted)' }}>Arc Testnet</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--subtle)' }}>Encryption</span>
              <span style={{ color: 'var(--secure)' }}>ECDH P-256 + AES-GCM 256</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
