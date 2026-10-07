// oxlint-disable typescript/no-unsafe-assignment, typescript/no-unsafe-member-access, typescript/no-unsafe-call, typescript/no-unsafe-argument, typescript/no-explicit-any, typescript/no-redundant-type-constituents, typescript/no-unsafe-return, typescript/no-floating-promises
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
  // The provider instance (reused, never re-inited — init is expensive)
  let provider: WCProvider | null = null
  // Whether we have registered the lifecycle event listeners
  let listenersAttached = false

  const initProvider = async (): Promise<WCProvider> => {
    if (provider) return provider
    const mod = await import('@walletconnect/ethereum-provider')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const EthereumProvider = mod.default ?? mod
    provider = await EthereumProvider.init({
      projectId: opts.projectId,
      chains: [opts.chains[0]],
      optionalChains: opts.chains.slice(1) as [number, ...number[]],
      showQrModal: true,
      qrModalOptions: { themeMode: 'dark' },
      metadata: opts.metadata,
    })
    return provider
  }

  return createConnector((config) => {
    const attachListeners = (p: WCProvider) => {
      if (listenersAttached) return
      listenersAttached = true

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      p.on('accountsChanged', (accounts: string[]) => {
        config.emitter.emit('change', { accounts: accounts as `0x${string}`[] })
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      p.on('chainChanged', (chainId: string | number) => {
        config.emitter.emit('change', { chainId: Number(chainId) })
      })
      // wallet-side or relay disconnect
      const handleDisconnect = () => {
        config.emitter.emit('disconnect')
        // Don't null provider — just let the next connect() call clear the session
      }
      p.on('disconnect', handleDisconnect)
      p.on('session_delete', handleDisconnect)
      p.on('session_expire', handleDisconnect)
    }

    return {
      id: 'walletConnect',
      name: 'WalletConnect',
      type: 'walletConnect' as const,
      icon: 'https://avatars.githubusercontent.com/u/37784886',

      async setup() {
        // Do NOT pre-init — defer until explicit user click.
        // Pre-init immediately opens a relay WebSocket which fails with
        // "origin not allowed" if the domain isn't whitelisted in Reown,
        // flooding the console with 3000 errors and freezing the UI.
      },

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async connect({ chainId }: { chainId?: number } = {}): Promise<any> {
        const p = await initProvider()
        attachListeners(p)

        // Always clear any stale session so the modal always appears
        if (p.session) {
          try {
            await p.disconnect()
          } catch {
            // Ignore — session may already be gone on the relay
          }
        }

        // Now open the QR / deeplink modal fresh
        await p.connect({
          chains: chainId ? [chainId] : undefined,
        })

        const accounts = (p.accounts ?? []) as `0x${string}`[]
        const resolvedChain = chainId ?? Number(p.chainId)
        config.emitter.emit('connect', { accounts, chainId: resolvedChain })
        return { accounts, chainId: resolvedChain }
      },

      async disconnect() {
        const p = await initProvider()
        try {
          await p.disconnect()
        } catch {
          // Ignore relay errors on disconnect
        }
        config.emitter.emit('disconnect')
      },

      async getAccounts() {
        const p = await initProvider()
        return (p.accounts ?? []) as `0x${string}`[]
      },

      async getChainId() {
        const p = await initProvider()
        return Number(p.chainId)
      },

      async isAuthorized() {
        try {
          const p = await initProvider()
          // Only authorised if we have an active session with accounts
          return !!(p.session && (p.accounts ?? []).length > 0)
        } catch {
          return false
        }
      },

      async getProvider() {
        return initProvider()
      },

      // Lifecycle hooks required by wagmi connector protocol
      onConnect() {},
      onAccountsChanged(accounts: string[]) {
        config.emitter.emit('change', { accounts: accounts as `0x${string}`[] })
      },
      onChainChanged(chainId: string) {
        config.emitter.emit('change', { chainId: Number(chainId) })
      },
      onDisconnect() {
        config.emitter.emit('disconnect')
      },
    }
  })
}
