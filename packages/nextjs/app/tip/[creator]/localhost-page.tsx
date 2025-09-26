"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, isAddress } from "viem";

// Simple ABI for localhost testing
const SIMPLE_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "creator", "type": "address"},
      {"internalType": "string", "name": "message", "type": "string"}
    ],
    "name": "tipETH",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
] as const;

// Localhost contract address - DEPLOYED!
const LOCALHOST_CONTRACT = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default function LocalhostTipPage() {
  const params = useParams();
  const creator = params.creator as string;

  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [txHash, setTxHash] = useState<string>("");

  const { writeContract, isPending } = useWriteContract();
  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}` | undefined,
  });

  const sendTip = async () => {
    if (!isConnected || !creator || !amount) return;

    try {
      const hash = await writeContract({
        address: LOCALHOST_CONTRACT as `0x${string}`,
        abi: SIMPLE_ABI,
        functionName: "tipETH",
        args: [creator as `0x${string}`, message],
        value: parseEther(amount),
      });
      setTxHash(hash);
    } catch (error) {
      console.error("Tip failed:", error);
      alert("Transaction failed. Please try again.");
    }
  };

  // Success page
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-green-600 mb-2">Tip Sent!</h1>
          <p className="text-gray-600 mb-4">
            Your {amount} ETH tip has been sent successfully!
          </p>
          <div className="text-sm text-gray-500 mb-4">
            Network: Localhost
          </div>
          {txHash && (
            <div className="mb-4 p-2 bg-gray-100 rounded text-xs break-all">
              TX: {txHash}
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Send Another Tip
          </button>
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
            Network: Localhost (Hardhat)
          </p>
        </div>

        {LOCALHOST_CONTRACT === "0x0000000000000000000000000000000000000000" && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-yellow-800 font-medium mb-2">⚠️ Contract Not Deployed</h3>
            <p className="text-yellow-700 text-sm mb-2">
              You need to deploy the SimpleTipJar contract first:
            </p>
            <code className="text-xs bg-yellow-100 p-2 rounded block">
              cd packages/hardhat<br/>
              yarn deploy --tags SimpleTipJar
            </code>
            <p className="text-yellow-700 text-xs mt-2">
              Then update LOCALHOST_CONTRACT in this file with the deployed address.
            </p>
          </div>
        )}

        {!isConnected ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">Connect your wallet to send a tip</p>
            <w3m-button />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (ETH)
              </label>
              <input
                type="number"
                step="0.001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.01"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Quick Amounts */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Amounts
              </label>
              <div className="grid grid-cols-4 gap-2">
                {["0.001", "0.01", "0.1", "1"].map((quickAmount) => (
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
              disabled={!amount || isPending || isTxLoading || LOCALHOST_CONTRACT === "0x0000000000000000000000000000000000000000"}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isPending || isTxLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isPending ? "Confirm in wallet..." : "Processing..."}
                </div>
              ) : LOCALHOST_CONTRACT === "0x0000000000000000000000000000000000000000" ? (
                "Deploy Contract First"
              ) : (
                `Send ${amount || "—"} ETH Tip`
              )}
            </button>

            {/* Info */}
            <div className="text-xs text-gray-500 text-center space-y-1">
              <div>Localhost Development - Deploy contract first</div>
              <div>Make sure Hardhat node is running: <code>yarn chain</code></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}