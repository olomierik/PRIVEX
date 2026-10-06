import { useState, useRef, useEffect } from 'react'
import {
  Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Monitor,
  Lock, AlertTriangle, Users, PhoneMissed, ChevronDown, Check
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { usePrivex } from '../../lib/store'
import { peerRoomId, shortAddress } from '../../lib/crypto'
import { postSignal, subscribeToSignals } from '../../lib/relay'
import { useAccount } from 'wagmi'

type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended'
type CallMode = 'voice' | 'video'

interface ParticipantStream {
  address: string
  stream: MediaStream
  videoRef: React.RefObject<HTMLVideoElement>
}

function formatDuration(s: number): string {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
}

// Screen share helper
async function getDisplayStream(): Promise<MediaStream | null> {
  try {
    return await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
  } catch {
    return null
  }
}

export default function CallsSection() {
  const { state } = usePrivex()
  const { address } = useAccount()

  const [callState, setCallState] = useState<CallState>('idle')
  const [peerAddress, setPeerAddress] = useState('')
  const [callMode, setCallMode] = useState<CallMode>('voice')
  const [micMuted, setMicMuted] = useState(false)
  const [videoOff, setVideoOff] = useState(false)
  const [screenSharing, setScreenSharing] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [showContactPicker, setShowContactPicker] = useState(false)
  const [callHistory] = useState(() => {
    const now = Date.now()
    return [
      { id: '1', peer: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', mode: 'video', duration: 312, missed: false, ts: now - 3600000 },
      { id: '2', peer: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30', mode: 'voice', duration: 0, missed: true, ts: now - 86400000 },
    ]
  })

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const durationRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const unsubSignalRef = useRef<(() => void) | null>(null)

  const roomId = address && peerAddress ? peerRoomId(address, peerAddress) : ''

  const stopCall = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop())
    screenStreamRef.current?.getTracks().forEach(t => t.stop())
    pcRef.current?.close()
    if (durationRef.current) clearInterval(durationRef.current)
    unsubSignalRef.current?.()
    unsubSignalRef.current = null
    pcRef.current = null
    localStreamRef.current = null
    screenStreamRef.current = null
    setCallState('ended')
    setCallDuration(0)
    setScreenSharing(false)
    setTimeout(() => setCallState('idle'), 2500)
  }

  // Duration counter
  useEffect(() => {
    if (callState !== 'connected') return
    durationRef.current = setInterval(() => setCallDuration(d => d + 1), 1000)
    return () => { if (durationRef.current) clearInterval(durationRef.current) }
  }, [callState])

  const createPeerConnection = (): RTCPeerConnection => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ]
    })

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) void postSignal(roomId, 'ice', JSON.stringify(candidate))
    }

    pc.ontrack = ({ streams }) => {
      if (remoteVideoRef.current && streams[0]) {
        remoteVideoRef.current.srcObject = streams[0]
      }
      setCallState('connected')
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        stopCall()
      }
    }

    return pc
  }

  const startSignalListen = (currentRoomId: string) => {
    unsubSignalRef.current?.()
    unsubSignalRef.current = subscribeToSignals(currentRoomId, (sig) => {
      void (async () => {
        if (!pcRef.current) return
        const payload: unknown = JSON.parse(sig.payload)
        if (sig.type === 'offer') {
          await pcRef.current.setRemoteDescription(payload as RTCSessionDescriptionInit)
          const answer = await pcRef.current.createAnswer()
          await pcRef.current.setLocalDescription(answer)
          void postSignal(currentRoomId, 'answer', JSON.stringify(answer))
          setCallState('connected')
        } else if (sig.type === 'answer') {
          await pcRef.current.setRemoteDescription(payload as RTCSessionDescriptionInit)
        } else if (sig.type === 'ice') {
          await pcRef.current.addIceCandidate(payload as RTCIceCandidateInit)
        }
      })()
    })
  }

  const initiateCall = async () => {
    if (!peerAddress.match(/^0x[0-9a-fA-F]{40}$/)) { toast.error('Invalid address'); return }
    setCallState('calling')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callMode === 'video',
      })
      localStreamRef.current = stream
      if (localVideoRef.current) localVideoRef.current.srcObject = stream

      const pc = createPeerConnection()
      pcRef.current = pc
      stream.getTracks().forEach(t => pc.addTrack(t, stream))

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      void postSignal(roomId, 'offer', JSON.stringify(offer))
      startSignalListen(roomId)
    } catch {
      toast.error('Could not access camera/microphone')
      setCallState('idle')
    }
  }

  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = micMuted })
    setMicMuted(m => !m)
  }

  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = videoOff })
    setVideoOff(v => !v)
  }

  const toggleScreenShare = async () => {
    if (!pcRef.current) return

    if (screenSharing) {
      // Stop screen share, revert to camera
      screenStreamRef.current?.getTracks().forEach(t => t.stop())
      screenStreamRef.current = null
      const videoTrack = localStreamRef.current?.getVideoTracks()[0]
      if (videoTrack) {
        const sender = pcRef.current.getSenders().find(s => s.track?.kind === 'video')
        if (sender) await sender.replaceTrack(videoTrack)
      }
      setScreenSharing(false)
    } else {
      const displayStream = await getDisplayStream()
      if (!displayStream) return
      screenStreamRef.current = displayStream
      const screenTrack = displayStream.getVideoTracks()[0]
      const sender = pcRef.current.getSenders().find(s => s.track?.kind === 'video')
      if (sender && screenTrack) {
        await sender.replaceTrack(screenTrack)
        screenTrack.onended = () => { void toggleScreenShare() }
      }
      if (localVideoRef.current) localVideoRef.current.srcObject = displayStream
      setScreenSharing(true)
    }
  }

  const contactsWithKeys = state.contacts.filter(c => c.publicKey && !c.blocked)

  if (!address) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center space-y-2">
          <Phone size={32} style={{ color: 'var(--subtle)' }} className="mx-auto" />
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Connect your wallet to access encrypted calls</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">

      {/* Active call UI */}
      <AnimatePresence mode="wait">
        {callState !== 'idle' && callState !== 'ended' ? (
          <motion.div key="active-call" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-strong rounded-2xl overflow-hidden">
            {/* Video area */}
            <div className="relative bg-black" style={{ minHeight: '280px' }}>
              {callMode === 'video' ? (
                <>
                  <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-72 object-cover" />
                  <video
                    ref={localVideoRef} autoPlay muted playsInline
                    className="absolute bottom-3 right-3 w-28 h-20 object-cover rounded-xl"
                    style={{ border: '2px solid rgba(255,255,255,0.2)' }}
                  />
                </>
              ) : (
                <div className="flex items-center justify-center h-64 gap-4 flex-col">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold" style={{ background: 'var(--surface-strong)', color: 'var(--accent)' }}>
                    {shortAddress(peerAddress)[0]}
                  </div>
                  <div className="text-sm font-medium display" style={{ color: 'var(--ink)' }}>{shortAddress(peerAddress)}</div>
                </div>
              )}

              {/* Status overlay */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 glass px-2.5 py-1.5 rounded-full">
                {callState === 'calling' ? (
                  <><div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--warning)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--warning)' }}>Calling...</span></>
                ) : callState === 'connected' ? (
                  <><div className="w-1.5 h-1.5 rounded-full secure-pulse" style={{ background: 'var(--secure)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--secure)' }}>{formatDuration(callDuration)}</span></>
                ) : null}
              </div>

              {/* E2E badge */}
              <div className="absolute top-3 right-3 flex items-center gap-1 glass px-2 py-1 rounded-full">
                <Lock size={9} style={{ color: 'var(--secure)' }} />
                <span className="text-xs" style={{ color: 'var(--secure)' }}>E2E</span>
              </div>
            </div>

            {/* Controls */}
            <div className="px-5 py-4 flex items-center justify-center gap-3">
              <button
                onClick={toggleMic}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                style={{ background: micMuted ? 'var(--danger)' : 'var(--surface-strong)' }}
                title={micMuted ? 'Unmute' : 'Mute'}
              >
                {micMuted ? <MicOff size={17} style={{ color: 'white' }} /> : <Mic size={17} style={{ color: 'var(--ink-2)' }} />}
              </button>

              {callMode === 'video' && (
                <button
                  onClick={toggleVideo}
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                  style={{ background: videoOff ? 'var(--danger)' : 'var(--surface-strong)' }}
                  title={videoOff ? 'Turn on camera' : 'Turn off camera'}
                >
                  {videoOff ? <VideoOff size={17} style={{ color: 'white' }} /> : <Video size={17} style={{ color: 'var(--ink-2)' }} />}
                </button>
              )}

              <button
                onClick={() => { void toggleScreenShare() }}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                style={{ background: screenSharing ? 'var(--accent)' : 'var(--surface-strong)' }}
                title={screenSharing ? 'Stop sharing' : 'Share screen'}
              >
                <Monitor size={17} style={{ color: screenSharing ? '#080e1a' : 'var(--ink-2)' }} />
              </button>

              <button
                onClick={stopCall}
                className="w-16 h-12 rounded-full flex items-center justify-center transition-all"
                style={{ background: 'var(--danger)' }}
              >
                <PhoneOff size={17} style={{ color: 'white' }} />
              </button>
            </div>

            {screenSharing && (
              <div className="px-5 pb-3 text-center">
                <span className="text-xs" style={{ color: 'var(--warning)' }}>Screen sharing active</span>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="new-call" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-strong rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Lock size={14} style={{ color: 'var(--secure)' }} />
              <h2 className="display font-semibold text-sm" style={{ color: 'var(--ink)' }}>Encrypted Call</h2>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--secure-dim)', color: 'var(--secure)' }}>WebRTC P2P</span>
            </div>

            {callState === 'ended' && (
              <div className="glass rounded-xl py-2 px-3 text-xs text-center flex items-center justify-center gap-1.5" style={{ color: 'var(--muted)' }}>
                <PhoneOff size={10} /> Call ended — no recording stored
              </div>
            )}
        

            {/* Recipient */}
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--muted)' }}>Recipient</label>
              <div className="flex gap-2">
                <input
                  value={peerAddress}
                  onChange={e => setPeerAddress(e.target.value)}
                  placeholder="0x... wallet address"
                  className="flex-1 glass rounded-xl px-3 py-2.5 text-xs outline-none"
                  style={{ color: 'var(--ink)', fontFamily: 'JetBrains Mono, monospace' }}
                />
                <div className="relative">
                  <button
                    onClick={() => setShowContactPicker(v => !v)}
                    className="h-full px-3 glass rounded-xl flex items-center gap-1.5 text-xs"
                    style={{ color: 'var(--ink-2)' }}
                  >
                    <Users size={13} />
                    <ChevronDown size={11} />
                  </button>
                  <AnimatePresence>
                    {showContactPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute right-0 top-full mt-1 glass-strong rounded-xl overflow-hidden z-10"
                        style={{ border: '1px solid var(--border-strong)', minWidth: '200px', maxHeight: '200px', overflowY: 'auto' }}
                      >
                        {contactsWithKeys.length === 0 ? (
                          <p className="p-3 text-xs" style={{ color: 'var(--muted)' }}>No registered contacts</p>
                        ) : (
                          contactsWithKeys.map(c => (
                            <button
                              key={c.address}
                              onClick={() => { setPeerAddress(c.address); setShowContactPicker(false) }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-left"
                            >
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--surface-strong)', color: 'var(--accent)' }}>
                                {c.handle[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="text-xs font-medium" style={{ color: 'var(--ink)' }}>{c.handle}</div>
                                <div className="text-xs" style={{ color: 'var(--subtle)', fontFamily: 'monospace' }}>{shortAddress(c.address)}</div>
                              </div>
                              {peerAddress === c.address && <Check size={11} className="ml-auto" style={{ color: 'var(--accent)' }} />}
                            </button>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Call type */}
            <div>
              <label className="text-xs font-medium block mb-2" style={{ color: 'var(--muted)' }}>Call Type</label>
              <div className="flex gap-2">
                {(['voice', 'video'] as CallMode[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setCallMode(t)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    style={{
                      background: callMode === t ? 'var(--surface-strong)' : 'var(--surface)',
                      color: callMode === t ? 'var(--ink)' : 'var(--muted)',
                      border: callMode === t ? '1px solid var(--border-strong)' : '1px solid transparent',
                    }}
                  >
                    {t === 'voice' ? <Mic size={13} /> : <Video size={13} />}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => { void initiateCall() }}
              disabled={!peerAddress}
              className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: 'var(--secure)', color: '#040e20' }}
            >
              {callMode === 'video' ? <Video size={16} /> : <Phone size={16} />}
              Start Encrypted {callMode === 'video' ? 'Video' : 'Voice'} Call
            </button>

            <div className="text-xs p-3 rounded-xl" style={{ background: 'var(--surface-muted)', color: 'var(--muted)' }}>
              <strong style={{ color: 'var(--ink-2)' }}>Privacy:</strong> Calls use WebRTC peer-to-peer DTLS-SRTP encryption.
              The relay server passes only connection signaling (SDP/ICE) — call content never reaches the server.
              No recordings are stored by default. Screen sharing sends display content directly to the peer.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call history */}
      <div className="glass-strong rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
          <Phone size={13} style={{ color: 'var(--accent)' }} />
          <h3 className="display font-semibold text-xs" style={{ color: 'var(--ink)' }}>Recent Calls</h3>
          <span className="text-xs ml-auto" style={{ color: 'var(--subtle)' }}>Stored locally only</span>
        </div>
        {callHistory.length === 0 ? (
          <div className="p-4 text-center text-xs" style={{ color: 'var(--muted)' }}>No recent calls</div>
        ) : (
          callHistory.map(call => (
            <div key={call.id} className="flex items-center gap-3 px-4 py-3 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: call.missed ? 'var(--danger-dim, rgba(239,68,68,0.15))' : 'var(--surface-strong)' }}>
                {call.missed
                  ? <PhoneMissed size={14} style={{ color: 'var(--danger)' }} />
                  : call.mode === 'video' ? <Video size={14} style={{ color: 'var(--secure)' }} /> : <Phone size={14} style={{ color: 'var(--secure)' }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium mono truncate" style={{ color: 'var(--ink)' }}>{shortAddress(call.peer)}</div>
                <div className="text-xs" style={{ color: 'var(--subtle)' }}>
                  {call.missed ? 'Missed' : formatDuration(call.duration)} · {call.mode}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs" style={{ color: 'var(--subtle)' }}>{new Date(call.ts).toLocaleDateString()}</div>
                <button
                  onClick={() => { setPeerAddress(call.peer); setCallMode(call.mode as CallMode) }}
                  className="text-xs mt-0.5"
                  style={{ color: 'var(--accent)' }}
                >
                  Call back
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Group call note */}
      <div className="glass rounded-xl p-4 flex items-start gap-3">
        <Users size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <div>
          <p className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>Group Calls</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
            Group calls (Phase 2) use a mesh WebRTC topology — each participant connects directly to each other peer.
            For groups larger than 4, a selective forwarding unit (SFU) like mediasoup will be integrated in Phase 2 infrastructure deployment.
          </p>
        </div>
      </div>

      {/* Power-features nudge — informational, never a gate */}
      <div className="glass rounded-xl p-3 flex items-start gap-2">
        <Lock size={12} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
        <div className="text-xs" style={{ color: 'var(--muted)' }}>
          <strong style={{ color: 'var(--ink-2)' }}>Calls are free and fully encrypted.</strong>{' '}
          Holding PVX unlocks group calls, screen recording, and priority relay routing — upgrades for power users, not gates.
        </div>
      </div>
    </div>
  )
}
