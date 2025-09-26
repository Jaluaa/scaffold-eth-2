import { BigInt, Bytes, log, Address } from "@graphprotocol/graph-ts";
import {
  TipSent,
  CreatorWithdrawal,
  TokenAdded,
  TokenRemoved,
  PlatformFeeUpdated,
} from "../generated/TipJar/TipJar";
import {
  Creator,
  Tipper,
  Tip,
  Withdrawal,
  DailyStats,
  MonthlyStats,
  PlatformStats,
  TokenStats,
} from "../generated/schema";

// Constants
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ETH_DECIMALS = 18;
const USDC_DECIMALS = 6;
const USD_DECIMALS = 6;
const PRICE_DECIMALS = 8;

// Helper functions
function getTokenSymbol(tokenAddress: Bytes): string {
  if (tokenAddress.toHexString() == ZERO_ADDRESS) {
    return "ETH";
  }
  // Add other token mappings here
  return "USDC"; // Default assumption for non-ETH tokens
}

function getDayId(timestamp: BigInt): string {
  const dayTimestamp = timestamp.div(BigInt.fromI32(86400)).times(BigInt.fromI32(86400));
  const date = new Date(dayTimestamp.toI32() * 1000);
  return date.toISOString().split("T")[0]; // YYYY-MM-DD format
}

function getMonthId(timestamp: BigInt): string {
  const date = new Date(timestamp.toI32() * 1000);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  return `${year}-${month.toString().padStart(2, "0")}`;
}

function getOrCreateCreator(address: Address): Creator {
  let creator = Creator.load(address.toHexString());
  if (creator == null) {
    creator = new Creator(address.toHexString());
    creator.totalTipsEth = BigInt.fromI32(0);
    creator.totalTipsUsdc = BigInt.fromI32(0);
    creator.tipCount = 0;
    creator.uniqueTippers = 0;
    creator.balanceEth = BigInt.fromI32(0);
    creator.balanceUsdc = BigInt.fromI32(0);
    creator.withdrawnEth = BigInt.fromI32(0);
    creator.withdrawnUsdc = BigInt.fromI32(0);
    creator.save();

    // Update platform stats
    let platformStats = getOrCreatePlatformStats();
    platformStats.totalCreators = platformStats.totalCreators + 1;
    platformStats.save();
  }
  return creator;
}

function getOrCreateTipper(address: Address): Tipper {
  let tipper = Tipper.load(address.toHexString());
  if (tipper == null) {
    tipper = new Tipper(address.toHexString());
    tipper.totalTippedEth = BigInt.fromI32(0);
    tipper.totalTippedUsdc = BigInt.fromI32(0);
    tipper.tipCount = 0;
    tipper.uniqueCreators = 0;
    tipper.save();

    // Update platform stats
    let platformStats = getOrCreatePlatformStats();
    platformStats.totalTippers = platformStats.totalTippers + 1;
    platformStats.save();
  }
  return tipper;
}

function getOrCreatePlatformStats(): PlatformStats {
  let stats = PlatformStats.load("platform");
  if (stats == null) {
    stats = new PlatformStats("platform");
    stats.totalTipsEth = BigInt.fromI32(0);
    stats.totalTipsUsdc = BigInt.fromI32(0);
    stats.totalTipCount = 0;
    stats.totalTippers = 0;
    stats.totalCreators = 0;
    stats.totalFeesEth = BigInt.fromI32(0);
    stats.totalFeesUsdc = BigInt.fromI32(0);
    stats.totalUsdVolume = BigInt.fromI32(0);
    stats.lastUpdated = BigInt.fromI32(0);
  }
  return stats;
}

function getOrCreateTokenStats(tokenAddress: Bytes): TokenStats {
  let stats = TokenStats.load(tokenAddress.toHexString());
  if (stats == null) {
    stats = new TokenStats(tokenAddress.toHexString());
    stats.symbol = getTokenSymbol(tokenAddress);
    stats.totalTips = BigInt.fromI32(0);
    stats.tipCount = 0;
    stats.totalFees = BigInt.fromI32(0);
    stats.totalWithdrawals = BigInt.fromI32(0);
    stats.lastPriceUsd = BigInt.fromI32(0);
    stats.lastUpdated = BigInt.fromI32(0);
  }
  return stats;
}

