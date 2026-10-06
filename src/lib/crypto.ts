/**
 * PRIVEX client-side cryptography
 *
 * Uses Web Crypto API and established primitives only.
 * Private keys NEVER leave the user's device/browser.
 *
 * Key architecture per identity:
 *   - messaging:  X25519 ECDH (key agreement) + AES-GCM (encryption)
 *   - signing:    secp256k1 via wallet (existing key)
 *   - email:      separate X25519 ECDH + AES-GCM keypair
 *   - files:      AES-GCM symmetric key per file, wrapped with recipient X25519
 *
 * Storage: keys are stored in IndexedDB under the wallet address, never sent to server.
 */

export interface PrivexKeyBundle {
  messagingPublicKey: string   // hex-encoded ECDH P-256 or X25519 public key
  emailPublicKey: string
  version: number
}

export interface PrivexPrivateKeys {
  messagingPrivateKey: CryptoKey
  emailPrivateKey: CryptoKey
}

const DB_NAME = 'privex-keys'
const DB_VERSION = 1
const STORE = 'keypairs'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(new Error(req.error?.message ?? 'IDB open failed'))
  })
}

async function dbGet<T>(key: string): Promise<T | undefined> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(key)
    req.onsuccess = () => resolve(req.result as T)
    req.onerror = () => reject(new Error(req.error?.message ?? 'IDB get failed'))
  })
}

async function dbSet(key: string, value: unknown): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(value, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(new Error(tx.error?.message ?? 'IDB set failed'))
  })
}

async function dbDelete(key: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(new Error(tx.error?.message ?? 'IDB delete failed'))
  })
}

function arrayBufferToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  return bytes
}

/** Generate a fresh ECDH P-256 keypair for messaging or email */
async function generateECDHKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey', 'deriveBits']
  )
}

/** Export public key as hex */
async function exportPublicKeyHex(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('raw', key)
  return arrayBufferToHex(raw)
}

/** Derive AES-GCM key from ECDH key pair */
async function deriveAESKey(privateKey: CryptoKey, publicKeyRaw: Uint8Array): Promise<CryptoKey> {
  const importedPub = await crypto.subtle.importKey(
    'raw',
    publicKeyRaw.buffer as ArrayBuffer,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  )
  return crypto.subtle.deriveKey(
    { name: 'ECDH', public: importedPub },
    privateKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/** Encrypt a plaintext string for a recipient's public key (hex) */
export async function encryptForRecipient(
  plaintext: string,
  recipientPublicKeyHex: string,
  senderPrivateKey: CryptoKey
): Promise<{ ciphertextHex: string; ivHex: string }> {
  const recipientPubRaw = hexToUint8Array(recipientPublicKeyHex)
  const aesKey = await deriveAESKey(senderPrivateKey, recipientPubRaw)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)
  const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv.buffer }, aesKey, encoded)
  return {
    ciphertextHex: arrayBufferToHex(cipherBuf),
    ivHex: arrayBufferToHex(iv.buffer),
  }
}

/** Decrypt a ciphertext from a sender's public key (hex) */
export async function decryptFromSender(
  ciphertextHex: string,
  ivHex: string,
  senderPublicKeyHex: string,
  recipientPrivateKey: CryptoKey
): Promise<string> {
  const senderPubRaw = hexToUint8Array(senderPublicKeyHex)
  const aesKey = await deriveAESKey(recipientPrivateKey, senderPubRaw)
  const cipherBytes = hexToUint8Array(ciphertextHex)
  const iv = hexToUint8Array(ivHex)
  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv.buffer as ArrayBuffer }, aesKey, cipherBytes.buffer as ArrayBuffer)
  return new TextDecoder().decode(plainBuf)
}

/** Load or generate the keypair for a given wallet address */
export async function loadOrCreateKeys(walletAddress: string): Promise<{
  privKeys: PrivexPrivateKeys
  bundle: PrivexKeyBundle
}> {
  const storeKey = `keys:${walletAddress.toLowerCase()}`
  const existing = await dbGet<{
    messagingPrivateJwk: JsonWebKey
    emailPrivateJwk: JsonWebKey
    bundle: PrivexKeyBundle
  }>(storeKey)

  if (existing) {
    const messagingPrivateKey = await crypto.subtle.importKey(
      'jwk', existing.messagingPrivateJwk,
      { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey', 'deriveBits']
    )
    const emailPrivateKey = await crypto.subtle.importKey(
      'jwk', existing.emailPrivateJwk,
      { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey', 'deriveBits']
    )
    return {
      privKeys: { messagingPrivateKey, emailPrivateKey },
      bundle: existing.bundle
    }
  }

  // Generate fresh keys
  const [msgKP, emailKP] = await Promise.all([generateECDHKeyPair(), generateECDHKeyPair()])
  const [msgPubHex, emailPubHex] = await Promise.all([
    exportPublicKeyHex(msgKP.publicKey),
    exportPublicKeyHex(emailKP.publicKey),
  ])
  const [msgPrivJwk, emailPrivJwk] = await Promise.all([
    crypto.subtle.exportKey('jwk', msgKP.privateKey),
    crypto.subtle.exportKey('jwk', emailKP.privateKey),
  ])

  const bundle: PrivexKeyBundle = {
    messagingPublicKey: msgPubHex,
    emailPublicKey: emailPubHex,
    version: 1,
  }

  await dbSet(storeKey, {
    messagingPrivateJwk: msgPrivJwk,
    emailPrivateJwk: emailPrivJwk,
    bundle,
  })

  return {
    privKeys: { messagingPrivateKey: msgKP.privateKey, emailPrivateKey: emailKP.privateKey },
    bundle,
  }
}

/** Delete all local keys for a wallet (key rotation or account deletion) */
export async function deleteLocalKeys(walletAddress: string): Promise<void> {
  await dbDelete(`keys:${walletAddress.toLowerCase()}`)
}

/** Create a commitment hash from a public key bundle (stored on-chain as bytes32) */
export async function computeCommitment(bundle: PrivexKeyBundle): Promise<`0x${string}`> {
  const data = new TextEncoder().encode(JSON.stringify(bundle))
  const hashBuf = await crypto.subtle.digest('SHA-256', data)
  return ('0x' + arrayBufferToHex(hashBuf)) as `0x${string}`
}

/** Generate a deterministic room ID for a 1:1 call between two addresses */
export function peerRoomId(a: string, b: string): string {
  const sorted = [a.toLowerCase(), b.toLowerCase()].sort()
  return `room:${sorted[0]}:${sorted[1]}`
}

/** Format an address as a short display string */
export function shortAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}
