import { Address } from "viem";

// Hackathon Testnet Configuration
export const HACKATHON_NETWORKS = {
  polygonAmoy: {
    id: 80002,
    name: "Polygon Amoy",
    rpcUrl: "https://rpc-amoy.polygon.technology",
    blockExplorer: "https://amoy.polygonscan.com",
    faucet: "https://faucet.polygon.technology/",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    contractAddress: "0x0000000000000000000000000000000000000000" as Address, // UPDATE AFTER DEPLOYMENT
    usdcAddress: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582" as Address,
  },
  baseSepolia: {
    id: 84532,
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    blockExplorer: "https://sepolia.basescan.org",
    faucet: "https://www.alchemy.com/faucets/base-sepolia",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    contractAddress: "0x0000000000000000000000000000000000000000" as Address, // UPDATE AFTER DEPLOYMENT
    usdcAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as Address,
  },
  arbitrumSepolia: {
    id: 421614,
    name: "Arbitrum Sepolia",
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    blockExplorer: "https://sepolia.arbiscan.io",
    faucet: "https://www.alchemy.com/faucets/arbitrum-sepolia",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    contractAddress: "0x0000000000000000000000000000000000000000" as Address, // UPDATE AFTER DEPLOYMENT
    usdcAddress: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d" as Address,
  },
  optimismSepolia: {
    id: 11155420,
    name: "Optimism Sepolia",
    rpcUrl: "https://sepolia.optimism.io",
    blockExplorer: "https://sepolia-optimism.etherscan.io",
    faucet: "https://www.alchemy.com/faucets/optimism-sepolia",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    contractAddress: "0x0000000000000000000000000000000000000000" as Address, // UPDATE AFTER DEPLOYMENT
    usdcAddress: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7" as Address,
  },
  flowEVMTestnet: {
    id: 545,
    name: "Flow EVM Testnet",
    rpcUrl: "https://testnet.evm.nodes.onflow.org",
    blockExplorer: "https://evm-testnet.flowscan.org",
    faucet: "https://testnet-faucet.onflow.org/",
    nativeCurrency: { name: "FLOW", symbol: "FLOW", decimals: 18 },
    contractAddress: "0x0000000000000000000000000000000000000000" as Address, // UPDATE AFTER DEPLOYMENT
    // No USDC on Flow EVM testnet yet
  },
  citreaTestnet: {
    id: 5115,
    name: "Citrea Testnet",
    rpcUrl: "https://rpc.testnet.citrea.xyz",
    blockExplorer: "https://explorer.testnet.citrea.xyz",
    nativeCurrency: { name: "cBTC", symbol: "cBTC", decimals: 18 },
    contractAddress: "0x0000000000000000000000000000000000000000" as Address, // UPDATE AFTER DEPLOYMENT
    // No USDC on Citrea testnet yet
  },
} as const;

// Get network config by chain ID
export function getNetworkConfig(chainId: number) {
  return Object.values(HACKATHON_NETWORKS).find(network => network.id === chainId);
}

// Check if chain ID is supported
export function isSupportedNetwork(chainId: number): boolean {
  return Object.values(HACKATHON_NETWORKS).some(network => network.id === chainId);
}

// Get contract address for a specific network
export function getContractAddress(chainId: number): Address {
  const network = getNetworkConfig(chainId);
  if (!network) {
    throw new Error(`Unsupported network: ${chainId}`);
  }
  return network.contractAddress;
}

// Get USDC address for a specific network (if available)
export function getUSDCAddress(chainId: number): Address | null {
  const network = getNetworkConfig(chainId);
  return network?.usdcAddress || null;
}

// Get all supported chain IDs
export function getSupportedChainIds(): number[] {
  return Object.values(HACKATHON_NETWORKS).map(network => network.id);
}

// Default network for the hackathon (Polygon Amoy - most stable)
export const DEFAULT_HACKATHON_NETWORK = HACKATHON_NETWORKS.polygonAmoy;

// Simplified ABI for hackathon
export const SIMPLE_TIP_JAR_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "creator", "type": "address"},
      {"internalType": "string", "name": "message", "type": "string"}
    ],
    "name": "tipETH",
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
    "name": "tipToken",
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
  {
    "inputs": [
      {"internalType": "address", "name": "creator", "type": "address"},
      {"internalType": "address", "name": "token", "type": "address"}
    ],
    "name": "getBalance",
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
    "name": "Withdrawal",
    "type": "event"
  }
] as const;

// Quick deployment update helper
export function updateContractAddress(chainId: number, address: Address) {
  const networkKey = Object.keys(HACKATHON_NETWORKS).find(
    key => HACKATHON_NETWORKS[key as keyof typeof HACKATHON_NETWORKS].id === chainId
  );

  if (networkKey) {
    console.log(`🔄 Update ${networkKey} contract address to: ${address}`);
    console.log(`   File: packages/nextjs/utils/hackathon-config.ts`);
    console.log(`   Line: ${networkKey}.contractAddress`);
  }
}