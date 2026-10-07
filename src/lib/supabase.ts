// oxlint-disable typescript/no-unsafe-member-access
/**
 * PRIVEX Supabase client
 * Encrypted relay — server only ever stores ciphertext.
 * Sends x-wallet-address header on every request so RLS policies
 * can enforce per-wallet row visibility without a JWT.
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[PRIVEX] Supabase env vars missing — relay will be unavailable')
}

// Wallet address injected by relay.ts after wallet connects
let _walletHeader: string = ''

export function setSupabaseWallet(addr: string | null) {
  _walletHeader = addr ? addr.toLowerCase() : ''
  // Rebuild the client's global headers so all subsequent requests carry the address
  // @supabase/supabase-js reads headers at request time via the storage key, so
  // we patch the internal headers object directly.
  // oxlint-disable-next-line typescript/no-unsafe-assignment, typescript/no-explicit-any
  const anyClient = supabase as any
  if (anyClient.rest?.headers) {
    if (_walletHeader) {
      // oxlint-disable-next-line typescript/no-unsafe-member-access
      anyClient.rest.headers['x-wallet-address'] = _walletHeader
    } else {
      // oxlint-disable-next-line typescript/no-unsafe-member-access
      delete anyClient.rest.headers['x-wallet-address']
    }
  }
}

export const supabase = createClient(SUPABASE_URL ?? '', SUPABASE_ANON_KEY ?? '', {
  realtime: { params: { eventsPerSecond: 10 } },
  global: {
    // Dynamic header injected at build time and patched at runtime via setSupabaseWallet
    headers: {},
  },
})

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DbMessage {
  id: string
  from_addr: string
  to_addr: string
  ciphertext: string
  epubkey: string
  created_at: number
  disappears_at: number | null
}

export interface DbSignal {
  id: string
  room_id: string
  from_addr: string
  type: string
  payload: string
  created_at: number
}

export interface DbEmail {
  id: string
  from_addr: string
  to_addr: string
  subject_cipher: string
  body_cipher: string
  subject_iv: string
  body_iv: string
  sender_pubkey: string
  attachment_id?: string
  attachment_name?: string
  attachment_size?: number
  created_at: number
  disappears_at?: number
  is_draft: boolean
}

export interface DbPubkey {
  wallet_addr: string
  pubkey_hex: string
  updated_at: number
}
