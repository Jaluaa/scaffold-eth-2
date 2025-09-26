# ClapCoin Subgraph

The Graph subgraph for indexing ClapCoin tipping events and analytics.

## Overview

This subgraph indexes the following events from the TipJar contract:
- `TipSent` - When a tip is sent to a creator
- `CreatorWithdrawal` - When a creator withdraws their tips
- `TokenAdded/TokenRemoved` - When supported tokens are modified
- `PlatformFeeUpdated` - When platform fee changes

## Entities

### Core Entities
- **Creator** - Creator profiles with tip statistics
- **Tipper** - Tipper profiles with sending statistics
- **Tip** - Individual tip transactions
- **Withdrawal** - Creator withdrawal transactions

### Analytics Entities
- **DailyStats** - Daily aggregated statistics
- **MonthlyStats** - Monthly aggregated statistics
- **PlatformStats** - Overall platform statistics
- **TokenStats** - Per-token statistics

## Setup

### Prerequisites
- Node.js 16+
- Graph CLI: `npm install -g @graphprotocol/graph-cli`
- Deployed TipJar contract

### Configuration

1. **Update contract address and start block** in `subgraph.yaml`:
   ```yaml
   source:
     address: "0xYourDeployedContractAddress"
     startBlock: 12345678  # Block when contract was deployed
   ```

2. **Add contract ABI** to `abis/TipJar.json` (copy from Hardhat artifacts)

### Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Generate types**:
   ```bash
   npm run codegen
   ```

3. **Build subgraph**:
   ```bash
   npm run build
   ```

### Deployment

#### The Graph Studio (Recommended)

1. **Create subgraph** at [https://thegraph.com/studio/](https://thegraph.com/studio/)

2. **Authenticate**:
   ```bash
   graph auth --studio YOUR_DEPLOY_KEY
   ```

3. **Deploy**:
   ```bash
   npm run deploy-studio
   ```

#### Self-hosted Graph Node

1. **Create local subgraph**:
   ```bash
   npm run create-local
   ```

2. **Deploy locally**:
   ```bash
   npm run deploy-local
   ```

## Example Queries

### Get Creator Statistics
```graphql
{
  creators(first: 10, orderBy: totalTipsEth, orderDirection: desc) {
    id
    ensName
    displayName
    totalTipsEth
    totalTipsUsdc
    tipCount
    uniqueTippers
    firstTipAt
    lastTipAt
  }
}
```

### Get Recent Tips
```graphql
{
  tips(first: 20, orderBy: timestamp, orderDirection: desc) {
    id
    tipper {
      id
    }
    creator {
      id
      displayName
    }
    amount
    tokenSymbol
    message
    timestamp
    usdValue
  }
}
```

### Get Daily Statistics
```graphql
{
  dailyStats(first: 30, orderBy: date, orderDirection: desc) {
    id
    date
    tipCount
    totalTipsEth
    totalTipsUsdc
    totalUsdVolume
    uniqueTippers
    uniqueCreators
  }
}
```

### Get Platform Overview
```graphql
{
  platformStats(id: "platform") {
    totalTipCount
    totalTipsEth
    totalTipsUsdc
    totalTippers
    totalCreators
    totalFeesEth
    totalFeesUsdc
    totalUsdVolume
    lastUpdated
  }
}
```

### Get Creator's Tips Received
```graphql
{
  creator(id: "0x742d35cc6634c0532925a3b8d91c92b73b98a2ed") {
    id
    displayName
    tipsReceived(first: 10, orderBy: timestamp, orderDirection: desc) {
      id
      tipper {
        id
      }
      amount
      tokenSymbol
      message
      timestamp
      usdValue
    }
  }
}
```

### Get Top Tippers
```graphql
{
  tippers(first: 10, orderBy: totalTippedEth, orderDirection: desc) {
    id
    totalTippedEth
    totalTippedUsdc
    tipCount
    uniqueCreators
    firstTipAt
    lastTipAt
  }
}
```

## Network Configuration

### Polygon Mainnet
- Network: `matic`
- RPC: `https://polygon-rpc.com`
- Graph Node: The Graph Network

### Polygon Mumbai (Testnet)
- Network: `mumbai`
- RPC: `https://rpc-mumbai.maticvigil.com`
- Graph Node: The Graph Hosted Service

## Monitoring

The subgraph provides comprehensive analytics for:
- Total volume and transaction counts
- Creator and tipper leaderboards
- Historical trends (daily/monthly)
- Token-specific statistics
- Fee collection tracking

## Development Notes

1. **Price Feeds**: Currently uses simplified price estimation. In production, integrate with Pyth Network or Chainlink oracles for accurate USD values.

2. **ENS Resolution**: The subgraph doesn't resolve ENS names automatically. Consider adding ENS integration or resolving names client-side.

3. **Gas Optimization**: The mapping functions are optimized to minimize gas costs and indexing time.

4. **Error Handling**: Robust error handling ensures the subgraph continues indexing even if individual events fail.

## Support

For issues and questions:
- Check The Graph documentation: https://thegraph.com/docs/
- Review mapping logs in Graph Explorer
- Test queries in GraphiQL playground