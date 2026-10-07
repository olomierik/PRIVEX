import { useState, useCallback, useRef, useEffect } from 'react'
import { ArrowUpDown, ChevronDown, CheckCircle, Clock, ExternalLink, Search, X, RefreshCw } from 'lucide-react'
import { TokenUSDC, TokenWBTC, TokenDAI } from '@web3icons/react'
import {
  NetworkEthereum, NetworkBase, NetworkArbitrumOne,
  NetworkOptimism, NetworkPolygon, NetworkAvalanche,
} from '@web3icons/react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { erc20Abi } from 'viem'
import { toast } from 'sonner'
import { getUsdc, buildTxExplorerUrl } from '@/onchain-facts'
import { usdcDecimalsFor, Amount } from '@/onchain-money'

const ARC_CHAIN_ID = 5042

interface Token {
  symbol: string
  name: string
  address: string
  decimals: number
  icon: React.ReactNode
}

const TOKENS: Token[] = [
  { symbol: 'USDC', name: 'USD Coin',       address: '0x3600000000000000000000000000000000000000', decimals: 6,  icon: <TokenUSDC variant="branded" size={28} /> },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '',                                           decimals: 8,  icon: <TokenWBTC variant="branded" size={28} /> },
  { symbol: 'DAI',  name: 'Dai',             address: '',                                           decimals: 18, icon: <TokenDAI  variant="branded" size={28} /> },
  { symbol: 'WETH', name: 'Wrapped ETH',     address: '',                                           decimals: 18, icon: <NetworkEthereum variant="branded" size={28} /> },
  { symbol: 'ARB',  name: 'Arbitrum',        address: '',                                           decimals: 18, icon: <NetworkArbitrumOne variant="branded" size={28} /> },
  { symbol: 'PVX',  name: 'PRIVEX Token',    address: '',                                           decimals: 18, icon: <img src="/privex-logo.svg" width={28} height={28} alt="PVX" style={{ borderRadius: '50%', background: '#0a1628' }} /> },
]

// Simulated mid-market rates in USD
const RATES: Record<string, number> = {
  USDC: 1, WBTC: 62000, DAI: 1, WETH: 2450, ARB: 0.85, PVX: 0.025,
}