function getOrCreateDailyStats(timestamp: BigInt): DailyStats {
  const dayId = getDayId(timestamp);
  let stats = DailyStats.load(dayId);
  if (stats == null) {
    stats = new DailyStats(dayId);
    stats.date = timestamp.div(BigInt.fromI32(86400)).times(BigInt.fromI32(86400));
    stats.totalTipsEth = BigInt.fromI32(0);
    stats.totalTipsUsdc = BigInt.fromI32(0);
    stats.tipCount = 0;
    stats.uniqueTippers = 0;
    stats.uniqueCreators = 0;
    stats.totalUsdVolume = BigInt.fromI32(0);
    stats.avgTipUsd = BigInt.fromI32(0);
  }
  return stats;
}

function getOrCreateMonthlyStats(timestamp: BigInt): MonthlyStats {
  const monthId = getMonthId(timestamp);
  let stats = MonthlyStats.load(monthId);
  if (stats == null) {
    stats = new MonthlyStats(monthId);
    stats.month = timestamp;
    stats.totalTipsEth = BigInt.fromI32(0);
    stats.totalTipsUsdc = BigInt.fromI32(0);
    stats.tipCount = 0;
    stats.uniqueTippers = 0;
    stats.uniqueCreators = 0;
    stats.totalUsdVolume = BigInt.fromI32(0);
    stats.avgTipUsd = BigInt.fromI32(0);
  }
  return stats;
}

// Simplified price estimation (in production, you'd integrate with price oracles)
function estimateUsdValue(amount: BigInt, tokenAddress: Bytes): BigInt {
  if (tokenAddress.toHexString() == ZERO_ADDRESS) {
    // ETH - assume $2000 for simplicity
    return amount.times(BigInt.fromI32(2000)).div(BigInt.fromI32(10).pow(ETH_DECIMALS as u8));
  } else {
    // USDC - assume $1
    return amount.div(BigInt.fromI32(10).pow((USDC_DECIMALS - USD_DECIMALS) as u8));
  }
}

export function handleTipSent(event: TipSent): void {
  // Create tip entity
  const tipId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let tip = new Tip(tipId);

  tip.transactionHash = event.transaction.hash;
  tip.blockNumber = event.block.number;
  tip.timestamp = event.block.timestamp;
  tip.logIndex = event.logIndex;
  tip.token = event.params.token;
  tip.tokenSymbol = getTokenSymbol(event.params.token);
  tip.amount = event.params.amount;
  tip.fee = event.params.fee;
  tip.netAmount = event.params.amount;
  tip.message = event.params.message;
  tip.usdValue = estimateUsdValue(event.params.amount, event.params.token);

  // Get or create tipper and creator
  let tipper = getOrCreateTipper(event.params.tipper);
  let creator = getOrCreateCreator(event.params.creator);

  tip.tipper = tipper.id;
  tip.creator = creator.id;

  // Update tipper stats
  if (event.params.token.toHexString() == ZERO_ADDRESS) {
    tipper.totalTippedEth = tipper.totalTippedEth.plus(event.params.amount);
  } else {
    tipper.totalTippedUsdc = tipper.totalTippedUsdc.plus(event.params.amount);
  }
  tipper.tipCount = tipper.tipCount + 1;
  if (tipper.firstTipAt == null) {
    tipper.firstTipAt = event.block.timestamp;
  }
  tipper.lastTipAt = event.block.timestamp;

  // Update creator stats
  if (event.params.token.toHexString() == ZERO_ADDRESS) {
    creator.totalTipsEth = creator.totalTipsEth.plus(event.params.amount);
    creator.balanceEth = creator.balanceEth.plus(event.params.amount);
  } else {
    creator.totalTipsUsdc = creator.totalTipsUsdc.plus(event.params.amount);
    creator.balanceUsdc = creator.balanceUsdc.plus(event.params.amount);
  }
  creator.tipCount = creator.tipCount + 1;
  if (creator.firstTipAt == null) {
    creator.firstTipAt = event.block.timestamp;
  }
  creator.lastTipAt = event.block.timestamp;

  // Update token stats
  let tokenStats = getOrCreateTokenStats(event.params.token);
  tokenStats.totalTips = tokenStats.totalTips.plus(event.params.amount);
  tokenStats.tipCount = tokenStats.tipCount + 1;
  tokenStats.totalFees = tokenStats.totalFees.plus(event.params.fee);
  tokenStats.lastUpdated = event.block.timestamp;

  // Update daily stats
  let dailyStats = getOrCreateDailyStats(event.block.timestamp);
  if (event.params.token.toHexString() == ZERO_ADDRESS) {
    dailyStats.totalTipsEth = dailyStats.totalTipsEth.plus(event.params.amount);
  } else {
    dailyStats.totalTipsUsdc = dailyStats.totalTipsUsdc.plus(event.params.amount);
  }
  dailyStats.tipCount = dailyStats.tipCount + 1;
  dailyStats.totalUsdVolume = dailyStats.totalUsdVolume.plus(tip.usdValue!);

  // Update monthly stats
  let monthlyStats = getOrCreateMonthlyStats(event.block.timestamp);
  if (event.params.token.toHexString() == ZERO_ADDRESS) {
    monthlyStats.totalTipsEth = monthlyStats.totalTipsEth.plus(event.params.amount);
  } else {
    monthlyStats.totalTipsUsdc = monthlyStats.totalTipsUsdc.plus(event.params.amount);
  }
  monthlyStats.tipCount = monthlyStats.tipCount + 1;
  monthlyStats.totalUsdVolume = monthlyStats.totalUsdVolume.plus(tip.usdValue!);

  // Update platform stats
  let platformStats = getOrCreatePlatformStats();
  if (event.params.token.toHexString() == ZERO_ADDRESS) {
    platformStats.totalTipsEth = platformStats.totalTipsEth.plus(event.params.amount);
    platformStats.totalFeesEth = platformStats.totalFeesEth.plus(event.params.fee);
  } else {
    platformStats.totalTipsUsdc = platformStats.totalTipsUsdc.plus(event.params.amount);
    platformStats.totalFeesUsdc = platformStats.totalFeesUsdc.plus(event.params.fee);
  }
  platformStats.totalTipCount = platformStats.totalTipCount + 1;
  platformStats.totalUsdVolume = platformStats.totalUsdVolume.plus(tip.usdValue!);
  platformStats.lastUpdated = event.block.timestamp;

  // Save all entities
  tip.save();
  tipper.save();
  creator.save();
  tokenStats.save();
  dailyStats.save();
  monthlyStats.save();
  platformStats.save();

  log.info("Tip processed: {} {} from {} to {}", [
    tip.amount.toString(),
    tip.tokenSymbol,
    tip.tipper,
    tip.creator,
  ]);
}

