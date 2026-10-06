/**
 * PRIVEX Bridge — Real CCTP via Circle App Kit + wagmi adapter.
 * Supports Arc ↔ ETH ↔ Base ↔ Arbitrum on mainnet.
 */
import { useState, useEffect, useRef } from 'react'
import {
  Globe, ArrowRight, Info, AlertTriangle,
  CheckCircle, XCircle, ExternalLink, RefreshCw, Activity, Lock,
} from 'lucide-react'
import { TokenUSDC } from '@web3icons/react'
import { useAccount, useReadContract, useSwitchChain } from 'wagmi'
import { erc20Abi } from 'viem'
import type { EIP1193Provider } from 'viem'
import { createViemAdapterFromProvider } from '@circle-fin/adapter-viem-v2'
import { AppKit } from '@circle-fin/app-kit'
import type { BridgeResult } from '@circle-fin/app-kit'
import { ONCHAIN_CHAINS, getUsdc, buildTxExplorerUrl } from '@/onchain-facts'
import { Amount, usdcDecimalsFor } from '@/onchain-money'
import { toast } from 'sonner'

// Mainnet chains with USDC and CCTP domain
const BRIDGE_CHAINS = ONCHAIN_CHAINS.filter(
  c => !c.isTestnet && c.usdc && c.cctpDomain !== undefined
)

// Chain name strings as expected by App Kit BridgeChain enum
const CHAIN_NAME_MAP: Record<number, string> = {
  5042: 'Arc',
  1: 'Ethereum',
  8453: 'Base',
  42161: 'Arbitrum',
  10: 'OP_Mainnet',
  137: 'Polygon',
  43114: 'Avalanche',
}

const appKit = new AppKit()

type BridgeStatus = 'idle' | 'approving' | 'burning' | 'attesting' | 'minting' | 'done' | 'failed'

interface BridgeRecord {
  id: string
  fromChain: string
  toChain: string
  amount: string
  status: BridgeStatus
  srcHash?: string
  dstHash?: string
  timestamp: number
}

const STATUS_STEPS: { status: BridgeStatus; label: string; desc: string }[] = [
  { status: 'approving', label: 'Approve USDC', desc: 'Authorizing CCTP to burn USDC' },
  { status: 'burning', label: 'Burn on source', desc: 'Burning USDC on source chain' },
  { status: 'attesting', label: 'Circle attestation', desc: 'Circle validators sign the burn proof (~20s)' },
  { status: 'minting', label: 'Mint on destination', desc: 'Minting native USDC on destination' },
  { status: 'done', label: 'Complete', desc: 'USDC arrived on destination chain' },
]
const STATUS_ORDER: BridgeStatus[] = ['approving', 'burning', 'attesting', 'minting', 'done', 'failed']

