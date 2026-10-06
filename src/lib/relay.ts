/**
 * PRIVEX relay — backed by Supabase Realtime + Postgres.
 * All message payloads are ciphertext. This module never handles plaintext.
 */
import { supabase, type DbMessage, type DbSignal, type DbEmail } from './supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ─── Legacy compat types (keep shape identical so MessagingSection needs no changes) ──

export interface RelayMessage {
  id: string
  from: string
  to: string
  ciphertextHex: string
  timestamp: number
  epubkeyHex: string
}

export interface SignalEntry {
  from: string
  type: string
  payload: string
  ts: number
}

export interface RelayEmail {
  id: string
  from: string
  to: string
  subjectCipher: string
  bodyCipher: string
  attachmentId?: string
  attachmentName?: string
  attachmentSize?: number
  subjectIv: string
  bodyIv: string
  senderPubkey: string
  timestamp: number
  disappearsAt?: number
}

export interface SendEmailPayload {
  to: string
  subjectCipher: string
  bodyCipher: string
  subjectIv: string
  bodyIv: string
  senderPubkey: string
  attachmentId?: string
  attachmentName?: string
  attachmentSize?: number
  disappearsAt?: number
}

// ─── Auth (no-op — Supabase uses anon key, no server-side auth token needed) ──

let _walletAddress: string | null = null

export function setToken(_t: string | null): void { /* no-op */ }
export function getToken(): string | null { return null }
export function setWalletAddress(addr: string | null): void { _walletAddress = addr }

// ─── Health ──────────────────────────────────────────────────────────────────

