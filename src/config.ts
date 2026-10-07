// oxlint-disable typescript/no-unsafe-member-access
import { http, createConfig } from 'wagmi'
import { mainnet, base, arbitrum, optimism, polygon, avalanche } from 'wagmi/chains'
import { arc } from 'viem/chains'
import { defineChain } from 'viem'
import { injected } from '@wagmi/core'
import { registerChain } from './tracing'
import { walletConnectConnector } from './lib/wcConnector'

// Robinhood Chain (EVM L2, chain ID 4663)
export const robinhoodChain = defineChain({
  id: 4663,
  name: 'Robinhood Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.mainnet.chain.robinhood.com'] } },
  blockExplorers: { default: { name: 'Blockscout', url: 'https://robinhoodchain.blockscout.com' } },
})

registerChain(arc.id, arc.rpcUrls.default.http[0])
registerChain(robinhoodChain.id, robinhoodChain.rpcUrls.default.http[0])

export const ARC_MAINNET_ID    = arc.id // 5042
export const ROBINHOOD_ID      = robinhoodChain.id // 4663
export const ADMIN_WALLET      = '0x274262A0321A0701b0A46a3576e07aE881c286Bb'
export const USDC_ARC          = '0x3600000000000000000000000000000000000000'
export const PAYMENT_ROUTER    = import.meta.env.VITE_PAYMENT_ROUTER_ADDRESS
export const ACCESS_MANAGER    = import.meta.env.VITE_ACCESS_MANAGER_ADDRESS
export const PVX_TOKEN_ADDRESS = '0x31074f65b518D9a711555D27B9d4A59c18211fc5'
export const PRIVEX_TOKEN      = (import.meta.env.VITE_PRIVEX_TOKEN_ADDRESS) ?? PVX_TOKEN_ADDRESS
export const WC_PROJECT_ID     = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined

export const SUPPORTED_CHAINS = [arc, robinhoodChain, mainnet, base, arbitrum, optimism, polygon, avalanche] as const
const CHAIN_IDS = SUPPORTED_CHAINS.map(c => c.id) as [number, ...number[]]

const connectors = [injected({ shimDisconnect: true })]

if (WC_PROJECT_ID) {
  connectors.push(
    walletConnectConnector({
      projectId: WC_PROJECT_ID,
      chains: CHAIN_IDS,
      metadata: {
        name: 'PRIVEX',
        description: 'Encrypted. Private. Onchain.',
        url: 'https://privex.world',
        icons: ['https://privex.world/privex-icon.svg'],
      },
    }),
  )
}

export const wagmiConfig = createConfig({
  chains: SUPPORTED_CHAINS,
  connectors,
  transports: {
    [arc.id]:              http('https://rpc.mainnet.arc.io'),
    [robinhoodChain.id]:   http('https://rpc.mainnet.chain.robinhood.com'),
    [mainnet.id]:          http(),
    [base.id]:             http(),
    [arbitrum.id]:         http(),
    [optimism.id]:         http(),
    [polygon.id]:          http(),
    [avalanche.id]:        http(),
  },
})
