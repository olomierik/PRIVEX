import { useState, useEffect, useRef } from 'react'
import { ArrowRight, CheckCircle, XCircle, RefreshCw, Clock, ExternalLink } from 'lucide-react'
import { TokenUSDC } from '@web3icons/react'
import {
  NetworkEthereum, NetworkBase, NetworkArbitrumOne,
  NetworkOptimism, NetworkPolygon, NetworkAvalanche,
} from '@web3icons/react'
import { useAccount, useReadContract, useSwitchChain } from 'wagmi'
import { erc20Abi } from 'viem'
import type { EIP1193Provider } from 'viem'
import { createViemAdapterFromProvider } from '@circle-fin/adapter-viem-v2'
import { AppKit } from '@circle-fin/app-kit'
import type { BridgeResult } from '@circle-fin/app-kit'
import { ONCHAIN_CHAINS, getUsdc, buildTxExplorerUrl } from '@/onchain-facts'
import { Amount, usdcDecimalsFor } from '@/onchain-money'
import { toast } from 'sonner'

// Chains supported by the bridge
const CHAIN_KIT_NAME: Record<number, string> = {
  5042:  'PRIVEX',
  4663:  'Robinhood',
  1:     'Ethereum',
  8453:  'Base',
  42161: 'Arbitrum',
  10:    'OP_Mainnet',
  137:   'Polygon',
  43114: 'Avalanche',
}

