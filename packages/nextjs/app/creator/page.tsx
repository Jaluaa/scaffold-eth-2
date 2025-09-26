"use client";

import { useState, useEffect } from "react";
import { useAccount, useEnsName, useChainId } from "wagmi";
import { Address } from "viem";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircleIcon, ClipboardIcon, QrCodeIcon, UserIcon } from "@heroicons/react/24/outline";
import { PLATFORM_CONFIG, isNetworkSupported } from "~~/utils/config";

interface CreatorProfile {
  address: Address;
  ensName?: string;
  displayName: string;
  tipLink: string;
  qrCode: string;
}

export default function CreatorOnboarding() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: ensName } = useEnsName({ address });

  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<"connect" | "setup" | "complete">("connect");

  useEffect(() => {
    if (isConnected && address) {
      if (isNetworkSupported(chainId)) {
        setStep("setup");
      }
    } else {
      setStep("connect");
    }
  }, [isConnected, address, chainId]);

  useEffect(() => {
    if (ensName) {
      setDisplayName(ensName);
    } else if (address) {
      setDisplayName(`${address.slice(0, 6)}...${address.slice(-4)}`);
    }
  }, [ensName, address]);

  const generateTipLink = () => {
    if (!address) return "";
    const baseUrl = PLATFORM_CONFIG.url || "https://clapcoin.app";
    const identifier = ensName || address;
    return `${baseUrl}/tip/${identifier}`;
  };

  const createProfile = () => {
    if (!address) return;

    const tipLink = generateTipLink();
    const newProfile: CreatorProfile = {
      address,
      ensName: ensName || undefined,
      displayName: displayName || `${address.slice(0, 6)}...${address.slice(-4)}`,
      tipLink,
      qrCode: tipLink,
    };

    setProfile(newProfile);
    setStep("complete");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const downloadQR = () => {
    if (!profile) return;

    const svg = document.querySelector("#qr-code") as SVGElement;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = 256;
    canvas.height = 256;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const link = document.createElement("a");
        link.download = `${profile.displayName}-tip-qr.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  if (!isNetworkSupported(chainId)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Unsupported Network</h2>
          <p className="text-red-600 mb-4">Please switch to Polygon network to continue.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Creator Dashboard</h1>
          <p className="text-gray-600">Set up your profile and start receiving tips from your fans</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step !== "connect" ? "text-green-600" : "text-blue-600"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step !== "connect" ? "bg-green-100 border-green-600" : "bg-blue-100 border-blue-600"
                }`}
              >
                {step !== "connect" ? <CheckCircleIcon className="w-5 h-5" /> : "1"}
              </div>
              <span className="ml-2 font-medium">Connect Wallet</span>
            </div>

            <div className="w-8 h-px bg-gray-300" />

            <div className={`flex items-center ${step === "complete" ? "text-green-600" : step === "setup" ? "text-blue-600" : "text-gray-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step === "complete"
                    ? "bg-green-100 border-green-600"
                    : step === "setup"
                    ? "bg-blue-100 border-blue-600"
                    : "bg-gray-100 border-gray-300"
                }`}
              >
                {step === "complete" ? <CheckCircleIcon className="w-5 h-5" /> : "2"}
              </div>
              <span className="ml-2 font-medium">Setup Profile</span>
            </div>

            <div className="w-8 h-px bg-gray-300" />

            <div className={`flex items-center ${step === "complete" ? "text-green-600" : "text-gray-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step === "complete" ? "bg-green-100 border-green-600" : "bg-gray-100 border-gray-300"
                }`}
              >
                {step === "complete" ? <CheckCircleIcon className="w-5 h-5" /> : "3"}
              </div>
              <span className="ml-2 font-medium">Share Link</span>
            </div>
          </div>
        </div>

        {/* Content */}
        {step === "connect" && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">Connect your wallet to create your creator profile and start receiving tips.</p>
            <p className="text-sm text-gray-500 mb-4">Make sure you're connected to the Polygon network for optimal experience.</p>
          </div>
        )}

        {step === "setup" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Setup Your Profile</h2>

            <div className="space-y-6">
              {/* Wallet Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Connected Wallet</label>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Address: {address}</p>
                  {ensName && <p className="text-sm text-gray-600">ENS: {ensName}</p>}
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={ensName || `${address?.slice(0, 6)}...${address?.slice(-4)}`}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">This name will be displayed to your supporters</p>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tip Link Preview</label>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 break-all">{generateTipLink()}</p>
                </div>
              </div>

              <button
                onClick={createProfile}
                disabled={!displayName.trim()}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Create Profile
              </button>
            </div>
          </div>
        )}

        {step === "complete" && profile && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-6">
              <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Created Successfully!</h2>
              <p className="text-gray-600">Your tip link is ready to share with your supporters.</p>
            </div>

            <div className="space-y-6">
              {/* Profile Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Profile Information</h3>
                <p className="text-sm text-gray-600">Display Name: {profile.displayName}</p>
                <p className="text-sm text-gray-600">Wallet: {profile.address}</p>
                {profile.ensName && <p className="text-sm text-gray-600">ENS: {profile.ensName}</p>}
              </div>

              {/* Tip Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Tip Link</label>
                <div className="flex">
                  <input
                    type="text"
                    value={profile.tipLink}
                    readOnly
                    className="flex-1 p-3 border border-gray-300 rounded-l-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(profile.tipLink)}
                    className={`px-4 py-3 border border-l-0 border-gray-300 rounded-r-lg transition-colors ${
                      copied ? "bg-green-100 text-green-700" : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <ClipboardIcon className="w-5 h-5" />
                  </button>
                </div>
                {copied && <p className="text-xs text-green-600 mt-1">Copied to clipboard!</p>}
              </div>

              {/* QR Code Section */}
              <div className="text-center">
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <QrCodeIcon className="w-5 h-5 mr-2" />
                  {showQR ? "Hide" : "Show"} QR Code
                </button>

                {showQR && (
                  <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg inline-block">
                    <QRCodeSVG
                      id="qr-code"
                      value={profile.tipLink}
                      size={200}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="M"
                      includeMargin={true}
                    />
                    <div className="mt-4">
                      <button
                        onClick={downloadQR}
                        className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                      >
                        Download QR Code
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Share Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">How to Share</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Copy and paste the link in your social media bio</li>
                  <li>• Add the QR code to your streaming overlay</li>
                  <li>• Include the link in your content descriptions</li>
                  <li>• Share directly with your supporters</li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => window.open(`/tip/${ensName || address}`, "_blank")}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Preview Tip Page
                </button>
                <button
                  onClick={() => window.open("/analytics", "_blank")}
                  className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}