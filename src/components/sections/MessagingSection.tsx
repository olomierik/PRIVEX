import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Lock, Search, Trash2, UserPlus, AlertTriangle,
  Mic, Paperclip, X, Download, Play, Pause, Users, Image,
  Clock, Check, CheckCheck, Ban, ShieldAlert, Star, ChevronLeft
} from 'lucide-react'
import { toast } from 'sonner'
import { usePrivex, type Contact, type LocalMessage, type Group } from '../../lib/store'
import { encryptForRecipient, decryptFromSender, shortAddress } from '../../lib/crypto'
import { sendEncryptedMessage, fetchMessages, sendFileMessage, fetchFileMessage, subscribeToMessages, resolveContact, fetchPubkey } from '../../lib/relay'
import { encryptFile, decryptFile, formatFileSize, MAX_FILE_BYTES } from '../../lib/fileEncryption'
import { startRecording, formatDuration } from '../../lib/voiceMessage'
import { useAccount } from 'wagmi'

const DISAPPEAR_OPTIONS = [
  { label: 'Off', value: 0 },
  { label: '1 min', value: 60_000 },
  { label: '5 min', value: 300_000 },
  { label: '1 hour', value: 3_600_000 },
  { label: '24 hours', value: 86_400_000 },
]

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥']

// Pre-generated random bar weights for VoiceWaveform (stable, avoids Math.random() in render)
const BAR_WEIGHTS = Array.from({ length: 20 }, () => 0.3 + Math.random() * 0.7)

function VoiceWaveform({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-px h-6">
      {BAR_WEIGHTS.map((w, i) => (
        <div
          key={i}
          className="w-0.5 rounded-full transition-all duration-75"
          style={{
            background: 'var(--secure)',
            height: `${Math.max(2, (w * level) * 20 + 2)}px`,
            opacity: 0.6 + level * 0.4,
          }}
        />
      ))}
    </div>
  )
}

function VoicePlayback({ blobUrl, duration }: { blobUrl: string; duration?: number }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onEnd = () => { setPlaying(false); setProgress(0); setElapsed(0) }
    const onTime = () => {
      if (a.duration) {
        setProgress(a.currentTime / a.duration)
        setElapsed(Math.floor(a.currentTime))
      }
    }
    a.addEventListener('ended', onEnd)
    a.addEventListener('timeupdate', onTime)
    return () => { a.removeEventListener('ended', onEnd); a.removeEventListener('timeupdate', onTime) }
  }, [])

  const toggle = () => {
    const a = audioRef.current
    if (!a) return
    if (playing) { a.pause(); setPlaying(false) }
    else { void a.play(); setPlaying(true) }
  }

  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <audio ref={audioRef} src={blobUrl} preload="metadata" />
      <button onClick={toggle} className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent)' }}>
        {playing ? <Pause size={11} style={{ color: '#080e1a' }} /> : <Play size={11} style={{ color: '#080e1a' }} />}
      </button>
      <div className="flex-1 space-y-1">
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <div className="h-full rounded-full transition-all" style={{ background: 'var(--accent)', width: `${progress * 100}%` }} />
        </div>
        <div className="text-right" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>
          {formatDuration(elapsed)}{duration ? ` / ${formatDuration(duration)}` : ''}
        </div>
      </div>
    </div>
  )
}

interface NewGroupDialogProps {
  contacts: Contact[]
  selfAddress: string
  onClose: () => void
  onCreate: (name: string, members: string[]) => void
}