export async function healthCheck(): Promise<boolean> {
  try {
    const { error } = await supabase.from('messages').select('id').limit(1)
    return !error
  } catch {
    return false
  }
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function sendEncryptedMessage(
  to: string,
  ciphertextHex: string,
  epubkeyHex: string,
  disappearsAt?: number
): Promise<{ id: string; timestamp: number }> {
  if (!_walletAddress) throw new Error('No wallet address set')

  const { data, error } = await supabase
    .from('messages')
    .insert({
      from_addr: _walletAddress.toLowerCase(),
      to_addr: to.toLowerCase(),
      ciphertext: ciphertextHex,
      epubkey: epubkeyHex,
      created_at: Date.now(),
      disappears_at: disappearsAt ?? null,
    })
    .select('id, created_at')
    .single()

  if (error) throw new Error(error.message)
  return { id: data.id as string, timestamp: data.created_at as number }
}

export async function fetchMessages(since = 0): Promise<RelayMessage[]> {
  if (!_walletAddress) return []

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('to_addr', _walletAddress.toLowerCase())
    .gt('created_at', since)
    .order('created_at', { ascending: true })

  if (error || !data) return []

  return (data as DbMessage[]).map(m => ({
    id: m.id,
    from: m.from_addr,
    to: m.to_addr,
    ciphertextHex: m.ciphertext,
    timestamp: m.created_at,
    epubkeyHex: m.epubkey,
  }))
}

export async function deleteMessage(id: string): Promise<void> {
  await supabase.from('messages').delete().eq('id', id)
}

// ─── Realtime subscription ────────────────────────────────────────────────────

let _msgChannel: RealtimeChannel | null = null

export function subscribeToMessages(
  walletAddress: string,
  onMessage: (msg: RelayMessage) => void
): () => void {
  void _msgChannel?.unsubscribe()

  _msgChannel = supabase
    .channel(`messages:${walletAddress.toLowerCase()}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `to_addr=eq.${walletAddress.toLowerCase()}`,
      },
      (payload) => {
        const m = payload.new as DbMessage
        onMessage({
          id: m.id,
          from: m.from_addr,
          to: m.to_addr,
          ciphertextHex: m.ciphertext,
          timestamp: m.created_at,
          epubkeyHex: m.epubkey,
        })
      }
    )
    .subscribe()

  return () => { void _msgChannel?.unsubscribe(); _msgChannel = null }
}

// ─── Signals (WebRTC) ─────────────────────────────────────────────────────────

export async function postSignal(roomId: string, type: string, payload: string): Promise<void> {
  if (!_walletAddress) return
  await supabase.from('signals').insert({
    room_id: roomId,
    from_addr: _walletAddress.toLowerCase(),
    type,
    payload,
    created_at: Date.now(),
  })
}

export async function pollSignals(roomId: string, since: number): Promise<SignalEntry[]> {
  const { data, error } = await supabase
    .from('signals')
    .select('*')
    .eq('room_id', roomId)
    .gt('created_at', since)
    .order('created_at', { ascending: true })

  if (error || !data) return []
  return (data as DbSignal[]).map(s => ({
    from: s.from_addr,
    type: s.type,
    payload: s.payload,
    ts: s.created_at,
  }))
}

let _signalChannel: RealtimeChannel | null = null

export function subscribeToSignals(
  roomId: string,
  onSignal: (s: SignalEntry) => void
): () => void {
  void _signalChannel?.unsubscribe()

  _signalChannel = supabase
    .channel(`signals:${roomId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'signals', filter: `room_id=eq.${roomId}` },
      (payload) => {
        const s = payload.new as DbSignal
        onSignal({ from: s.from_addr, type: s.type, payload: s.payload, ts: s.created_at })
      }
    )
    .subscribe()

  return () => { void _signalChannel?.unsubscribe(); _signalChannel = null }
}

// ─── File relay — Supabase Storage bucket "privex-files" ─────────────────────

export async function sendFileMessage(blob: Blob): Promise<string | null> {
  const fileId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const { error } = await supabase.storage
    .from('privex-files')
    .upload(fileId, blob, { contentType: blob.type || 'application/octet-stream', upsert: false })
  if (error) { console.error('[PRIVEX] Storage upload error', error.message); return null }
  return fileId
}

export async function fetchFileMessage(fileId: string): Promise<Blob | null> {
  const { data, error } = await supabase.storage
    .from('privex-files')
    .download(fileId)
  if (error || !data) { console.error('[PRIVEX] Storage download error', error?.message); return null }
  return data
}

// ─── Auth helpers (legacy compat — kept for any callers) ─────────────────────

export function fetchChallenge(_address: string): Promise<{ nonce: string; message: string }> {
  const nonce = Math.random().toString(36).slice(2)
  return Promise.resolve({ nonce, message: `Sign in to PRIVEX\nNonce: ${nonce}` })
}

export function verifySignature(
  address: string, _signature: string, _message: string
): Promise<{ token: string; address: string }> {
  return Promise.resolve({ token: address, address })
}

export function logout(): Promise<void> { return Promise.resolve() }

// ─── Email ────────────────────────────────────────────────────────────────────

function dbEmailToRelay(e: DbEmail): RelayEmail {
  return {
    id: e.id,
    from: e.from_addr,
    to: e.to_addr,
    subjectCipher: e.subject_cipher,
    bodyCipher: e.body_cipher,
    subjectIv: e.subject_iv,
    bodyIv: e.body_iv,
    senderPubkey: e.sender_pubkey,
    attachmentId: e.attachment_id,
    attachmentName: e.attachment_name,
    attachmentSize: e.attachment_size,
    timestamp: e.created_at,
    disappearsAt: e.disappears_at,
  }
}

export async function sendEncryptedEmail(
  payload: SendEmailPayload
): Promise<{ id: string; timestamp: number }> {
  if (!_walletAddress) throw new Error('No wallet address')

  const { data, error } = await supabase
    .from('emails')
    .insert({
      from_addr: _walletAddress.toLowerCase(),
      to_addr: payload.to.toLowerCase(),
      subject_cipher: payload.subjectCipher,
      body_cipher: payload.bodyCipher,
      subject_iv: payload.subjectIv,
      body_iv: payload.bodyIv,
      sender_pubkey: payload.senderPubkey,
      attachment_id: payload.attachmentId,
      attachment_name: payload.attachmentName,
      attachment_size: payload.attachmentSize,
      created_at: Date.now(),
      disappears_at: payload.disappearsAt ?? null,
      is_draft: false,
    })
    .select('id, created_at')
    .single()

  if (error) throw new Error(error.message)
  return { id: data.id as string, timestamp: data.created_at as number }
}

export async function fetchEncryptedEmails(since = 0): Promise<RelayEmail[]> {
  if (!_walletAddress) return []

  const { data, error } = await supabase
    .from('emails')
    .select('*')
    .eq('to_addr', _walletAddress.toLowerCase())
    .eq('is_draft', false)
    .gt('created_at', since)
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return (data as DbEmail[]).map(dbEmailToRelay)
}

export async function deleteRelayEmail(id: string): Promise<void> {
  await supabase.from('emails').delete().eq('id', id)
}

export async function saveDraft(
  draftId: string | null,
  payload: Partial<SendEmailPayload>
): Promise<{ id: string }> {
  if (!_walletAddress) return { id: draftId ?? `draft-${Date.now()}` }

  if (draftId) {
    await supabase.from('emails').update({ ...payload, is_draft: true }).eq('id', draftId)
    return { id: draftId }
  }

  const { data, error } = await supabase
    .from('emails')
    .insert({
      from_addr: _walletAddress.toLowerCase(),
      to_addr: (payload.to ?? '').toLowerCase(),
      subject_cipher: payload.subjectCipher ?? '',
      body_cipher: payload.bodyCipher ?? '',
      subject_iv: payload.subjectIv ?? '',
      body_iv: payload.bodyIv ?? '',
      sender_pubkey: payload.senderPubkey ?? '',
      created_at: Date.now(),
      is_draft: true,
    })
    .select('id')
    .single()

  if (error) return { id: `draft-${Date.now()}` }
  return { id: data.id as string }
}

export async function fetchDrafts(): Promise<RelayEmail[]> {
  if (!_walletAddress) return []

  const { data, error } = await supabase
    .from('emails')
    .select('*')
    .eq('from_addr', _walletAddress.toLowerCase())
    .eq('is_draft', true)
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return (data as DbEmail[]).map(dbEmailToRelay)
}

export async function deleteDraft(id: string): Promise<void> {
  await supabase.from('emails').delete().eq('id', id)
}
