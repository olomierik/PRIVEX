/**
 * PRIVEX Settings
 * Privacy preferences, theme, notifications, data export, session management.
 */
import { useState } from 'react'
import {
  Bell, Globe, Shield, HelpCircle, ExternalLink, ChevronRight,
  Moon, Download, Trash2, RefreshCw, AlertTriangle, Lock,
  Smartphone, Eye, EyeOff,
} from 'lucide-react'
import { usePrivex } from '../../lib/store'
import { useAccount } from 'wagmi'
import { toast } from 'sonner'

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-11 h-6 rounded-full transition-all relative flex-shrink-0"
      style={{ background: value ? 'var(--secure)' : 'var(--border-strong)' }}
    >
      <div
        className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm"
        style={{ left: value ? 26 : 4 }}
      />
    </button>
  )
}

function SettingRow({ label, detail, value, onChange }: {
  label: string; detail?: string; value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b last:border-0"
      style={{ borderColor: 'var(--border)' }}>
      <div className="flex-1 pr-4">
        <div className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>{label}</div>
        {detail && <div className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>{detail}</div>}
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  )
}

interface Session {
  id: string; device: string; ip: string; lastSeen: string; current: boolean
}

const MOCK_SESSIONS: Session[] = [
  { id: '1', device: 'Chrome / macOS', ip: '***.***.**.42', lastSeen: 'Now', current: true },
  { id: '2', device: 'Firefox / Windows', ip: '***.***.**.88', lastSeen: '2 hours ago', current: false },
  { id: '3', device: 'Safari / iOS', ip: '***.***.**.16', lastSeen: '1 day ago', current: false },
]

