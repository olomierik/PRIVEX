/**
 * PRIVEX Supabase client
 * Encrypted relay — server only ever stores ciphertext.
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[PRIVEX] Supabase env vars missing — relay will be unavailable')
}

export const supabase = createClient(SUPABASE_URL ?? '', SUPABASE_ANON_KEY ?? '', {
  realtime: { params: { eventsPerSecond: 10 } },
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
