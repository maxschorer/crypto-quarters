# Crypto Quarters

A 500,000 NFT collection inspired by the US 50 State Quarters program.

## Overview

- **50 states × 10,000 serials** = 500,000 unique NFTs
- Each quarter has a state design + serial number (1-10,000)
- **Free to mint** with royalties on resale
- **50 quarter limit** per wallet
- **Random distribution** — token ID doesn't predict which state/serial you get
- **Phased reveal** — metadata released in batches to prevent sniping

## Project Structure

```
contracts/          # Solidity smart contracts (Foundry)
frontend/           # Next.js minting app
scripts/            # Metadata generation, shuffling, IPFS upload
assets/             # Quarter images (50 states)
```

## Tech Stack

- **Blockchain:** Base (Coinbase L2)
- **Contract:** ERC-721A (gas-efficient batch minting)
- **Frontend:** Next.js, wagmi, RainbowKit
- **Metadata:** IPFS
- **Hosting:** Vercel

## Contract Features

- Batch mint up to `50 - balance` per transaction
- Owner-adjustable mint price (starts at 0)
- Owner-adjustable royalty % (EIP-2981)
- Owner-adjustable supply cap (phased reveal)
- Updateable base URI for metadata batches

## Development

### Contracts
```bash
cd contracts
forge build
forge test
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## License

MIT
