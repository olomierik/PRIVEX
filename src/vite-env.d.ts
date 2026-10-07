/// <reference types="vite/client" />

// @walletconnect/ethereum-provider ships as ESM-only with no bundled .d.ts
// oxlint-disable-next-line typescript/no-explicit-any
declare module '@walletconnect/ethereum-provider' { const x: any; export default x }

interface ImportMetaEnv {
  readonly VITE_PRIVEX_TOKEN_ADDRESS: string
  readonly VITE_ACCESS_MANAGER_ADDRESS: string
  readonly VITE_PAYMENT_ROUTER_ADDRESS: string
  readonly VITE_ARC_NETWORK: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
