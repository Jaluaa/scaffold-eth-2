import { PYTH_PRICE_FEEDS, getPythEndpoint } from "./config";

export interface PriceData {
  price: number;
  confidence: number;
  expo: number;
  publishTime: number;
}

export interface PythPriceResponse {
  id: string;
  price: PriceData;
  ema_price: PriceData;
}

/**
 * Fetch price data from Pyth Network
 */
export async function fetchPythPrices(
  priceIds: string[],
  chainId: number = 137
): Promise<Map<string, PythPriceResponse>> {
  const endpoint = getPythEndpoint(chainId);
  const url = `${endpoint}/api/latest_price_feeds?ids[]=${priceIds.join("&ids[]=")}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Pyth API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const priceMap = new Map<string, PythPriceResponse>();

    for (const item of data) {
      priceMap.set(item.id, item);
    }

    return priceMap;
  } catch (error) {
    console.error("Error fetching Pyth prices:", error);
    throw error;
  }
}

/**
 * Get current ETH/USD price
 */
export async function getEthPrice(chainId: number = 137): Promise<number> {
  try {
    const prices = await fetchPythPrices([PYTH_PRICE_FEEDS["ETH/USD"]], chainId);
    const ethPriceData = prices.get(PYTH_PRICE_FEEDS["ETH/USD"]);

    if (!ethPriceData) {
      throw new Error("ETH price not found");
    }

    // Convert price considering the exponent
    const price = ethPriceData.price.price * Math.pow(10, ethPriceData.price.expo);
    return price;
  } catch (error) {
    console.error("Error getting ETH price:", error);
    // Fallback price if API fails
    return 2000; // Approximate ETH price as fallback
  }
}

/**
 * Get current USDC/USD price
 */
export async function getUsdcPrice(chainId: number = 137): Promise<number> {
  try {
    const prices = await fetchPythPrices([PYTH_PRICE_FEEDS["USDC/USD"]], chainId);
    const usdcPriceData = prices.get(PYTH_PRICE_FEEDS["USDC/USD"]);

    if (!usdcPriceData) {
      throw new Error("USDC price not found");
    }

    // Convert price considering the exponent
    const price = usdcPriceData.price.price * Math.pow(10, usdcPriceData.price.expo);
    return price;
  } catch (error) {
    console.error("Error getting USDC price:", error);
    // Fallback price if API fails
    return 1.0; // USDC should be close to $1
  }
}

/**
 * Convert ETH amount to USD
 */
export async function ethToUsd(ethAmount: number, chainId: number = 137): Promise<number> {
  const ethPrice = await getEthPrice(chainId);
  return ethAmount * ethPrice;
}

/**
 * Convert USDC amount to USD (should be ~1:1)
 */
export async function usdcToUsd(usdcAmount: number, chainId: number = 137): Promise<number> {
  const usdcPrice = await getUsdcPrice(chainId);
  return usdcAmount * usdcPrice;
}

/**
 * Convert USD amount to ETH
 */
export async function usdToEth(usdAmount: number, chainId: number = 137): Promise<number> {
  const ethPrice = await getEthPrice(chainId);
  return usdAmount / ethPrice;
}

/**
 * Convert USD amount to USDC
 */
export async function usdToUsdc(usdAmount: number, chainId: number = 137): Promise<number> {
  const usdcPrice = await getUsdcPrice(chainId);
  return usdAmount / usdcPrice;
}

/**
 * Get all supported token prices in USD
 */
export async function getAllTokenPrices(chainId: number = 137): Promise<{
  ETH: number;
  USDC: number;
}> {
  try {
    const priceIds = [PYTH_PRICE_FEEDS["ETH/USD"], PYTH_PRICE_FEEDS["USDC/USD"]];
    const prices = await fetchPythPrices(priceIds, chainId);

    const ethPriceData = prices.get(PYTH_PRICE_FEEDS["ETH/USD"]);
    const usdcPriceData = prices.get(PYTH_PRICE_FEEDS["USDC/USD"]);

    const ethPrice = ethPriceData
      ? ethPriceData.price.price * Math.pow(10, ethPriceData.price.expo)
      : 2000; // Fallback

    const usdcPrice = usdcPriceData
      ? usdcPriceData.price.price * Math.pow(10, usdcPriceData.price.expo)
      : 1.0; // Fallback

    return {
      ETH: ethPrice,
      USDC: usdcPrice,
    };
  } catch (error) {
    console.error("Error getting all token prices:", error);
    return {
      ETH: 2000, // Fallback prices
      USDC: 1.0,
    };
  }
}

/**
 * Format price for display
 */
export function formatPrice(price: number, decimals: number = 2): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(price);
}

/**
 * React hook for real-time price updates
 */
export function usePythPrices(refreshInterval: number = 30000) {
  // This would be implemented as a React hook in a real application
  // For now, returning a placeholder structure
  return {
    prices: { ETH: 0, USDC: 0 },
    loading: true,
    error: null,
    refresh: async () => {},
  };
}

/**
 * Utility to check if price data is stale
 */
export function isPriceStale(publishTime: number, maxAgeMs: number = 60000): boolean {
  const currentTime = Date.now() / 1000; // Convert to seconds
  return currentTime - publishTime > maxAgeMs / 1000;
}

/**
 * Get confidence interval for price
 */
export function getPriceConfidence(price: number, confidence: number): {
  lower: number;
  upper: number;
  percentage: number;
} {
  const confidencePercentage = (confidence / price) * 100;

  return {
    lower: price - confidence,
    upper: price + confidence,
    percentage: confidencePercentage,
  };
}