import { Address } from "viem";
import { polygon, polygonMumbai, hardhat } from "viem/chains";

// Contract addresses by network
export const CONTRACT_ADDRESSES = {
  [polygon.id]: {
    TIP_JAR: "0x0000000000000000000000000000000000000000" as Address, // Replace after deployment
    USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" as Address,
  },
  [polygonMumbai.id]: {
    TIP_JAR: "0x0000000000000000000000000000000000000000" as Address, // Replace after deployment
    USDC: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB" as Address,
  },
  [hardhat.id]: {
    TIP_JAR: "0x0000000000000000000000000000000000000000" as Address, // Replace after deployment
    USDC: "0x0000000000000000000000000000000000000000" as Address, // Mock USDC for local testing
  },
} as const;

// Network configuration
export const NETWORK_CONFIG = {
  [polygon.id]: {
    name: "Polygon",
    rpcUrl: "https://polygon-rpc.com",
    blockExplorer: "https://polygonscan.com",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
  },
  [polygonMumbai.id]: {
    name: "Polygon Mumbai",
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    blockExplorer: "https://mumbai.polygonscan.com",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
  },
  [hardhat.id]: {
    name: "Hardhat",
    rpcUrl: "http://127.0.0.1:8546",
    blockExplorer: "",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
  },
} as const;

// Supported networks for the dApp
export const SUPPORTED_NETWORKS = [polygon.id, polygonMumbai.id, hardhat.id];

// Default network (Polygon mainnet)
export const DEFAULT_NETWORK = polygon.id;

// Token configuration
export const SUPPORTED_TOKENS = {
  ETH: {
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    address: "0x0000000000000000000000000000000000000000" as Address, // ETH uses zero address
    logoUrl: "/tokens/eth.svg",
    minTipAmount: "0.001", // 0.001 ETH
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logoUrl: "/tokens/usdc.svg",
    minTipAmount: "1", // 1 USDC
    getAddress: (chainId: number) => CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.USDC,
  },
} as const;

// PYTH Network price feed IDs
export const PYTH_PRICE_FEEDS = {
  "ETH/USD": "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
  "USDC/USD": "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
} as const;

// PYTH Network endpoints
export const PYTH_ENDPOINTS = {
  [polygon.id]: "https://hermes.pyth.network",
  [polygonMumbai.id]: "https://hermes.pyth.network",
  [hardhat.id]: "https://hermes.pyth.network", // Use mainnet for local testing
} as const;

// ENS configuration
export const ENS_CONFIG = {
  supportedChains: [polygon.id], // ENS is primarily on Ethereum, but we'll resolve on Polygon
  resolverAddress: "0x0000000000000000000000000000000000000000" as Address, // ENS resolver on Polygon
} as const;

// The Graph configuration
export const SUBGRAPH_ENDPOINTS = {
  [polygon.id]: "https://api.thegraph.com/subgraphs/name/clapcoin/tips-polygon", // Replace with actual subgraph URL
  [polygonMumbai.id]: "https://api.thegraph.com/subgraphs/name/clapcoin/tips-mumbai", // Replace with actual subgraph URL
  [hardhat.id]: "", // No subgraph for local development
} as const;

// Platform configuration
export const PLATFORM_CONFIG = {
  name: "ClapCoin",
  description: "Social tipping platform for creators",
  url: "https://clapcoin.app", // Replace with actual domain
  logo: "/logo.svg",
  fee: 2.5, // 2.5% platform fee
  maxTipAmount: {
    ETH: "10", // 10 ETH max
    USDC: "10000", // 10,000 USDC max
  },
} as const;

// Utility functions
export function getContractAddress(chainId: number, contract: "TIP_JAR" | "USDC"): Address {
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  if (!addresses) {
    throw new Error(`Unsupported network: ${chainId}`);
  }
  return addresses[contract];
}

export function getSupportedTokens(chainId: number) {
  const tokens = { ...SUPPORTED_TOKENS };

  // Add USDC address for the specific chain
  if (tokens.USDC.getAddress) {
    tokens.USDC.address = tokens.USDC.getAddress(chainId);
  }

  return tokens;
}

export function getNetworkConfig(chainId: number) {
  const config = NETWORK_CONFIG[chainId as keyof typeof NETWORK_CONFIG];
  if (!config) {
    throw new Error(`Unsupported network: ${chainId}`);
  }
  return config;
}

export function isNetworkSupported(chainId: number): boolean {
  return SUPPORTED_NETWORKS.includes(chainId);
}

export function getPythEndpoint(chainId: number): string {
  return PYTH_ENDPOINTS[chainId as keyof typeof PYTH_ENDPOINTS] || PYTH_ENDPOINTS[polygon.id];
}

export function getSubgraphEndpoint(chainId: number): string {
  return SUBGRAPH_ENDPOINTS[chainId as keyof typeof SUBGRAPH_ENDPOINTS] || "";
}

// Contract ABI (will be generated after compilation)
export const TIP_JAR_ABI = [
  // Core tipping functions
  {
    "inputs": [
      {"internalType": "address", "name": "creator", "type": "address"},
      {"internalType": "string", "name": "message", "type": "string"}
    ],
    "name": "tipWithETH",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "creator", "type": "address"},
      {"internalType": "address", "name": "token", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "string", "name": "message", "type": "string"}
    ],
    "name": "tipWithToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "token", "type": "address"}],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // View functions
  {
    "inputs": [
      {"internalType": "address", "name": "creator", "type": "address"},
      {"internalType": "address", "name": "token", "type": "address"}
    ],
    "name": "getCreatorBalance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "supportedTokens",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "minTipAmounts",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "tipper", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "creator", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "token", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "fee", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "message", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "TipSent",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "creator", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "token", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "CreatorWithdrawal",
    "type": "event"
  }
] as const;