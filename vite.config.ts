import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

/** Stub any module id that matches a predicate — returns an empty ESM module */
function stubPlugin(matches: (id: string) => boolean): Plugin {
  const STUB_ID = '\0stub-empty'
  const STUB_CODE = 'export default {}; export const createClient = () => ({}); export const z = {}; export const RpcSchema = {}'
  return {
    name: 'stub-heavy-wallets',
    enforce: 'pre',
    resolveId(id) {
      if (matches(id)) return STUB_ID
    },
    load(id) {
      if (id === STUB_ID) return STUB_CODE
    },
    transform(code, id) {
      // Also empty out any node_modules file that belongs to a stubbed package
      if (
        id.includes('/node_modules/@wagmi/connectors/') ||
        id.includes('/node_modules/porto/') ||
        id.includes('/node_modules/@coinbase/wallet-sdk/') ||
        id.includes('/node_modules/@base-org/account/')
      ) {
        return { code: STUB_CODE, map: null }
      }
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(),
    stubPlugin(id =>
      id === 'porto' ||
      id.startsWith('porto/') ||
      id === '@coinbase/wallet-sdk' ||
      id.startsWith('@coinbase/wallet-sdk/') ||
      id === '@base-org/account' ||
      id.startsWith('@base-org/account/') ||
      // Stub the entire @wagmi/connectors barrel — we only use injected (from @wagmi/core)
      id === '@wagmi/connectors' ||
      id.startsWith('@wagmi/connectors/'),
    ),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    // Exclude everything that transitively pulls in the heavy wallet SDKs
    exclude: [
      'connectkit',
      'wagmi/connectors',
      '@wagmi/connectors',
      'porto',
      '@coinbase/wallet-sdk',
      '@base-org/account',
    ],
    include: [
      'react', 'react-dom', 'react-dom/client', 'react/jsx-runtime',
      '@tanstack/react-query',
      'wagmi', 'wagmi/chains',
      'viem', 'viem/chains',
      'framer-motion', 'lucide-react', 'sonner', 'clsx', 'tailwind-merge',
      'vite-plugin-node-polyfills/shims/buffer',
      'vite-plugin-node-polyfills/shims/global',
      'vite-plugin-node-polyfills/shims/process',
    ],
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    chunkSizeWarningLimit: 6000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@walletconnect') || id.includes('walletconnect')) return 'walletconnect'
          if (id.includes('framer-motion')) return 'framer'
          if (id.includes('wagmi') || id.includes('viem')) return 'onchain'
          if (id.includes('@supabase')) return 'supabase'
          if (id.includes('@web3icons')) return 'web3icons'
        },
      },
    },
  },
  server: {
    allowedHosts: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, '/api'),
      },
    },
  },
})
