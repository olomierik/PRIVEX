/**
 * PRIVEX Relay Server
 * 
 * Responsibilities:
 * - Wallet signature authentication (never stores private keys)
 * - Encrypted message relay (never receives plaintext)
 * - Identity/handle registry cache
 * - WebRTC signaling for encrypted calls
 * - Rate limiting and session management
 *
 * Privacy: this server only receives ciphertext. It has no ability to decrypt
 * messages, emails, call content, or any private user data.
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { createHmac, randomBytes } from 'node:crypto'
import { verifyMessage, getAddress } from 'viem'

const PORT = 3001
const CHALLENGE_TTL_MS = 5 * 60 * 1000 // 5 min
const SESSION_TTL_MS = 24 * 60 * 60 * 1000 // 24 h
const MAX_PAYLOAD_BYTES = 64 * 1024 // 64 KB per ciphertext message

// --- In-memory stores (replace with encrypted DB for production) ---
const challenges = new Map<string, { nonce: string; issuedAt: number }>()
const sessions = new Map<string, { address: string; createdAt: number }>()

// File relay: opaque encrypted blobs — never decoded here
const fileStore = new Map<string, { owner: string; data: Buffer; size: number; ts: number }>()
const MAX_FILE_BYTES_RELAY = 12 * 1024 * 1024 // 12 MB

// Email relay: encrypted ciphertext only
const emailBoxes = new Map<string, Array<{
  id: string; from: string; to: string
  subjectCipher: string; bodyCipher: string
  subjectIv: string; bodyIv: string; senderPubkey: string
  attachmentId?: string; attachmentName?: string; attachmentSize?: number
  timestamp: number; disappearsAt?: number
}>>()

// Draft relay: encrypted ciphertext only
const draftBoxes = new Map<string, Array<{
  id: string; owner: string
  subjectCipher?: string; bodyCipher?: string
  subjectIv?: string; bodyIv?: string; senderPubkey?: string
  toCipher?: string; timestamp: number
}>>()

// Encrypted messages: stored as opaque ciphertext, never decrypted here
// mailbox: address -> [ { from, ciphertextHex, timestamp, id } ]
const mailboxes = new Map<string, Array<{
  id: string
  from: string
  to: string
  ciphertextHex: string
  timestamp: number
  epubkeyHex: string   // ephemeral X25519 public key for recipient to derive shared secret
}>>()

// WebRTC signaling rooms
const signalingRooms = new Map<string, Array<{ from: string; type: string; payload: string; ts: number }>>()

// Rate limiting: address -> [timestamp]
const rateLimits = new Map<string, number[]>()

// --- Helpers ---
function rateLimit(address: string, maxPerMinute = 60): boolean {
  const now = Date.now()
  const prev = rateLimits.get(address) ?? []
  const recent = prev.filter(t => now - t < 60_000)
  if (recent.length >= maxPerMinute) return false
  recent.push(now)
  rateLimits.set(address, recent)
  return true
}

function generateId(): string {
  return randomBytes(16).toString('hex')
}

function cors(res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

function json(res: ServerResponse, statusCode: number, data: unknown) {
  cors(res)
  res.writeHead(statusCode, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

async function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    let size = 0
    req.on('data', chunk => {
      size += chunk.length
      if (size > MAX_PAYLOAD_BYTES) {
        req.destroy()
        reject(new Error('Payload too large'))
        return
      }
      body += chunk
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function getSession(req: IncomingMessage): string | null {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.slice(7)
  const session = sessions.get(token)
  if (!session) return null
  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    sessions.delete(token)
    return null
  }
  return session.address
}

// --- Route handlers ---
async function handleChallenge(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' })
  const url = new URL(req.url!, `http://localhost:${PORT}`)
  const address = url.searchParams.get('address')
  if (!address) return json(res, 400, { error: 'Missing address' })

  let normalized: string
  try { normalized = getAddress(address) } catch { return json(res, 400, { error: 'Invalid address' }) }

  const nonce = randomBytes(32).toString('hex')
  challenges.set(normalized, { nonce, issuedAt: Date.now() })
  const message = `PRIVEX Authentication\n\nWallet: ${normalized}\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}\n\nBy signing this message you authenticate your PRIVEX identity. This request does not initiate a blockchain transaction or cost any gas.`
  json(res, 200, { nonce, message })
}

async function handleVerify(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })
  let body: { address: string; signature: string; message: string }
  try { body = JSON.parse(await readBody(req)) } catch { return json(res, 400, { error: 'Invalid JSON' }) }

  const { address, signature, message } = body
  if (!address || !signature || !message) return json(res, 400, { error: 'Missing fields' })

  let normalized: string
  try { normalized = getAddress(address) } catch { return json(res, 400, { error: 'Invalid address' }) }

  const stored = challenges.get(normalized)
  if (!stored || Date.now() - stored.issuedAt > CHALLENGE_TTL_MS) {
    return json(res, 401, { error: 'Challenge expired or not found' })
  }
  challenges.delete(normalized)

  // Verify the signature
  try {
    const valid = await verifyMessage({ address: normalized as `0x${string}`, message, signature: signature as `0x${string}` })
    if (!valid) return json(res, 401, { error: 'Invalid signature' })
  } catch {
    return json(res, 401, { error: 'Signature verification failed' })
  }

  const token = generateId() + generateId()
  sessions.set(token, { address: normalized, createdAt: Date.now() })
  json(res, 200, { token, address: normalized })
}

async function handleSendMessage(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })
  const sender = getSession(req)
  if (!sender) return json(res, 401, { error: 'Unauthorized' })
  if (!rateLimit(sender, 120)) return json(res, 429, { error: 'Rate limit exceeded' })

  let body: { to: string; ciphertextHex: string; epubkeyHex: string }
  try { body = JSON.parse(await readBody(req)) } catch { return json(res, 400, { error: 'Invalid JSON' }) }

  const { to, ciphertextHex, epubkeyHex } = body
  if (!to || !ciphertextHex || !epubkeyHex) return json(res, 400, { error: 'Missing fields' })

  let toNorm: string
  try { toNorm = getAddress(to) } catch { return json(res, 400, { error: 'Invalid recipient' }) }

  // Validate ciphertext is hex (content-agnostic: we never decode it)
  if (!/^[0-9a-f]+$/i.test(ciphertextHex)) return json(res, 400, { error: 'Invalid ciphertext encoding' })

  const id = generateId()
  const box = mailboxes.get(toNorm) ?? []
  box.push({ id, from: sender, to: toNorm, ciphertextHex, timestamp: Date.now(), epubkeyHex })
  // Keep last 200 messages per mailbox
  if (box.length > 200) box.splice(0, box.length - 200)
  mailboxes.set(toNorm, box)

  json(res, 200, { id, timestamp: Date.now() })
}

async function handleGetMessages(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' })
  const recipient = getSession(req)
  if (!recipient) return json(res, 401, { error: 'Unauthorized' })

  const url = new URL(req.url!, `http://localhost:${PORT}`)
  const since = parseInt(url.searchParams.get('since') ?? '0', 10)
  const box = (mailboxes.get(recipient) ?? []).filter(m => m.timestamp > since)
  json(res, 200, { messages: box })
}

async function handleDeleteMessage(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'DELETE') return json(res, 405, { error: 'Method not allowed' })
  const addr = getSession(req)
  if (!addr) return json(res, 401, { error: 'Unauthorized' })

  const url = new URL(req.url!, `http://localhost:${PORT}`)
  const id = url.pathname.split('/').pop()!
  const box = mailboxes.get(addr)
  if (box) {
    const idx = box.findIndex(m => m.id === id && (m.to === addr || m.from === addr))
    if (idx >= 0) box.splice(idx, 1)
  }
  json(res, 200, { ok: true })
}

// WebRTC signaling — only passes SDP/ICE between peers, no call content
async function handleSignal(req: IncomingMessage, res: ServerResponse) {
  const caller = getSession(req)
  if (!caller) return json(res, 401, { error: 'Unauthorized' })

  if (req.method === 'POST') {
    let body: { roomId: string; type: string; payload: string }
    try { body = JSON.parse(await readBody(req)) } catch { return json(res, 400, { error: 'Invalid JSON' }) }
    const { roomId, type, payload } = body
    if (!roomId || !type || !payload) return json(res, 400, { error: 'Missing fields' })

    const room = signalingRooms.get(roomId) ?? []
    // Purge old signals (>60 s)
    const recent = room.filter(s => Date.now() - s.ts < 60_000)
    recent.push({ from: caller, type, payload, ts: Date.now() })
    if (recent.length > 50) recent.splice(0, recent.length - 50)
    signalingRooms.set(roomId, recent)
    return json(res, 200, { ok: true })
  }

  if (req.method === 'GET') {
    const url = new URL(req.url!, `http://localhost:${PORT}`)
    const roomId = url.searchParams.get('roomId')
    const since = parseInt(url.searchParams.get('since') ?? '0', 10)
    if (!roomId) return json(res, 400, { error: 'Missing roomId' })
    const room = (signalingRooms.get(roomId) ?? []).filter(s => s.ts > since && s.from !== caller)
    return json(res, 200, { signals: room })
  }

  json(res, 405, { error: 'Method not allowed' })
}

async function handleLogout(req: IncomingMessage, res: ServerResponse) {
  const auth = req.headers.authorization
  if (auth?.startsWith('Bearer ')) sessions.delete(auth.slice(7))
  json(res, 200, { ok: true })
}

function handleHealth(_req: IncomingMessage, res: ServerResponse) {
  json(res, 200, {
    status: 'ok',
    sessions: sessions.size,
    timestamp: Date.now(),
  })
}

// ─── File relay handlers (Phase 2) ──────────────────────────────────────────

async function handleFileUpload(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })
  const owner = getSession(req)
  if (!owner) return json(res, 401, { error: 'Unauthorized' })
  if (!rateLimit(owner, 30)) return json(res, 429, { error: 'Rate limit exceeded' })

  const chunks: Buffer[] = []
  let size = 0
  await new Promise<void>((resolve, reject) => {
    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > MAX_FILE_BYTES_RELAY) { req.destroy(); reject(new Error('File too large')); return }
      chunks.push(chunk)
    })
    req.on('end', resolve)
    req.on('error', reject)
  })

  const data = Buffer.concat(chunks)
  const fileId = generateId()
  fileStore.set(fileId, { owner, data, size: data.length, ts: Date.now() })

  // Prune old files > 1h
  const now = Date.now()
  fileStore.forEach((v, k) => { if (now - v.ts > 3_600_000) fileStore.delete(k) })

  json(res, 200, { fileId })
}

async function handleFileDownload(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' })
  const addr = getSession(req)
  if (!addr) return json(res, 401, { error: 'Unauthorized' })

  const url = new URL(req.url!, `http://localhost:${PORT}`)
  const fileId = url.pathname.split('/').pop()!
  const file = fileStore.get(fileId)
  if (!file) return json(res, 404, { error: 'File not found or expired' })

  cors(res)
  res.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Content-Length': file.size })
  res.end(file.data)
}

// ─── Email relay handlers (Phase 3) ─────────────────────────────────────────

async function handleSendEmail(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })
  const sender = getSession(req)
  if (!sender) return json(res, 401, { error: 'Unauthorized' })
  if (!rateLimit(sender, 60)) return json(res, 429, { error: 'Rate limit exceeded' })

  let body: {
    to: string; subjectCipher: string; bodyCipher: string
    subjectIv: string; bodyIv: string; senderPubkey: string
    attachmentId?: string; attachmentName?: string; attachmentSize?: number; disappearsAt?: number
  }
  try { body = JSON.parse(await readBody(req)) } catch { return json(res, 400, { error: 'Invalid JSON' }) }

  const { to, subjectCipher, bodyCipher, subjectIv, bodyIv, senderPubkey } = body
  if (!to || !subjectCipher || !bodyCipher || !subjectIv || !bodyIv || !senderPubkey) {
    return json(res, 400, { error: 'Missing required fields' })
  }

  let toNorm: string
  try { toNorm = getAddress(to) } catch { return json(res, 400, { error: 'Invalid recipient' }) }

  const id = generateId()
  const box = emailBoxes.get(toNorm) ?? []
  box.push({
    id, from: sender, to: toNorm,
    subjectCipher, bodyCipher, subjectIv, bodyIv, senderPubkey,
    attachmentId: body.attachmentId, attachmentName: body.attachmentName,
    attachmentSize: body.attachmentSize, timestamp: Date.now(),
    disappearsAt: body.disappearsAt,
  })
  if (box.length > 500) box.splice(0, box.length - 500)
  emailBoxes.set(toNorm, box)

  // Also store in sender's sent box
  const sentBox = emailBoxes.get(`sent:${sender}`) ?? []
  sentBox.push({ id, from: sender, to: toNorm, subjectCipher, bodyCipher, subjectIv, bodyIv, senderPubkey, timestamp: Date.now() })
  emailBoxes.set(`sent:${sender}`, sentBox)

  json(res, 200, { id, timestamp: Date.now() })
}

async function handleGetEmails(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' })
  const addr = getSession(req)
  if (!addr) return json(res, 401, { error: 'Unauthorized' })

  const url = new URL(req.url!, `http://localhost:${PORT}`)
  const since = parseInt(url.searchParams.get('since') ?? '0', 10)
  const folder = url.searchParams.get('folder') ?? 'inbox'
  const key = folder === 'sent' ? `sent:${addr}` : addr
  const now = Date.now()

  const emails = (emailBoxes.get(key) ?? [])
    .filter(e => {
      if (e.timestamp <= since) return false
      if (e.disappearsAt && now > e.disappearsAt) return false
      return true
    })

  json(res, 200, { emails })
}

async function handleDeleteEmail(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'DELETE') return json(res, 405, { error: 'Method not allowed' })
  const addr = getSession(req)
  if (!addr) return json(res, 401, { error: 'Unauthorized' })

  const url = new URL(req.url!, `http://localhost:${PORT}`)
  const id = url.pathname.split('/').pop()!

  const box = emailBoxes.get(addr)
  if (box) {
    const idx = box.findIndex(e => e.id === id && (e.to === addr || e.from === addr))
    if (idx >= 0) box.splice(idx, 1)
  }
  json(res, 200, { ok: true })
}

async function handleDrafts(req: IncomingMessage, res: ServerResponse) {
  const addr = getSession(req)
  if (!addr) return json(res, 401, { error: 'Unauthorized' })

  if (req.method === 'GET') {
    const drafts = (draftBoxes.get(addr) ?? [])
    return json(res, 200, { drafts })
  }

  if (req.method === 'POST') {
    let body: { draftId?: string; subjectCipher?: string; bodyCipher?: string; subjectIv?: string; bodyIv?: string; senderPubkey?: string }
    try { body = JSON.parse(await readBody(req)) } catch { return json(res, 400, { error: 'Invalid JSON' }) }
    const drafts = draftBoxes.get(addr) ?? []
    const existing = body.draftId ? drafts.findIndex(d => d.id === body.draftId) : -1
    const draft = { id: body.draftId ?? generateId(), owner: addr, ...body, timestamp: Date.now() }
    if (existing >= 0) drafts[existing] = draft
    else drafts.push(draft)
    if (drafts.length > 50) drafts.splice(0, drafts.length - 50)
    draftBoxes.set(addr, drafts)
    return json(res, 200, { id: draft.id })
  }

  if (req.method === 'DELETE') {
    const url = new URL(req.url!, `http://localhost:${PORT}`)
    const id = url.pathname.split('/').pop()!
    const drafts = draftBoxes.get(addr) ?? []
    draftBoxes.set(addr, drafts.filter(d => d.id !== id))
    return json(res, 200, { ok: true })
  }

  json(res, 405, { error: 'Method not allowed' })
}

// --- Router ---
const server = createServer(async (req, res) => {
  cors(res)
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

  const url = new URL(req.url!, `http://localhost:${PORT}`)
  const path = url.pathname

  try {
    if (path === '/api/health') return handleHealth(req, res)
    if (path === '/api/auth/challenge') return handleChallenge(req, res)
    if (path === '/api/auth/verify') return handleVerify(req, res)
    if (path === '/api/auth/logout') return handleLogout(req, res)
    if (path === '/api/messages' && req.method === 'POST') return handleSendMessage(req, res)
    if (path === '/api/messages' && req.method === 'GET') return handleGetMessages(req, res)
    if (path.startsWith('/api/messages/') && req.method === 'DELETE') return handleDeleteMessage(req, res)
    if (path === '/api/signal' || path.startsWith('/api/signal')) return handleSignal(req, res)
    // File relay (Phase 2)
    if (path === '/api/files' && req.method === 'POST') return handleFileUpload(req, res)
    if (path.startsWith('/api/files/') && req.method === 'GET') return handleFileDownload(req, res)
    // Email relay (Phase 3)
    if (path === '/api/email' && req.method === 'POST') return handleSendEmail(req, res)
    if (path === '/api/email' && req.method === 'GET') return handleGetEmails(req, res)
    if (path.startsWith('/api/email/') && !path.includes('/drafts') && req.method === 'DELETE') return handleDeleteEmail(req, res)
    if (path.startsWith('/api/email/drafts')) return handleDrafts(req, res)
    if (path === '/api/email/drafts') return handleDrafts(req, res)
    json(res, 404, { error: 'Not found' })
  } catch (err) {
    console.error('[PRIVEX relay error]', err)
    json(res, 500, { error: 'Internal server error' })
  }
})

server.listen(PORT, () => {
  console.log(`[PRIVEX relay] running on http://localhost:${PORT}`)
})
