/**
 * PRIVEX global state store (React context + reducer)
 * No sensitive data is stored in this module — only UI state and public metadata.
 * All private keys stay in IndexedDB via lib/crypto.ts
 */
import { createContext, useContext } from 'react'
import type { PrivexKeyBundle, PrivexPrivateKeys } from './crypto'

export type NavSection =
  | 'home'
  | 'messages'
  | 'calls'
  | 'email'
  | 'payments'
  | 'swap'
  | 'bridge'
  | 'vpn'
  | 'contacts'
  | 'identity'
  | 'security'
  | 'settings'
  | 'admin'

export type MessageType = 'text' | 'file' | 'voice' | 'image'

export interface LocalMessage {
  id: string
  from: string
  to: string           // wallet address for DMs, groupId for groups
  text: string         // decrypted locally, never sent to server
  timestamp: number
  pending?: boolean
  failed?: boolean
  type?: MessageType
  // File/voice metadata (decrypted locally)
  fileName?: string
  fileMime?: string
  fileSize?: number
  fileBlobUrl?: string // object URL for downloaded+decrypted file, never serialised
  voiceDuration?: number
  disappearsAt?: number // unix ms — 0 = no expiry
  reactions?: Record<string, string[]> // emoji -> [addresses]
  deleted?: boolean
  groupId?: string
}

export interface Contact {
  address: string
  handle: string
  publicKey: string
  addedAt: number
  verified: boolean
  blocked?: boolean
}

export interface Group {
  id: string
  name: string
  members: string[]      // wallet addresses
  memberKeys: Record<string, string> // address -> messagingPublicKey
  createdAt: number
  createdBy: string
  avatar?: string
}

export interface LocalEmail {
  id: string
  from: string            // wallet address or @privex handle
  to: string
  subject: string         // decrypted locally
  body: string            // decrypted locally
  timestamp: number
  folder: EmailFolder
  read: boolean
  hasAttachment: boolean
  attachmentName?: string
  attachmentSize?: number
  attachmentBlobUrl?: string
  disappearsAt?: number
  starred: boolean
  spam: boolean
  draft?: boolean
  // raw ciphertext fields (what the server stores)
  subjectCipher?: string
  bodyCipher?: string
}

export type EmailFolder = 'inbox' | 'sent' | 'drafts' | 'starred' | 'trash' | 'spam'

export interface ActivityEvent {
  id: string
  type: string
  detail: string
  timestamp: number
  icon: 'message' | 'call' | 'email' | 'payment' | 'vpn' | 'identity' | 'security' | 'swap' | 'bridge'
}

export interface PrivexState {
  // Auth
  isAuthenticated: boolean
  authToken: string | null
  // Identity
  privexHandle: string | null
  keyBundle: PrivexKeyBundle | null
  privKeys: PrivexPrivateKeys | null
  // UI
  activeSection: NavSection
  sidebarOpen: boolean
  // Messaging
  messages: Record<string, LocalMessage[]>   // peerAddress or groupId -> messages
  activeConversation: string | null
  contacts: Contact[]
  groups: Group[]
  // Email
  emails: LocalEmail[]
  emailDrafts: Partial<LocalEmail>[]
  // Services
  vpnConnected: boolean
  vpnLocation: string
  // Backend
  backendOnline: boolean
  // Activity feed
  activityFeed: ActivityEvent[]
}

export const initialState: PrivexState = {
  isAuthenticated: false,
  authToken: null,
  privexHandle: null,
  keyBundle: null,
  privKeys: null,
  activeSection: 'home',
  sidebarOpen: true,
  messages: {},
  activeConversation: null,
  contacts: [],
  groups: [],
  emails: [],
  emailDrafts: [],
  vpnConnected: false,
  vpnLocation: 'Auto',
  backendOnline: false,
  activityFeed: [],
}

export type PrivexAction =
  | { type: 'AUTH_SUCCESS'; token: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'SET_IDENTITY'; handle: string; keyBundle: PrivexKeyBundle; privKeys: PrivexPrivateKeys }
  | { type: 'SET_SECTION'; section: NavSection }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_ACTIVE_CONVERSATION'; address: string | null }
  | { type: 'ADD_MESSAGE'; peer: string; message: LocalMessage }
  | { type: 'SET_MESSAGES'; peer: string; messages: LocalMessage[] }
  | { type: 'DELETE_MESSAGE'; peer: string; id: string }
  | { type: 'REACT_MESSAGE'; peer: string; id: string; emoji: string; addr: string }
  | { type: 'ADD_CONTACT'; contact: Contact }
  | { type: 'REMOVE_CONTACT'; address: string }
  | { type: 'BLOCK_CONTACT'; address: string; blocked: boolean }
  | { type: 'ADD_GROUP'; group: Group }
  | { type: 'REMOVE_GROUP'; id: string }
  | { type: 'SET_VPN'; connected: boolean; location?: string }
  | { type: 'SET_BACKEND_ONLINE'; online: boolean }
  | { type: 'ADD_EMAIL'; email: LocalEmail }
  | { type: 'SET_EMAILS'; emails: LocalEmail[] }
  | { type: 'UPDATE_EMAIL'; id: string; patch: Partial<LocalEmail> }
  | { type: 'DELETE_EMAIL'; id: string }
  | { type: 'SAVE_DRAFT'; draft: Partial<LocalEmail> }
  | { type: 'DELETE_DRAFT'; idx: number }
  | { type: 'ADD_ACTIVITY'; event: ActivityEvent }

