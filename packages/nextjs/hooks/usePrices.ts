"use client";

import { useState, useEffect, useCallback } from "react";
import { useChainId } from "wagmi";
import { getAllTokenPrices } from "~~/utils/pyth";

export interface TokenPrices {
  ETH: number;
  USDC: number;
}

export interface UsePricesReturn {
  prices: TokenPrices;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

/**
 * React hook for fetching and managing token prices from Pyth Network
 * @param refreshInterval Auto-refresh interval in milliseconds (default: 30 seconds)
 * @param autoRefresh Whether to automatically refresh prices (default: true)
 */
export function usePrices(
  refreshInterval: number = 30000,
  autoRefresh: boolean = true
): UsePricesReturn {
  const chainId = useChainId();

  const [prices, setPrices] = useState<TokenPrices>({
    ETH: 0,
    USDC: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      setError(null);
      const tokenPrices = await getAllTokenPrices(chainId);
      setPrices(tokenPrices);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch prices";
      setError(errorMessage);
      console.error("Price fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [chainId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchPrices();
  }, [fetchPrices]);

  // Initial fetch
  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchPrices, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchPrices, refreshInterval, autoRefresh]);

  return {
    prices,
    loading,
    error,
    lastUpdated,
    refresh,
  };
}

/**
 * Hook for converting between tokens and USD
 */
export function usePriceConversions() {
  const { prices, loading } = usePrices();

  const convertToUsd = useCallback(
    (amount: number, token: "ETH" | "USDC"): number => {
      if (loading || prices[token] === 0) return 0;
      return amount * prices[token];
    },
    [prices, loading]
  );

  const convertFromUsd = useCallback(
    (usdAmount: number, token: "ETH" | "USDC"): number => {
      if (loading || prices[token] === 0) return 0;
      return usdAmount / prices[token];
    },
    [prices, loading]
  );

  const convertBetweenTokens = useCallback(
    (amount: number, fromToken: "ETH" | "USDC", toToken: "ETH" | "USDC"): number => {
      if (loading || prices[fromToken] === 0 || prices[toToken] === 0) return 0;
      const usdValue = amount * prices[fromToken];
      return usdValue / prices[toToken];
    },
    [prices, loading]
  );

  return {
    prices,
    loading,
    convertToUsd,
    convertFromUsd,
    convertBetweenTokens,
  };
}

/**
 * Hook for price formatting utilities
 */
export function usePriceFormatting() {
  const formatUsd = useCallback((amount: number, decimals: number = 2): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  }, []);

  const formatToken = useCallback(
    (amount: number, token: "ETH" | "USDC", decimals?: number): string => {
      const defaultDecimals = token === "ETH" ? 6 : 2;
      const precision = decimals ?? defaultDecimals;

      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      }).format(amount);
    },
    []
  );

  const formatPriceChange = useCallback((change: number): string => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  }, []);

  return {
    formatUsd,
    formatToken,
    formatPriceChange,
  };
}

/**
 * Hook for price alerts and monitoring
 */
export function usePriceAlerts() {
  const { prices } = usePrices();
  const [alerts, setAlerts] = useState<
    Array<{
      id: string;
      token: "ETH" | "USDC";
      condition: "above" | "below";
      threshold: number;
      triggered: boolean;
    }>
  >([]);

  const addAlert = useCallback(
    (token: "ETH" | "USDC", condition: "above" | "below", threshold: number) => {
      const alert = {
        id: Date.now().toString(),
        token,
        condition,
        threshold,
        triggered: false,
      };
      setAlerts(prev => [...prev, alert]);
      return alert.id;
    },
    []
  );

  const removeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  // Check alerts when prices change
  useEffect(() => {
    setAlerts(prev =>
      prev.map(alert => {
        const currentPrice = prices[alert.token];
        const shouldTrigger =
          (alert.condition === "above" && currentPrice > alert.threshold) ||
          (alert.condition === "below" && currentPrice < alert.threshold);

        if (shouldTrigger && !alert.triggered) {
          // Alert triggered - you could show a notification here
          console.log(
            `Price alert: ${alert.token} is ${alert.condition} ${alert.threshold}`
          );
        }

        return {
          ...alert,
          triggered: shouldTrigger,
        };
      })
    );
  }, [prices]);

  return {
    alerts,
    addAlert,
    removeAlert,
  };
}