export function handleCreatorWithdrawal(event: CreatorWithdrawal): void {
  // Create withdrawal entity
  const withdrawalId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let withdrawal = new Withdrawal(withdrawalId);

  withdrawal.transactionHash = event.transaction.hash;
  withdrawal.blockNumber = event.block.number;
  withdrawal.timestamp = event.block.timestamp;
  withdrawal.logIndex = event.logIndex;
  withdrawal.token = event.params.token;
  withdrawal.tokenSymbol = getTokenSymbol(event.params.token);
  withdrawal.amount = event.params.amount;
  withdrawal.usdValue = estimateUsdValue(event.params.amount, event.params.token);

  // Get creator
  let creator = getOrCreateCreator(event.params.creator);
  withdrawal.creator = creator.id;

  // Update creator balances
  if (event.params.token.toHexString() == ZERO_ADDRESS) {
    creator.balanceEth = creator.balanceEth.minus(event.params.amount);
    creator.withdrawnEth = creator.withdrawnEth.plus(event.params.amount);
  } else {
    creator.balanceUsdc = creator.balanceUsdc.minus(event.params.amount);
    creator.withdrawnUsdc = creator.withdrawnUsdc.plus(event.params.amount);
  }

  // Update token stats
  let tokenStats = getOrCreateTokenStats(event.params.token);
  tokenStats.totalWithdrawals = tokenStats.totalWithdrawals.plus(event.params.amount);
  tokenStats.lastUpdated = event.block.timestamp;

  // Save entities
  withdrawal.save();
  creator.save();
  tokenStats.save();

  log.info("Withdrawal processed: {} {} by {}", [
    withdrawal.amount.toString(),
    withdrawal.tokenSymbol,
    withdrawal.creator,
  ]);
}

export function handleTokenAdded(event: TokenAdded): void {
  let tokenStats = getOrCreateTokenStats(event.params.token);
  tokenStats.lastUpdated = event.block.timestamp;
  tokenStats.save();

  log.info("Token added: {}", [event.params.token.toHexString()]);
}

export function handleTokenRemoved(event: TokenRemoved): void {
  log.info("Token removed: {}", [event.params.token.toHexString()]);
}

export function handlePlatformFeeUpdated(event: PlatformFeeUpdated): void {
  log.info("Platform fee updated: {} -> {}", [
    event.params.oldFee.toString(),
    event.params.newFee.toString(),
  ]);
}