function StepIndicator({ current }: { current: BridgeStatus }) {
  const currentIdx = STATUS_ORDER.indexOf(current)
  return (
    <div className="space-y-2">
      {STATUS_STEPS.map((step, i) => {
        const stepIdx = STATUS_ORDER.indexOf(step.status)
        const done = currentIdx > stepIdx && current !== 'failed'
        const active = current === step.status
        return (
          <div key={step.status} className="flex items-start gap-3">
            <div className="flex flex-col items-center flex-shrink-0 mt-0.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: done ? 'var(--secure)' : active ? 'var(--accent)' : 'var(--surface-muted)' }}>
                {done ? <CheckCircle size={11} style={{ color: '#080e1a' }} />
                  : current === 'failed' && active ? <XCircle size={11} style={{ color: 'white' }} />
                  : active ? <div className="w-2 h-2 border border-[#080e1a]/30 border-t-[#080e1a] rounded-full animate-spin" />
                  : <div className="w-2 h-2 rounded-full" style={{ background: 'var(--subtle)' }} />}
              </div>
              {i < STATUS_STEPS.length - 1 && <div className="w-px mt-1" style={{ height: 12, background: done ? 'var(--secure)' : 'var(--border)' }} />}
            </div>
            <div className="flex-1 pb-1">
              <div className="text-xs font-semibold" style={{ color: done || active ? 'var(--ink)' : 'var(--subtle)' }}>{step.label}</div>
              {(done || active) && <div className="text-xs" style={{ color: 'var(--muted)' }}>{step.desc}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function BridgeSection() {
  const { address, connector, chainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()

  const defaultFrom = BRIDGE_CHAINS.find(c => c.chainId === 5042) ?? BRIDGE_CHAINS[0]
  const defaultTo = BRIDGE_CHAINS.find(c => c.chainId === 8453) ?? BRIDGE_CHAINS[1]

  const [fromChain, setFromChain] = useState(defaultFrom)
  const [toChain, setToChain] = useState(defaultTo)
  const [amount, setAmount] = useState('')
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus>('idle')
  const [history, setHistory] = useState<BridgeRecord[]>([])
  const [tab, setTab] = useState<'bridge' | 'history'>('bridge')
  const [elapsed, setElapsed] = useState(0)
  const [srcHash, setSrcHash] = useState<string | undefined>()
  const [dstHash, setDstHash] = useState<string | undefined>()
  const bridgeResultRef = useRef<BridgeResult | null>(null)

  const usdcFact = getUsdc(fromChain?.chainId ?? 5042)
  const isWrongChain = chainId !== fromChain?.chainId

  const { data: balance } = useReadContract({
    address: usdcFact?.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: fromChain?.chainId,
    query: { enabled: !!address && !!usdcFact },
  })

  const formattedBalance = balance !== undefined
    ? Amount.fromRaw(balance, usdcDecimalsFor(fromChain?.chainId ?? 5042)).toFixed(2)
    : '—'

  const isBridging = bridgeStatus !== 'idle' && bridgeStatus !== 'done' && bridgeStatus !== 'failed'

  // Elapsed timer
  useEffect(() => {
    if (!isBridging) { const t = setTimeout(() => setElapsed(0), 0); return () => clearTimeout(t) }
    const iv = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(iv)
  }, [isBridging])

  const startBridge = async () => {
    if (!address || !connector) { toast.error('Connect wallet first'); return }
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter an amount'); return }
    if (!fromChain || !toChain || fromChain.chainId === toChain.chainId) { toast.error('Select different chains'); return }

    const fromChainName = CHAIN_NAME_MAP[fromChain.chainId]
    const toChainName = CHAIN_NAME_MAP[toChain.chainId]
    if (!fromChainName || !toChainName) { toast.error('Chain not supported by bridge'); return }

    setSrcHash(undefined)
    setDstHash(undefined)
    setBridgeStatus('approving')

    // Register step listeners
    const onApprove = () => setBridgeStatus('approving')
    const onBurn = (payload: { values?: { txHash?: string } }) => {
      setBridgeStatus('burning')
      if (payload?.values?.txHash) setSrcHash(payload.values.txHash)
    }
    const onAttest = () => setBridgeStatus('attesting')
    const onMint = (payload: { values?: { txHash?: string } }) => {
      setBridgeStatus('minting')
      if (payload?.values?.txHash) setDstHash(payload.values.txHash)
    }

    // oxlint-disable-next-line typescript/no-unsafe-argument -- App Kit event API requires cast
    appKit.on('bridge.approve' as never, onApprove)
    // oxlint-disable-next-line typescript/no-unsafe-argument -- App Kit event API requires cast
    appKit.on('bridge.burn' as never, onBurn as never)
    // oxlint-disable-next-line typescript/no-unsafe-argument -- App Kit event API requires cast
    appKit.on('bridge.fetchAttestation' as never, onAttest)
    // oxlint-disable-next-line typescript/no-unsafe-argument -- App Kit event API requires cast
    appKit.on('bridge.mint' as never, onMint as never)

    try {
      if (chainId !== fromChain.chainId) {
        await switchChainAsync({ chainId: fromChain.chainId })
      }

      const provider = await connector.getProvider() as EIP1193Provider
      const adapter = await createViemAdapterFromProvider({ provider })

      const result = await appKit.bridge({
        from: { adapter, chain: fromChainName as Parameters<typeof appKit.bridge>[0]['from']['chain'] },
        to: { adapter, chain: toChainName as Parameters<typeof appKit.bridge>[0]['from']['chain'] },
        amount,
      })

      bridgeResultRef.current = result

      if (result.state === 'success') {
        setBridgeStatus('done')
        const rec: BridgeRecord = {
          id: `bridge-${Date.now()}`,
          fromChain: fromChain.name,
          toChain: toChain.name,
          amount,
          status: 'done',
          srcHash,
          dstHash,
          timestamp: Date.now(),
        }
        setHistory(prev => [rec, ...prev])
        toast.success(`Bridged ${amount} USDC to ${toChain.name}!`)
      } else {
        setBridgeStatus('failed')
        const rec: BridgeRecord = {
          id: `bridge-${Date.now()}`,
          fromChain: fromChain.name,
          toChain: toChain.name,
          amount,
          status: 'failed',
          timestamp: Date.now(),
        }
        setHistory(prev => [rec, ...prev])
        toast.error('Bridge failed — you can retry below')
      }
    } catch (err) {
      setBridgeStatus('failed')
      const msg = err instanceof Error ? err.message : 'Bridge failed'
      toast.error(msg)
      console.error('[PRIVEX Bridge]', err)
    } finally {
      // oxlint-disable-next-line typescript/no-unsafe-argument
      appKit.off('bridge.approve' as never, onApprove)
      // oxlint-disable-next-line typescript/no-unsafe-argument
      appKit.off('bridge.burn' as never, onBurn as never)
      // oxlint-disable-next-line typescript/no-unsafe-argument
      appKit.off('bridge.fetchAttestation' as never, onAttest)
      // oxlint-disable-next-line typescript/no-unsafe-argument
      appKit.off('bridge.mint' as never, onMint as never)
    }
  }

  const retryBridge = async () => {
    if (!bridgeResultRef.current || !connector) return
    const provider = await connector.getProvider() as EIP1193Provider
    const adapter = await createViemAdapterFromProvider({ provider })
    setBridgeStatus('attesting')
    try {
      const result = await appKit.retryBridge(bridgeResultRef.current, {
        from: adapter,
        to: adapter,
      })
      if (result.state === 'success') {
        setBridgeStatus('done')
        toast.success('Bridge complete after retry!')
      } else {
        toast.error('Retry did not succeed')
      }
    } catch {
      toast.error('Retry failed')
    }
  }

  const resetBridge = () => {
    setBridgeStatus('idle')
    setAmount('')
    setSrcHash(undefined)
    setDstHash(undefined)
    bridgeResultRef.current = null
  }

  const fee = amount ? (parseFloat(amount) * 0.001).toFixed(4) : '—'
  const received = amount ? (parseFloat(amount) * 0.999).toFixed(4) : '—'

  if (!fromChain || !toChain) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <p className="text-sm" style={{ color: 'var(--muted)' }}>No supported mainnet bridge chains found</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 glass rounded-xl p-1">
        {(['bridge', 'history'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all"
            style={{ background: tab === t ? 'var(--surface-strong)' : 'transparent', color: tab === t ? 'var(--ink)' : 'var(--muted)' }}>
            {t === 'bridge' ? 'Bridge' : `History (${history.length})`}
          </button>
        ))}
      </div>

      {tab === 'bridge' && (
        <div className="space-y-4">
          <div className="glass-strong rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Globe size={16} style={{ color: 'var(--accent)' }} />
              <h2 className="display font-semibold text-sm" style={{ color: 'var(--ink)' }}>Cross-Chain Bridge</h2>
              <div className="flex items-center gap-1 ml-auto glass px-2 py-0.5 rounded-full">
                <Lock size={8} style={{ color: 'var(--secure)' }} />
                <span className="text-xs" style={{ color: 'var(--secure)', fontSize: '10px' }}>Circle CCTP v2</span>
              </div>
            </div>

            {/* Wrong chain warning */}
            {isWrongChain && bridgeStatus === 'idle' && (
              <div className="glass rounded-xl p-3 flex items-center gap-2">
                <AlertTriangle size={12} style={{ color: 'var(--warning)' }} />
                <span className="text-xs" style={{ color: 'var(--warning)' }}>Switch to {fromChain.name} to bridge</span>
                <button onClick={() => { void switchChainAsync({ chainId: fromChain.chainId }) }} className="ml-auto text-xs font-semibold" style={{ color: 'var(--accent)' }}>Switch</button>
              </div>
            )}

            {bridgeStatus === 'idle' && (
              <>
                {/* Chain selector */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 glass rounded-xl p-3">
                    <div className="text-xs mb-1.5" style={{ color: 'var(--muted)' }}>From</div>
                    <select value={fromChain.chainId}
                      onChange={e => setFromChain(BRIDGE_CHAINS.find(c => c.chainId === Number(e.target.value)) ?? BRIDGE_CHAINS[0])}
                      className="w-full bg-transparent text-xs font-semibold outline-none cursor-pointer"
                      style={{ color: 'var(--ink)' }}>
                      {BRIDGE_CHAINS.filter(c => CHAIN_NAME_MAP[c.chainId]).map(c => (
                        <option key={c.chainId} value={c.chainId} style={{ background: '#111d30' }}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={() => { const t = fromChain; setFromChain(toChain); setToChain(t) }}
                    className="w-8 h-8 rounded-full flex items-center justify-center glass-strong hover:opacity-80 transition-opacity flex-shrink-0">
                    <ArrowRight size={13} style={{ color: 'var(--accent)' }} />
                  </button>
                  <div className="flex-1 glass rounded-xl p-3">
                    <div className="text-xs mb-1.5" style={{ color: 'var(--muted)' }}>To</div>
                    <select value={toChain.chainId}
                      onChange={e => setToChain(BRIDGE_CHAINS.find(c => c.chainId === Number(e.target.value)) ?? BRIDGE_CHAINS[1])}
                      className="w-full bg-transparent text-xs font-semibold outline-none cursor-pointer"
                      style={{ color: 'var(--ink)' }}>
                      {BRIDGE_CHAINS.filter(c => c.chainId !== fromChain.chainId && CHAIN_NAME_MAP[c.chainId]).map(c => (
                        <option key={c.chainId} value={c.chainId} style={{ background: '#111d30' }}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Amount */}
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>Amount</span>
                    <button onClick={() => setAmount(formattedBalance !== '—' ? formattedBalance : '')}
                      className="text-xs" style={{ color: 'var(--accent)' }}>
                      Balance: {formattedBalance} USDC
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <input value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                      placeholder="0.00"
                      className="flex-1 bg-transparent display text-2xl font-bold outline-none tabular"
                      style={{ color: 'var(--ink)' }} />
                    <div className="flex items-center gap-1.5 glass-strong px-3 py-2 rounded-xl">
                      <TokenUSDC variant="branded" size={18} />
                      <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>USDC</span>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                {amount && (
                  <div className="glass rounded-xl p-3 space-y-2">
                    {[
                      { label: 'Bridge fee (0.1%)', value: `${fee} USDC` },
                      { label: 'You receive', value: `${received} USDC`, highlight: true },
                      { label: 'Estimated time', value: '~20 sec (fast mode)' },
                      { label: 'Protocol', value: 'Circle CCTP v2' },
                      { label: 'Destination', value: toChain.name },
                    ].map(({ label, value, highlight }) => (
                      <div key={label} className="flex justify-between text-xs">
                        <span style={{ color: 'var(--muted)' }}>{label}</span>
                        <span style={{ color: highlight ? 'var(--secure)' : 'var(--ink-2)' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* CCTP step progress */}
            {bridgeStatus !== 'idle' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                    {bridgeStatus === 'failed' ? 'Bridge Failed' : bridgeStatus === 'done' ? 'Bridge Complete!' : 'Bridge in Progress'}
                  </span>
                  {isBridging && (
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted)' }}>
                      <Activity size={11} />
                      {elapsed}s
                    </div>
                  )}
                </div>
                <StepIndicator current={bridgeStatus} />
                {srcHash && (
                  <a href={buildTxExplorerUrl(fromChain.chainId, srcHash)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}>
                    <ExternalLink size={10} />Source transaction
                  </a>
                )}
                {dstHash && (
                  <a href={buildTxExplorerUrl(toChain.chainId, dstHash)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}>
                    <ExternalLink size={10} />Destination transaction
                  </a>
                )}
              </div>
            )}

            <div className="glass rounded-xl p-3 flex items-start gap-2">
              <Info size={11} style={{ color: 'var(--muted)', flexShrink: 0, marginTop: 1 }} />
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                PRIVEX uses Circle CCTP — an audited burn-and-mint protocol. Transactions are publicly visible on both chains.
              </p>
            </div>

            {bridgeStatus === 'done' ? (
              <button onClick={resetBridge}
                className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                style={{ background: 'var(--surface-strong)', color: 'var(--ink)' }}>
                <RefreshCw size={14} />New Bridge
              </button>
            ) : bridgeStatus === 'failed' ? (
              <div className="flex gap-2">
                <button onClick={() => { void retryBridge() }}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ background: 'var(--warning)', color: '#080e1a' }}>
                  <RefreshCw size={14} />Retry
                </button>
                <button onClick={resetBridge}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--surface-strong)', color: 'var(--ink)' }}>
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => { void startBridge() }}
                disabled={!amount || !address || fromChain.chainId === toChain.chainId || isBridging}
                className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)', color: '#080e1a' }}>
                {isBridging
                  ? <><div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />Bridging...</>
                  : !address ? 'Connect Wallet'
                  : fromChain.chainId === toChain.chainId ? 'Select Different Chains'
                  : !amount ? 'Enter Amount'
                  : <><Globe size={14} />Bridge {amount} USDC</>}
              </button>
            )}
          </div>

          <div className="glass rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle size={11} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 1 }} />
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              Mainnet bridge moves real USDC. Double-check chains and amounts. CCTP is audited Circle infrastructure.
            </p>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="glass-strong rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Bridge History</span>
          </div>
          {history.length === 0 ? (
            <div className="text-center py-12">
              <Globe size={28} style={{ color: 'var(--subtle)' }} className="mx-auto mb-3" />
              <p className="text-sm" style={{ color: 'var(--muted)' }}>No bridge transactions yet</p>
            </div>
          ) : (
            history.map(r => (
              <div key={r.id} className="px-4 py-3 border-b last:border-0 hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>
                    {r.amount} USDC · {r.fromChain} → {r.toChain}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: r.status === 'done' ? 'var(--secure)' : r.status === 'failed' ? 'var(--danger)' : 'var(--warning)' }} />
                    <span className="text-xs capitalize" style={{ color: 'var(--subtle)' }}>{r.status}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--subtle)' }}>{new Date(r.timestamp).toLocaleString()}</span>
                  {r.srcHash && (
                    <a href={buildTxExplorerUrl(fromChain.chainId, r.srcHash)} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}>
                      <ExternalLink size={9} />Source tx
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