function NewGroupDialog({ contacts, selfAddress, onClose, onCreate }: NewGroupDialogProps) {
  const [name, setName] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (addr: string) => setSelected(s => s.includes(addr) ? s.filter(a => a !== addr) : [...s, addr])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
    >
      <motion.div
        initial={{ scale: 0.96, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-strong rounded-2xl p-5 w-80 space-y-4"
        style={{ border: '1px solid var(--border-strong)' }}
      >
        <div className="flex items-center justify-between">
          <h3 className="display font-semibold text-sm" style={{ color: 'var(--ink)' }}>New Group</h3>
          <button onClick={onClose}><X size={14} style={{ color: 'var(--muted)' }} /></button>
        </div>

        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Group name..."
          className="w-full glass rounded-xl px-3 py-2 text-xs outline-none"
          style={{ color: 'var(--ink)' }}
        />

        <div className="space-y-1 max-h-48 overflow-y-auto">
          <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>Select members</p>
          {contacts.filter(c => c.address !== selfAddress && !c.blocked).map(c => (
            <button
              key={c.address}
              onClick={() => toggle(c.address)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-white/5"
            >
              <div
                className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0"
                style={{ borderColor: selected.includes(c.address) ? 'var(--accent)' : 'var(--border-strong)', background: selected.includes(c.address) ? 'var(--accent)' : 'transparent' }}
              >
                {selected.includes(c.address) && <Check size={10} style={{ color: '#080e1a' }} />}
              </div>
              <span className="text-xs" style={{ color: 'var(--ink-2)' }}>{c.handle}</span>
            </button>
          ))}
          {contacts.length === 0 && <p className="text-xs text-center py-3" style={{ color: 'var(--subtle)' }}>Add contacts first</p>}
        </div>

        <button
          onClick={() => { if (name.trim() && selected.length > 0) onCreate(name.trim(), selected) }}
          disabled={!name.trim() || selected.length === 0}
          className="w-full py-2.5 rounded-xl text-xs font-semibold disabled:opacity-40"
          style={{ background: 'var(--accent)', color: '#080e1a' }}
        >
          Create Group ({selected.length} member{selected.length !== 1 ? 's' : ''})
        </button>
      </motion.div>
    </motion.div>
  )
}

export default function MessagingSection() {
  const { state, dispatch } = usePrivex()
  const { address } = useAccount()

  // Compose state
  const [messageInput, setMessageInput] = useState('')
  const [newContactAddr, setNewContactAddr] = useState('')
  const [showAddContact, setShowAddContact] = useState(false)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // File attachment
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attachedFile, setAttachedFile] = useState<File | null>(null)

  // Voice recording
  const [recording, setRecording] = useState(false)
  const [recordDuration, setRecordDuration] = useState(0)
  const [voiceLevel, setVoiceLevel] = useState(0)
  const recorderRef = useRef<{ stop: () => Promise<Blob>; cancel: () => void } | null>(null)
  const recDurationRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Group
  const [showNewGroup, setShowNewGroup] = useState(false)

  // Disappearing messages
  const [disappearMs, setDisappearMs] = useState(0)
  const [showDisappearMenu, setShowDisappearMenu] = useState(false)

  // Context menu
  const [contextMenu, setContextMenu] = useState<{ msgId: string; x: number; y: number } | null>(null)
  const [showReactPicker, setShowReactPicker] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)

  const activeMessages = state.activeConversation ? (state.messages[state.activeConversation] ?? []) : []
  const activeContact = state.contacts.find(c => c.address === state.activeConversation)
  const activeGroup = state.groups.find(g => g.id === state.activeConversation)
  const isGroup = !!activeGroup

  // Mobile: track whether we're viewing the convo list or the chat panel
  const [mobileShowChat, setMobileShowChat] = useState(false)
  const mq = typeof window !== 'undefined' ? window.matchMedia('(max-width: 639px)') : null
  const [isMobile, setIsMobile] = useState(() => mq?.matches ?? false)
  useEffect(() => {
    if (!mq) return
    const h = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [mq])

  // Filter contacts by search
  const allConvos = [
    ...state.contacts.map(c => ({ id: c.address, label: c.handle, isGroup: false, verified: c.verified, blocked: c.blocked })),
    ...state.groups.map(g => ({ id: g.id, label: g.name, isGroup: true, verified: false, blocked: false })),
  ].filter(c => !c.blocked && (c.label.toLowerCase().includes(searchQuery.toLowerCase()) || searchQuery === ''))

  const autoDownloadVoice = useCallback(async (
    msgId: string, fileId: string, ivHex: string, wrappedKeyHex: string, wrapIvHex: string,
    senderPubHex: string, mimeType: string, from: string
  ) => {
    if (!state.privKeys) return
    try {
      const encBlob = await fetchFileMessage(fileId)
      if (!encBlob) return
      const encArr = await encBlob.arrayBuffer()
      const encHex = Array.from(new Uint8Array(encArr)).map(b => b.toString(16).padStart(2, '0')).join('')
      const { blob } = await decryptFile(
        { ciphertextHex: encHex, fileIvHex: ivHex, wrappedKeyHex, wrapIvHex, senderEpubkeyHex: senderPubHex, filename: 'voice.webm', mimeType, size: 0 },
        senderPubHex,
        state.privKeys.messagingPrivateKey
      )
      const url = URL.createObjectURL(blob)
      dispatch({
        type: 'SET_MESSAGES', peer: from,
        messages: (state.messages[from] ?? []).map(m => m.id === msgId ? { ...m, fileBlobUrl: url } : m)
      })
    } catch (e) {
      console.warn('[PRIVEX] Voice auto-download failed', e)
    }
  }, [state.privKeys, state.messages, dispatch])

  // Message processor — handles both initial fetch and realtime push
  const processMessage = useCallback(async (msg: import('../../lib/relay').RelayMessage) => {
    if (!state.privKeys) return

    const isFileMeta = msg.ciphertextHex.startsWith('FILEMETA:')
    if (isFileMeta) {
      try {
        const metaJson = msg.ciphertextHex.slice(9)
        const meta = JSON.parse(metaJson) as {
          fileId: string; fileName: string; mimeType: string; size: number
          ivHex: string; wrappedKeyHex: string; wrapIvHex: string; senderPubHex: string
          voiceDuration?: number; disappearsAt?: number
        }
        const isVoice = meta.mimeType.startsWith('audio/')
        const localMsg: LocalMessage = {
          id: msg.id, from: msg.from, to: msg.to,
          text: isVoice ? 'Voice message' : `File: ${meta.fileName}`,
          timestamp: msg.timestamp, type: isVoice ? 'voice' : 'file',
          fileName: meta.fileName, fileMime: meta.mimeType, fileSize: meta.size,
          voiceDuration: meta.voiceDuration, disappearsAt: meta.disappearsAt,
        }
        dispatch({ type: 'ADD_MESSAGE', peer: msg.from, message: localMsg })
        if (isVoice) {
          void autoDownloadVoice(msg.id, meta.fileId, meta.ivHex, meta.wrappedKeyHex, meta.wrapIvHex, meta.senderPubHex, meta.mimeType, msg.from)
        }
      } catch { /* malformed meta */ }
      return
    }

    try {
      const parts = msg.ciphertextHex.split(':')
      if (parts.length < 3) return
      const [ivHex, cipherHex, senderPubHex] = parts
      const text = await decryptFromSender(cipherHex, ivHex, senderPubHex, state.privKeys.messagingPrivateKey)
      let disappearsAt: number | undefined
      let actualText = text
      if (text.startsWith('PRIVEX_EXPIRE:')) {
        const [, expStr, ...rest] = text.split(':')
        disappearsAt = parseInt(expStr, 10)
        actualText = rest.join(':')
      }
      dispatch({
        type: 'ADD_MESSAGE', peer: msg.from,
        message: { id: msg.id, from: msg.from, to: msg.to, text: actualText, timestamp: msg.timestamp, type: 'text', disappearsAt },
      })
    } catch {
      console.warn('[PRIVEX] Could not decrypt message', msg.id)
    }
  }, [state.privKeys, dispatch, autoDownloadVoice])

  // Subscribe to Supabase Realtime for instant message delivery + initial fetch
  useEffect(() => {
    if (!address) return
    void fetchMessages(0).then(msgs => { msgs.forEach(m => { void processMessage(m) }) })
    const unsub = subscribeToMessages(address, (msg) => { void processMessage(msg) })
    return unsub
  }, [address, processMessage])

  // Auto-refresh pubkey when opening a conversation with a contact who has no key yet
  useEffect(() => {
    if (!state.activeConversation) return
    const contact = state.contacts.find(c => c.address === state.activeConversation)
    if (!contact || contact.publicKey) return
    void fetchPubkey(contact.address).then(key => {
      if (key) dispatch({ type: 'ADD_CONTACT', contact: { ...contact, publicKey: key, verified: true } })
    })
  }, [state.activeConversation, state.contacts, dispatch])

  // Disappearing message sweep
  useEffect(() => {
    const sweep = setInterval(() => {
      const now = Date.now()
      Object.keys(state.messages).forEach(peer => {
        state.messages[peer].forEach(m => {
          if (m.disappearsAt && m.disappearsAt > 0 && now > m.disappearsAt) {
            dispatch({ type: 'DELETE_MESSAGE', peer, id: m.id })
          }
        })
      })
    }, 5000)
    return () => clearInterval(sweep)
  }, [state.messages, dispatch])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMessages.length])

  // Close context menu on click outside
  useEffect(() => {
    const close = () => { setContextMenu(null); setShowReactPicker(null) }
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [])

  const sendMessage = async () => {
    if (!state.activeConversation || !state.privKeys || !address) return
    if (!state.backendOnline) { toast.error('Relay offline'); return }

    // File send
    if (attachedFile) {
      await sendFileAttachment(attachedFile)
      return
    }

    if (!messageInput.trim()) return

    // Text or group text
    if (isGroup && activeGroup) {
      await sendGroupMessage(messageInput.trim())
      return
    }

    const contact = state.contacts.find(c => c.address === state.activeConversation)
    if (!contact?.publicKey) {
      toast.error('No public key for this contact — they need to register their PRIVEX identity first')
      return
    }
    if (contact.blocked) { toast.error('Contact is blocked'); return }

    setSending(true)
    try {
      let plaintext = messageInput.trim()
      // oxlint-disable-next-line react/purity -- Date.now() is called in an async event handler, not during render
      if (disappearMs > 0) plaintext = `PRIVEX_EXPIRE:${Date.now() + disappearMs}:${plaintext}`

      const { ciphertextHex, ivHex } = await encryptForRecipient(
        plaintext, contact.publicKey, state.privKeys.messagingPrivateKey
      )
      const senderPubkey = state.keyBundle?.messagingPublicKey ?? ''
      const packed = `${ivHex}:${ciphertextHex}:${senderPubkey}`
      const { id, timestamp } = await sendEncryptedMessage(state.activeConversation, packed, senderPubkey)

      dispatch({
        type: 'ADD_MESSAGE', peer: state.activeConversation,
        // oxlint-disable-next-line react/purity -- Date.now() is called in an async event handler, not during render
        message: { id, from: address, to: state.activeConversation, text: messageInput.trim(), timestamp, type: 'text', disappearsAt: disappearMs > 0 ? Date.now() + disappearMs : undefined }
      })
      setMessageInput('')
    } catch {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const sendGroupMessage = async (text: string) => {
    if (!activeGroup || !state.privKeys || !address) return
    setSending(true)
    try {
      const senderPubkey = state.keyBundle?.messagingPublicKey ?? ''
      // Encrypt separately for each group member
      const sends = activeGroup.members
        .filter(m => m !== address && activeGroup.memberKeys[m])
        .map(async member => {
          const { ciphertextHex, ivHex } = await encryptForRecipient(
            `GROUP:${activeGroup.id}:${text}`, activeGroup.memberKeys[member], state.privKeys!.messagingPrivateKey
          )
          const packed = `${ivHex}:${ciphertextHex}:${senderPubkey}`
          return sendEncryptedMessage(member, packed, senderPubkey)
        })
      await Promise.all(sends)

      const localMsg: LocalMessage = {
        id: `g-${Date.now()}`, from: address, to: activeGroup.id,
        text, timestamp: Date.now(), type: 'text', groupId: activeGroup.id,
      }
      dispatch({ type: 'ADD_MESSAGE', peer: activeGroup.id, message: localMsg })
      setMessageInput('')
    } catch {
      toast.error('Failed to send group message')
    } finally {
      setSending(false)
    }
  }

  const sendFileAttachment = async (file: File) => {
    if (!state.privKeys || !address || !state.activeConversation) return
    if (file.size > MAX_FILE_BYTES) { toast.error('File too large (max 10 MB)'); return }

    const contact = state.contacts.find(c => c.address === state.activeConversation)
    if (!contact?.publicKey) { toast.error('No public key for recipient'); return }

    setSending(true)
    try {
      const senderPubkey = state.keyBundle?.messagingPublicKey ?? ''
      const packet = await encryptFile(file, contact.publicKey, state.privKeys.messagingPrivateKey, senderPubkey)

      // Upload encrypted blob to relay
      const encBytes = new Uint8Array(packet.ciphertextHex.match(/.{1,2}/g)!.map(b => parseInt(b, 16)))
      const fileId = await sendFileMessage(new Blob([encBytes]))
      if (!fileId) throw new Error('Upload failed')

      const isVoice = file.type.startsWith('audio/')
      const metaObj = {
        fileId, fileName: file.name, mimeType: file.type, size: file.size,
        ivHex: packet.fileIvHex, wrappedKeyHex: packet.wrappedKeyHex,
        wrapIvHex: packet.wrapIvHex, senderPubHex: senderPubkey,
        ...(isVoice ? { voiceDuration: 0 } : {}),
        ...(disappearMs > 0 ? { disappearsAt: Date.now() + disappearMs } : {}),
      }

      const metaPacked = `FILEMETA:${JSON.stringify(metaObj)}`
      const { id, timestamp } = await sendEncryptedMessage(state.activeConversation, metaPacked, senderPubkey)

      const blobUrl = URL.createObjectURL(file)
      dispatch({
        type: 'ADD_MESSAGE', peer: state.activeConversation,
        message: {
          id, from: address, to: state.activeConversation,
          timestamp, type: isVoice ? 'voice' : 'file',
          fileName: file.name, fileMime: file.type, fileSize: file.size,
          fileBlobUrl: blobUrl, disappearsAt: disappearMs > 0 ? Date.now() + disappearMs : undefined,
          text: isVoice ? 'Voice message' : `File: ${file.name}`,
        }
      })
      setAttachedFile(null)
      toast.success('Encrypted file sent')
    } catch (err) {
      toast.error('Failed to send file')
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const startVoiceRecording = async () => {
    try {
      const rec = await startRecording(setVoiceLevel)
      recorderRef.current = rec
      setRecording(true)
      setRecordDuration(0)
      recDurationRef.current = setInterval(() => setRecordDuration(d => d + 1), 1000)
    } catch {
      toast.error('Could not access microphone')
    }
  }

  const stopVoiceRecording = async () => {
    if (!recorderRef.current) return
    if (recDurationRef.current) clearInterval(recDurationRef.current)
    setRecording(false)
    setVoiceLevel(0)
    try {
      const blob = await recorderRef.current.stop()
      const file = new File([blob], `voice-${Date.now()}.webm`, { type: blob.type })
      setAttachedFile(file)
    } catch {
      toast.error('Recording failed')
    }
    recorderRef.current = null
  }

  const cancelVoiceRecording = () => {
    recorderRef.current?.cancel()
    recorderRef.current = null
    if (recDurationRef.current) clearInterval(recDurationRef.current)
    setRecording(false)
    setRecordDuration(0)
    setVoiceLevel(0)
  }

  const [addingContact, setAddingContact] = useState(false)
  const addContact = async () => {
    if (!newContactAddr.trim()) return
    setAddingContact(true)
    try {
      const resolved = await resolveContact(newContactAddr.trim())
      if (!resolved) {
        toast.error('Not found — enter a wallet address (0x...) or handle (name@privex)')
        return
      }
      const contact: Contact = {
        address: resolved.walletAddr,
        handle: resolved.displayName,
        publicKey: resolved.pubkeyHex,
        addedAt: Date.now(),
        verified: !!resolved.pubkeyHex,
      }
      dispatch({ type: 'ADD_CONTACT', contact })
      setNewContactAddr(''); setShowAddContact(false)
      toast.success(resolved.pubkeyHex ? `Added ${resolved.displayName} — encrypted messaging ready` : `Added ${resolved.displayName} — waiting for them to register their identity`)
    } catch {
      toast.error('Failed to resolve contact')
    } finally {
      setAddingContact(false)
    }
  }

  const createGroup = (name: string, members: string[]) => {
    if (!address) return
    const memberKeys: Record<string, string> = {}
    members.forEach(m => {
      const c = state.contacts.find(c => c.address === m)
      if (c?.publicKey) memberKeys[m] = c.publicKey
    })
    const group: Group = {
      id: `g-${Date.now()}`,
      name,
      members: [address, ...members],
      memberKeys,
      createdAt: Date.now(),
      createdBy: address,
    }
    dispatch({ type: 'ADD_GROUP', group })
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', address: group.id })
    setShowNewGroup(false)
    toast.success(`Group "${name}" created`)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setAttachedFile(file)
    e.target.value = ''
  }

  const downloadDecryptedFile = (msg: LocalMessage) => {
    if (msg.fileBlobUrl) {
      const a = document.createElement('a')
      a.href = msg.fileBlobUrl
      a.download = msg.fileName ?? 'file'
      a.click()
      return
    }
    toast.info('File not yet downloaded. Files are auto-downloaded in production with backend storage.')
  }

  const handleReact = (msgId: string, emoji: string) => {
    if (!address || !state.activeConversation) return
    dispatch({ type: 'REACT_MESSAGE', peer: state.activeConversation, id: msgId, emoji, addr: address })
    setShowReactPicker(null)
  }

  if (!address) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center space-y-2">
          <Lock size={32} style={{ color: 'var(--subtle)' }} className="mx-auto" />
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Connect your wallet to access encrypted messaging</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex" style={{ height: 'calc(100dvh - 58px)', position: 'relative', overflow: 'hidden' }}>
      <AnimatePresence>
        {showNewGroup && (
          <NewGroupDialog
            contacts={state.contacts}
            selfAddress={address ?? ''}
            onClose={() => setShowNewGroup(false)}
            onCreate={createGroup}
          />
        )}
      </AnimatePresence>

      {/* Conversation list — full width on mobile when no chat open, fixed width on desktop */}
      <div
        className="flex-shrink-0 flex flex-col border-r"
        style={{
          borderColor: 'var(--border)',
          width: isMobile ? '100%' : 260,
          display: isMobile && mobileShowChat ? 'none' : 'flex',
        }}
      >
        {/* Search */}
        <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="glass rounded-xl px-3 py-2.5 flex items-center gap-2">
            <Search size={13} style={{ color: 'var(--subtle)' }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="bg-transparent outline-none flex-1 text-[13px]"
              style={{ color: 'var(--ink)' }}
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {allConvos.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-xs" style={{ color: 'var(--muted)' }}>No conversations yet</p>
            </div>
          ) : (
            allConvos.map(convo => {
              const msgs = state.messages[convo.id] ?? []
              const filtered = msgs.filter(m => !m.deleted)
              const lastMsg = filtered[filtered.length - 1]
              const unread = msgs.filter(m => m.from !== address && !m.deleted).length
              const isActive = state.activeConversation === convo.id
              return (
                <button
                  key={convo.id}
                  onClick={() => { dispatch({ type: 'SET_ACTIVE_CONVERSATION', address: convo.id }); setMobileShowChat(true) }}
                  className={`w-full px-3 py-3 flex items-center gap-2.5 text-left transition-colors hover:bg-white/5 ${isActive ? 'bg-white/5' : ''}`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: convo.isGroup ? 'var(--accent-2)' : 'var(--surface-strong)', color: convo.isGroup ? 'var(--ink)' : 'var(--accent)' }}
                  >
                    {convo.isGroup ? <Users size={14} /> : convo.label[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold truncate" style={{ color: 'var(--ink)' }}>{convo.label}</div>
                    {lastMsg && (
                      <div className="text-[12px] truncate mt-0.5" style={{ color: 'var(--subtle)' }}>
                        {lastMsg.from.toLowerCase() === address?.toLowerCase() ? 'You: ' : ''}
                        {lastMsg.deleted ? 'Message deleted' : lastMsg.type === 'voice' ? 'Voice message' : lastMsg.type === 'file' ? `File: ${lastMsg.fileName ?? 'File'}` : lastMsg.text}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {convo.verified && <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--secure)' }} />}
                    {unread > 0 && (
                      <div className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--accent)', color: '#080e1a', fontSize: '9px' }}>
                        {unread > 9 ? '9+' : unread}
                      </div>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Add contact / new group */}
        <div className="p-3 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => setShowNewGroup(true)}
            className="w-full py-2 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 transition-all hover:opacity-80"
            style={{ background: 'var(--surface-muted)', color: 'var(--ink-2)', minHeight: 40 }}
          >
            <Users size={13} />
            New Group
          </button>

          {showAddContact ? (
            <div className="space-y-2">
              <input
                value={newContactAddr}
                onChange={e => setNewContactAddr(e.target.value)}
                placeholder="name@privex or 0x..."
                className="w-full glass rounded-xl px-3 py-2.5 text-[12px] outline-none"
                style={{ color: 'var(--ink)', minHeight: 40 }}
                onKeyDown={e => { if (e.key === 'Enter') { void addContact() } }}
              />
              <div className="flex gap-2">
                <button onClick={() => { void addContact() }} disabled={addingContact} className="flex-1 py-2 rounded-xl text-[13px] font-semibold disabled:opacity-40" style={{ background: 'var(--accent)', color: 'var(--accent-text, #040e20)', minHeight: 40 }}>{addingContact ? 'Looking up…' : 'Add'}</button>
                <button onClick={() => setShowAddContact(false)} className="flex-1 py-2 rounded-xl text-[13px]" style={{ background: 'var(--surface-muted)', color: 'var(--muted)', minHeight: 40 }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddContact(true)}
              className="w-full py-2 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 transition-all hover:opacity-80"
              style={{ background: 'var(--surface-muted)', color: 'var(--ink-2)', minHeight: 40 }}
            >
              <UserPlus size={13} />
              Add Contact
            </button>
          )}
        </div>
      </div>

      {/* Chat area — full width on mobile when chat open, flex-1 on desktop */}
      {state.activeConversation ? (
        <div className="flex-1 flex flex-col min-w-0"
          style={{ display: isMobile && !mobileShowChat ? 'none' : 'flex' }}>
          {/* Chat header */}
          <div className="px-3 h-[58px] border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 min-w-0">
              {/* Back button — mobile only */}
              {isMobile && (
                <button
                  onClick={() => { setMobileShowChat(false); dispatch({ type: 'SET_ACTIVE_CONVERSATION', address: '' }) }}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0"
                  style={{ color: 'var(--accent)' }}
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0"
                style={{ background: isGroup ? 'linear-gradient(135deg,#4f46e5,#1d4ed8)' : 'var(--surface-strong)', color: isGroup ? '#fff' : 'var(--accent)' }}>
                {isGroup ? <Users size={14} /> : (activeContact?.handle?.[0]?.toUpperCase() ?? '?')}
              </div>
              <div className="min-w-0">
                <div className="text-[14px] font-semibold truncate" style={{ color: 'var(--ink)' }}>
                  {isGroup ? activeGroup.name : (activeContact?.handle ?? shortAddress(state.activeConversation))}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Lock size={10} style={{ color: 'var(--secure)' }} />
                  <span className="text-[11px]" style={{ color: 'var(--secure)' }}>
                    {isGroup ? `E2E Encrypted · ${activeGroup.members.length} members` : 'End-to-End Encrypted'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Disappearing messages toggle */}
              <div className="relative">
                <button
                  onClick={e => { e.stopPropagation(); setShowDisappearMenu(v => !v) }}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-1"
                  title="Disappearing messages"
                >
                  <Clock size={13} style={{ color: disappearMs > 0 ? 'var(--warning)' : 'var(--subtle)' }} />
                  {disappearMs > 0 && <span className="text-xs" style={{ color: 'var(--warning)', fontSize: '9px' }}>{DISAPPEAR_OPTIONS.find(o => o.value === disappearMs)?.label}</span>}
                </button>
                <AnimatePresence>
                  {showDisappearMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute right-0 top-full mt-1 glass-strong rounded-xl overflow-hidden z-10"
                      style={{ border: '1px solid var(--border-strong)', minWidth: '140px' }}
                      onClick={e => e.stopPropagation()}
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
                      {/* PVX upgrade nudge */}
                      <div className="px-3 py-2 border-t" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--subtle)' }}>
                          <ShieldAlert size={9} />
                          <span>Hold 1K PVX to enable 7d + 30d timers</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {!isGroup && activeContact && (
                <button
                  onClick={() => { dispatch({ type: 'BLOCK_CONTACT', address: activeContact.address, blocked: !activeContact.blocked }); toast.success(activeContact.blocked ? 'Unblocked' : 'Blocked') }}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  title={activeContact.blocked ? 'Unblock' : 'Block'}
                >
                  <Ban size={13} style={{ color: activeContact.blocked ? 'var(--danger)' : 'var(--subtle)' }} />
                </button>
              )}
              <button
                onClick={() => { if (window.confirm(isGroup ? 'Leave group?' : 'Clear conversation?')) dispatch({ type: 'SET_ACTIVE_CONVERSATION', address: null }) }}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Trash2 size={13} style={{ color: 'var(--subtle)' }} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }} onClick={() => { setContextMenu(null); setShowReactPicker(null) }}>
            {!isGroup && !activeContact?.publicKey && (
              <div className="glass rounded-xl p-3 flex items-start gap-2">
                <AlertTriangle size={12} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />
                <p className="text-xs" style={{ color: 'var(--warning)' }}>
                  This contact has no public key yet — they must register their PRIVEX identity before you can send encrypted messages.
                </p>
              </div>
            )}
            {activeMessages.map(msg => {
              const isMine = msg.from.toLowerCase() === address?.toLowerCase()
              const isDeleted = msg.deleted
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}>
                  <div className="relative max-w-[75%]">
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-snug ${isDeleted ? 'italic opacity-50' : ''}`}
                      style={{
                        background: isMine ? 'var(--accent)' : 'var(--surface-strong)',
                        color: isMine ? 'var(--accent-text)' : 'var(--ink)',
                        borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      }}
                      onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setContextMenu({ msgId: msg.id, x: e.clientX, y: e.clientY }) }}
                    >
                      {/* File / voice content */}
                      {!isDeleted && msg.type === 'voice' && msg.fileBlobUrl ? (
                        <VoicePlayback blobUrl={msg.fileBlobUrl} duration={msg.voiceDuration} />
                      ) : !isDeleted && (msg.type === 'file' || msg.type === 'image') ? (
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: isMine ? 'rgba(0,0,0,0.15)' : 'var(--surface-muted)' }}>
                            {msg.fileMime?.startsWith('image/') ? <Image size={14} style={{ color: isMine ? '#080e1a' : 'var(--accent)' }} /> : <Paperclip size={14} style={{ color: isMine ? '#080e1a' : 'var(--accent)' }} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate" style={{ color: isMine ? '#080e1a' : 'var(--ink)' }}>{msg.fileName}</div>
                            {msg.fileSize && <div className="text-xs" style={{ color: isMine ? 'rgba(0,0,0,0.5)' : 'var(--muted)' }}>{formatFileSize(msg.fileSize)}</div>}
                          </div>
                          <button onClick={() => { downloadDecryptedFile(msg) }} className="p-1">
                            <Download size={12} style={{ color: isMine ? '#080e1a' : 'var(--accent)' }} />
                          </button>
                        </div>
                      ) : (
                        <p className={isDeleted ? 'text-xs italic opacity-60' : ''}>{isDeleted ? 'Message deleted' : msg.text}</p>
                      )}

                      {/* Timestamp + status */}
                      {!isDeleted && (
                        <div className="mt-1 flex items-center justify-end gap-1">
                          {msg.disappearsAt && msg.disappearsAt > 0 && (
                            <Clock size={8} style={{ color: isMine ? 'rgba(0,0,0,0.4)' : 'var(--subtle)' }} />
                          )}
                          <span style={{ color: isMine ? 'rgba(0,0,0,0.45)' : 'var(--subtle)', fontSize: '11px' }}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMine && (msg.pending ? <Check size={10} style={{ color: 'rgba(0,0,0,0.35)' }} /> : <CheckCheck size={10} style={{ color: 'rgba(0,0,0,0.55)' }} />)}
                        </div>
                      )}
                    </motion.div>

                    {/* Reactions */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className={`flex gap-1 mt-0.5 flex-wrap ${isMine ? 'justify-end' : 'justify-start'}`}>
                        {Object.entries(msg.reactions).map(([emoji, users]) => users.length > 0 && (
                          <button
                            key={emoji}
                            onClick={() => handleReact(msg.id, emoji)}
                            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs transition-all"
                            style={{
                              background: users.includes(address ?? '') ? 'var(--accent)' : 'var(--surface-strong)',
                              color: users.includes(address ?? '') ? '#080e1a' : 'var(--ink-2)',
                              fontSize: '10px',
                            }}
                          >
                            {emoji} {users.length}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Hover react + more button */}
                    {!isDeleted && (
                      <div
                        className={`absolute ${isMine ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 px-1`}
                        onClick={e => e.stopPropagation()}
                      >
                        {showReactPicker === msg.id ? (
                          <div className="flex items-center gap-0.5 glass rounded-full px-1.5 py-1" style={{ border: '1px solid var(--border-strong)' }}>
                            {REACTIONS.map(r => (
                              <button key={r} onClick={() => handleReact(msg.id, r)} className="text-sm hover:scale-125 transition-transform">{r}</button>
                            ))}
                            <button onClick={() => setShowReactPicker(null)}><X size={10} style={{ color: 'var(--muted)' }} /></button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => setShowReactPicker(msg.id)} className="p-1 glass rounded-full text-xs" style={{ color: 'var(--muted)' }}>+</button>
                            {isMine && (
                              <button onClick={() => dispatch({ type: 'DELETE_MESSAGE', peer: state.activeConversation!, id: msg.id })} className="p-1 glass rounded-full">
                                <Trash2 size={10} style={{ color: 'var(--danger)' }} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
            {/* Attached file preview */}
            {attachedFile && !recording && (
              <div className="mb-2 flex items-center gap-2 glass rounded-xl px-3 py-2">
                <Paperclip size={11} style={{ color: 'var(--accent)' }} />
                <span className="text-xs flex-1 truncate" style={{ color: 'var(--ink-2)' }}>
                  {attachedFile.name} ({formatFileSize(attachedFile.size)})
                </span>
                <button onClick={() => setAttachedFile(null)}><X size={11} style={{ color: 'var(--muted)' }} /></button>
              </div>
            )}

            {/* Voice recording indicator */}
            {recording && (
              <div className="mb-2 flex items-center gap-3 glass rounded-xl px-3 py-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--danger)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--danger)' }}>{formatDuration(recordDuration)}</span>
                <VoiceWaveform level={voiceLevel} />
                <button onClick={cancelVoiceRecording} className="ml-auto">
                  <X size={13} style={{ color: 'var(--muted)' }} />
                </button>
                <button
                  onClick={() => { void stopVoiceRecording() }}
                  className="px-2 py-1 rounded-lg text-xs font-semibold"
                  style={{ background: 'var(--danger)', color: 'white' }}
                >
                  Stop
                </button>
              </div>
            )}

            {!recording && (
              <div className="flex items-end gap-2">
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                  style={{ color: 'var(--muted)' }}
                  title="Attach file"
                >
                  <Paperclip size={16} />
                </button>

                <div className="flex-1 glass rounded-2xl px-3 py-2 flex items-end gap-2">
                  <textarea
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMessage() } }}
                    placeholder={attachedFile ? 'Add a caption...' : 'Encrypted message...'}
                    rows={1}
                    className="bg-transparent flex-1 outline-none resize-none text-[14px] leading-relaxed"
                    style={{ color: 'var(--ink)', maxHeight: '120px', touchAction: 'manipulation' }}
                  />
                  <Lock size={10} style={{ color: 'var(--secure)', flexShrink: 0, marginBottom: 2 }} />
                </div>

                {messageInput.trim() || attachedFile ? (
                  <button
                    onClick={() => { void sendMessage() }}
                    disabled={sending}
                    className="flex items-center justify-center rounded-xl transition-all disabled:opacity-40 hover:opacity-80"
                    style={{ background: 'var(--accent)', color: 'var(--accent-text)', width: 44, height: 44, flexShrink: 0 }}
                  >
                    <Send size={15} />
                  </button>
                ) : (
                  <button
                    onMouseDown={() => { void startVoiceRecording() }}
                    className="flex items-center justify-center rounded-xl transition-all hover:opacity-80"
                    style={{ background: 'var(--surface-strong)', color: 'var(--ink-2)', width: 44, height: 44, flexShrink: 0 }}
                    title="Hold to record voice message"
                  >
                    <Mic size={15} />
                  </button>
                )}
              </div>
            )}

            <div className="mt-1.5 flex items-center gap-1 justify-end">
              {disappearMs > 0 && (
                <span className="text-xs flex items-center gap-1" style={{ color: 'var(--warning)', fontSize: '9px' }}>
                  <Clock size={8} /> Auto-deletes in {DISAPPEAR_OPTIONS.find(o => o.value === disappearMs)?.label}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : !isMobile ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: 'var(--surface-strong)' }}>
              <Lock size={24} style={{ color: 'var(--subtle)' }} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold display" style={{ color: 'var(--ink)' }}>Select a conversation</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Add a contact or create a group to start messaging</p>
            </div>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 glass rounded-full px-3 py-1.5">
                <Lock size={9} style={{ color: 'var(--secure)' }} />
                <span className="text-xs" style={{ color: 'var(--secure)' }}>E2E Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5 glass rounded-full px-3 py-1.5">
                <ShieldAlert size={9} style={{ color: 'var(--accent)' }} />
                <span className="text-xs" style={{ color: 'var(--accent)' }}>Zero-knowledge relay</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Context menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed z-50 glass-strong rounded-xl overflow-hidden"
            style={{ left: contextMenu.x, top: contextMenu.y, border: '1px solid var(--border-strong)', minWidth: '160px' }}
            onClick={e => e.stopPropagation()}
          >
            {[
              { label: 'React', icon: <Star size={13} style={{ color: 'var(--accent)' }} />, action: () => { setShowReactPicker(contextMenu.msgId); setContextMenu(null) } },
              { label: 'Delete for me', icon: <Trash2 size={13} style={{ color: 'var(--danger)' }} />, action: () => { if (state.activeConversation) dispatch({ type: 'DELETE_MESSAGE', peer: state.activeConversation, id: contextMenu.msgId }); setContextMenu(null) } },
              { label: 'Report', icon: <AlertTriangle size={13} style={{ color: 'var(--warning)' }} />, action: () => { toast.info('Reported (in production, sends anonymized report)'); setContextMenu(null) } },
            ].map(item => (
              <button key={item.label} onClick={item.action} className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/5" style={{ color: 'var(--ink-2)' }}>
                {item.icon} {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
