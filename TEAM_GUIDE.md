# CLAPCOIN - Social Tipping dApp

## 🎯 Project Overview
A social tipping platform where creators can receive tips from fans using ETH/USDC on Polygon network.

## 🏗️ Team Structure & Responsibilities

### Backend Team (2 developers)
**Primary Focus**: Smart contracts, deployment, and blockchain infrastructure

#### Developer 1: Smart Contract Development
- `packages/hardhat/contracts/TipJar.sol` - Main tipping contract
- `packages/hardhat/contracts/interfaces/` - Contract interfaces
- `packages/hardhat/test/` - Contract unit tests

#### Developer 2: Deployment & Infrastructure
- `packages/hardhat/deploy/` - Deployment scripts
- `packages/hardhat/scripts/` - Utility scripts
- `subgraph/` - The Graph indexing configuration

### Frontend Team (3 developers)

#### Developer 1: Core Pages & Routing
- `packages/nextjs/app/creator/` - Creator onboarding flow
- `packages/nextjs/app/tip/` - Tip page and transaction handling
- `packages/nextjs/components/layout/` - Navigation and layout

#### Developer 2: Web3 Integration & Utils
- `packages/nextjs/hooks/` - Custom React hooks for blockchain
- `packages/nextjs/utils/` - Web3 utilities, contract config
- `packages/nextjs/components/web3/` - Wallet connection components

#### Developer 3: UI Components & Analytics
- `packages/nextjs/components/ui/` - Reusable UI components
- `packages/nextjs/app/analytics/` - Creator analytics dashboard
- `packages/nextjs/components/charts/` - Data visualization

## 📁 Project Structure

```
packages/
├── hardhat/                 # Smart contracts & deployment
│   ├── contracts/
│   │   ├── TipJar.sol      # Main contract
│   │   └── interfaces/
│   ├── deploy/
│   │   └── 01-deploy-tipjar.ts
│   ├── test/
│   └── scripts/
├── nextjs/                  # Frontend dApp
│   ├── app/
│   │   ├── creator/         # Creator onboarding
│   │   ├── tip/            # Tip pages
│   │   └── analytics/      # Analytics dashboard
│   ├── components/
│   │   ├── ui/             # Reusable components
│   │   ├── web3/           # Blockchain components
│   │   └── layout/         # Navigation & layout
│   ├── hooks/              # Custom React hooks
│   └── utils/              # Utilities & config
└── subgraph/               # The Graph indexing
    ├── schema.graphql
    ├── subgraph.yaml
    └── src/
```

## 🔧 Development Workflow

### Getting Started
1. **Install dependencies**: `yarn install`
2. **Start local blockchain**: `yarn chain` (in one terminal)
3. **Deploy contracts**: `yarn deploy` (in another terminal)
4. **Start frontend**: `yarn start` (in another terminal)

### Branch Strategy
- `main` - Production ready code
- `dev` - Integration branch
- `feature/contract-*` - Backend features
- `feature/frontend-*` - Frontend features

### Daily Workflow
1. Pull latest `dev` branch
2. Create feature branch from `dev`
3. Work on assigned tasks
4. Test your changes locally
5. Create PR to `dev` branch
6. Code review & merge

## 🛠️ Tech Stack

### Blockchain
- **Network**: Polygon Mainnet (low gas fees)
- **Contracts**: Solidity, Hardhat
- **Tokens**: ETH, USDC
- **Oracles**: PYTH Network (price feeds)
- **Indexing**: The Graph Protocol

### Frontend
- **Framework**: Next.js 14, React 18
- **Styling**: Tailwind CSS
- **Web3**: ethers.js, wagmi, RainbowKit
- **State**: React hooks, Context API

### Services
- **ENS**: Human-readable creator names
- **IPFS**: Metadata storage
- **The Graph**: Event indexing & analytics

## 📋 Current Sprint Tasks

### Backend Team
- [ ] **TipJar.sol**: Core tipping contract with events
- [ ] **Deployment**: Polygon deployment script
- [ ] **Testing**: Comprehensive unit tests
- [ ] **Subgraph**: The Graph schema & mappings

### Frontend Team
- [ ] **Creator Flow**: Onboarding & profile setup
- [ ] **Tip Flow**: Payment UI & transaction handling
- [ ] **Web3 Setup**: Wallet connection & network switching
- [ ] **Analytics**: Dashboard for creators

## 🔗 Important Links
- **Polygon RPC**: `https://polygon-rpc.com`
- **PYTH Docs**: `https://docs.pyth.network/`
- **The Graph Docs**: `https://thegraph.com/docs/`
- **ENS Docs**: `https://docs.ens.domains/`

## 🚀 Deployment Checklist
- [ ] Contracts deployed to Polygon
- [ ] Frontend config updated with contract addresses
- [ ] Subgraph deployed and syncing
- [ ] ENS integration tested
- [ ] PYTH price feeds working
- [ ] MetaMask auto-switch to Polygon

## 💬 Communication
- **Daily standups**: 9 AM
- **Backend sync**: Tuesdays, Thursdays
- **Frontend sync**: Mondays, Wednesdays, Fridays
- **Full team review**: Fridays