export default function SettingsSection() {
  const { state, dispatch } = usePrivex()
  const { address } = useAccount()

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
  const [showAddr, setShowAddr] = useState(false)

  const exportData = async () => {
    setExporting(true)
    await new Promise(r => setTimeout(r, 1400))
    const payload = {
      exportedAt: new Date().toISOString(),
      wallet: address ?? 'unknown',
      handle: state.privexHandle,
      contactCount: state.contacts.length,
      emailCount: state.emails.length,
      note: 'Private keys and message contents are NOT included — they never leave your device unencrypted.',
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'privex-data-export.json'; a.click()
    URL.revokeObjectURL(url)
    setExporting(false); setExportReady(true)
    toast.success('Data exported — no private keys or message content included')
  }

  const revokeSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.current || s.id !== id))
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
      {/* Tab bar */}
      <div className="flex gap-1 glass rounded-xl p-1 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
            style={{
              background: tab === t.id ? 'var(--surface-strong)' : 'transparent',
              color: tab === t.id ? 'var(--ink)' : 'var(--muted)',
              minHeight: 40,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── PRIVACY ── */}
      {tab === 'privacy' && (
        <div className="space-y-4">
          <div className="glass-strong rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={15} style={{ color: 'var(--accent)' }} />
              <h2 className="display font-semibold text-base" style={{ color: 'var(--ink)' }}>Privacy</h2>
            </div>
            <SettingRow label="Disappearing Messages" detail="Messages auto-delete after 7 days" value={disappearingMessages} onChange={setDisappearingMessages} />
            <SettingRow label="Read Receipts" detail="Let contacts see when you've read messages" value={readReceipts} onChange={setReadReceipts} />
            <SettingRow label="Metadata Minimization" detail="Reduce timing and routing metadata exposure" value={metadataMinimization} onChange={setMetadataMinimization} />
            <SettingRow label="Hide Online Status" detail="Don't broadcast your last-seen time" value={hideOnlineStatus} onChange={setHideOnlineStatus} />
            <SettingRow label="Screenshot Protection" detail="Attempt to block screenshots in app (mobile)" value={screenshotProtection} onChange={setScreenshotProtection} />
            <SettingRow label="VPN 2FA" detail="Require wallet signature to connect VPN" value={twoFactorVPN} onChange={setTwoFactorVPN} />
          </div>

          {/* Appearance */}
          <div className="glass-strong rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Moon size={15} style={{ color: 'var(--accent)' }} />
              <h2 className="display font-semibold text-base" style={{ color: 'var(--ink)' }}>Appearance</h2>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>Theme</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>Dark mode — designed for deep focus</div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                style={{ background: 'var(--surface-mid)', color: 'var(--accent)', border: '1px solid var(--border-strong)' }}>
                <Moon size={11} /> Dark
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="glass-strong rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Globe size={15} style={{ color: 'var(--accent)' }} />
              <h2 className="display font-semibold text-base" style={{ color: 'var(--ink)' }}>Account</h2>
            </div>
            <div className="space-y-2.5">
              <div className="glass rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>PRIVEX Handle</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                    {state.privexHandle ? `${state.privexHandle}@privex` : 'Not registered'}
                  </div>
                </div>
                <button
                  onClick={() => dispatch({ type: 'SET_SECTION', section: 'identity' })}
                  className="flex items-center gap-1 text-sm ml-3 font-medium"
                  style={{ color: 'var(--accent)' }}>
                  Manage <ChevronRight size={12} />
                </button>
              </div>
              <div className="glass rounded-xl p-3.5 flex items-center gap-3">
                <Lock size={13} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>Wallet</div>
                  <div className="mono text-xs mt-0.5 truncate" style={{ color: 'var(--muted)' }}>
                    {showAddr ? (address ?? 'Not connected') : (address ? `${address.slice(0, 10)}…${address.slice(-6)}` : 'Not connected')}
                  </div>
                </div>
                <button onClick={() => setShowAddr(v => !v)} className="p-1.5 rounded-lg hover:bg-white/5">
                  {showAddr ? <EyeOff size={13} style={{ color: 'var(--muted)' }} /> : <Eye size={13} style={{ color: 'var(--muted)' }} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── NOTIFICATIONS ── */}
      {tab === 'notifications' && (
        <div className="glass-strong rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={15} style={{ color: 'var(--accent)' }} />
            <h2 className="display font-semibold text-base" style={{ color: 'var(--ink)' }}>Notifications</h2>
          </div>
          <SettingRow label="Push Notifications" detail="Receive alerts for messages and calls" value={notifications} onChange={setNotifications} />
          <SettingRow label="Message Alerts" detail="New encrypted message received" value={notifications} onChange={v => { setNotifications(v); toast.info(v ? 'Message alerts on' : 'Message alerts off') }} />
          <SettingRow label="Call Alerts" detail="Incoming encrypted call" value={notifications} onChange={v => toast.info(v ? 'Call alerts on' : 'Call alerts off')} />
          <SettingRow label="Email Alerts" detail="New encrypted email received" value={notifications} onChange={v => toast.info(v ? 'Email alerts on' : 'Email alerts off')} />
          <SettingRow label="VPN Disconnect" detail="Alert when VPN connection drops" value={true} onChange={() => {}} />
          <SettingRow label="Security Alerts" detail="Unknown login or key rotation" value={true} onChange={() => {}} />
        </div>
      )}

      {/* ── SESSIONS ── */}
      {tab === 'sessions' && (
        <div className="glass-strong rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <Smartphone size={14} style={{ color: 'var(--accent)' }} />
              <span className="text-base font-semibold display" style={{ color: 'var(--ink)' }}>Active Sessions</span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Authenticated by wallet signature — IP addresses are obfuscated</p>
          </div>
          {sessions.map(s => (
            <div key={s.id} className="flex items-center gap-3 px-5 py-4 border-b last:border-0 hover:bg-white/5 transition-colors"
              style={{ borderColor: 'var(--border)' }}>
              <Smartphone size={14} style={{ color: s.current ? 'var(--secure)' : 'var(--muted)', flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                  {s.device}
                  {s.current && (
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--secure-dim)', color: 'var(--secure)' }}>
                      Current
                    </span>
                  )}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>IP {s.ip} · {s.lastSeen}</div>
              </div>
              {!s.current && (
                <button onClick={() => revokeSession(s.id)}
                  className="text-sm px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                  style={{ background: 'var(--surface-muted)', color: 'var(--danger)' }}>
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── DATA ── */}
      {tab === 'data' && (
        <div className="space-y-4">
          <div className="glass-strong rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Download size={15} style={{ color: 'var(--accent)' }} />
              <h2 className="display font-semibold text-base" style={{ color: 'var(--ink)' }}>Export Your Data</h2>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
              Export a copy of your PRIVEX data. Private keys and message contents are NOT included — they are stored encrypted on your device only.
            </p>
            <div className="space-y-2 mb-5">
              {['Contact list (addresses + handles)', 'Email metadata', 'Settings', 'Identity commitment (public key hash)'].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--secure)' }} />
                  <span className="text-sm" style={{ color: 'var(--ink-2)' }}>{item}</span>
                </div>
              ))}
              {['Private keys', 'Message ciphertext', 'Call recordings', 'VPN credentials'].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--danger)' }} />
                  <span className="text-sm" style={{ color: 'var(--subtle)' }}>{item} (never exported)</span>
                </div>
              ))}
            </div>
            <button onClick={() => { void exportData() }} disabled={exporting}
              className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80 disabled:opacity-60"
              style={{ background: 'var(--surface-strong)', color: 'var(--ink)', border: '1px solid var(--border-strong)' }}>
              {exporting
                ? <><div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />Exporting...</>
                : exportReady
                ? <><RefreshCw size={14} />Export Again</>
                : <><Download size={14} />Export Data</>}
            </button>
          </div>

          <div className="glass-strong rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Trash2 size={15} style={{ color: 'var(--danger)' }} />
              <h2 className="display font-semibold text-base" style={{ color: 'var(--ink)' }}>Delete Data</h2>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
              Request deletion of relay data. On-chain identity commitments and transactions cannot be deleted — they are part of the immutable blockchain.
            </p>
            <button onClick={() => toast.error('Data deletion requires contract interaction — coming in Phase 10')}
              className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{ background: 'var(--surface-muted)', color: 'var(--danger)', border: '1px solid rgba(248,113,113,0.2)' }}>
              Request Data Deletion
            </button>
          </div>

          <div className="glass rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle size={13} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 1 }} />
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Encrypted relay data is automatically deleted per your disappearing message settings. Server-side retention is minimized by design.
            </p>
          </div>
        </div>
      )}

      {/* ── ABOUT ── */}
      {tab === 'about' && (
        <div className="glass-strong rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <HelpCircle size={15} style={{ color: 'var(--accent)' }} />
            <h2 className="display font-semibold text-base" style={{ color: 'var(--ink)' }}>About PRIVEX</h2>
          </div>
          <div className="space-y-3 text-sm" style={{ color: 'var(--muted)' }}>
            <p>PRIVEX is a Web3 privacy protocol providing E2E encrypted messaging, calls, email, USDC payments, swaps, and cross-chain bridging — anchored by blockchain identity on Arc Mainnet.</p>
            <p>PRIVEX token (PVX) unlocks power features. It is a utility token — not a security or investment vehicle.</p>
            <p>All cryptographic operations use the WebCrypto API with ECDH P-256 + AES-GCM 256-bit. No proprietary algorithms.</p>
            <div className="flex gap-4 pt-2 flex-wrap">
              <a href="#" className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--accent)' }}><ExternalLink size={11} />Docs</a>
              <a href="#" className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--accent)' }}><ExternalLink size={11} />Privacy Policy</a>
              <a href="#" className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--accent)' }}><ExternalLink size={11} />Security Audit</a>
              <a href="#" className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--accent)' }}><ExternalLink size={11} />GitHub</a>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
            {[
              { label: 'Version', value: 'Phase 4–7 MVP' },
              { label: 'Network', value: 'Arc Mainnet' },
              { label: 'Encryption', value: 'ECDH P-256 + AES-GCM 256', highlight: true },
            ].map(r => (
              <div key={r.label} className="flex justify-between text-sm">
                <span style={{ color: 'var(--subtle)' }}>{r.label}</span>
                <span style={{ color: r.highlight ? 'var(--secure)' : 'var(--muted)' }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
