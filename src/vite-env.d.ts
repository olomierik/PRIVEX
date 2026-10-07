/// <reference types="vite/client" />

// @walletconnect/ethereum-provider ships as ESM-only with no bundled .d.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare module '@walletconnect/ethereum-provider' { const x: any; export default x }
