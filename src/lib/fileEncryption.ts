/**
 * PRIVEX encrypted file handling (Phase 2)
 *
 * Per-file AES-GCM keys, wrapped with recipient's ECDH public key.
 * Files are encrypted entirely on the client. The server only ever
 * stores and relays ciphertext blobs — it never sees file contents.
 *
 * Flow:
 *   Sender:
 *     1. Generate random 256-bit AES-GCM file key (FK)
 *     2. Encrypt file bytes with FK -> ciphertext blob
 *     3. ECDH-derive shared secret with recipient's messaging pubkey
 *     4. Wrap FK with shared AES-GCM key -> wrappedFK
 *     5. Send ciphertext blob + wrappedFK + sender pubkey hex to relay
 *
 *   Recipient:
 *     1. ECDH-derive same shared secret using sender pubkey
 *     2. Unwrap FK
 *     3. Decrypt file blob with FK
 */

function buf2hex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function hex2buf(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) out[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  return out
}

export interface EncryptedFilePacket {
  /** hex-encoded encrypted file bytes (AES-GCM) */
  ciphertextHex: string
  /** hex IV for the file ciphertext */
  fileIvHex: string
  /** hex-encoded wrapped (encrypted) file key */
  wrappedKeyHex: string
  /** hex IV for the wrapped key */
  wrapIvHex: string
  /** sender's ECDH public key (hex) used to derive shared secret */
  senderEpubkeyHex: string
  /** original filename */
  filename: string
  /** MIME type */
  mimeType: string
  /** original size in bytes */
  size: number
}

/** Derive AES-GCM wrapping key from ECDH P-256 keypair */
async function deriveWrapKey(privateKey: CryptoKey, peerPublicKeyHex: string): Promise<CryptoKey> {
  const peerRaw = hex2buf(peerPublicKeyHex)
  const peerKey = await crypto.subtle.importKey(
    'raw', peerRaw.buffer as ArrayBuffer,
    { name: 'ECDH', namedCurve: 'P-256' }, false, []
  )
  return crypto.subtle.deriveKey(
    { name: 'ECDH', public: peerKey },
    privateKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['wrapKey', 'unwrapKey']
  )
}

/**
 * Encrypt a File for a recipient.
 * @param file - the File to encrypt
 * @param recipientPubkeyHex - recipient's ECDH P-256 public key (hex)
 * @param senderPrivateKey - sender's ECDH P-256 private key (for key agreement)
 * @param senderPublicKeyHex - sender's ECDH P-256 public key (hex), sent to relay so recipient can derive shared secret
 */
export async function encryptFile(
  file: File,
  recipientPubkeyHex: string,
  senderPrivateKey: CryptoKey,
  senderPublicKeyHex: string
): Promise<EncryptedFilePacket> {
  // 1. Generate random per-file AES-GCM key
  const fileKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 }, true, ['encrypt']
  )

  // 2. Encrypt file bytes with the file key
  const fileBytes = await file.arrayBuffer()
  const fileIv = crypto.getRandomValues(new Uint8Array(12))
  const cipherBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: fileIv.buffer },
    fileKey,
    fileBytes
  )

  // 3. Derive wrap key from sender priv + recipient pub
  const wrapKey = await deriveWrapKey(senderPrivateKey, recipientPubkeyHex)

  // 4. Wrap (encrypt) the file key
  const wrapIv = crypto.getRandomValues(new Uint8Array(12))
  const wrappedKeyBuf = await crypto.subtle.wrapKey('raw', fileKey, wrapKey, {
    name: 'AES-GCM', iv: wrapIv.buffer
  })

  return {
    ciphertextHex: buf2hex(cipherBuf),
    fileIvHex: buf2hex(fileIv.buffer),
    wrappedKeyHex: buf2hex(wrappedKeyBuf),
    wrapIvHex: buf2hex(wrapIv.buffer),
    senderEpubkeyHex: senderPublicKeyHex,
    filename: file.name,
    mimeType: file.type,
    size: file.size,
  }
}

/** Decrypt a received EncryptedFilePacket */
export async function decryptFile(
  packet: EncryptedFilePacket,
  senderPublicKeyHex: string,
  recipientPrivateKey: CryptoKey
): Promise<{ blob: Blob; filename: string }> {
  // 1. Derive wrap key from recipient priv + sender pub
  const wrapKey = await deriveWrapKey(recipientPrivateKey, senderPublicKeyHex)

  // 2. Unwrap file key
  const wrappedKeyBytes = hex2buf(packet.wrappedKeyHex)
  const wrapIv = hex2buf(packet.wrapIvHex)
  const fileKey = await crypto.subtle.unwrapKey(
    'raw',
    wrappedKeyBytes.buffer as ArrayBuffer,
    wrapKey,
    { name: 'AES-GCM', iv: wrapIv.buffer as ArrayBuffer },
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  )

  // 3. Decrypt file bytes
  const cipherBytes = hex2buf(packet.ciphertextHex)
  const fileIv = hex2buf(packet.fileIvHex)
  const plainBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fileIv.buffer as ArrayBuffer },
    fileKey,
    cipherBytes.buffer as ArrayBuffer
  )

  return {
    blob: new Blob([plainBuf], { type: packet.mimeType }),
    filename: packet.filename,
  }
}

/** Format file size for display */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Max file size: 10 MB */
export const MAX_FILE_BYTES = 10 * 1024 * 1024