export function privexReducer(state: PrivexState, action: PrivexAction): PrivexState {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return { ...state, isAuthenticated: true, authToken: action.token }
    case 'AUTH_LOGOUT':
      return { ...initialState, backendOnline: state.backendOnline }
    case 'SET_IDENTITY':
      return { ...state, privexHandle: action.handle, keyBundle: action.keyBundle, privKeys: action.privKeys }
    case 'SET_SECTION':
      return { ...state, activeSection: action.section }
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen }
    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversation: action.address }
    case 'ADD_MESSAGE': {
      const prev = state.messages[action.peer] ?? []
      // Deduplicate by id
      if (prev.find(m => m.id === action.message.id)) return state
      return { ...state, messages: { ...state.messages, [action.peer]: [...prev, action.message] } }
    }
    case 'SET_MESSAGES':
      return { ...state, messages: { ...state.messages, [action.peer]: action.messages } }
    case 'DELETE_MESSAGE': {
      const prev = state.messages[action.peer] ?? []
      return { ...state, messages: { ...state.messages, [action.peer]: prev.map(m => m.id === action.id ? { ...m, deleted: true, text: 'Message deleted' } : m) } }
    }
    case 'REACT_MESSAGE': {
      const prev = state.messages[action.peer] ?? []
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.peer]: prev.map(m => {
            if (m.id !== action.id) return m
            const reacts = { ...(m.reactions ?? {}) }
            const users = reacts[action.emoji] ?? []
            reacts[action.emoji] = users.includes(action.addr)
              ? users.filter(u => u !== action.addr)
              : [...users, action.addr]
            return { ...m, reactions: reacts }
          })
        }
      }
    }
    case 'ADD_CONTACT':
      return { ...state, contacts: [...state.contacts.filter(c => c.address !== action.contact.address), action.contact] }
    case 'REMOVE_CONTACT':
      return { ...state, contacts: state.contacts.filter(c => c.address !== action.address) }
    case 'BLOCK_CONTACT':
      return { ...state, contacts: state.contacts.map(c => c.address === action.address ? { ...c, blocked: action.blocked } : c) }
    case 'ADD_GROUP':
      return { ...state, groups: [...state.groups.filter(g => g.id !== action.group.id), action.group] }
    case 'REMOVE_GROUP':
      return { ...state, groups: state.groups.filter(g => g.id !== action.id) }
    case 'SET_VPN':
      return { ...state, vpnConnected: action.connected, vpnLocation: action.location ?? state.vpnLocation }
    case 'SET_BACKEND_ONLINE':
      return { ...state, backendOnline: action.online }
    // Email actions
    case 'ADD_EMAIL':
      if (state.emails.find(e => e.id === action.email.id)) return state
      return { ...state, emails: [action.email, ...state.emails] }
    case 'SET_EMAILS':
      return { ...state, emails: action.emails }
    case 'UPDATE_EMAIL':
      return { ...state, emails: state.emails.map(e => e.id === action.id ? { ...e, ...action.patch } : e) }
    case 'DELETE_EMAIL':
      return { ...state, emails: state.emails.filter(e => e.id !== action.id) }
    case 'SAVE_DRAFT':
      return { ...state, emailDrafts: [...state.emailDrafts, action.draft] }
    case 'DELETE_DRAFT':
      return { ...state, emailDrafts: state.emailDrafts.filter((_, i) => i !== action.idx) }
    case 'ADD_ACTIVITY':
      return { ...state, activityFeed: [action.event, ...state.activityFeed.slice(0, 49)] }
    default:
      return state
  }
}

export interface PrivexContextValue {
  state: PrivexState
  dispatch: React.Dispatch<PrivexAction>
}

export const PrivexContext = createContext<PrivexContextValue | null>(null)

export function usePrivex(): PrivexContextValue {
  const ctx = useContext(PrivexContext)
  if (!ctx) throw new Error('usePrivex must be used within PrivexProvider')
  return ctx
}