function ChainIcon({ chainId, size = 24 }: { chainId: number; size?: number }) {
  const cls = `flex-shrink-0 rounded-full overflow-hidden`
  const s = size
  if (chainId === 5042) return (
    <img src="/privex-logo.svg" width={s} height={s} alt="PRIVEX" className={cls} style={{ borderRadius: '50%', background: '#0a1628' }} />
  )
  if (chainId === 4663) return (
    <div className={cls} style={{ width: s, height: s, background: '#004aff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: s * 0.45, fontWeight: 700, color: '#fff' }}>R</div>
  )
  if (chainId === 1)     return <NetworkEthereum variant="branded" size={s} className={cls} />
  if (chainId === 8453)  return <NetworkBase variant="branded" size={s} className={cls} />
  if (chainId === 42161) return <NetworkArbitrumOne variant="branded" size={s} className={cls} />
  if (chainId === 10)    return <NetworkOptimism variant="branded" size={s} className={cls} />
  if (chainId === 137)   return <NetworkPolygon variant="branded" size={s} className={cls} />
  if (chainId === 43114) return <NetworkAvalanche variant="branded" size={s} className={cls} />
  return <div className={cls} style={{ width: s, height: s, background: 'var(--surface-strong)' }} />
}

const BRIDGE_CHAINS = ONCHAIN_CHAINS.filter(
  c => !c.isTestnet && c.usdc && CHAIN_KIT_NAME[c.chainId] !== undefined
)

const appKit = new AppKit()

type BridgeStatus = 'idle' | 'approving' | 'burning' | 'attesting' | 'minting' | 'done' | 'failed'

interface BridgeRecord {
  id: string
  fromChain: string
  fromChainId: number
  toChain: string
  toChainId: number
  amount: string
  status: BridgeStatus
  srcHash?: string
  dstHash?: string
  timestamp: number
}

const STEPS: { status: BridgeStatus; label: string }[] = [
  { status: 'approving', label: 'Authorizing' },
  { status: 'burning',   label: 'Sending' },
  { status: 'attesting', label: 'Verifying' },
  { status: 'minting',   label: 'Receiving' },
  { status: 'done',      label: 'Complete' },
]
const STEP_ORDER: BridgeStatus[] = ['approving', 'burning', 'attesting', 'minting', 'done', 'failed']

function StepBar({ current }: { current: BridgeStatus }) {
  const ci = STEP_ORDER.indexOf(current)
  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((step, i) => {
        const si = STEP_ORDER.indexOf(step.status)
        const done   = ci > si && current !== 'failed'
        const active = current === step.status
        return (
          <div key={step.status} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full h-1 rounded-full transition-all"
              style={{ background: done ? 'var(--secure)' : active ? 'var(--accent)' : 'var(--surface-muted)' }} />
            <span className="text-[10px] font-medium" style={{ color: done || active ? 'var(--ink-2)' : 'var(--subtle)' }}>
              {done ? <CheckCircle size={8} style={{ color: 'var(--secure)', display: 'inline' }} /> : step.label}
            </span>
            {i < STEPS.length - 1 && <div />}
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
  const defaultTo   = BRIDGE_CHAINS.find(c => c.chainId === 8453) ?? BRIDGE_CHAINS[1]

  const [fromChain, setFromChain] = useState(defaultFrom)
  const [toChain,   setToChain]   = useState(defaultTo)
  const [amount,    setAmount]    = useState('')
  const [status,    setStatus]    = useState<BridgeStatus>('idle')
  const [history,   setHistory]   = useState<BridgeRecord[]>([])
  const [tab,       setTab]       = useState<'bridge' | 'history'>('bridge')
  const [elapsed,   setElapsed]   = useState(0)
  const [srcHash,   setSrcHash]   = useState<string | undefined>()
  const [dstHash,   setDstHash]   = useState<string | undefined>()
  const resultRef = useRef<BridgeResult | null>(null)

  const usdcFact    = getUsdc(fromChain?.chainId ?? 5042)
  // Only show wrong-chain warning when wallet is connected
  const isWrongChain = !!address && chainId !== fromChain?.chainId
  const isBridging   = status !== 'idle' && status !== 'done' && status !== 'failed'

  const { data: balance } = useReadContract({
    address: usdcFact?.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: fromChain?.chainId,
    query: { enabled: !!address && !!usdcFact },
  })
  const fmtBalance = balance !== undefined
    ? Amount.fromRaw(balance, usdcDecimalsFor(fromChain?.chainId ?? 5042)).toFixed(2)
    : '—'

  useEffect(() => {
    if (!isBridging) { const t = setTimeout(() => setElapsed(0), 0); return () => clearTimeout(t) }
    const iv = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(iv)
  }, [isBridging])

  const swap = () => { const t = fromChain; setFromChain(toChain); setToChain(t) }

  const startBridge = async () => {
    if (!address || !connector) { toast.error('Connect your wallet first'); return }
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter an amount'); return }
    if (fromChain.chainId === toChain.chainId) { toast.error('Choose different networks'); return }
    const fromName = CHAIN_KIT_NAME[fromChain.chainId]
    const toName   = CHAIN_KIT_NAME[toChain.chainId]
    if (!fromName || !toName) { toast.error('Network not supported'); return }

    setSrcHash(undefined); setDstHash(undefined); setStatus('approving')

    const onApprove = () => setStatus('approving')
    const onBurn    = (p: { values?: { txHash?: string } }) => { setStatus('burning');   if (p?.values?.txHash) setSrcHash(p.values.txHash) }
    const onAttest  = () => setStatus('attesting')
    const onMint    = (p: { values?: { txHash?: string } }) => { setStatus('minting');   if (p?.values?.txHash) setDstHash(p.values.txHash) }

    // oxlint-disable-next-line typescript/no-unsafe-argument
    appKit.on('bridge.approve' as never, onApprove)
    // oxlint-disable-next-line typescript/no-unsafe-argument
    appKit.on('bridge.burn' as never, onBurn as never)
    // oxlint-disable-next-line typescript/no-unsafe-argument
    appKit.on('bridge.fetchAttestation' as never, onAttest)
    // oxlint-disable-next-line typescript/no-unsafe-argument
    appKit.on('bridge.mint' as never, onMint as never)

    try {
      if (chainId !== fromChain.chainId) await switchChainAsync({ chainId: fromChain.chainId })
      const provider = await connector.getProvider() as EIP1193Provider
      const adapter  = await createViemAdapterFromProvider({ provider })
      const result   = await appKit.bridge({
        from: { adapter, chain: fromName as Parameters<typeof appKit.bridge>[0]['from']['chain'] },
        to:   { adapter, chain: toName   as Parameters<typeof appKit.bridge>[0]['from']['chain'] },
        amount,
      })
      resultRef.current = result
      const rec: BridgeRecord = {
        id: `bridge-${Date.now()}`,
        fromChain: fromChain.name, fromChainId: fromChain.chainId,
        toChain: toChain.name,     toChainId: toChain.chainId,
        amount, status: result.state === 'success' ? 'done' : 'failed',
        srcHash, dstHash, timestamp: Date.now(),
      }
      setHistory(prev => [rec, ...prev])
      if (result.state === 'success') {
        setStatus('done')
        toast.success(`${amount} USDC sent to ${toChain.name}`)
      } else {
        setStatus('failed')
        toast.error('Transfer failed — tap Retry to continue')
      }
    } catch (err) {
      setStatus('failed')
      toast.error(err instanceof Error ? err.message : 'Transfer failed')
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
    if (!resultRef.current || !connector) return
    const provider = await connector.getProvider() as EIP1193Provider
    const adapter  = await createViemAdapterFromProvider({ provider })
    setStatus('attesting')
    try {
      const result = await appKit.retryBridge(resultRef.current, { from: adapter, to: adapter })
      if (result.state === 'success') { setStatus('done'); toast.success('Transfer complete!') }
      else toast.error('Retry did not succeed')
    } catch { toast.error('Retry failed') }
  }

  const reset = () => { setStatus('idle'); setAmount(''); setSrcHash(undefined); setDstHash(undefined); resultRef.current = null }

  const received = amount ? (parseFloat(amount) * 0.999).toFixed(4) : '—'

  if (!fromChain || !toChain) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-sm" style={{ color: 'var(--muted)' }}>No supported networks found</p>
    </div>
  )

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto space-y-3">
      {/* Tab bar */}
      <div className="flex gap-1 glass rounded-xl p-1">
        {(['bridge', 'history'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all"
            style={{ background: tab === t ? 'var(--surface-strong)' : 'transparent', color: tab === t ? 'var(--ink)' : 'var(--muted)' }}>
            {t === 'bridge' ? 'Send' : `History (${history.length})`}
          </button>
        ))}
      </div>

      {tab === 'bridge' && (
        <div className="space-y-3">
          <div className="glass-strong rounded-2xl p-5 space-y-4">

            {/* Wrong chain warning — only if wallet is connected AND on wrong chain */}
            {isWrongChain && status === 'idle' && (
              <div className="flex items-center gap-3 glass rounded-xl px-3 py-2.5"
                style={{ borderLeft: '2px solid var(--warning)' }}>
                <span className="text-sm flex-1" style={{ color: 'var(--ink-2)' }}>
                  Switch to {fromChain.name} to send from there
                </span>
                <button onClick={() => { void switchChainAsync({ chainId: fromChain.chainId }) }}
                  className="text-xs font-bold px-2.5 py-1 rounded-lg"
                  style={{ background: 'var(--warning)', color: '#080e1a' }}>
                  Switch
                </button>
              </div>
            )}

            {status === 'idle' && (
              <>
                {/* Network selector */}
                <div className="grid grid-cols-[1fr_40px_1fr] items-center gap-2">
                  {/* From */}
                  <div className="glass rounded-xl p-3 space-y-2">
                    <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>From</span>
                    <div className="flex items-center gap-2 mb-1">
                      <ChainIcon chainId={fromChain.chainId} size={22} />
                      <span className="text-sm font-bold truncate" style={{ color: 'var(--ink)' }}>{fromChain.name}</span>
                    </div>
                    <select value={fromChain.chainId}
                      onChange={e => {
                        const c = BRIDGE_CHAINS.find(x => x.chainId === Number(e.target.value))
                        if (c) { setFromChain(c); if (c.chainId === toChain.chainId) setToChain(BRIDGE_CHAINS.find(x => x.chainId !== c.chainId) ?? BRIDGE_CHAINS[1]) }
                      }}
                      className="w-full text-xs rounded-lg px-2 py-1 outline-none"
                      style={{ background: 'var(--surface-muted)', color: 'var(--ink-2)', border: '1px solid var(--border)' }}>
                      {BRIDGE_CHAINS.filter(c => CHAIN_KIT_NAME[c.chainId]).map(c => (
                        <option key={c.chainId} value={c.chainId} style={{ background: '#0f1c2e' }}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Swap button */}
                  <button onClick={swap}
                    className="w-10 h-10 rounded-xl flex items-center justify-center glass-strong hover:opacity-80 transition-opacity mx-auto">
                    <ArrowRight size={14} style={{ color: 'var(--accent)' }} />
                  </button>

                  {/* To */}
                  <div className="glass rounded-xl p-3 space-y-2">
                    <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>To</span>
                    <div className="flex items-center gap-2 mb-1">
                      <ChainIcon chainId={toChain.chainId} size={22} />
                      <span className="text-sm font-bold truncate" style={{ color: 'var(--ink)' }}>{toChain.name}</span>
                    </div>
                    <select value={toChain.chainId}
                      onChange={e => {
                        const c = BRIDGE_CHAINS.find(x => x.chainId === Number(e.target.value))
                        if (c) setToChain(c)
                      }}
                      className="w-full text-xs rounded-lg px-2 py-1 outline-none"
                      style={{ background: 'var(--surface-muted)', color: 'var(--ink-2)', border: '1px solid var(--border)' }}>
                      {BRIDGE_CHAINS.filter(c => c.chainId !== fromChain.chainId && CHAIN_KIT_NAME[c.chainId]).map(c => (
                        <option key={c.chainId} value={c.chainId} style={{ background: '#0f1c2e' }}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* All supported networks */}
                <div>
                  <p className="text-xs mb-2" style={{ color: 'var(--subtle)' }}>Supported networks</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {BRIDGE_CHAINS.map(c => (
                      <div key={c.chainId} className="flex items-center gap-1.5 glass px-2 py-1 rounded-lg">
                        <ChainIcon chainId={c.chainId} size={14} />
                        <span className="text-xs" style={{ color: 'var(--ink-2)' }}>{c.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>Amount (USDC)</span>
                    <button onClick={() => setAmount(fmtBalance !== '—' ? fmtBalance : '')}
                      className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                      Max: {fmtBalance}
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <input value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                      placeholder="0.00"
                      className="flex-1 bg-transparent display text-3xl font-bold outline-none tabular"
                      style={{ color: 'var(--ink)' }} />
                    <div className="flex items-center gap-1.5 glass-strong px-3 py-2 rounded-xl">
                      <TokenUSDC variant="branded" size={20} />
                      <span className="text-sm font-bold" style={{ color: 'var(--ink)' }}>USDC</span>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                {amount && parseFloat(amount) > 0 && (
                  <div className="flex items-center justify-between glass rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ChainIcon chainId={fromChain.chainId} size={18} />
                      <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{amount} USDC</span>
                    </div>
                    <ArrowRight size={14} style={{ color: 'var(--muted)' }} />
                    <div className="flex items-center gap-2">
                      <ChainIcon chainId={toChain.chainId} size={18} />
                      <span className="text-sm font-semibold" style={{ color: 'var(--secure)' }}>{received} USDC</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* In-progress / done / failed */}
            {status !== 'idle' && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-base font-semibold" style={{ color: 'var(--ink)' }}>
                    {status === 'done' ? '✓ Transfer complete' : status === 'failed' ? 'Transfer failed' : `Transferring${isBridging ? ` · ${elapsed}s` : ''}`}
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                    {amount} USDC · {fromChain.name} → {toChain.name}
                  </p>
                </div>
                <StepBar current={status} />
                {(srcHash || dstHash) && (
                  <div className="flex flex-col gap-1.5">
                    {srcHash && (
                      <a href={buildTxExplorerUrl(fromChain.chainId, srcHash)} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}>
                        <ExternalLink size={10} />View source transaction
                      </a>
                    )}
                    {dstHash && (
                      <a href={buildTxExplorerUrl(toChain.chainId, dstHash)} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs" style={{ color: 'var(--secure)' }}>
                        <ExternalLink size={10} />View destination transaction
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            {status === 'done' ? (
              <button onClick={reset}
                className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                style={{ background: 'var(--surface-strong)', color: 'var(--ink)' }}>
                <RefreshCw size={14} />New Transfer
              </button>
            ) : status === 'failed' ? (
              <div className="flex gap-2">
                <button onClick={() => { void retryBridge() }}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--warning)', color: '#080e1a' }}>
                  Retry
                </button>
                <button onClick={reset}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--surface-strong)', color: 'var(--ink)' }}>
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => { void startBridge() }}
                disabled={!amount || parseFloat(amount) <= 0 || fromChain.chainId === toChain.chainId || isBridging}
                className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)', color: '#080e1a' }}>
                {isBridging
                  ? <><div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />Transferring...</>
                  : !address ? 'Connect Wallet'
                  : fromChain.chainId === toChain.chainId ? 'Select Different Networks'
                  : !amount ? 'Enter Amount'
                  : <>Send {amount} USDC to {toChain.name}</>}
              </button>
            )}
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="glass-strong rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Transfer History</span>
          </div>
          {history.length === 0 ? (
            <div className="text-center py-12">
              <Clock size={28} style={{ color: 'var(--subtle)' }} className="mx-auto mb-3" />
              <p className="text-sm" style={{ color: 'var(--muted)' }}>No transfers yet</p>
            </div>
          ) : history.map(r => (
            <div key={r.id} className="px-4 py-3 border-b last:border-0 hover:bg-white/5" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <ChainIcon chainId={r.fromChainId} size={16} />
                <ArrowRight size={10} style={{ color: 'var(--subtle)' }} />
                <ChainIcon chainId={r.toChainId} size={16} />
                <span className="text-sm font-semibold ml-1" style={{ color: 'var(--ink)' }}>{r.amount} USDC</span>
                <div className="ml-auto flex items-center gap-1">
                  {r.status === 'done'
                    ? <CheckCircle size={12} style={{ color: 'var(--secure)' }} />
                    : <XCircle size={12} style={{ color: 'var(--danger)' }} />}
                  <span className="text-xs capitalize" style={{ color: 'var(--subtle)' }}>{r.status}</span>
                </div>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--subtle)' }}>
                {r.fromChain} → {r.toChain} · {new Date(r.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
