/**
 * Custom wagmi connector wrapping @walletconnect/ethereum-provider directly.
 * Avoids wagmi/connectors which drags in @coinbase/wallet-sdk / porto and
 * causes OOM during production builds.
 */
import { createConnector } from 'wagmi'

type WCOptions = {
  projectId: string
  chains: number[]
  metadata: { name: string; description: string; url: string; icons: string[] }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WCProvider = any

export function walletConnectConnector(opts: WCOptions) {
  let provider: WCProvider | null = null

  const getProvider = async (): Promise<WCProvider> => {
    if (!provider) {
      const EthereumProvider = (await import('@walletconnect/ethereum-provider')).default
      provider = await EthereumProvider.init({
        projectId: opts.projectId,
        chains: [opts.chains[0]],
        optionalChains: opts.chains.slice(1),
        showQrModal: true,
        metadata: opts.metadata,
      })
    }
    return provider
  }

  return createConnector((config) => ({
    id: 'walletConnect',
    name: 'WalletConnect',
    type: 'walletConnect' as const,
    icon: 'https://avatars.githubusercontent.com/u/37784886',

    async setup() {},

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async connect({ chainId }: { chainId?: number } = {}): Promise<any> {
      const p = await getProvider()
      if (!p.connected) {
        await p.connect({ chains: chainId ? [chainId] : undefined })
      }
      const accounts = (p.accounts ?? []) as `0x${string}`[]
      const chain = chainId ?? Number(p.chainId)
      config.emitter.emit('connect', { accounts, chainId: chain })
      return { accounts, chainId: chain }
    },

    async disconnect() {
      const p = await getProvider()
      await p.disconnect()
      provider = null
      config.emitter.emit('disconnect')
    },

    async getAccounts() {
      const p = await getProvider()
      return (p.accounts ?? []) as `0x${string}`[]
    },

    async getChainId() {
      const p = await getProvider()
      return Number(p.chainId)
    },

    async isAuthorized() {
      try {
        const accs = await this.getAccounts()
        return accs.length > 0
      } catch {
        return false
      }
    },

    async getProvider() {
      return getProvider()
    },

    onConnect() {},
    onAccountsChanged(accounts: string[]) {
      config.emitter.emit('change', { accounts: accounts as `0x${string}`[] })
    },
    onChainChanged(chainId: string) {
      config.emitter.emit('change', { chainId: Number(chainId) })
    },
    onDisconnect() {
      provider = null
      config.emitter.emit('disconnect')
    },
  }))
}
