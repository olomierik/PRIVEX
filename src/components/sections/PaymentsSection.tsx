/**
 * PRIVEX Payments — Phase 5
 * USDC wallet-to-wallet payments, payment requests, QR receive, tx history.
 * Clearly distinguishes public (on-chain visible) vs future private payment paths.
 */
import { useState, useEffect, useRef } from 'react'
import {
  useAccount, useReadContract, useWriteContract,
  useWaitForTransactionReceipt, useSwitchChain, usePublicClient,
} from 'wagmi'
import { erc20Abi, isAddress, formatUnits, type Log } from 'viem'
import {
  Send, ArrowDown, Copy, ExternalLink, AlertTriangle,
  Lock, Info, QrCode, Clock, CheckCircle, XCircle,
  ArrowUpRight, ArrowDownLeft, RefreshCw, Shield,
} from 'lucide-react'
import { toast } from 'sonner'
import { TokenUSDC } from '@web3icons/react'
import { getUsdc, buildTxExplorerUrl } from '@/onchain-facts'
import { parseAmount, Amount, usdcDecimalsFor } from '@/onchain-money'
import { usePrivex } from '../../lib/store'
import { ARC_MAINNET_ID } from '../../config'

const ARC_TESTNET_ID = ARC_MAINNET_ID  // Arc Mainnet (5042)

type Tab = 'send' | 'receive' | 'history' | 'request'

interface TxRecord {
  hash: string
  direction: 'out' | 'in'
  to: string
  from: string
  amount: string
  timestamp: number
  confirmed: boolean
}

// Real scannable QR code using qrcode library
function QRDisplay({ value, label = 'Scan to pay' }: { value: string; label?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !value) return
    import('qrcode').then(QRCode => {
      void QRCode.toCanvas(canvasRef.current!, value, {
        width: 180,
        margin: 2,
        color: { dark: '#f0f6ff', light: '#0a1020' },
      })
    })
  }, [value])

  return (
    <div className="inline-flex flex-col items-center glass-strong p-3 rounded-2xl gap-2">
      <canvas ref={canvasRef} className="rounded-xl" />
      <p className="text-xs font-medium" style={{ color: 'var(--subtle)' }}>{label}</p>
    </div>
  )
}

