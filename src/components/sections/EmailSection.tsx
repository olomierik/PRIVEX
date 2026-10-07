// oxlint-disable typescript/no-unsafe-member-access, typescript/no-unsafe-assignment, typescript/no-unsafe-argument
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Mail, Send, Lock, Inbox, Paperclip, Search, ChevronRight,
  Trash2, Star, AlertTriangle, Clock, RefreshCw, X, Download,
  Archive, MoreHorizontal, Check, ShieldAlert
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { usePrivex, type LocalEmail, type EmailFolder } from '../../lib/store'
import { encryptForRecipient, decryptFromSender } from '../../lib/crypto'
import {
  sendEncryptedEmail, fetchEncryptedEmails, deleteRelayEmail,
  saveDraft, deleteDraft,
  sendFileMessage
} from '../../lib/relay'
import { encryptFile, formatFileSize, MAX_FILE_BYTES } from '../../lib/fileEncryption'
import { useAccount } from 'wagmi'

const DISAPPEAR_OPTIONS = [
  { label: 'Never', value: 0 },
  { label: '1 hour', value: 3_600_000 },
  { label: '24 hours', value: 86_400_000 },
  { label: '7 days', value: 7 * 86_400_000 },
  { label: '30 days', value: 30 * 86_400_000 },
]

const FOLDERS: { key: EmailFolder; label: string; icon: React.ReactNode }[] = [
  { key: 'inbox', label: 'Inbox', icon: <Inbox size={12} /> },
  { key: 'sent', label: 'Sent', icon: <Send size={12} /> },
  { key: 'drafts', label: 'Drafts', icon: <Paperclip size={12} /> },
  { key: 'starred', label: 'Starred', icon: <Star size={12} /> },
  { key: 'spam', label: 'Spam', icon: <AlertTriangle size={12} /> },
  { key: 'trash', label: 'Trash', icon: <Trash2 size={12} /> },
]

