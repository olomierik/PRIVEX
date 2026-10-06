/**
 * PRIVEX relay API client
 * All message payloads are ciphertext. This module never handles plaintext.
 */

const BASE = '/api'

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

interface ApiError { error: string }
interface MessagesResponse { messages: RelayMessage[] }
interface SignalsResponse { signals: SignalEntry[] }

let authToken: string | null = null

export function setToken(t: string | null): void { authToken = t }
export function getToken(): string | null { return authToken }

function headers(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (authToken) h['Authorization'] = `Bearer ${authToken}`
  return h
}

export async function fetchChallenge(address: string): Promise<{ nonce: string; message: string }> {
  const r = await fetch(`${BASE}/auth/challenge?address=${encodeURIComponent(address)}`)
  if (!r.ok) throw new Error('Failed to get challenge')
  return r.json() as Promise<{ nonce: string; message: string }>
}

export async function verifySignature(address: string, signature: string, message: string): Promise<{ token: string; address: string }> {
  const r = await fetch(`${BASE}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, signature, message }),
  })
  if (!r.ok) {
    const e = await (r.json() as Promise<ApiError>).catch(() => ({ error: 'Auth failed' }))
    throw new Error(e.error)
  }
  return r.json() as Promise<{ token: string; address: string }>
}

export async function logout(): Promise<void> {
  if (!authToken) return
  await fetch(`${BASE}/auth/logout`, { method: 'POST', headers: headers() })
  authToken = null
}

export async function sendEncryptedMessage(
  to: string,
  ciphertextHex: string,
  epubkeyHex: string
): Promise<{ id: string; timestamp: number }> {
  const r = await fetch(`${BASE}/messages`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ to, ciphertextHex, epubkeyHex }),
  })
  if (!r.ok) {
    const e = await (r.json() as Promise<ApiError>).catch(() => ({ error: 'Send failed' }))
    throw new Error(e.error)
  }
  return r.json() as Promise<{ id: string; timestamp: number }>
}

export async function fetchMessages(since = 0): Promise<RelayMessage[]> {
  const r = await fetch(`${BASE}/messages?since=${since}`, { headers: headers() })
  if (!r.ok) return []
  const data = await (r.json() as Promise<MessagesResponse>)
  return data.messages ?? []
}

export async function deleteMessage(id: string): Promise<void> {
  await fetch(`${BASE}/messages/${id}`, { method: 'DELETE', headers: headers() })
}

export async function postSignal(roomId: string, type: string, payload: string): Promise<void> {
  await fetch(`${BASE}/signal`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ roomId, type, payload }),
  })
}

export async function pollSignals(roomId: string, since: number): Promise<SignalEntry[]> {
  const r = await fetch(`${BASE}/signal?roomId=${encodeURIComponent(roomId)}&since=${since}`, { headers: headers() })
  if (!r.ok) return []
  const data = await (r.json() as Promise<SignalsResponse>)
  return data.signals ?? []
}

export async function healthCheck(): Promise<boolean> {
  try {
    const r = await fetch(`${BASE}/health`)
    return r.ok
  } catch {
    return false
  }
}

// ─── File relay (Phase 2) ───────────────────────────────────────────────────

/** Upload an encrypted file blob to the relay. Returns fileId or null on failure. */
export async function sendFileMessage(blob: Blob): Promise<string | null> {
  try {
    const r = await fetch(`${BASE}/files`, {
      method: 'POST',
      headers: { ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}), 'Content-Type': 'application/octet-stream' },
      body: blob,
    })
    if (!r.ok) return null
    const data = await (r.json() as Promise<{ fileId: string }>)
    return data.fileId
  } catch {
    return null
  }
}

/** Download an encrypted file blob from the relay. */
export async function fetchFileMessage(fileId: string): Promise<Blob | null> {
  try {
    const r = await fetch(`${BASE}/files/${encodeURIComponent(fileId)}`, { headers: headers() })
    if (!r.ok) return null
    return r.blob()
  } catch {
    return null
  }
}

// ─── Email relay (Phase 3) ──────────────────────────────────────────────────

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

/** Send an encrypted email to the relay (server only sees ciphertext) */
export async function sendEncryptedEmail(payload: SendEmailPayload): Promise<{ id: string; timestamp: number }> {
  const r = await fetch(`${BASE}/email`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(payload),
  })
  if (!r.ok) {
    const e = await (r.json() as Promise<ApiError>).catch(() => ({ error: 'Send failed' }))
    throw new Error(e.error)
  }
  return r.json() as Promise<{ id: string; timestamp: number }>
}

/** Fetch encrypted emails from the relay inbox */
export async function fetchEncryptedEmails(since = 0): Promise<RelayEmail[]> {
  const r = await fetch(`${BASE}/email?since=${since}`, { headers: headers() })
  if (!r.ok) return []
  const data = await (r.json() as Promise<{ emails: RelayEmail[] }>)
  return data.emails ?? []
}

/** Delete an email from the relay */
export async function deleteRelayEmail(id: string): Promise<void> {
  await fetch(`${BASE}/email/${id}`, { method: 'DELETE', headers: headers() })
}

/** Save/update a draft (stored encrypted client-side only; relay draft for sync) */
export async function saveDraft(draftId: string | null, payload: Partial<SendEmailPayload>): Promise<{ id: string }> {
  const r = await fetch(`${BASE}/email/drafts`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ draftId, ...payload }),
  })
  if (!r.ok) return { id: draftId ?? `draft-${Date.now()}` }
  return r.json() as Promise<{ id: string }>
}

export async function fetchDrafts(): Promise<RelayEmail[]> {
  const r = await fetch(`${BASE}/email/drafts`, { headers: headers() })
  if (!r.ok) return []
  const data = await (r.json() as Promise<{ drafts: RelayEmail[] }>)
  return data.drafts ?? []
}

export async function deleteDraft(id: string): Promise<void> {
  await fetch(`${BASE}/email/drafts/${id}`, { method: 'DELETE', headers: headers() })
}
