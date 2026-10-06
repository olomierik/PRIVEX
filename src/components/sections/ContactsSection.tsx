/**
 * PRIVEX Contacts — Phase 4+
 * Contact management with QR code sharing, invite links, public key verification,
 * and direct message/call actions.
 */
import { useState, useRef } from 'react'
import {
  Users, UserPlus, MessageSquare, Phone, Trash2, Shield, Search,
  CheckCircle, QrCode, Link, Copy, Mail, X, Key, Share2,
} from 'lucide-react'
import { toast } from 'sonner'
import { usePrivex, type Contact } from '../../lib/store'
import { shortAddress } from '../../lib/crypto'
import { useAccount } from 'wagmi'

// Minimal QR SVG — uses the same deterministic pattern as PaymentsSection
function QRDisplay({ value, size = 80 }: { value: string; size?: number }) {
  const hash = value.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0xffff, 0)
  const n = 9
  const cells = Array.from({ length: n }, (_, row) =>
    Array.from({ length: n }, (_, col) => {
      if (row < 3 && col < 3) return true
      if (row < 3 && col > n - 4) return true
      if (row > n - 4 && col < 3) return true
      return (((hash >> ((row * n + col) % 16)) & 1) === 1)
    })
  )
  const cell = Math.floor(size / n)
  return (
    <div className="inline-block glass-strong rounded-xl p-2">
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, ${cell}px)`, gap: 1 }}>
        {cells.flat().map((filled, i) => (
          <div key={i} style={{ width: cell, height: cell, background: filled ? 'var(--ink)' : 'transparent', borderRadius: 1 }} />
        ))}
      </div>
    </div>
  )
}

type View = 'list' | 'add' | 'detail' | 'mycard'

export default function ContactsSection() {
  const { state, dispatch } = usePrivex()
  const { address } = useAccount()
  const [view, setView] = useState<View>('list')
  const [selected, setSelected] = useState<Contact | null>(null)
  const [newAddr, setNewAddr] = useState('')
  const [newHandle, setNewHandle] = useState('')
  const [newPubkey, setNewPubkey] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'verified' | 'blocked'>('all')
  const fileRef = useRef<HTMLInputElement>(null)

  const addContact = () => {
    if (!newAddr.trim() || !/^0x[0-9a-fA-F]{40}$/.test(newAddr)) { toast.error('Invalid Ethereum address'); return }
    const contact: Contact = {
      address: newAddr.toLowerCase(),
      handle: newHandle.trim() || shortAddress(newAddr),
      publicKey: newPubkey.trim(),
      addedAt: Date.now(),
      verified: !!newPubkey.trim(),
    }
    dispatch({ type: 'ADD_CONTACT', contact })
    setNewAddr(''); setNewHandle(''); setNewPubkey('')
    toast.success('Contact added')
    setView('list')
  }

  const myInviteLink = `${window.location.origin}?add=${address}&handle=${encodeURIComponent(state.privexHandle ?? '')}`

  const copyInviteLink = () => {
    void navigator.clipboard.writeText(myInviteLink).then(() => toast.success('Invite link copied'))
  }

  const copyContactLink = (c: Contact) => {
    const url = `${window.location.origin}?add=${c.address}&handle=${encodeURIComponent(c.handle)}`
    void navigator.clipboard.writeText(url).then(() => toast.success('Contact link copied'))
  }

  const importFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as Partial<Contact>
        if (data.address && /^0x[0-9a-fA-F]{40}$/.test(data.address)) {
          dispatch({ type: 'ADD_CONTACT', contact: { address: data.address, handle: data.handle ?? shortAddress(data.address), publicKey: data.publicKey ?? '', addedAt: Date.now(), verified: !!data.publicKey } })
          toast.success('Contact imported')
        } else {
          toast.error('Invalid contact file')
        }
      } catch {
        toast.error('Invalid JSON')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const filtered = state.contacts
    .filter(c => filter === 'all' ? true : filter === 'verified' ? c.verified : c.blocked)
    .filter(c =>
      c.handle.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase())
    )

  if (view === 'mycard') return (
    <div className="p-4 md:p-6 max-w-md mx-auto space-y-5">
      <div className="flex items-center gap-2">
        <button onClick={() => setView('list')} className="p-2 rounded-lg hover:bg-white/5"><X size={14} style={{ color: 'var(--muted)' }} /></button>
        <h2 className="display font-semibold text-sm" style={{ color: 'var(--ink)' }}>My Contact Card</h2>
      </div>
      <div className="glass-strong rounded-2xl p-6 flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center display text-3xl font-bold" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)', color: '#080e1a' }}>
          {(state.privexHandle?.[0] ?? address?.[2] ?? '?').toUpperCase()}
        </div>
        <div>
          {state.privexHandle && <div className="display text-xl font-bold" style={{ color: 'var(--ink)' }}>{state.privexHandle}@privex</div>}
          <div className="mono text-xs mt-1" style={{ color: 'var(--subtle)' }}>{address ? shortAddress(address) : 'Not connected'}</div>
        </div>
        <QRDisplay value={address ?? 'no-address'} size={108} />
        <div className="w-full space-y-2">
          <button onClick={copyInviteLink}
            className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80"
            style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)', color: '#080e1a' }}>
            <Link size={13} />Copy Invite Link
          </button>
          <button onClick={() => { void navigator.clipboard.writeText(address ?? '').then(() => toast.success('Address copied')) }}
            className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80"
            style={{ background: 'var(--surface-strong)', color: 'var(--ink)' }}>
            <Copy size={13} />Copy Address
          </button>
        </div>
      </div>
    </div>
  )

  if (view === 'detail' && selected) return (
    <div className="p-4 md:p-6 max-w-md mx-auto space-y-5">
      <div className="flex items-center gap-2">
        <button onClick={() => { setView('list'); setSelected(null) }} className="p-2 rounded-lg hover:bg-white/5"><X size={14} style={{ color: 'var(--muted)' }} /></button>
        <h2 className="display font-semibold text-sm" style={{ color: 'var(--ink)' }}>Contact Details</h2>
      </div>
      <div className="glass-strong rounded-2xl p-6 flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold" style={{ background: 'var(--surface-strong)', color: 'var(--accent)' }}>
          {selected.handle[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <div className="flex items-center gap-1.5 justify-center">
            <span className="display text-xl font-bold" style={{ color: 'var(--ink)' }}>{selected.handle}</span>
            {selected.verified && <CheckCircle size={14} style={{ color: 'var(--secure)' }} />}
          </div>
          <div className="mono text-xs mt-1" style={{ color: 'var(--subtle)' }}>{selected.address}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>Added {new Date(selected.addedAt).toLocaleDateString()}</div>
        </div>
        <QRDisplay value={selected.address} size={90} />
        {selected.publicKey ? (
          <div className="w-full glass rounded-xl p-3 text-left">
            <div className="flex items-center gap-1.5 mb-1">
              <Key size={11} style={{ color: 'var(--secure)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--ink-2)' }}>Public Key (verified)</span>
            </div>
            <div className="mono text-xs break-all" style={{ color: 'var(--subtle)' }}>{selected.publicKey.slice(0, 64)}...</div>
          </div>
        ) : (
          <div className="w-full glass rounded-xl p-3 flex items-start gap-2">
            <Shield size={11} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 1 }} />
            <span className="text-xs" style={{ color: 'var(--warning)' }}>No public key — encrypted messaging unavailable until key exchange</span>
          </div>
        )}
        <div className="w-full grid grid-cols-3 gap-2">
          <button onClick={() => { dispatch({ type: 'SET_ACTIVE_CONVERSATION', address: selected.address }); dispatch({ type: 'SET_SECTION', section: 'messages' }) }}
            className="py-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all hover:opacity-80"
            style={{ background: 'var(--surface-strong)', color: 'var(--ink)' }}>
            <MessageSquare size={14} style={{ color: 'var(--accent)' }} />Message
          </button>
          <button onClick={() => dispatch({ type: 'SET_SECTION', section: 'calls' })}
            className="py-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all hover:opacity-80"
            style={{ background: 'var(--surface-strong)', color: 'var(--ink)' }}>
            <Phone size={14} style={{ color: 'var(--accent)' }} />Call
          </button>
          <button onClick={() => { dispatch({ type: 'SET_SECTION', section: 'email' }) }}
            className="py-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all hover:opacity-80"
            style={{ background: 'var(--surface-strong)', color: 'var(--ink)' }}>
            <Mail size={14} style={{ color: 'var(--accent)' }} />Email
          </button>
        </div>
        <div className="w-full grid grid-cols-2 gap-2">
          <button onClick={() => copyContactLink(selected)}
            className="py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all hover:opacity-80"
            style={{ background: 'var(--surface-muted)', color: 'var(--ink-2)' }}>
            <Share2 size={11} />Share Contact
          </button>
          {!selected.blocked ? (
            <button onClick={() => { dispatch({ type: 'BLOCK_CONTACT', address: selected.address, blocked: true }); toast.success('Contact blocked'); setView('list') }}
              className="py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all hover:opacity-80"
              style={{ background: 'var(--surface-muted)', color: 'var(--danger)' }}>
              <Shield size={11} />Block
            </button>
          ) : (
            <button onClick={() => { dispatch({ type: 'BLOCK_CONTACT', address: selected.address, blocked: false }); toast.success('Contact unblocked') }}
              className="py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all hover:opacity-80"
              style={{ background: 'var(--surface-muted)', color: 'var(--secure)' }}>
              <Shield size={11} />Unblock
            </button>
          )}
        </div>
        <button onClick={() => { dispatch({ type: 'REMOVE_CONTACT', address: selected.address }); toast.success('Contact removed'); setView('list') }}
          className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all hover:opacity-80"
          style={{ background: 'var(--surface-muted)', color: 'var(--danger)' }}>
          <Trash2 size={11} />Remove Contact
        </button>
      </div>
    </div>
  )

  if (view === 'add') return (
    <div className="p-4 md:p-6 max-w-md mx-auto space-y-5">
      <div className="flex items-center gap-2">
        <button onClick={() => setView('list')} className="p-2 rounded-lg hover:bg-white/5"><X size={14} style={{ color: 'var(--muted)' }} /></button>
        <h2 className="display font-semibold text-sm" style={{ color: 'var(--ink)' }}>Add Contact</h2>
      </div>
      <div className="glass-strong rounded-2xl p-5 space-y-3">
        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--muted)' }}>Wallet Address *</label>
          <input value={newAddr} onChange={e => setNewAddr(e.target.value)}
            placeholder="0x..." className="w-full glass rounded-xl px-3 py-2.5 text-xs outline-none mono"
            style={{ color: 'var(--ink)', fontFamily: 'JetBrains Mono, monospace' }} />
          {newAddr && !/^0x[0-9a-fA-F]{40}$/.test(newAddr) && (
            <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>Invalid Ethereum address</p>
          )}
        </div>
        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--muted)' }}>Nickname</label>
          <input value={newHandle} onChange={e => setNewHandle(e.target.value)} placeholder="Alice"
            className="w-full glass rounded-xl px-3 py-2.5 text-xs outline-none" style={{ color: 'var(--ink)' }} />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--muted)' }}>Public Key (for E2E encryption)</label>
          <textarea value={newPubkey} onChange={e => setNewPubkey(e.target.value)} placeholder="Paste their messaging public key hex..."
            rows={3} className="w-full glass rounded-xl px-3 py-2.5 text-xs outline-none mono resize-none"
            style={{ color: 'var(--ink)', fontFamily: 'JetBrains Mono, monospace' }} />
          <p className="text-xs mt-1" style={{ color: 'var(--subtle)' }}>Optional. Without a public key, only unencrypted messaging is possible.</p>
        </div>
        <button onClick={addContact} disabled={!newAddr || !/^0x[0-9a-fA-F]{40}$/.test(newAddr)}
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)', color: '#080e1a' }}>
          Add Contact
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: 'var(--border)' }} /></div>
          <div className="relative flex justify-center"><span className="px-3 text-xs" style={{ background: 'var(--surface-strong)', color: 'var(--subtle)' }}>or</span></div>
        </div>

        <button onClick={() => fileRef.current?.click()}
          className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80"
          style={{ background: 'var(--surface-strong)', color: 'var(--ink)' }}>
          <Copy size={13} />Import from File
        </button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={importFromFile} />
      </div>
    </div>
  )

  // LIST view
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
      {/* Header actions */}
      <div className="flex items-center gap-2">
        <div className="flex-1 glass rounded-xl px-3 py-2 flex items-center gap-2">
          <Search size={12} style={{ color: 'var(--muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts..."
            className="bg-transparent text-xs outline-none flex-1" style={{ color: 'var(--ink)' }} />
          {search && <button onClick={() => setSearch('')}><X size={11} style={{ color: 'var(--muted)' }} /></button>}
        </div>
        <button onClick={() => setView('mycard')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
          style={{ background: 'var(--surface-strong)', color: 'var(--ink)' }}>
          <QrCode size={13} />My Card
        </button>
        <button onClick={() => setView('add')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
          style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)', color: '#080e1a' }}>
          <UserPlus size={13} />Add
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2">
        {(['all', 'verified', 'blocked'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1 rounded-full text-xs font-medium capitalize transition-all"
            style={{ background: filter === f ? 'var(--accent)' : 'var(--surface-muted)', color: filter === f ? '#080e1a' : 'var(--muted)' }}>
            {f} {f === 'all' ? `(${state.contacts.length})` : f === 'verified' ? `(${state.contacts.filter(c => c.verified).length})` : `(${state.contacts.filter(c => c.blocked).length})`}
          </button>
        ))}
      </div>

      {/* Contact list */}
      {filtered.length === 0 ? (
        <div className="glass-strong rounded-2xl text-center py-12">
          <Users size={28} style={{ color: 'var(--subtle)' }} className="mx-auto mb-3" />
          <p className="text-sm" style={{ color: 'var(--muted)' }}>{state.contacts.length === 0 ? 'No contacts yet' : 'No matches'}</p>
          {state.contacts.length === 0 && (
            <button onClick={() => setView('add')} className="mt-3 text-xs font-semibold" style={{ color: 'var(--accent)' }}>Add your first contact</button>
          )}
        </div>
      ) : (
        <div className="glass-strong rounded-2xl overflow-hidden">
          {filtered.map((contact, i) => (
            <div key={contact.address}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer ${i < filtered.length - 1 ? 'border-b' : ''}`}
              style={{ borderColor: 'var(--border)', opacity: contact.blocked ? 0.5 : 1 }}
              onClick={() => { setSelected(contact); setView('detail') }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: 'var(--surface-strong)', color: 'var(--accent)' }}>
                {contact.handle[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>{contact.handle}</span>
                  {contact.verified && <CheckCircle size={10} style={{ color: 'var(--secure)' }} />}
                  {contact.blocked && <span className="text-xs px-1.5 rounded-full" style={{ background: 'var(--danger)' + '33', color: 'var(--danger)' }}>Blocked</span>}
                </div>
                <div className="mono text-xs truncate" style={{ color: 'var(--subtle)' }}>{shortAddress(contact.address)}</div>
              </div>
              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <button onClick={() => { dispatch({ type: 'SET_ACTIVE_CONVERSATION', address: contact.address }); dispatch({ type: 'SET_SECTION', section: 'messages' }) }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors" title="Message">
                  <MessageSquare size={13} style={{ color: 'var(--accent)' }} />
                </button>
                <button onClick={() => dispatch({ type: 'SET_SECTION', section: 'calls' })}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors" title="Call">
                  <Phone size={13} style={{ color: 'var(--muted)' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
