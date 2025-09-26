import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the TipJar contract
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployTipJar: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Configuration based on network
  const networkConfig: Record<string, { feeRecipient: string; usdcAddress?: string }> = {
    // Polygon Mainnet
    "137": {
      feeRecipient: "0x742d35Cc6634C0532925a3b8D91C92b73b98a2ed", // Replace with actual fee recipient
      usdcAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC on Polygon
    },
    // Polygon Mumbai (Testnet)
    "80001": {
      feeRecipient: deployer, // Use deployer as fee recipient on testnet
      usdcAddress: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB", // USDC on Mumbai
    },
    // Local development
    "31337": {
      feeRecipient: deployer, // Use deployer as fee recipient locally
    },
  };

  const chainId = await hre.getChainId();
  const config = networkConfig[chainId];

  if (!config) {
    throw new Error(`No configuration found for chain ID ${chainId}`);
  }

  console.log(`Deploying TipJar to network ${hre.network.name} (Chain ID: ${chainId})`);
  console.log(`Fee recipient: ${config.feeRecipient}`);

  // Deploy TipJar contract
  const tipJarDeployment = await deploy("TipJar", {
    from: deployer,
    args: [config.feeRecipient],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });

  // Get the deployed contract to verify it and set up tokens
  const tipJar = await hre.ethers.getContract<Contract>("TipJar", deployer);

  console.log(`TipJar deployed at: ${tipJarDeployment.address}`);

  // Add USDC as supported token if available on this network
  if (config.usdcAddress) {
    console.log(`Adding USDC as supported token: ${config.usdcAddress}`);

    // Set minimum USDC tip to $1 (1 USDC = 1e6 due to 6 decimals)
    const minUsdcTip = hre.ethers.parseUnits("1", 6); // 1 USDC

    try {
      const addTokenTx = await tipJar.addSupportedToken(config.usdcAddress, minUsdcTip);
      await addTokenTx.wait();
      console.log(`✅ USDC added as supported token with min tip: ${hre.ethers.formatUnits(minUsdcTip, 6)} USDC`);
    } catch (error) {
      console.error("❌ Failed to add USDC as supported token:", error);
    }
  }

  // Set up ETH minimum tip amount (already added in constructor, but let's update if needed)
  const minEthTip = hre.ethers.parseEther("0.001"); // 0.001 ETH
  try {
    const setMinTipTx = await tipJar.setMinTipAmount(hre.ethers.ZeroAddress, minEthTip);
    await setMinTipTx.wait();
    console.log(`✅ ETH minimum tip set to: ${hre.ethers.formatEther(minEthTip)} ETH`);
  } catch (error) {
    console.error("❌ Failed to set ETH minimum tip:", error);
  }

  // Log important contract information for frontend configuration
  console.log("\n🎉 Deployment Complete!");
  console.log("=====================================");
  console.log(`Contract Address: ${tipJarDeployment.address}`);
  console.log(`Network: ${hre.network.name}`);
  console.log(`Chain ID: ${chainId}`);
  console.log(`Fee Recipient: ${config.feeRecipient}`);
  console.log(`Deployer: ${deployer}`);

  if (config.usdcAddress) {
    console.log(`USDC Address: ${config.usdcAddress}`);
  }

  console.log("\n📋 Frontend Configuration:");
  console.log(`Add this to packages/nextjs/utils/config.ts:`);
  console.log(`TIP_JAR_ADDRESS: "${tipJarDeployment.address}"`);
  console.log("=====================================\n");

  // Verify contract on Etherscan/Polygonscan if not on local network
  if (chainId !== "31337") {
    console.log("⏳ Waiting 30 seconds before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    try {
      await hre.run("verify:verify", {
        address: tipJarDeployment.address,
        constructorArguments: [config.feeRecipient],
      });
      console.log("✅ Contract verified on block explorer");
    } catch (error) {
      console.error("❌ Contract verification failed:", error);
    }
  }
};

export default deployTipJar;

// Tags are useful if you have multiple deploy files and only want to run one of them.
deployTipJar.tags = ["TipJar", "main"];