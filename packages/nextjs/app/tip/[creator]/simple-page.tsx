"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, parseUnits, isAddress } from "viem";

// Simple ABI for hackathon
const SIMPLE_TIP_JAR_ABI = [
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
  }
] as const;

// Contract addresses - UPDATE AFTER DEPLOYMENT
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // REPLACE WITH DEPLOYED ADDRESS
const USDC_ADDRESS = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"; // Mumbai USDC

export default function SimpleTipPage() {
  const params = useParams();
  const creator = params.creator as string;

  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState<"ETH" | "USDC">("ETH");
  const [txHash, setTxHash] = useState<string>("");

  const { writeContract, isPending } = useWriteContract();
  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}` | undefined,
  });

  const sendTip = async () => {
    if (!isConnected || !creator || !amount) return;

    try {
      if (token === "ETH") {
        const hash = await writeContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: SIMPLE_TIP_JAR_ABI,
          functionName: "tipETH",
          args: [creator as `0x${string}`, message],
          value: parseEther(amount),
        });
        setTxHash(hash);
      } else {
        const hash = await writeContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: SIMPLE_TIP_JAR_ABI,
          functionName: "tipToken",
          args: [
            creator as `0x${string}`,
            USDC_ADDRESS as `0x${string}`,
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

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-green-600 mb-2">Tip Sent!</h1>
          <p className="text-gray-600 mb-4">
            Your {amount} {token} tip has been sent successfully!
          </p>
          {txHash && (
            <a
              href={`https://mumbai.polygonscan.com/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 text-sm underline"
            >
              View Transaction
            </a>
          )}
          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              Send Another Tip
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
          <h1 className="text-2xl font-bold text-gray-900">Send a Tip</h1>
          <p className="text-gray-600 text-sm mt-1">
            To: {isAddress(creator) ? `${creator.slice(0, 6)}...${creator.slice(-4)}` : creator}
          </p>
        </div>

        {!isConnected ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">Connect your wallet to send a tip</p>
            <w3m-button />
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
                  <div className="font-medium">ETH</div>
                  <div className="text-xs text-gray-500">Ethereum</div>
                </button>
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
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount ({token})
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
                {(token === "ETH" ? ["0.01", "0.05", "0.1", "0.5"] : ["5", "10", "25", "50"]).map((quickAmount) => (
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
                placeholder="Say something nice..."
                maxLength={100}
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Send Button */}
            <button
              onClick={sendTip}
              disabled={!amount || isPending || isTxLoading}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isPending || isTxLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isPending ? "Confirm in wallet..." : "Processing..."}
                </div>
              ) : (
                `Send ${amount || "—"} ${token} Tip`
              )}
            </button>

            {/* Info */}
            <div className="text-xs text-gray-500 text-center">
              Make sure you're connected to Polygon Mumbai testnet
            </div>
          </div>
        )}
      </div>
    </div>
  );
}