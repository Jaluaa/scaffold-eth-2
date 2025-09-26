"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { HeartIcon, CurrencyDollarIcon, GlobeAltIcon } from "@heroicons/react/24/outline";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        {/* Hero Section */}
        <div className="px-5 text-center max-w-4xl">
          <div className="text-6xl mb-4">💝</div>
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ClapCoin
            </span>
          </h1>
          <p className="text-xl text-gray-600 mt-4 mb-8">
            Send tips to your favorite creators with crypto. Fast, simple, no signup required.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex justify-center items-center space-x-4 flex-col sm:flex-row gap-4">
            <Link
              href="/creator"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              I'm a Creator
            </Link>
            <Link
              href="/tip/0x742d35Cc6634C0532925a3b8D91C92b73b98a2ed"
              className="bg-gray-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Send a Tip (Demo)
            </Link>
          </div>

          {connectedAddress && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 font-medium">✅ Wallet Connected</p>
              <p className="text-green-600 text-sm">
                Address: {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
              </p>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grow bg-gray-50 w-full mt-16 px-8 py-12">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="flex justify-center items-center gap-8 flex-col lg:flex-row max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="flex flex-col bg-white px-8 py-8 text-center items-center max-w-sm rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <HeartIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Connect Wallet</h3>
              <p className="text-gray-600">
                Connect your crypto wallet (MetaMask, etc.) to get started. No account creation needed!
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col bg-white px-8 py-8 text-center items-center max-w-sm rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">2. Send Tips</h3>
              <p className="text-gray-600">
                Tip creators with ETH or USDC. Add a personal message to show your support!
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col bg-white px-8 py-8 text-center items-center max-w-sm rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <GlobeAltIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">3. Instant Settlement</h3>
              <p className="text-gray-600">
                Tips are sent directly to creators' wallets. No middleman, no delays, no fees!
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-16 text-center">
            <h3 className="text-xl font-bold mb-6">Quick Start</h3>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link
                href="/tip/0x742d35Cc6634C0532925a3b8D91C92b73b98a2ed"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Demo Tip Page
              </Link>
              <Link
                href="/creator"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Creator Dashboard
              </Link>
              {connectedAddress && (
                <Link
                  href={`/tip/${connectedAddress}`}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Your Tip Page
                </Link>
              )}
            </div>
          </div>

          {/* Hackathon Badge */}
          <div className="mt-12 text-center">
            <div className="inline-block bg-yellow-100 border border-yellow-400 rounded-lg px-4 py-2">
              <p className="text-yellow-800 font-medium">
                🏆 Built in 36 hours for hackathon demo
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;