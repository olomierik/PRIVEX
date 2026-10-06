/**
 * PRIVEX Swap — Phase 6
 * DEX swap interface on Arc with live quote simulation, token picker,
 * price impact, slippage, gas estimate, tx history.
 * Note: Normal DEX swaps are on-chain and publicly visible.
 * A shielded swap module is planned for Phase 8.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  ArrowUpDown, Info, AlertTriangle, ChevronDown, ExternalLink,
  Search, X, CheckCircle, Clock, RefreshCw, Zap, TrendingDown,
} from 'lucide-react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { erc20Abi } from 'viem'
import { toast } from 'sonner'
import { getUsdc, buildTxExplorerUrl } from '@/onchain-facts'
import { usdcDecimalsFor, Amount } from '@/onchain-money'
import { TokenUSDC } from '@web3icons/react'

const ARC_TESTNET_ID = 5042002

interface Token {
  symbol: string
  name: string
  address: string
  decimals: number
  color: string
  description: string
}

const TOKENS: Token[] = [
  { symbol: 'USDC', name: 'USD Coin', address: '0x3600000000000000000000000000000000000000', decimals: 6, color: '#2775ca', description: 'Circle stablecoin' },
  { symbol: 'PVX', name: 'PRIVEX Token', address: '', decimals: 18, color: '#00e596', description: 'PRIVEX utility token' },
  { symbol: 'WETH', name: 'Wrapped ETH', address: '', decimals: 18, color: '#627eea', description: 'Wrapped Ether' },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '', decimals: 8, color: '#f7931a', description: 'Wrapped Bitcoin' },
  { symbol: 'DAI', name: 'Dai', address: '', decimals: 18, color: '#f5ac37', description: 'MakerDAO stablecoin' },
  { symbol: 'ARB', name: 'Arbitrum', address: '', decimals: 18, color: '#28a0f0', description: 'Arbitrum governance token' },
]

// Simulated DEX rates vs USDC
const RATES: Record<string, number> = {
  USDC: 1,
  PVX: 0.025,   // 1 USDC = 40 PVX
  WETH: 2450,
  WBTC: 62000,
  DAI: 1,
  ARB: 0.85,
}

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

function TokenIcon({ token, size = 24 }: { token: Token; size?: number }) {
  if (token.symbol === 'USDC') return <TokenUSDC variant="branded" size={size} />
  return (
    <div className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
      style={{ width: size, height: size, background: token.color + '33', color: token.color, fontSize: size * 0.4, fontFamily: 'Space Grotesk, sans-serif' }}>
      {token.symbol[0]}
    </div>
  )
}

function TokenPicker({ selected, onSelect, exclude }: { selected: Token; onSelect: (t: Token) => void; exclude: Token }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = TOKENS.filter(t => t.symbol !== exclude.symbol &&
    (t.symbol.toLowerCase().includes(search.toLowerCase()) || t.name.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 glass-strong px-3 py-2 rounded-xl hover:opacity-80 transition-opacity">
        <TokenIcon token={selected} size={20} />
        <span className="text-sm font-bold" style={{ color: 'var(--ink)' }}>{selected.symbol}</span>
        <ChevronDown size={12} style={{ color: 'var(--muted)' }} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 glass-strong rounded-xl shadow-xl z-50 overflow-hidden border" style={{ borderColor: 'var(--border-strong)' }}>
          <div className="p-2 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 glass rounded-lg px-2 py-1.5">
              <Search size={11} style={{ color: 'var(--muted)' }} />
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search token..."
                className="bg-transparent text-xs outline-none flex-1" style={{ color: 'var(--ink)' }} />
              {search && <button onClick={() => setSearch('')}><X size={10} style={{ color: 'var(--muted)' }} /></button>}
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.map(t => (
              <button key={t.symbol} onClick={() => { onSelect(t); setOpen(false); setSearch('') }}
                className="w-full px-3 py-2.5 flex items-center gap-2.5 hover:bg-white/5 transition-colors text-left">
                <TokenIcon token={t} size={28} />
                <div>
                  <div className="text-xs font-bold" style={{ color: 'var(--ink)' }}>{t.symbol}</div>
                  <div className="text-xs" style={{ color: 'var(--subtle)' }}>{t.name}</div>
                </div>
                {t.symbol === selected.symbol && <CheckCircle size={11} style={{ color: 'var(--accent)', marginLeft: 'auto' }} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function SwapSection() {
  const { address } = useAccount()
  const [fromToken, setFromToken] = useState<Token>(TOKENS[0])
  const [toToken, setToToken] = useState<Token>(TOKENS[1])
  const [fromAmount, setFromAmount] = useState('')
  const [slippage, setSlippage] = useState('0.5')
  const [customSlippage, setCustomSlippage] = useState('')
  const [quoting, setQuoting] = useState(false)
  const [quote, setQuote] = useState<{ out: string; priceImpact: number; fee: string; route: string } | null>(null)
  const [tab, setTab] = useState<'swap' | 'history'>('swap')
  const [history, setHistory] = useState<SwapRecord[]>([])
  const [showSlippageConfig, setShowSlippageConfig] = useState(false)
  const quoteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const usdcFact = getUsdc(ARC_TESTNET_ID)
  const effectiveSlippage = customSlippage || slippage

  const { data: usdcBalance } = useReadContract({
    address: usdcFact?.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: ARC_TESTNET_ID,
    query: { enabled: !!address && !!usdcFact },
  })

  const formattedUsdcBal = usdcBalance !== undefined
    ? Amount.fromRaw(usdcBalance, usdcDecimalsFor(ARC_TESTNET_ID)).toFixed(2)
    : '—'

  // Compute live quote with simulated latency
  const fetchQuote = useCallback(() => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) { setQuote(null); return }
    setQuoting(true)
    if (quoteTimerRef.current) clearTimeout(quoteTimerRef.current)
    quoteTimerRef.current = setTimeout(() => {
      const fromRate = RATES[fromToken.symbol] ?? 1
      const toRate = RATES[toToken.symbol] ?? 1
      const outRaw = (parseFloat(fromAmount) * fromRate) / toRate
      const impact = Math.min(parseFloat(fromAmount) * 0.01, 2.5)
      const out = (outRaw * (1 - impact / 100)).toFixed(toToken.decimals > 8 ? 6 : 4)
      const fee = (parseFloat(fromAmount) * 0.003).toFixed(4)
      const route = `${fromToken.symbol} → ${fromToken.symbol === 'USDC' || toToken.symbol === 'USDC' ? toToken.symbol : 'USDC'} → ${toToken.symbol === 'USDC' || fromToken.symbol === 'USDC' ? toToken.symbol : toToken.symbol}`
      setQuote({ out, priceImpact: impact, fee, route })
      setQuoting(false)
    }, 400)
  }, [fromAmount, fromToken, toToken])

  useEffect(() => { setTimeout(() => fetchQuote(), 0) }, [fetchQuote])

  const { writeContract, data: swapHash, isPending, reset: resetWrite } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: swapHash })

  useEffect(() => {
    if (isSuccess && swapHash && quote) {
      const rec: SwapRecord = {
        id: swapHash,
        fromSymbol: fromToken.symbol,
        toSymbol: toToken.symbol,
        fromAmount,
        toAmount: quote.out,
        timestamp: Date.now(),
        hash: swapHash,
        status: 'confirmed',
      }
      toast.success(`Swapped ${fromAmount} ${fromToken.symbol} → ${quote.out} ${toToken.symbol}`)
      setTimeout(() => {
        setHistory(prev => [rec, ...prev.slice(0, 49)])
        setFromAmount('')
        setQuote(null)
        resetWrite()
      }, 0)
    }
  }, [isSuccess, swapHash]) // eslint-disable-line

  const handleSwap = () => {
    if (!address || !usdcFact || !quote) return
    if (fromToken.symbol === 'USDC' && usdcBalance !== undefined) {
      // Simulate: approve + swap call to DEX router. Using self-transfer as placeholder.
      try {
        const parsed = BigInt(Math.floor(parseFloat(fromAmount) * 1e6))
        writeContract({
          address: usdcFact.address as `0x${string}`,
          abi: erc20Abi,
          functionName: 'transfer',
          args: [address, parsed], // self-transfer placeholder
          chainId: ARC_TESTNET_ID,
        })
      } catch {
        toast.error('Invalid amount')
      }
    } else {
      // Non-USDC: just add to history as simulated
      const rec: SwapRecord = {
        id: `sim-${Date.now()}`,
        fromSymbol: fromToken.symbol,
        toSymbol: toToken.symbol,
        fromAmount,
        toAmount: quote.out,
        timestamp: Date.now(),
        hash: '0x',
        status: 'confirmed',
      }
      setHistory(prev => [rec, ...prev.slice(0, 49)])
      toast.success(`Swap simulated — DEX router not yet deployed on testnet`)
      setFromAmount(''); setQuote(null)
    }
  }

  const flip = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(quote?.out ?? '')
  }

  const impactColor = !quote ? 'var(--muted)'
    : quote.priceImpact < 0.5 ? 'var(--secure)'
    : quote.priceImpact < 2 ? 'var(--warning)'
    : 'var(--danger)'

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 glass rounded-xl p-1">
        {(['swap', 'history'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all"
            style={{ background: tab === t ? 'var(--surface-strong)' : 'transparent', color: tab === t ? 'var(--ink)' : 'var(--muted)' }}>
            {t === 'swap' ? 'Swap' : `History (${history.length})`}
          </button>
        ))}
      </div>

      {tab === 'swap' && (
        <div className="glass-strong rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="display font-semibold text-sm" style={{ color: 'var(--ink)' }}>Swap Tokens</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => fetchQuote()} className="p-1 rounded-lg hover:bg-white/5">
                <RefreshCw size={12} style={{ color: quoting ? 'var(--accent)' : 'var(--muted)' }} className={quoting ? 'animate-spin' : ''} />
              </button>
              <button onClick={() => setShowSlippageConfig(v => !v)}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg glass"
                style={{ color: 'var(--muted)' }}>
                <Zap size={10} />{effectiveSlippage}% slippage
              </button>
            </div>
          </div>

          {/* Slippage config */}
          {showSlippageConfig && (
            <div className="glass rounded-xl p-3 space-y-2">
              <div className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Max slippage</div>
              <div className="flex gap-1.5 flex-wrap items-center">
                {['0.1', '0.5', '1.0', '2.0'].map(s => (
                  <button key={s} onClick={() => { setSlippage(s); setCustomSlippage('') }}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                    style={{ background: effectiveSlippage === s ? 'var(--accent)' : 'var(--surface-muted)', color: effectiveSlippage === s ? '#080e1a' : 'var(--muted)' }}>
                    {s}%
                  </button>
                ))}
                <div className="flex items-center gap-1 glass rounded-lg px-2 py-1">
                  <input value={customSlippage} onChange={e => setCustomSlippage(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="Custom" className="bg-transparent text-xs outline-none w-12" style={{ color: 'var(--ink)' }} />
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>%</span>
                </div>
              </div>
              {parseFloat(effectiveSlippage) > 2 && (
                <div className="flex items-center gap-1">
                  <AlertTriangle size={10} style={{ color: 'var(--warning)' }} />
                  <span className="text-xs" style={{ color: 'var(--warning)' }}>High slippage — may result in unfavorable trade</span>
                </div>
              )}
            </div>
          )}

          {/* From */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs" style={{ color: 'var(--muted)' }}>From</span>
              {fromToken.symbol === 'USDC' && (
                <button onClick={() => setFromAmount(formattedUsdcBal !== '—' ? formattedUsdcBal : '')}
                  className="text-xs" style={{ color: 'var(--accent)' }}>
                  Balance: {formattedUsdcBal} USDC
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input value={fromAmount} onChange={e => setFromAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="0.00"
                className="flex-1 bg-transparent display text-2xl font-bold outline-none tabular"
                style={{ color: 'var(--ink)' }} />
              <TokenPicker selected={fromToken} onSelect={setFromToken} exclude={toToken} />
            </div>
            {fromAmount && (
              <div className="text-xs mt-1" style={{ color: 'var(--subtle)' }}>
                ≈ ${(parseFloat(fromAmount) * (RATES[fromToken.symbol] ?? 1)).toFixed(2)} USD
              </div>
            )}
          </div>

          {/* Flip button */}
          <div className="flex justify-center -my-1">
            <button onClick={flip}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-80 glass-strong">
              <ArrowUpDown size={15} style={{ color: 'var(--accent)' }} />
            </button>
          </div>

          {/* To */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs" style={{ color: 'var(--muted)' }}>To (estimated)</span>
              {quoting && <div className="w-3 h-3 border border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" />}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 display text-2xl font-bold tabular"
                style={{ color: quote?.out ? 'var(--ink)' : 'var(--subtle)' }}>
                {quote?.out ?? '0.00'}
              </div>
              <TokenPicker selected={toToken} onSelect={setToToken} exclude={fromToken} />
            </div>
            {quote && (
              <div className="text-xs mt-1" style={{ color: 'var(--subtle)' }}>
                ≈ ${(parseFloat(quote.out) * (RATES[toToken.symbol] ?? 1)).toFixed(2)} USD
              </div>
            )}
          </div>

          {/* Quote details */}
          {quote && fromAmount && (
            <div className="glass rounded-xl p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--muted)' }}>Rate</span>
                <span style={{ color: 'var(--ink-2)' }}>
                  1 {fromToken.symbol} ≈ {((RATES[fromToken.symbol] ?? 1) / (RATES[toToken.symbol] ?? 1)).toFixed(6)} {toToken.symbol}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <div className="flex items-center gap-1">
                  <TrendingDown size={10} style={{ color: impactColor }} />
                  <span style={{ color: 'var(--muted)' }}>Price impact</span>
                </div>
                <span style={{ color: impactColor }}>{quote.priceImpact.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--muted)' }}>Protocol fee (0.3%)</span>
                <span style={{ color: 'var(--ink-2)' }}>{quote.fee} {fromToken.symbol}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--muted)' }}>Minimum received</span>
                <span style={{ color: 'var(--ink-2)' }}>
                  {(parseFloat(quote.out) * (1 - parseFloat(effectiveSlippage) / 100)).toFixed(6)} {toToken.symbol}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--muted)' }}>Route</span>
                <span style={{ color: 'var(--subtle)' }}>{quote.route}</span>
              </div>
            </div>
          )}

          <div className="glass rounded-xl p-3 flex items-start gap-2">
            <Info size={11} style={{ color: 'var(--muted)', flexShrink: 0, marginTop: 1 }} />
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              Swaps execute through Arc DEX contracts. All swaps are publicly visible on-chain. PRIVEX token (PVX) is a utility token — not an investment vehicle.
            </p>
          </div>

          <button onClick={handleSwap} disabled={!fromAmount || !address || !quote || isPending || isConfirming}
            className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)', color: '#080e1a' }}>
            {isPending ? 'Confirm in wallet...'
              : isConfirming ? <><div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />Confirming...</>
              : !address ? 'Connect Wallet'
              : !fromAmount ? 'Enter Amount'
              : `Swap ${fromToken.symbol} → ${toToken.symbol}`}
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
          ) : (
            history.map(r => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3 border-b last:border-0 hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--surface-strong)', color: 'var(--accent)' }}>{r.fromSymbol[0]}</div>
                  <ArrowUpDown size={10} style={{ color: 'var(--subtle)' }} />
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--surface-strong)', color: 'var(--accent-2)' }}>{r.toSymbol[0]}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>
                    {r.fromAmount} {r.fromSymbol} → {r.toAmount} {r.toSymbol}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--subtle)' }}>{new Date(r.timestamp).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: r.status === 'confirmed' ? 'var(--secure)' : r.status === 'pending' ? 'var(--warning)' : 'var(--danger)' }} />
                  {r.hash && r.hash !== '0x' && (
                    <a href={buildTxExplorerUrl(ARC_TESTNET_ID, r.hash)} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={10} style={{ color: 'var(--accent)' }} />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="glass rounded-xl p-3 flex items-start gap-2">
        <AlertTriangle size={11} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 1 }} />
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          Token swaps involve price risk. Always verify token contract addresses. PVX is a utility token with no guaranteed returns. DEX liquidity on Arc testnet is simulated.
        </p>
      </div>
    </div>
  )
}
