import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the SimpleTipJar contract for hackathon MVP
 */
const deploySimpleTipJar: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log(`🚀 Deploying SimpleTipJar to ${hre.network.name}`);
  console.log(`📝 Deployer: ${deployer}`);

  const simpleTipJar = await deploy("SimpleTipJar", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log(`✅ SimpleTipJar deployed at: ${simpleTipJar.address}`);

  // Network-specific token addresses
  const networkTokens: Record<string, { USDC?: string; explorer: string; faucet?: string }> = {
    polygonAmoy: {
      USDC: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
      explorer: "https://amoy.polygonscan.com",
      faucet: "https://faucet.polygon.technology/"
    },
    baseSepolia: {
      USDC: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      explorer: "https://sepolia.basescan.org",
      faucet: "https://www.alchemy.com/faucets/base-sepolia"
    },
    arbitrumSepolia: {
      USDC: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
      explorer: "https://sepolia.arbiscan.io",
      faucet: "https://www.alchemy.com/faucets/arbitrum-sepolia"
    },
    optimismSepolia: {
      USDC: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
      explorer: "https://sepolia-optimism.etherscan.io",
      faucet: "https://www.alchemy.com/faucets/optimism-sepolia"
    },
    flowEVMTestnet: {
      explorer: "https://evm-testnet.flowscan.org",
      faucet: "https://testnet-faucet.onflow.org/"
    },
    citreaTestnet: {
      explorer: "https://explorer.testnet.citrea.xyz",
    }
  };

  const networkInfo = networkTokens[hre.network.name];
  if (networkInfo?.USDC) {
    console.log(`📝 ${hre.network.name} USDC address: ${networkInfo.USDC}`);
  }

  console.log("\n🎉 DEPLOYMENT COMPLETE!");
  console.log("=====================================");
  console.log(`Contract: ${simpleTipJar.address}`);
  console.log(`Network: ${hre.network.name}`);
  console.log(`Deployer: ${deployer}`);
  console.log("=====================================");
  console.log("\n📋 NEXT STEPS:");
  console.log("1. Update packages/nextjs/utils/config.ts with contract address");
  console.log("2. Test contract on block explorer");
  console.log("3. Send test tip transaction");
  console.log("\n🔗 USEFUL LINKS:");

  if (networkInfo) {
    console.log(`📊 Explorer: ${networkInfo.explorer}/address/${simpleTipJar.address}`);
    if (networkInfo.faucet) {
      console.log(`🌊 Faucet: ${networkInfo.faucet}`);
    }
  }

  // Verify contract if not on local network
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting 30 seconds before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    try {
      await hre.run("verify:verify", {
        address: simpleTipJar.address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on block explorer");
    } catch (error) {
      console.error("❌ Contract verification failed:", error);
    }
  }
};

export default deploySimpleTipJar;
deploySimpleTipJar.tags = ["SimpleTipJar", "hackathon"];