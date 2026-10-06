/**
 * PRIVEX voice message recording (Phase 2)
 *
 * Records audio via MediaRecorder, returns a Blob.
 * The Blob is then encrypted via fileEncryption.ts before sending.
 * No raw audio ever reaches the server.
 */

/** Start recording from the microphone. Returns a promise that resolves with a recorder handle. */
export async function startRecording(onLevel?: (level: number) => void): Promise<{
  stop: () => Promise<Blob>
  cancel: () => void
  stream: MediaStream
}> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })

  // Level meter
  let audioCtx: AudioContext | null = null
  let rafId: number | null = null
  if (onLevel) {
    audioCtx = new AudioContext()
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 256
    const src = audioCtx.createMediaStreamSource(stream)
    src.connect(analyser)
    const data = new Uint8Array(analyser.frequencyBinCount)
    const tick = () => {
      analyser.getByteFrequencyData(data)
      const avg = data.reduce((a, b) => a + b, 0) / data.length
      onLevel(avg / 255)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
  }

  const stopMeter = () => {
    if (rafId !== null) cancelAnimationFrame(rafId)
    audioCtx?.close().catch(() => undefined)
  }

  const chunks: BlobPart[] = []
  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : 'audio/webm'
  const mr = new MediaRecorder(stream, { mimeType })
  mr.ondataavailable = (e: BlobEvent) => { if (e.data.size > 0) chunks.push(e.data) }

  mr.start(100)

  const stop = (): Promise<Blob> => new Promise((resolve, reject) => {
    if (mr.state === 'inactive') { reject(new Error('Not recording')); return }
    mr.onstop = () => {
      stopMeter()
      stream.getTracks().forEach(t => t.stop())
      resolve(new Blob(chunks, { type: mimeType }))
    }
    mr.onerror = () => reject(new Error('MediaRecorder error'))
    mr.stop()
  })

  const cancel = () => {
    stopMeter()
    if (mr.state !== 'inactive') mr.stop()
    stream.getTracks().forEach(t => t.stop())
  }

  return { stop, cancel, stream }
}

/** Format recording duration as mm:ss */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