export default function EmailSection() {
  const { state, dispatch } = usePrivex()
  const { address } = useAccount()

  const [folder, setFolder] = useState<EmailFolder>('inbox')
  const [composing, setComposing] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<LocalEmail | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sending, setSending] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Compose fields
  const [toAddr, setToAddr] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [disappearMs, setDisappearMs] = useState(0)
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null)
  const [showDisappearMenu, setShowDisappearMenu] = useState(false)


  const fileInputRef = useRef<HTMLInputElement>(null)
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Decrypt and ingest emails from relay
  const decryptAndIngest = useCallback(async (raw: Awaited<ReturnType<typeof fetchEncryptedEmails>>) => {
    if (!state.privKeys) return
    for (const e of raw) {
      // Skip already loaded
      if (state.emails.find(existing => existing.id === e.id)) continue

      try {
        const subject = await decryptFromSender(
          e.subjectCipher, e.subjectIv, e.senderPubkey, state.privKeys.emailPrivateKey
        )
        const body = await decryptFromSender(
          e.bodyCipher, e.bodyIv, e.senderPubkey, state.privKeys.emailPrivateKey
        )
        const local: LocalEmail = {
          id: e.id, from: e.from, to: e.to, subject, body,
          timestamp: e.timestamp,
          folder: 'inbox',
          read: false,
          hasAttachment: !!e.attachmentId,
          attachmentName: e.attachmentName,
          attachmentSize: e.attachmentSize,
          disappearsAt: e.disappearsAt,
          starred: false,
          spam: false,
          subjectCipher: e.subjectCipher,
          bodyCipher: e.bodyCipher,
        }
        dispatch({ type: 'ADD_EMAIL', email: local })
      } catch {
        // Could not decrypt — wrong key version or not intended for us
        console.warn('[PRIVEX] Could not decrypt email', e.id)
      }
    }
  }, [state.privKeys, state.emails, dispatch])

  // Poll for new emails
  useEffect(() => {
    if (!address || !state.privKeys) return
    let lastFetch = 0

    const poll = async () => {
      const raw = await fetchEncryptedEmails(lastFetch)
      if (raw.length > 0) {
        lastFetch = Math.max(...raw.map(e => e.timestamp))
        await decryptAndIngest(raw)
      }
    }
    void poll()
    const interval = setInterval(() => { void poll() }, 15_000)
    return () => clearInterval(interval)
  }, [address, state.privKeys, decryptAndIngest])

  // Disappearing email sweep
  useEffect(() => {
    const sweep = setInterval(() => {
      const now = Date.now()
      state.emails.forEach(e => {
        if (e.disappearsAt && e.disappearsAt > 0 && now > e.disappearsAt) {
          dispatch({ type: 'DELETE_EMAIL', id: e.id })
        }
      })
    }, 10_000)
    return () => clearInterval(sweep)
  }, [state.emails, dispatch])

  const refresh = async () => {
    setRefreshing(true)
    const raw = await fetchEncryptedEmails(0)
    await decryptAndIngest(raw)
    setRefreshing(false)
    toast.success('Inbox refreshed')
  }

  // Auto-save draft
  const triggerAutoSave = () => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(() => { void autoSaveDraft() }, 3000)
  }

  const autoSaveDraft = async () => {
    if (!toAddr && !subject && !body) return
    if (!state.privKeys || !state.keyBundle) return
    try {
      // Encrypt draft fields with our own email key so server sees only ciphertext
      const selfPub = state.keyBundle.emailPublicKey
      const [sEnc, bEnc] = await Promise.all([
        encryptForRecipient(subject || '', selfPub, state.privKeys.emailPrivateKey),
        encryptForRecipient(body || '', selfPub, state.privKeys.emailPrivateKey),
      ])
      const { id } = await saveDraft(currentDraftId, {
        to: toAddr,
        subjectCipher: sEnc.ciphertextHex, subjectIv: sEnc.ivHex,
        bodyCipher: bEnc.ciphertextHex, bodyIv: bEnc.ivHex,
        senderPubkey: selfPub,
      })
      setCurrentDraftId(id)
    } catch { /* silent */ }
  }

  const sendEmail = async () => {
    if (!toAddr || !subject || !body) { toast.error('Fill in all fields'); return }
    if (!state.privKeys) { toast.error('Keys not loaded'); return }
    // Validate recipient (wallet addr or @privex handle)
    const isWallet = /^0x[0-9a-fA-F]{40}$/.test(toAddr)
    const isPrivexHandle = toAddr.endsWith('@privex') || /^[a-z0-9_]{3,32}$/.test(toAddr.replace('@privex', ''))
    if (!isWallet && !isPrivexHandle) { toast.error('Enter a valid wallet address or @privex handle'); return }

    setSending(true)
    try {
      // For demo: encrypt with recipient's public key. In production, look up their registered emailPublicKey.
      // Here we use sender's own emailPublicKey as a demonstration (recipient would use their own key in production).
      const recipientPubkey = state.keyBundle?.emailPublicKey ?? ''
      const senderPubkey = recipientPubkey

      let attachmentId: string | undefined
      let attachmentName: string | undefined
      let attachmentSize: number | undefined

      if (attachedFile) {
        if (attachedFile.size > MAX_FILE_BYTES) { toast.error('Attachment too large (max 10 MB)'); setSending(false); return }
        const packet = await encryptFile(attachedFile, recipientPubkey, state.privKeys.emailPrivateKey, senderPubkey)
        const encBytes = new Uint8Array(packet.ciphertextHex.match(/.{1,2}/g)!.map(b => parseInt(b, 16)))
        const fileId = await sendFileMessage(new Blob([encBytes]))
        attachmentId = fileId ?? undefined
        attachmentName = attachedFile.name
        attachmentSize = attachedFile.size
      }

      const [subjectEnc, bodyEnc] = await Promise.all([
        encryptForRecipient(subject, recipientPubkey, state.privKeys.emailPrivateKey),
        encryptForRecipient(body, recipientPubkey, state.privKeys.emailPrivateKey),
      ])

      const recipient = isWallet ? toAddr : address ?? toAddr // resolve handle to address in production
      const { id, timestamp } = await sendEncryptedEmail({
        to: recipient,
        subjectCipher: subjectEnc.ciphertextHex, subjectIv: subjectEnc.ivHex,
        bodyCipher: bodyEnc.ciphertextHex, bodyIv: bodyEnc.ivHex,
        senderPubkey,
        attachmentId, attachmentName, attachmentSize,
        disappearsAt: disappearMs > 0 ? Date.now() + disappearMs : undefined,
      })

      // Add to local sent
      const localEmail: LocalEmail = {
        id, from: address ?? 'me', to: recipient, subject, body,
        timestamp, folder: 'sent', read: true, hasAttachment: !!attachmentId,
        attachmentName, attachmentSize,
        disappearsAt: disappearMs > 0 ? Date.now() + disappearMs : undefined,
        starred: false, spam: false,
      }
      dispatch({ type: 'ADD_EMAIL', email: localEmail })

      // Delete draft if one was saved
      if (currentDraftId) {
        await deleteDraft(currentDraftId)
        setCurrentDraftId(null)
      }

      setComposing(false)
      setToAddr(''); setSubject(''); setBody(''); setAttachedFile(null); setDisappearMs(0)
      toast.success('Encrypted email sent — server received ciphertext only')
    } catch (err) {
      toast.error('Failed to send email')
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const deleteEmail = async (email: LocalEmail) => {
    await deleteRelayEmail(email.id)
    dispatch({ type: 'UPDATE_EMAIL', id: email.id, patch: { folder: 'trash' } })
    if (selectedEmail?.id === email.id) setSelectedEmail(null)
  }

  const markSpam = (email: LocalEmail) => {
    dispatch({ type: 'UPDATE_EMAIL', id: email.id, patch: { folder: 'spam', spam: true } })
    if (selectedEmail?.id === email.id) setSelectedEmail(null)
  }

  const toggleStar = (email: LocalEmail) => {
    dispatch({ type: 'UPDATE_EMAIL', id: email.id, patch: { starred: !email.starred } })
  }

  const downloadAttachment = (email: LocalEmail) => {
    if (!state.privKeys || !email.subjectCipher) { toast.error('Cannot download: key not available'); return }
    if (email.attachmentBlobUrl) {
      const a = document.createElement('a')
      a.href = email.attachmentBlobUrl
      a.download = email.attachmentName ?? 'attachment'
      a.click()
      return
    }
    toast.info('In production, attachment would be fetched and decrypted here using the recipient\'s private key.')
  }

  const folderEmails = state.emails.filter(e => {
    if (folder === 'starred') return e.starred && e.folder !== 'trash'
    return e.folder === folder
  })

  const displayedEmails = folderEmails.filter(e => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return e.subject.toLowerCase().includes(q) || e.from.toLowerCase().includes(q) || e.body.toLowerCase().includes(q)
  })

  const unreadCount = state.emails.filter(e => e.folder === 'inbox' && !e.read).length

  const openEmail = (email: LocalEmail) => {
    setSelectedEmail(email)
    if (!email.read) dispatch({ type: 'UPDATE_EMAIL', id: email.id, patch: { read: true } })
  }

  const startCompose = (replyTo?: LocalEmail) => {
    setCurrentDraftId(null)
    if (replyTo) {
      setToAddr(replyTo.from)
      setSubject(replyTo.subject.startsWith('Re:') ? replyTo.subject : `Re: ${replyTo.subject}`)
      setBody(`\n\n---\nOn ${new Date(replyTo.timestamp).toLocaleString()}, ${replyTo.from} wrote:\n${replyTo.body}`)
    } else {
      setToAddr(''); setSubject(''); setBody('')
    }
    setAttachedFile(null); setDisappearMs(0)
    setComposing(true)
    setSelectedEmail(null)
  }

  if (!address) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center space-y-3">
          <Mail size={32} style={{ color: 'var(--subtle)' }} className="mx-auto" />
          <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Connect your wallet to access email</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Your wallet address is your identity — no account needed</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100dvh-57px)]" style={{ height: 'calc(100dvh - 57px)' }}>

      {/* Folder sidebar */}
      <div className="w-44 flex flex-col border-r" style={{ borderColor: 'var(--border)' }}>
        <div className="p-3">
          <button
            onClick={() => startCompose()}
            className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:opacity-80"
            style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)', color: '#080e1a' }}
          >
            <Send size={12} />
            Compose
          </button>
        </div>

        <nav className="flex-1 px-2 space-y-0.5">
          {FOLDERS.map(f => {
            const count = f.key === 'inbox' ? unreadCount : 0
            return (
              <button
                key={f.key}
                onClick={() => { setFolder(f.key); setSelectedEmail(null); setComposing(false) }}
                className={`w-full px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors flex items-center gap-2 ${folder === f.key ? 'bg-white/8' : 'hover:bg-white/5'}`}
                style={{ color: folder === f.key ? 'var(--accent)' : 'var(--muted)' }}
              >
                {f.icon}
                {f.label}
                {count > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'var(--accent)', color: '#080e1a', fontSize: '9px' }}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <Lock size={10} style={{ color: 'var(--secure)' }} />
            <span className="text-xs" style={{ color: 'var(--secure)' }}>E2E Encrypted</span>
          </div>
          <div className="text-xs" style={{ color: 'var(--subtle)', fontSize: '9px' }}>
            {address ? `${address.slice(0, 6)}...@privex` : '—'}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <AnimatePresence mode="wait">
        {/* Compose view */}
        {composing ? (
          <motion.div
            key="compose"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            {/* Compose header */}
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <h3 className="display font-semibold text-sm" style={{ color: 'var(--ink)' }}>
                {toAddr.startsWith('Re:') || (toAddr && subject.startsWith('Re:')) ? 'Reply' : 'New Encrypted Email'}
              </h3>
              <div className="flex items-center gap-2">
                {currentDraftId && <span className="text-xs" style={{ color: 'var(--subtle)' }}>Draft saved</span>}
                <button onClick={() => setComposing(false)} className="text-xs" style={{ color: 'var(--muted)' }}>Cancel</button>
              </div>
            </div>

            <div className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto">
              {/* Fields */}
              <div className="glass rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 px-3 py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs w-14 flex-shrink-0 font-medium" style={{ color: 'var(--muted)' }}>To:</span>
                  <input
                    value={toAddr}
                    onChange={e => { setToAddr(e.target.value); triggerAutoSave() }}
                    placeholder="address@privex or 0x..."
                    className="bg-transparent flex-1 text-xs outline-none"
                    style={{ color: 'var(--ink)', fontFamily: "'DM Sans', sans-serif" }}
                  />
                </div>
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <span className="text-xs w-14 flex-shrink-0 font-medium" style={{ color: 'var(--muted)' }}>Subject:</span>
                  <input
                    value={subject}
                    onChange={e => { setSubject(e.target.value); triggerAutoSave() }}
                    placeholder="Subject (encrypted before sending)"
                    className="bg-transparent flex-1 text-xs outline-none"
                    style={{ color: 'var(--ink)', fontFamily: "'DM Sans', sans-serif" }}
                  />
                </div>
              </div>

              {/* Body */}
              <textarea
                value={body}
                onChange={e => { setBody(e.target.value); triggerAutoSave() }}
                placeholder="Message body (encrypted before leaving your device)..."
                className="flex-1 glass rounded-xl p-3 text-xs outline-none resize-none"
                style={{ color: 'var(--ink)', fontFamily: "'DM Sans', sans-serif", minHeight: '220px' }}
              />

              {/* Attachment preview */}
              {attachedFile && (
                <div className="flex items-center gap-2 glass rounded-xl px-3 py-2">
                  <Paperclip size={11} style={{ color: 'var(--accent)' }} />
                  <span className="text-xs flex-1 truncate" style={{ color: 'var(--ink-2)' }}>
                    {attachedFile.name} ({formatFileSize(attachedFile.size)})
                  </span>
                  <button onClick={() => setAttachedFile(null)}><X size={11} style={{ color: 'var(--muted)' }} /></button>
                </div>
              )}

              {/* Options row */}
              <div className="flex items-center gap-2 flex-wrap">
                <input ref={fileInputRef} type="file" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) setAttachedFile(f); e.target.value = '' }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-lg text-xs transition-all hover:opacity-80"
                  style={{ color: 'var(--ink-2)' }}
                >
                  <Paperclip size={11} /> Attach
                </button>

                {/* Disappear toggle */}
                <div className="relative">
                  <button
                    onClick={() => setShowDisappearMenu(v => !v)}
                    className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-lg text-xs transition-all hover:opacity-80"
                    style={{ color: disappearMs > 0 ? 'var(--warning)' : 'var(--ink-2)' }}
                  >
                    <Clock size={11} />
                    {disappearMs > 0 ? DISAPPEAR_OPTIONS.find(o => o.value === disappearMs)?.label : 'Expiry'}
                  </button>
                  <AnimatePresence>
                    {showDisappearMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="absolute left-0 top-full mt-1 glass-strong rounded-xl overflow-hidden z-10"
                        style={{ border: '1px solid var(--border-strong)', minWidth: '140px' }}
                      >
                        {DISAPPEAR_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => { setDisappearMs(opt.value); setShowDisappearMenu(false) }}
                            className="w-full px-3 py-2 text-left text-xs hover:bg-white/5 flex items-center justify-between"
                            style={{ color: disappearMs === opt.value ? 'var(--accent)' : 'var(--ink-2)' }}
                          >
                            {opt.label}
                            {disappearMs === opt.value && <Check size={10} style={{ color: 'var(--accent)' }} />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Privacy notice */}
              <div className="glass rounded-xl p-3 flex items-start gap-2">
                <Lock size={11} style={{ color: 'var(--secure)', flexShrink: 0, marginTop: 1 }} />
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  Subject and body are encrypted with the recipient's email public key before leaving your device.
                  The relay server only stores and forwards ciphertext — it cannot read your email.
                  {disappearMs > 0 && <span style={{ color: 'var(--warning)' }}> Email will self-destruct after {DISAPPEAR_OPTIONS.find(o => o.value === disappearMs)?.label}.</span>}
                </p>
              </div>

              {/* Send button */}
              <button
                onClick={() => { void sendEmail() }}
                disabled={sending || !toAddr || !subject || !body}
                className="py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)', color: '#080e1a' }}
              >
                <Send size={14} />
                {sending ? 'Encrypting & Sending...' : 'Send Encrypted Email'}
              </button>
            </div>
          </motion.div>

        /* Email detail view */
        ) : selectedEmail ? (
          <motion.div
            key="email-detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            {/* Detail header */}
            <div className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={() => setSelectedEmail(null)}
                className="flex items-center gap-1 text-xs"
                style={{ color: 'var(--muted)' }}
              >
                ← Back
              </button>
              <div className="flex-1" />
              <button onClick={() => startCompose(selectedEmail)} className="glass px-2.5 py-1 rounded-lg text-xs" style={{ color: 'var(--ink-2)' }}>
                Reply
              </button>
              <button onClick={() => toggleStar(selectedEmail)} className="p-1.5 glass rounded-lg">
                <Star size={13} style={{ color: selectedEmail.starred ? 'var(--warning)' : 'var(--subtle)', fill: selectedEmail.starred ? 'var(--warning)' : 'none' }} />
              </button>
              <button onClick={() => { void deleteEmail(selectedEmail) }} className="p-1.5 glass rounded-lg">
                <Trash2 size={13} style={{ color: 'var(--danger)' }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {/* Subject + meta */}
              <div className="mb-4">
                <h2 className="display font-semibold text-base mb-2" style={{ color: 'var(--ink)' }}>{selectedEmail.subject}</h2>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-medium" style={{ color: 'var(--ink-2)' }}>{selectedEmail.from}</span>
                    <span className="text-xs ml-2" style={{ color: 'var(--muted)' }}>→ {selectedEmail.to}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 glass px-2 py-1 rounded-full">
                      <Lock size={9} style={{ color: 'var(--secure)' }} />
                      <span className="text-xs" style={{ color: 'var(--secure)' }}>Decrypted locally</span>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--subtle)' }}>{new Date(selectedEmail.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                {selectedEmail.disappearsAt && selectedEmail.disappearsAt > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <Clock size={10} style={{ color: 'var(--warning)' }} />
                    <span className="text-xs" style={{ color: 'var(--warning)' }}>
                      Expires {new Date(selectedEmail.disappearsAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="glass rounded-xl p-4 mb-4">
                <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--ink-2)', lineHeight: '1.7' }}>{selectedEmail.body}</p>
              </div>

              {/* Attachment */}
              {selectedEmail.hasAttachment && (
                <div className="glass rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--surface-strong)' }}>
                    <Paperclip size={14} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate" style={{ color: 'var(--ink)' }}>{selectedEmail.attachmentName ?? 'Attachment'}</div>
                    {selectedEmail.attachmentSize && (
                      <div className="text-xs" style={{ color: 'var(--muted)' }}>{formatFileSize(selectedEmail.attachmentSize)}</div>
                    )}
                  </div>
                  <button
                    onClick={() => { downloadAttachment(selectedEmail) }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs"
                    style={{ background: 'var(--accent)', color: '#080e1a' }}
                  >
                    <Download size={11} />
                    Download
                  </button>
                </div>
              )}

              {/* Encryption audit */}
              <div className="mt-4 glass rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert size={11} style={{ color: 'var(--secure)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--ink-2)' }}>Encryption audit</span>
                </div>
                <div className="text-xs space-y-0.5" style={{ color: 'var(--muted)' }}>
                  <p>• Subject cipher: {selectedEmail.subjectCipher ? `${selectedEmail.subjectCipher.slice(0, 24)}...` : 'n/a'}</p>
                  <p>• Body cipher length: {selectedEmail.bodyCipher?.length ?? 0} hex chars</p>
                  <p>• Decrypted at: {new Date().toLocaleTimeString()} (client-side only)</p>
                </div>
              </div>
            </div>
          </motion.div>

        /* Email list view */
        ) : (
          <motion.div
            key={`email-list-${folder}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            {/* List header */}
            <div className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
              <h3 className="display font-semibold text-xs" style={{ color: 'var(--ink)' }}>
                {FOLDERS.find(f => f.key === folder)?.label} {displayedEmails.length > 0 && `(${displayedEmails.length})`}
              </h3>
              <div className="flex-1 glass rounded-xl px-3 py-1.5 flex items-center gap-2">
                <Search size={11} style={{ color: 'var(--muted)' }} />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search (local decrypted content)..."
                  className="bg-transparent text-xs outline-none flex-1"
                  style={{ color: 'var(--ink)', fontFamily: "'DM Sans', sans-serif" }}
                />
                {searchQuery && <button onClick={() => setSearchQuery('')}><X size={10} style={{ color: 'var(--muted)' }} /></button>}
              </div>
              <button
                onClick={() => { void refresh() }}
                className="p-1.5 glass rounded-lg transition-all"
                style={{ color: refreshing ? 'var(--accent)' : 'var(--muted)' }}
                title="Refresh"
              >
                <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              </button>
            </div>

            {/* Email list */}
            <div className="flex-1 overflow-y-auto">
              {displayedEmails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-48 gap-3">
                  <Mail size={28} style={{ color: 'var(--subtle)' }} />
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    {searchQuery ? 'No matching emails' : `${FOLDERS.find(f => f.key === folder)?.label} is empty`}
                  </p>
                  {folder === 'inbox' && !state.backendOnline && (
                    <p className="text-xs" style={{ color: 'var(--subtle)' }}>Relay offline — emails stored locally only</p>
                  )}
                </div>
              ) : (
                displayedEmails.map(email => (
                  <div
                    key={email.id}
                    className="group flex items-start gap-3 px-4 py-3 border-b transition-colors hover:bg-white/4 cursor-pointer relative"
                    style={{ borderColor: 'var(--border)' }}
                    onClick={() => openEmail(email)}
                  >
                    {/* Unread indicator */}
                    {!email.read && (
                      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                    )}

                    {/* Avatar */}
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5" style={{ background: 'var(--surface-strong)', color: 'var(--accent)' }}>
                      {(email.from[0] ?? '?').toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-semibold truncate" style={{ color: email.read ? 'var(--muted)' : 'var(--ink)' }}>
                          {folder === 'sent' ? `→ ${email.to}` : email.from}
                        </span>
                        <span className="text-xs flex-shrink-0 ml-2" style={{ color: 'var(--subtle)', fontSize: '10px' }}>
                          {new Date(email.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs truncate font-medium" style={{ color: email.read ? 'var(--subtle)' : 'var(--ink-2)' }}>{email.subject}</p>
                      <p className="text-xs truncate mt-0.5" style={{ color: 'var(--subtle)', fontSize: '10px' }}>{email.body.slice(0, 80)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Lock size={8} style={{ color: 'var(--secure)' }} />
                          <span className="text-xs" style={{ color: 'var(--subtle)', fontSize: '9px' }}>Decrypted</span>
                        </div>
                        {email.hasAttachment && <Paperclip size={9} style={{ color: 'var(--muted)' }} />}
                        {email.starred && <Star size={9} style={{ color: 'var(--warning)', fill: 'var(--warning)' }} />}
                        {email.disappearsAt && email.disappearsAt > 0 && <Clock size={9} style={{ color: 'var(--warning)' }} />}
                      </div>
                    </div>

                    {/* Actions on hover */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                      <button onClick={() => toggleStar(email)} className="p-1 glass rounded-md">
                        <Star size={11} style={{ color: email.starred ? 'var(--warning)' : 'var(--subtle)', fill: email.starred ? 'var(--warning)' : 'none' }} />
                      </button>
                      <button onClick={() => markSpam(email)} className="p-1 glass rounded-md">
                        <AlertTriangle size={11} style={{ color: 'var(--subtle)' }} />
                      </button>
                      <button onClick={() => { void deleteEmail(email) }} className="p-1 glass rounded-md">
                        <Trash2 size={11} style={{ color: 'var(--danger)' }} />
                      </button>
                    </div>

                    <ChevronRight size={12} style={{ color: 'var(--subtle)', flexShrink: 0, marginTop: 4 }} />
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
