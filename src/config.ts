/**
 * wagmi configuration
 * Built with Arc Studio — https://studio.arc.io
 */

import { http, createConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { arc } from 'viem/chains'
import { injected } from 'wagmi/connectors'
import { registerChain } from './tracing'

// Pre-register chain RPC URLs so trace events show correct chain names immediately
registerChain(arc.id, arc.rpcUrls.default.http[0])

/** Arc Mainnet chain ID */
export const ARC_CHAIN_ID = arc.id  // 5042

/**
 * The fee-receiving and admin wallet.
 * All service fees route here; only this address can access the Admin panel.
 */
export const ADMIN_WALLET = '0x274262A0321A0701b0A46a3576e07aE881c286Bb' as const

/** USDC on Arc Mainnet */
export const ARC_USDC_ADDRESS = '0x3600000000000000000000000000000000000000' as const

/** PaymentRouter — Arc Mainnet */
export const PAYMENT_ROUTER_ADDRESS = (import.meta.env.VITE_PAYMENT_ROUTER_ADDRESS ?? '') as `0x${string}`
/** AccessManager — Arc Mainnet */
export const ACCESS_MANAGER_ADDRESS = (import.meta.env.VITE_ACCESS_MANAGER_ADDRESS ?? '') as `0x${string}`
/** PRIVEXToken (PVX) — Arc Mainnet */
export const PRIVEX_TOKEN_ADDRESS = (import.meta.env.VITE_PRIVEX_TOKEN_ADDRESS ?? '') as `0x${string}`

export const config = createConfig({
  chains: [arc, mainnet], // mainnet needed for ENS resolution
  connectors: [injected()],
  transports: {
    [arc.id]: http('https://rpc.mainnet.arc.io'),
    [mainnet.id]: http(), // ENS resolution uses mainnet
  },
})