const NETWORKS = [
  { chainId: 5042,  name: 'PRIVEX',   icon: <img src="/privex-logo.svg" width={16} height={16} alt="PRIVEX" style={{ borderRadius: '50%', background: '#0a1628' }} /> },
  { chainId: 4663,  name: 'Robinhood',icon: <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#004aff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff' }}>R</div> },
  { chainId: 1,     name: 'Ethereum', icon: <NetworkEthereum variant="branded" size={16} /> },
  { chainId: 8453,  name: 'Base',     icon: <NetworkBase     variant="branded" size={16} /> },
  { chainId: 42161, name: 'Arbitrum', icon: <NetworkArbitrumOne variant="branded" size={16} /> },
  { chainId: 10,    name: 'Optimism', icon: <NetworkOptimism variant="branded" size={16} /> },
  { chainId: 137,   name: 'Polygon',  icon: <NetworkPolygon  variant="branded" size={16} /> },
  { chainId: 43114, name: 'Avalanche',icon: <NetworkAvalanche variant="branded" size={16} /> },
]

interface SwapRecord {
  id: string
  fromSymbol: string
  toSymbol: string
  fromAmount: string
  toAmount: string
  timestamp: number
  hash: string
  status: 'pending' | 'confirmed' | 'failed'
}

function TokenButton({ token, onClick }: { token: Token; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 glass-strong px-3 py-2 rounded-xl hover:opacity-80 transition-opacity flex-shrink-0">
      <div className="flex-shrink-0">{token.icon}</div>
      <span className="text-sm font-bold" style={{ color: 'var(--ink)' }}>{token.symbol}</span>
      <ChevronDown size={12} style={{ color: 'var(--muted)' }} />
    </button>
  )
}

function TokenPicker({ selected, exclude, onSelect, onClose }: {
  selected: Token; exclude: Token; onSelect: (t: Token) => void; onClose: () => void
}) {
  const [q, setQ] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [onClose])
  const filtered = TOKENS.filter(t => t.symbol !== exclude.symbol &&
    (t.symbol.toLowerCase().includes(q.toLowerCase()) || t.name.toLowerCase().includes(q.toLowerCase())))
  return (
    <div ref={ref} className="absolute right-0 top-full mt-1 w-60 glass-strong rounded-2xl shadow-2xl z-50 overflow-hidden border"
      style={{ borderColor: 'var(--border-strong)' }}>
      <div className="p-2 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 glass rounded-xl px-3 py-2">
          <Search size={12} style={{ color: 'var(--muted)' }} />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search..."
            className="flex-1 bg-transparent text-sm outline-none" style={{ color: 'var(--ink)' }} />
          {q && <button onClick={() => setQ('')}><X size={11} style={{ color: 'var(--muted)' }} /></button>}
        </div>
      </div>
      <div className="max-h-52 overflow-y-auto">
        {filtered.map(t => (
          <button key={t.symbol} onClick={() => { onSelect(t); onClose() }}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left">
            <div className="flex-shrink-0">{t.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold" style={{ color: 'var(--ink)' }}>{t.symbol}</div>
              <div className="text-xs" style={{ color: 'var(--subtle)' }}>{t.name}</div>
            </div>
            {t.symbol === selected.symbol && <CheckCircle size={14} style={{ color: 'var(--accent)' }} />}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function SwapSection() {
  const { address } = useAccount()
  const [from,     setFrom]     = useState<Token>(TOKENS[0])
  const [to,       setTo]       = useState<Token>(TOKENS[3])
  const [amount,   setAmount]   = useState('')
  const [quoting,  setQuoting]  = useState(false)
  const [out,      setOut]      = useState('')
  const [tab,      setTab]      = useState<'swap' | 'history'>('swap')
  const [history,  setHistory]  = useState<SwapRecord[]>([])
  const [showFrom, setShowFrom] = useState(false)
  const [showTo,   setShowTo]   = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const usdcFact = getUsdc(ARC_CHAIN_ID)

  const { data: usdcBal } = useReadContract({
    address: usdcFact?.address as `0x${string}`,
    abi: erc20Abi, functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: ARC_CHAIN_ID,
    query: { enabled: !!address && !!usdcFact },
  })
  const fmtBal = usdcBal !== undefined
    ? Amount.fromRaw(usdcBal, usdcDecimalsFor(ARC_CHAIN_ID)).toFixed(2) : '—'

  const quote = useCallback(() => {
    if (!amount || parseFloat(amount) <= 0) { setOut(''); return }
    setQuoting(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const fromRate = RATES[from.symbol] ?? 1
      const toRate   = RATES[to.symbol]   ?? 1
      const raw = (parseFloat(amount) * fromRate) / toRate
      setOut((raw * 0.997).toFixed(to.decimals > 8 ? 6 : 4))
      setQuoting(false)
    }, 350)
  }, [amount, from, to])

  useEffect(() => { const t = setTimeout(() => quote(), 0); return () => clearTimeout(t) }, [quote])

  const { writeContract, data: hash, isPending, reset: resetWrite } = useWriteContract()
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (isSuccess && hash) {
      const rec: SwapRecord = { id: hash, fromSymbol: from.symbol, toSymbol: to.symbol, fromAmount: amount, toAmount: out, timestamp: Date.now(), hash, status: 'confirmed' }
      toast.success(`${amount} ${from.symbol} → ${out} ${to.symbol}`)
      setTimeout(() => { setHistory(p => [rec, ...p.slice(0, 49)]); setAmount(''); setOut(''); resetWrite() }, 0)
    }
  }, [isSuccess, hash]) // eslint-disable-line

  const handleSwap = () => {
    if (!address || !usdcFact || !out) return
    if (from.symbol === 'USDC') {
      try {
        writeContract({
          address: usdcFact.address as `0x${string}`,
          abi: erc20Abi, functionName: 'transfer',
          args: [address, BigInt(Math.floor(parseFloat(amount) * 1e6))],
          chainId: ARC_CHAIN_ID,
        })
      } catch { toast.error('Invalid amount') }
    } else {
      const rec: SwapRecord = { id: `sim-${Date.now()}`, fromSymbol: from.symbol, toSymbol: to.symbol, fromAmount: amount, toAmount: out, timestamp: Date.now(), hash: '0x', status: 'confirmed' }
      setHistory(p => [rec, ...p.slice(0, 49)])
      toast.success(`${amount} ${from.symbol} → ${out} ${to.symbol}`)
      setAmount(''); setOut('')
    }
  }

  const flip = () => { const t = from; setFrom(to); setTo(t); setAmount(out) }

  const usdValue = amount ? (parseFloat(amount) * (RATES[from.symbol] ?? 1)).toFixed(2) : null

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto space-y-3">
      {/* Tabs */}
      <div className="flex gap-1 glass rounded-xl p-1">
        {(['swap', 'history'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all"
            style={{ background: tab === t ? 'var(--surface-strong)' : 'transparent', color: tab === t ? 'var(--ink)' : 'var(--muted)' }}>
            {t === 'swap' ? 'Swap' : `History (${history.length})`}
          </button>
        ))}
      </div>

      {tab === 'swap' && (
        <div className="glass-strong rounded-2xl p-5 space-y-3">
          {/* Supported networks strip */}
          <div>
            <p className="text-xs mb-2" style={{ color: 'var(--subtle)' }}>Available on</p>
            <div className="flex items-center gap-2 flex-wrap">
              {NETWORKS.map(n => (
                <div key={n.chainId} className="flex items-center gap-1.5 glass px-2 py-1 rounded-lg">
                  {n.icon}
                  <span className="text-xs" style={{ color: 'var(--ink-2)' }}>{n.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px" style={{ background: 'var(--border)' }} />

          {/* From */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>You pay</span>
              {from.symbol === 'USDC' && (
                <button onClick={() => setAmount(fmtBal !== '—' ? fmtBal : '')}
                  className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                  Balance: {fmtBal}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="0.00"
                  className="w-full bg-transparent display text-3xl font-bold outline-none tabular"
                  style={{ color: 'var(--ink)' }} />
                {usdValue && <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>≈ ${usdValue}</p>}
              </div>
              <div className="relative">
                <TokenButton token={from} onClick={() => { setShowFrom(v => !v); setShowTo(false) }} />
                {showFrom && <TokenPicker selected={from} exclude={to} onSelect={t => { setFrom(t) }} onClose={() => setShowFrom(false)} />}
              </div>
            </div>
          </div>

          {/* Flip */}
          <div className="flex justify-center -my-1">
            <button onClick={flip}
              className="w-10 h-10 rounded-xl flex items-center justify-center glass-strong hover:opacity-80 transition-opacity">
              <ArrowUpDown size={16} style={{ color: 'var(--accent)' }} />
            </button>
          </div>

          {/* To */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>You receive</span>
              {quoting && <div className="w-3 h-3 border border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" />}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 display text-3xl font-bold tabular"
                style={{ color: out ? 'var(--ink)' : 'var(--subtle)' }}>
                {out || '0.00'}
              </div>
              <div className="relative">
                <TokenButton token={to} onClick={() => { setShowTo(v => !v); setShowFrom(false) }} />
                {showTo && <TokenPicker selected={to} exclude={from} onSelect={t => { setTo(t) }} onClose={() => setShowTo(false)} />}
              </div>
            </div>
          </div>

          {/* Swap button */}
          <button onClick={handleSwap}
            disabled={!amount || parseFloat(amount) <= 0 || !out || !address || isPending || confirming}
            className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)', color: '#080e1a' }}>
            {isPending   ? 'Confirm in wallet...'
            : confirming ? <><div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />Confirming...</>
            : !address   ? 'Connect Wallet'
            : !amount    ? 'Enter Amount'
            : `Swap ${from.symbol} → ${to.symbol}`}
          </button>
        </div>
      )}

      {tab === 'history' && (
        <div className="glass-strong rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Swap History</span>
          </div>
          {history.length === 0 ? (
            <div className="text-center py-12">
              <Clock size={28} style={{ color: 'var(--subtle)' }} className="mx-auto mb-3" />
              <p className="text-sm" style={{ color: 'var(--muted)' }}>No swaps yet</p>
            </div>
          ) : history.map(r => (
            <div key={r.id} className="px-4 py-3 border-b last:border-0 hover:bg-white/5" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
                  {r.fromAmount} {r.fromSymbol}
                </span>
                <ArrowUpDown size={11} style={{ color: 'var(--subtle)' }} />
                <span className="text-sm font-bold" style={{ color: 'var(--secure)' }}>
                  {r.toAmount} {r.toSymbol}
                </span>
                <div className="ml-auto flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: r.status === 'confirmed' ? 'var(--secure)' : 'var(--danger)' }} />
                  {r.hash && r.hash !== '0x' && (
                    <a href={buildTxExplorerUrl(ARC_CHAIN_ID, r.hash)} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={11} style={{ color: 'var(--accent)' }} />
                    </a>
                  )}
                </div>
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>{new Date(r.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Refresh quote button */}
      <div className="flex justify-center">
        <button onClick={() => quote()}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg glass"
          style={{ color: 'var(--muted)' }}>
          <RefreshCw size={10} className={quoting ? 'animate-spin' : ''} />
          Refresh quote
        </button>
      </div>
    </div>
  )
}
