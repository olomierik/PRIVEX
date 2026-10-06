# PRIVEX

> Built with Arc Studio — One Wallet. One Identity. Private Digital Life.

## What This App Does

PRIVEX is a Web3 privacy protocol on Arc combining wallet-based identity, end-to-end encrypted messaging, encrypted calls, private email, VPN, USDC payments, swaps, and cross-chain bridging into one dark-themed dashboard.

---

## Smart Contracts

| Contract | File | Description |
|----------|------|-------------|
| PRIVEXToken (PVX) | `contracts/PRIVEXToken.sol` | ERC-20 utility token, 1B supply, Ownable2Step, Pausable |
| AccessManager | `contracts/AccessManager.sol` | Wallet identity registry, tier gating by PVX balance |
| PaymentRouter | `contracts/PaymentRouter.sol` | USDC service payments with fee routing |

## Deployed Addresses — Arc Testnet

| Contract | Address | Explorer |
|----------|---------|---------|
| PRIVEXToken (PVX) | `0xdaf854107d4fbffadc841f7dab33f16a81181653` | [explorer](https://explorer.testnet.arc.io/address/0xdaf854107d4fbffadc841f7dab33f16a81181653) |
| AccessManager | `0x515cb956a4404d6eedd84c253a36778d1d9b5e1e` | [explorer](https://explorer.testnet.arc.io/address/0x515cb956a4404d6eedd84c253a36778d1d9b5e1e) |
| PaymentRouter | `0x598e9154f451046769c529c3517993e9ebe25800` | [explorer](https://explorer.testnet.arc.io/address/0x598e9154f451046769c529c3517993e9ebe25800) |

Set in `.env`:
```
VITE_PRIVEX_TOKEN_ADDRESS=0xdaf854107d4fbffadc841f7dab33f16a81181653
VITE_ACCESS_MANAGER_ADDRESS=0x515cb956a4404d6eedd84c253a36778d1d9b5e1e
VITE_PAYMENT_ROUTER_ADDRESS=0x598e9154f451046769c529c3517993e9ebe25800
```

## Architecture

### Backend (`server/index.ts`)
- Bun server on port 3001, proxied through Vite at `/api`
- `/api/auth/challenge` + `/api/auth/verify` — wallet signature authentication
- `/api/messages` — encrypted message relay (ciphertext only, never plaintext)
- `/api/signal` — WebRTC signaling for calls (SDP/ICE only, no call content)

### Client Crypto (`src/lib/crypto.ts`)
- ECDH P-256 keypairs generated locally in browser, stored in IndexedDB
- Private keys NEVER leave the user's device
- AES-GCM 256 for symmetric encryption
- Key commitment (SHA-256) stored on-chain in AccessManager

### Frontend (`src/`)
- `lib/store.ts` — React context + reducer for global state
- `lib/relay.ts` — relay API client
- `lib/abis.ts` — contract ABI slices
- `components/AuthGate.tsx` — wallet signature auth gate
- `components/PrivexLayout.tsx` — sidebar navigation
- `components/sections/` — one file per nav section

## Tier System
| Tier | PVX Required | Features |
|------|-------------|---------|
| FREE | 0 | Identity + limited messaging |
| BASIC | 1,000 | Unlimited messaging |
| PRO | 10,000 | Calls + email |
| PREMIUM | 50,000 | VPN |
| VIP | 100,000 | All + discounts |

## Privacy Guarantees
- Server receives ONLY ciphertext — never plaintext messages, emails, or calls
- Private keys stored in IndexedDB only — never transmitted
- WebRTC calls are peer-to-peer (server passes SDP/ICE only)
- VPN status displayed honestly — no false anonymity claims
- Blockchain transactions labeled PUBLIC or PRIVATE accurately

## Phase Roadmap
- [x] Phase 1: Wallet identity + PVX token + encrypted messaging MVP
- [ ] Phase 2: File encryption + voice messages
- [ ] Phase 3: Email backend
- [ ] Phase 4: Real VPN provisioning
- [ ] Phase 5: USDC service payments
- [ ] Phase 6: DEX/swap execution
- [ ] Phase 7: CCTP bridge execution
- [ ] Phase 8: ZK private payments