export default function PaymentsSection() {
  const { address, chainId } = useAccount()
  const { state } = usePrivex()
  const { switchChain } = useSwitchChain()
  const publicClient = usePublicClient({ chainId: ARC_TESTNET_ID })

  const [tab, setTab] = useState<Tab>('send')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [copied, setCopied] = useState(false)
  const [txHistory, setTxHistory] = useState<TxRecord[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [requestAmount, setRequestAmount] = useState('')
  const [requestMemo, setRequestMemo] = useState('')
  const [requestLink, setRequestLink] = useState('')
  const [privateNote, setPrivateNote] = useState('')

  const usdcFact = getUsdc(ARC_TESTNET_ID)
  // Only flag wrong chain when a wallet is actually connected
  const isWrongChain = !!address && chainId !== ARC_TESTNET_ID

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: usdcFact?.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: ARC_TESTNET_ID,
    query: { enabled: !!address && !!usdcFact },
  })

  const { writeContract, data: hash, isPending, isError, error, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const formattedBalance = balance !== undefined
    ? Amount.fromRaw(balance, usdcDecimalsFor(ARC_TESTNET_ID)).toFixed(2)
    : '—'

  // On successful tx: add to history, clear form, refetch balance
  useEffect(() => {
    if (isSuccess && hash && address) {
      const record: TxRecord = {
        hash,
        direction: 'out',
        to: recipient,
        from: address,
        amount,
        timestamp: Date.now(),
        confirmed: true,
      }
      setTimeout(() => {
        setTxHistory(prev => [record, ...prev])
        setRecipient(''); setAmount(''); setMemo('')
        void refetchBalance()
      }, 0)
      toast.success('Payment confirmed')
    }
  }, [isSuccess, hash, address, recipient, amount, refetchBalance])

  // Fetch on-chain USDC Transfer history for this address
  const fetchHistory = async () => {
    if (!address || !usdcFact || !publicClient) return
    setLoadingHistory(true)
    try {
      const transferAbi = [{
        type: 'event',
        name: 'Transfer',
        inputs: [
          { name: 'from', type: 'address', indexed: true },
          { name: 'to', type: 'address', indexed: true },
          { name: 'value', type: 'uint256', indexed: false },
        ],
      }] as const

      const [sent, received] = await Promise.all([
        publicClient.getLogs({
          address: usdcFact.address as `0x${string}`,
          event: transferAbi[0],
          args: { from: address },
          fromBlock: 'earliest',
          toBlock: 'latest',
        }).catch((): Log[] => []),
        publicClient.getLogs({
          address: usdcFact.address as `0x${string}`,
          event: transferAbi[0],
          args: { to: address },
          fromBlock: 'earliest',
          toBlock: 'latest',
        }).catch((): Log[] => []),
      ])

      interface TransferLog extends Log {
        args: { from: `0x${string}`; to: `0x${string}`; value: bigint }
        transactionHash: `0x${string}`
      }

      const toRecord = (log: Log, dir: 'in' | 'out'): TxRecord => {
        const l = log as TransferLog
        const val = l.args?.value ?? BigInt(0)
        return {
          hash: l.transactionHash ?? '0x',
          direction: dir,
          to: l.args?.to ?? '0x',
          from: l.args?.from ?? '0x',
          amount: parseFloat(formatUnits(val, 6)).toFixed(2),
          timestamp: Date.now(),
          confirmed: true,
        }
      }

      const all = [
        ...sent.map(l => toRecord(l, 'out')),
        ...received.map(l => toRecord(l, 'in')),
      ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50)

      setTxHistory(all)
    } catch {
      toast.error('Could not load history')
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    if (tab === 'history') setTimeout(() => void fetchHistory(), 0)
  }, [tab, address])  // eslint-disable-line

  const handleSend = () => {
    if (isWrongChain) { switchChain({ chainId: ARC_TESTNET_ID }); return }
    const isHandle = recipient.includes('@privex') || /^[a-z0-9]{3,32}$/.test(recipient)
    if (!isAddress(recipient) && !isHandle) { toast.error('Enter a valid address or @privex handle'); return }
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter a valid amount'); return }
    if (!usdcFact) { toast.error('USDC not available on this chain'); return }
    if (!isAddress(recipient)) { toast.error('Handle lookup not yet live — paste the wallet address directly'); return }
    reset()
    let parsed: bigint
    try { parsed = parseAmount(ARC_TESTNET_ID, amount).raw }
    catch { toast.error('Invalid amount'); return }
    writeContract({
      address: usdcFact.address as `0x${string}`,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [recipient, parsed],
      chainId: ARC_TESTNET_ID,
    })
  }

  const generateRequestLink = () => {
    if (!address) return
    const url = `${window.location.origin}?to=${address}&amount=${requestAmount}&memo=${encodeURIComponent(requestMemo)}`
    setRequestLink(url)
    void navigator.clipboard.writeText(url)
    toast.success('Payment request link copied')
  }

  const copyAddress = () => {
    void navigator.clipboard.writeText(address ?? '').then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); toast.success('Address copied') })
  }

  const quickAmounts = ['1', '5', '10', '25', '50', '100']
  const tabs: { id: Tab; label: string }[] = [
    { id: 'send', label: 'Send' },
    { id: 'receive', label: 'Receive' },
    { id: 'request', label: 'Request' },
    { id: 'history', label: 'History' },
  ]

  const shortAddr = (a: string) => `${a.slice(0, 8)}...${a.slice(-6)}`

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto space-y-4">
      {/* Balance card */}
      <div className="glass-strong rounded-2xl p-5">
        <div className="label-caps mb-2">USDC Balance</div>
        <div className="flex items-center gap-3">
          <TokenUSDC variant="branded" size={36} />
          <div>
            <div className="display text-3xl font-bold tabular" style={{ color: 'var(--ink)' }}>{formattedBalance}</div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>Arc Mainnet · USDC</div>
          </div>
          <button onClick={() => void refetchBalance()} className="ml-auto p-2 rounded-lg transition-colors hover:bg-white/5">
            <RefreshCw size={13} style={{ color: 'var(--muted)' }} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{ background: tab === t.id ? 'var(--surface-strong)' : 'transparent', color: tab === t.id ? 'var(--ink)' : 'var(--muted)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Wrong chain banner */}
      {isWrongChain && tab !== 'history' && (
        <div className="glass rounded-xl p-3 flex items-center gap-2">
          <AlertTriangle size={12} style={{ color: 'var(--warning)' }} />
          <span className="text-xs" style={{ color: 'var(--warning)' }}>Wrong network — switch to Arc for payments</span>
          <button onClick={() => switchChain({ chainId: ARC_TESTNET_ID })} className="ml-auto text-xs font-semibold" style={{ color: 'var(--accent)' }}>Switch</button>
        </div>
      )}

      {/* ── SEND ── */}
      {tab === 'send' && (
        <div className="glass-strong rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--muted)' }}>Recipient</label>
            <input value={recipient} onChange={e => setRecipient(e.target.value)}
              placeholder="0x... wallet address or handle@privex"
              className="w-full glass rounded-xl px-3 py-2.5 text-xs outline-none mono"
              style={{ color: 'var(--ink)', fontFamily: 'JetBrains Mono, monospace' }} />
            {recipient && !isAddress(recipient) && !recipient.includes('@privex') && !/^[a-z0-9]{3,32}$/.test(recipient) && (
              <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>Enter a valid 0x address or @privex handle</p>
            )}
            {/* Contact suggestions */}
            {recipient.length > 2 && state.contacts.filter(c =>
              c.handle.toLowerCase().includes(recipient.toLowerCase()) ||
              c.address.toLowerCase().includes(recipient.toLowerCase())
            ).length > 0 && (
              <div className="mt-1 glass rounded-xl overflow-hidden">
                {state.contacts.filter(c =>
                  c.handle.toLowerCase().includes(recipient.toLowerCase()) ||
                  c.address.toLowerCase().includes(recipient.toLowerCase())
                ).slice(0, 4).map(c => (
                  <button key={c.address} onClick={() => setRecipient(c.address)}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-white/5 transition-colors">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--surface-strong)', color: 'var(--accent)' }}>{c.handle[0]?.toUpperCase()}</div>
                    <div>
                      <div className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>{c.handle}</div>
                      <div className="mono text-xs" style={{ color: 'var(--subtle)' }}>{shortAddr(c.address)}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Amount (USDC)</label>
              <button onClick={() => balance && setAmount(Amount.fromRaw(balance, usdcDecimalsFor(ARC_TESTNET_ID)).toFixed(6))}
                className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>Max</button>
            </div>
            <div className="glass rounded-xl px-3 py-2.5 flex items-center gap-2">
              <TokenUSDC variant="branded" size={18} />
              <input value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="0.00" type="text" inputMode="decimal"
                className="bg-transparent flex-1 text-xl font-bold outline-none tabular"
                style={{ color: 'var(--ink)', fontFamily: 'Space Grotesk, sans-serif' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>USDC</span>
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {quickAmounts.map(q => (
                <button key={q} onClick={() => setAmount(q)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                  style={{ background: amount === q ? 'var(--accent)' : 'var(--surface-muted)', color: amount === q ? 'var(--accent-text)' : 'var(--ink-2)' }}>
                  ${q}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--muted)' }}>Memo (optional — stored on-chain)</label>
            <input value={memo} onChange={e => setMemo(e.target.value)} placeholder="What's this for?" maxLength={100}
              className="w-full glass rounded-xl px-3 py-2 text-xs outline-none" style={{ color: 'var(--ink)' }} />
          </div>

          {/* Optional private note (local only) */}
          <div>
            <div className="flex items-center gap-1 mb-1.5">
              <Lock size={10} style={{ color: 'var(--secure)' }} />
              <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Private note (local only — never on-chain)</label>
            </div>
            <input value={privateNote} onChange={e => setPrivateNote(e.target.value)} placeholder="Personal reminder — stays on your device"
              className="w-full glass rounded-xl px-3 py-2 text-xs outline-none" style={{ color: 'var(--ink)' }} />
          </div>

          <div className="glass rounded-xl p-3 flex items-start gap-2">
            <Info size={11} style={{ color: 'var(--muted)', flexShrink: 0, marginTop: 1 }} />
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              <strong style={{ color: 'var(--ink-2)' }}>Public Transaction:</strong> Standard USDC transfer visible on-chain. Private shielded payments using zero-knowledge proofs are planned for Phase 8.
            </p>
          </div>

          <button onClick={handleSend} disabled={isPending || isConfirming || !recipient || !amount}
            className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
            {isPending ? 'Confirm in wallet...' : isConfirming
              ? <><div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />Confirming...</>
              : <><Send size={14} />Send USDC</>}
          </button>

          {isSuccess && hash && (
            <div className="glass rounded-xl p-3 flex items-center gap-2">
              <CheckCircle size={13} style={{ color: 'var(--secure)' }} />
              <span className="text-xs" style={{ color: 'var(--secure)' }}>Transaction confirmed</span>
              <a href={buildTxExplorerUrl(ARC_TESTNET_ID, hash)} target="_blank" rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}>
                <ExternalLink size={10} />View
              </a>
            </div>
          )}
          {isError && (
            <div className="glass rounded-xl p-3 flex items-center gap-2">
              <XCircle size={13} style={{ color: 'var(--danger)' }} />
              <span className="text-xs" style={{ color: 'var(--danger)' }}>
                {error?.message?.includes('user rejected') ? 'Cancelled by user' : 'Transaction failed'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── RECEIVE ── */}
      {tab === 'receive' && (
        <div className="glass-strong rounded-2xl p-5 space-y-5">
          <div className="flex flex-col items-center gap-4">
            <QRDisplay value={address ?? 'no-address'} />
            <div className="w-full glass rounded-xl px-3 py-2.5 flex items-center gap-2">
              <span className="mono text-xs flex-1 truncate" style={{ color: 'var(--ink)' }}>{address ?? 'Connect wallet'}</span>
              <button onClick={copyAddress}>
                <Copy size={13} style={{ color: copied ? 'var(--secure)' : 'var(--accent)' }} />
              </button>
            </div>
            {state.privexHandle && (
              <div className="w-full glass rounded-xl px-3 py-2.5 flex items-center gap-2">
                <Shield size={12} style={{ color: 'var(--accent)' }} />
                <span className="text-xs flex-1" style={{ color: 'var(--ink)' }}>{state.privexHandle}@privex</span>
                <button onClick={() => { void navigator.clipboard.writeText(`${state.privexHandle}@privex`).then(() => toast.success('Handle copied')) }}>
                  <Copy size={13} style={{ color: 'var(--accent)' }} />
                </button>
              </div>
            )}
          </div>
          <div className="glass rounded-xl p-3 flex items-start gap-2">
            <Info size={11} style={{ color: 'var(--muted)', flexShrink: 0, marginTop: 1 }} />
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Share your address or PRIVEX handle for USDC payments. All incoming payments are publicly visible on-chain.</p>
          </div>
        </div>
      )}

      {/* ── REQUEST ── */}
      {tab === 'request' && (
        <div className="glass-strong rounded-2xl p-5 space-y-4">
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Generate a payment request link. Share it with anyone to receive a specific USDC amount.</p>
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--muted)' }}>Amount (USDC)</label>
            <div className="glass rounded-xl px-3 py-2.5 flex items-center gap-2">
              <TokenUSDC variant="branded" size={16} />
              <input value={requestAmount} onChange={e => setRequestAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="0.00" className="bg-transparent flex-1 text-lg font-bold outline-none tabular"
                style={{ color: 'var(--ink)', fontFamily: 'Space Grotesk, sans-serif' }} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--muted)' }}>Memo / Invoice reference</label>
            <input value={requestMemo} onChange={e => setRequestMemo(e.target.value)} placeholder="Invoice #001"
              className="w-full glass rounded-xl px-3 py-2.5 text-xs outline-none" style={{ color: 'var(--ink)' }} />
          </div>
          <button onClick={generateRequestLink} disabled={!address}
            className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80 disabled:opacity-40"
            style={{ background: 'var(--surface-strong)', color: 'var(--ink)' }}>
            <QrCode size={14} />Generate Payment Link
          </button>
          {requestLink && (
            <div className="space-y-3">
              <div className="glass rounded-xl p-3">
                <div className="text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>Payment Link</div>
                <div className="text-xs mono break-all" style={{ color: 'var(--ink-2)' }}>{requestLink}</div>
              </div>
              <div className="flex justify-center">
                <QRDisplay value={requestLink} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── HISTORY ── */}
      {tab === 'history' && (
        <div className="glass-strong rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Transaction History</span>
            <button onClick={() => void fetchHistory()} className="flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}>
              <RefreshCw size={11} className={loadingHistory ? 'animate-spin' : ''} />Refresh
            </button>
          </div>

          {loadingHistory ? (
            <div className="flex items-center justify-center py-12 gap-2">
              <div className="w-4 h-4 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" />
              <span className="text-xs" style={{ color: 'var(--muted)' }}>Loading...</span>
            </div>
          ) : txHistory.length === 0 ? (
            <div className="text-center py-12">
              <Clock size={28} style={{ color: 'var(--subtle)' }} className="mx-auto mb-3" />
              <p className="text-sm" style={{ color: 'var(--muted)' }}>No transactions yet</p>
              <p className="text-xs mt-1" style={{ color: 'var(--subtle)' }}>Send or receive USDC to see history</p>
            </div>
          ) : (
            <div>
              {txHistory.map((tx, i) => (
                <div key={`${tx.hash}-${i}`} className="flex items-center gap-3 px-4 py-3 border-b last:border-0 hover:bg-white/5 transition-colors"
                  style={{ borderColor: 'var(--border)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: tx.direction === 'out' ? '#f97316' + '22' : '#00e596' + '22' }}>
                    {tx.direction === 'out'
                      ? <ArrowUpRight size={14} style={{ color: '#f97316' }} />
                      : <ArrowDownLeft size={14} style={{ color: 'var(--secure)' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>
                      {tx.direction === 'out' ? `To ${shortAddr(tx.to)}` : `From ${shortAddr(tx.from)}`}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--subtle)' }}>
                      {new Date(tx.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold tabular" style={{ color: tx.direction === 'out' ? '#f97316' : 'var(--secure)' }}>
                      {tx.direction === 'out' ? '-' : '+'}{tx.amount} USDC
                    </div>
                    {tx.hash !== '0x' && (
                      <a href={buildTxExplorerUrl(ARC_TESTNET_ID, tx.hash)} target="_blank" rel="noopener noreferrer"
                        className="text-xs flex items-center gap-0.5 justify-end" style={{ color: 'var(--accent)' }}>
                        <ExternalLink size={9} />View
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
