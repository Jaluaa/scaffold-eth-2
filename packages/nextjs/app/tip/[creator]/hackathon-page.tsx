"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { parseEther, parseUnits, isAddress } from "viem";
import {
  HACKATHON_NETWORKS,
  getNetworkConfig,
  getContractAddress,
  getUSDCAddress,
  isSupportedNetwork,
  SIMPLE_TIP_JAR_ABI
} from "~~/utils/hackathon-config";

export default function HackathonTipPage() {
  const params = useParams();
  const creator = params.creator as string;
  const chainId = useChainId();

  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState<"ETH" | "USDC">("ETH");
  const [txHash, setTxHash] = useState<string>("");

  const { writeContract, isPending } = useWriteContract();
  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}` | undefined,
  });

  const networkConfig = getNetworkConfig(chainId);
  const usdcAddress = getUSDCAddress(chainId);
  const hasUSDC = !!usdcAddress;

  const sendTip = async () => {
    if (!isConnected || !creator || !amount || !networkConfig) return;

    try {
      const contractAddress = getContractAddress(chainId);

      if (token === "ETH") {
        const hash = await writeContract({
          address: contractAddress,
          abi: SIMPLE_TIP_JAR_ABI,
          functionName: "tipETH",
          args: [creator as `0x${string}`, message],
          value: parseEther(amount),
        });
        setTxHash(hash);
      } else if (hasUSDC && usdcAddress) {
        const hash = await writeContract({
          address: contractAddress,
          abi: SIMPLE_TIP_JAR_ABI,
          functionName: "tipToken",
          args: [
            creator as `0x${string}`,
            usdcAddress,
            parseUnits(amount, 6), // USDC has 6 decimals
            message
          ],
        });
        setTxHash(hash);
      }
    } catch (error) {
      console.error("Tip failed:", error);
      alert("Transaction failed. Please try again.");
    }
  };

  // Network not supported
  if (!isSupportedNetwork(chainId)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-900 mb-4">Unsupported Network</h1>
          <p className="text-gray-600 mb-4">
            Please switch to one of these hackathon testnets:
          </p>
          <div className="space-y-2 text-sm">
            {Object.values(HACKATHON_NETWORKS).map((network) => (
              <div key={network.id} className="p-2 bg-gray-50 rounded">
                <strong>{network.name}</strong>
                <br />
                Chain ID: {network.id}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Success page
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-green-600 mb-2">Tip Sent!</h1>
          <p className="text-gray-600 mb-4">
            Your {amount} {token} tip has been sent successfully!
          </p>
          <div className="text-sm text-gray-500 mb-4">
            Network: {networkConfig?.name}
          </div>
          {txHash && networkConfig && (
            <a
              href={`${networkConfig.blockExplorer}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 text-sm underline block mb-4"
            >
              View Transaction
            </a>
          )}
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              Send Another Tip
            </button>
            <button
              onClick={() => window.open(networkConfig?.faucet, "_blank")}
              className="w-full bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
            >
              Get Testnet Tokens
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">💝</div>
          <h1 className="text-2xl font-bold text-gray-900">ClapCoin Tip</h1>
          <p className="text-gray-600 text-sm mt-1">
            To: {isAddress(creator) ? `${creator.slice(0, 6)}...${creator.slice(-4)}` : creator}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Network: {networkConfig?.name}
          </p>
        </div>

        {!isConnected ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">Connect your wallet to send a tip</p>
            <w3m-button />
            {networkConfig?.faucet && (
              <div className="mt-4">
                <a
                  href={networkConfig.faucet}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 text-sm underline"
                >
                  Need testnet tokens? Get them here →
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Token Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Token
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setToken("ETH")}
                  className={`p-3 border rounded-lg text-center ${
                    token === "ETH"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="font-medium">{networkConfig?.nativeCurrency.symbol}</div>
                  <div className="text-xs text-gray-500">{networkConfig?.nativeCurrency.name}</div>
                </button>
                {hasUSDC ? (
                  <button
                    onClick={() => setToken("USDC")}
                    className={`p-3 border rounded-lg text-center ${
                      token === "USDC"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="font-medium">USDC</div>
                    <div className="text-xs text-gray-500">USD Coin</div>
                  </button>
                ) : (
                  <div className="p-3 border border-gray-200 rounded-lg text-center text-gray-400 cursor-not-allowed">
                    <div className="font-medium">USDC</div>
                    <div className="text-xs">Not Available</div>
                  </div>
                )}
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount ({token === "ETH" ? networkConfig?.nativeCurrency.symbol : token})
              </label>
              <input
                type="number"
                step="0.001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={token === "ETH" ? "0.01" : "5"}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Quick Amounts */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Amounts
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(token === "ETH" ? ["0.001", "0.01", "0.1", "0.5"] : ["1", "5", "10", "25"]).map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount)}
                    className="p-2 text-sm border border-gray-300 rounded hover:border-blue-500 hover:text-blue-600"
                  >
                    {quickAmount}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Great work! 🎉"
                maxLength={100}
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="text-xs text-gray-500 mt-1">{message.length}/100</div>
            </div>

            {/* Send Button */}
            <button
              onClick={sendTip}
              disabled={!amount || isPending || isTxLoading || (token === "USDC" && !hasUSDC)}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isPending || isTxLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isPending ? "Confirm in wallet..." : "Processing..."}
                </div>
              ) : (
                `Send ${amount || "—"} ${token === "ETH" ? networkConfig?.nativeCurrency.symbol : token} Tip`
              )}
            </button>

            {/* Info */}
            <div className="text-xs text-gray-500 text-center space-y-1">
              <div>Hackathon Demo - {networkConfig?.name}</div>
              {networkConfig?.faucet && (
                <a
                  href={networkConfig.faucet}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 underline"
                >
                  Get testnet tokens
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}