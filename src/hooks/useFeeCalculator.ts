// src/hooks/useFeeCalculator.ts

import { useCallback, useMemo, useState } from 'react';

/** ---------- Types ---------- */

export interface FeeInputs {
  // Pool & Position
  poolType: "volatile" | "stable" | "CL";
  positionValue: number;     // USD
  currentPrice: number;      // USD/ZAR (not used in math yet, but kept for future IL)
  p0: number;               // initial price for IL calculation
p1: number;               // scenario price for IL calculation
  lowerTick: number;         // range lower (USD/ZAR)
  upperTick: number;         // range upper (USD/ZAR)
  yourLiquidity: number;     // L_you
  activeLiquidity: number;   // L_active in your range
  timeInRangeFrac: number;  

  // Optional: derive liquidity from token amounts instead of manual input
amount0?: number;          // ZAR token amount for liquidity derivation
amount1?: number;          // USD token amount for liquidity derivation
tickSpacing?: number;      // tick spacing for the pool (e.g., 1, 10, 60, 200)

  // Flow & Microstructure
  swapVolume: number;        // 24h volume crossing your range (USD)
  flowImbalance: number;     // 0..1, e.g. 0.72 = 72% one-way
  realizedVol: number;       // annualized, e.g. 0.17 = 17%
  cexDexLag: number;         // milliseconds
  rebalancesPerDay: number;  // count
  gasPerRebalance: number;   // USD

  // Fee Policy
  feeMin: number;            // decimal, e.g. 0.008 = 0.8%
  feeMax: number;            // decimal
  volAnchor: number;         // e.g. 0.12 = 12%
  k1: number;                // vol coef
  k2: number;                // flow coef
  k3: number;                // rate-diff coef
  stressDelta: number;       // additive bump when stressed (decimal)
  dailyMovePct: number;      // absolute daily % move, e.g. 0.051 = 5.1%

  // Macro/Carry
  sarbRate: number;          // % (not decimal), e.g. 8.25
  fedRate: number;           // % (not decimal), e.g. 5.50

  // Risk Policy
  insuranceBuffer: number;   // decimal of TVL, e.g. 0.06 = 6%
  targetZarMix: number;      // 0..1 (display only for now)
  mevBps?: number;           // default 6 bp on pro-rata volume

  // Emissions & Bribes (ve(3,3))
weeklyAERO?: number;           // Weekly AERO emissions to distribute
poolVotes?: number;            // Votes this pool received
totalVotes?: number;           // Total votes across all pools
yourLPShareInPool?: number;    // Your share of this pool's total liquidity (0..1)
veBoost?: number;              // Your veNFT boost factor (1.0 = no boost, 2.5 = max)
bribesPerVoteUSD?: number;     // USD value of bribes per vote
aeroPrice?: number;            // AERO token price in USD

// APR Calculation Mode
useActiveLiquidityAPR?: boolean; // For CL: use active liquidity as denominator
}

export interface FeeOutputs {
  dynamicFeePct: number;   // %
  fVolPct: number;         // %
  fFlowPct: number;        // %
  fRatePct: number;        // %
  fStressPct: number;      // %
  stress: boolean;

  grossFees: number;       // USD/day
  lvr: number;             // USD/day
  mevHaircut: number;      // USD/day
  rebalanceCost: number;   // USD/day
  netFees: number;         // USD/day

  aprPct: number;          // %
  breakEvenFeePct: number; // %

  deficitCovered: number;      // USD/day covered by insurance
  insuranceRemaining: number;  // USD remaining in insurance TVL snapshot
  positionValueAtP1: number;    // USD value at scenario price
pnlVsHodl: number;           // position value vs HODL baseline
ilPct: number;               // impermanent loss percentage
netEdge: number;             // fees - IL - costs (total edge)
ilUsd: number;               // impermanent loss in USD
hodlBaseline: number;        // HODL value at P1
positionWithoutFees: number; // position value excluding fees

// Emissions & Bribes
emissionsUSD: number;          // USD/day from AERO emissions
bribesUSD: number;             // USD/day from bribes
totalRewardsUSD: number;       // emissions + bribes per day

// Enhanced APR breakdown
feesAPR: number;               // APR from fees only
rewardsAPR: number;            // APR from emissions+bribes
totalAPR: number;              // combined APR including all rewards

enhancedNetPnL: number;
}

/** ---------- Defaults ---------- */

export const defaultFeeInputs: FeeInputs = {
  // Pool & Position
  poolType: "CL", // default to concentrated liquidity
  positionValue: 100000,
  currentPrice: 18.75,
  p0: 18.75,    // initial price
p1: 18.75,    // scenario price (same as current by default)
  lowerTick: 18.0,
  upperTick: 19.5,
  yourLiquidity: 2.73,
  activeLiquidity: 44609.06,
  timeInRangeFrac: 1.0, 

  // Optional liquidity derivation
amount0: undefined,        // let users choose manual L or derive from amounts
amount1: undefined,
tickSpacing: 1,           // default tick spacing

  // Flow & Microstructure
  swapVolume: 12_500_000,
  flowImbalance: 0.72,
  realizedVol: 0.17,
  cexDexLag: 450,
  rebalancesPerDay: 1,
  gasPerRebalance: 2.4,

  // Fee Policy
  feeMin: 0.008,
  feeMax: 0.025,
  volAnchor: 0.12,
  k1: 3.0,
  k2: 0.5,
  k3: 0.2,
  stressDelta: 0.006,
  dailyMovePct: 0.05,

  // Macro/Carry
  sarbRate: 8.25,
  fedRate: 5.5,

  // Risk Policy
  insuranceBuffer: 0.06,
  targetZarMix: 0.45,  // 45% ZAR / 55% USD default (USD-heavy)
  mevBps: 6,

  // Emissions & Bribes (ve(3,3))
weeklyAERO: 1000000,           // 1M AERO per week example
poolVotes: 50000,              // Example pool votes
totalVotes: 1000000,           // Total voting power
yourLPShareInPool: 0.001,      // 0.1% of pool
veBoost: 1.0,                  // No boost
bribesPerVoteUSD: 0.05,        // $0.05 per vote
aeroPrice: 0.50,               // $0.50 per AERO

// APR mode
useActiveLiquidityAPR: false,  // Use total position value by default
};

// Helper: Check if current price is within CL range
function isInRange(currentPrice: number, lowerTick: number, upperTick: number): boolean {
  return currentPrice >= lowerTick && currentPrice <= upperTick;
}

// Helper: Calculate realistic time-in-range based on price position
function calculateTimeInRange(inp: FeeInputs): number {
  const { currentPrice, lowerTick, upperTick, timeInRangeFrac } = inp;
  
  // If user provided explicit timeInRangeFrac, use it
  if (timeInRangeFrac < 1.0) {
    return timeInRangeFrac;
  }
  
  // Auto-calculate based on current position
  if (!isInRange(currentPrice, lowerTick, upperTick)) {
    return 0; // completely out of range = no fees
  }
  
  // In range: use provided fraction or default to 1.0
  return timeInRangeFrac;
}

// Helper: Calculate position value for volatile pools (x*y=k)
function valueVolatileAt(p1: number, initialValue: number, p0: number): number {
  if (p0 <= 0) return initialValue;
  const priceRatio = p1 / p0;
  // For x*y=k pools: value = initial * 2 * sqrt(priceRatio) / (1 + priceRatio)
  const il = 2 * Math.sqrt(priceRatio) / (1 + priceRatio);
  return initialValue * il;
}

// Helper: Calculate position value for stable pools using curve mechanics
function valueStableAt(p1: number, initialValue: number, p0: number, reserves?: { x: number, y: number }): number {
  if (p0 <= 0) return initialValue;
  
  // If we have reserve data, use curve quoting
  if (reserves && reserves.x > 0 && reserves.y > 0) {
    const priceChange = (p1 - p0) / p0;
    const tradeSize = Math.abs(priceChange) * reserves.x * 0.1; // Approximate trade size
    const quote = stableQuote(tradeSize, reserves.x, reserves.y);
    const slippage = Math.abs(quote.newPrice - p0) / p0;
    
    // Stable pools have minimal IL but still some curve-based impact
    const ilFactor = 1 - (slippage * slippage * 0.05);
    return initialValue * ilFactor;
  }
  
  // Fallback to simplified model
  const priceRatio = p1 / p0;
  const deviation = Math.abs(priceRatio - 1);
  const ilFactor = 1 - (deviation * deviation * 0.1);
  return initialValue * ilFactor;
}

// Helper: Calculate position value for CL pools
function valueCLAt(p1: number, liquidity: number, lowerTick: number, upperTick: number, _p0: number, initialValue: number): number {
  if (liquidity <= 0 || lowerTick >= upperTick) return initialValue;
  
  // Convert prices to sqrt space
  const sa = Math.sqrt(lowerTick);
  const sb = Math.sqrt(upperTick);
  const s1 = Math.sqrt(p1);
  
  let amount0At1 = 0;
  let amount1At1 = 0;
  
  // Calculate amounts at price p1 based on range position
  if (s1 <= sa) {
    // All in token0
    amount0At1 = liquidity * (sb - sa) / (sa * sb);
    amount1At1 = 0;
  } else if (s1 >= sb) {
    // All in token1  
    amount0At1 = 0;
    amount1At1 = liquidity * (sb - sa);
  } else {
    // Mixed position
    amount0At1 = liquidity * (sb - s1) / (s1 * sb);
    amount1At1 = liquidity * (s1 - sa);
  }
  
  // Value in USD (assuming token1 is USD, token0 is ZAR)
  return amount0At1 * p1 + amount1At1;
}

// Helper: Calculate HODL baseline value
function hodlValue(p1: number, initialValue: number, p0: number, zarMix: number): number {
  if (p0 <= 0) return initialValue;
  const usdValue = initialValue * (1 - zarMix);
  const zarValue = initialValue * zarMix;
  // ZAR value changes with price, USD stays same
  return usdValue + (zarValue * p1 / p0);
}




function liquidityFromAmounts(amount0: number, amount1: number, pL: number, pU: number): number {
  if (pL >= pU || pL <= 0 || pU <= 0) return 0;
  
  const sa = Math.sqrt(pL);   // sqrt(P_L)
  const sb = Math.sqrt(pU);   // sqrt(P_U)
  
  // Calculate liquidity from each token amount
  let l0 = 0;
  let l1 = 0;
  
  if (amount0 > 0) {
    l0 = amount0 * (sa * sb) / (sb - sa);
  }
  
  if (amount1 > 0) {
    l1 = amount1 / (sb - sa);
  }
  
  // Return minimum (the limiting factor)
  if (l0 > 0 && l1 > 0) {
    return Math.min(l0, l1);
  } else if (l0 > 0) {
    return l0;
  } else {
    return l1;
  }
}

// Helper: Calculate token amounts from liquidity at a given price
function amountsFromLiquidity(L: number, price: number, pL: number, pU: number): { amount0: number, amount1: number } {
  if (L <= 0 || pL >= pU) return { amount0: 0, amount1: 0 };
  
  const sa = Math.sqrt(pL);
  const sb = Math.sqrt(pU);
  const s = Math.sqrt(price);
  
  let amount0 = 0;
  let amount1 = 0;
  
  if (s <= sa) {
    // All in token0 (ZAR)
    amount0 = L * (sb - sa) / (sa * sb);
    amount1 = 0;
  } else if (s >= sb) {
    // All in token1 (USD)
    amount0 = 0;
    amount1 = L * (sb - sa);
  } else {
    // Mixed position
    amount0 = L * (sb - s) / (s * sb);
    amount1 = L * (s - sa);
  }
  
  return { amount0, amount1 };
}

// Helper: Stable pool quote using simplified curve approximation
function stableQuote(xIn: number, xReserve: number, yReserve: number, A: number = 100): { dy: number, newPrice: number } {
  if (xIn <= 0 || xReserve <= 0 || yReserve <= 0) {
    return { dy: 0, newPrice: 0 };
  }
  
  // Simplified stable curve: dy ≈ xIn * (yReserve/xReserve) with reduced slippage
  const basePrice = yReserve / xReserve;
  const slippageFactor = 1 - (xIn / (xReserve * A)); // A controls slippage
  const dy = xIn * basePrice * Math.max(0.01, slippageFactor);
  const newPrice = (yReserve - dy) / (xReserve + xIn);
  
  return { dy, newPrice };
}

// Helper: Calculate emissions and bribes for ve(3,3) model
function estimateEmissionsAndBribes(inp: FeeInputs): { emissionsUSD: number, bribesUSD: number } {
  const safeGet = (n: number | undefined, fallback = 0) => (Number.isFinite(n) ? n! : fallback);
  const clampLocal = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi);
  
  const weeklyAERO = safeGet(inp.weeklyAERO, 0);
  const poolVotes = safeGet(inp.poolVotes, 0);
  const totalVotes = Math.max(1, safeGet(inp.totalVotes, 1));
  const yourLPShare = clampLocal(safeGet(inp.yourLPShareInPool, 0), 0, 1);
  const veBoost = Math.max(1, safeGet(inp.veBoost, 1));
  const aeroPrice = Math.max(0, safeGet(inp.aeroPrice, 0));
  const bribesPerVote = Math.max(0, safeGet(inp.bribesPerVoteUSD, 0));

  // Pool gets this fraction of weekly emissions
  const poolEmissionShare = poolVotes / totalVotes;
  const poolEmissionsWeekly = weeklyAERO * poolEmissionShare;
  
  // Your share of pool emissions (with veBoost)
  const yourEmissionsWeekly = poolEmissionsWeekly * yourLPShare * veBoost;
  const emissionsUSD = (yourEmissionsWeekly * aeroPrice) / 7; // Convert to daily
  
  // Your bribes based on your LP share of the voted pool
  const yourBribesWeekly = bribesPerVote * poolVotes * yourLPShare;
  const bribesUSD = yourBribesWeekly / 7; // Convert to daily
  
  return { emissionsUSD, bribesUSD };
}




/** ---------- Core Calculator ---------- */

export function calculateFeeMetrics(inp: FeeInputs): FeeOutputs {
  // Helpers with guards
  const nz = (n: number, fallback = 0) => (Number.isFinite(n) ? n : fallback);
  const clamp = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi);

  const position = Math.max(1e-9, nz(inp.positionValue, 0));
  const lActive = Math.max(1e-9, nz(inp.activeLiquidity, 0));
  const lYou = Math.max(0, nz(inp.yourLiquidity, 0));
  const share = clamp(lYou / lActive, 0, 1);
  const volume = Math.max(0, nz(inp.swapVolume, 0));

  // Derive liquidity if amounts are provided, otherwise use manual input
let actualLiquidity = lYou;
if (inp.amount0 !== undefined && inp.amount1 !== undefined && inp.poolType === "CL") {
  actualLiquidity = liquidityFromAmounts(
    nz(inp.amount0, 0),
    nz(inp.amount1, 0), 
    nz(inp.lowerTick, 0),
    nz(inp.upperTick, 0),

  );
}

// Recalculate share using derived liquidity
const actualShare = clamp(actualLiquidity / lActive, 0, 1);

  // Stress logic: |daily move| ≥ 5% OR realizedVol - anchor ≥ 3%
  const sigma = Math.max(0, nz(inp.realizedVol, 0));
  const sigmaAnchor = Math.max(0, nz(inp.volAnchor, 0));
  const moveAbs = Math.abs(nz(inp.dailyMovePct, 0));
  const stress = moveAbs >= 0.05 || (sigma - sigmaAnchor) >= 0.03;

  // Pool-specific fee logic
  const isVolatile = inp.poolType === "volatile";
  const isStable = inp.poolType === "stable";
  const isCL = inp.poolType === "CL";

// For CL pools, calculate realistic volume and range effects
let effectiveShare = actualShare;
let effectiveVolume = volume;

if (isCL) {
  // Calculate realistic time in range
  const timeInRange = calculateTimeInRange(inp);
  
  // CL pools only earn fees when price is in range
  effectiveVolume = volume * timeInRange;
  
  // CL share is based on active liquidity only
  effectiveShare = share; // already calculated as lYou/lActive which is correct for CL
  
  // If completely out of range, set share to 0 as well
  if (timeInRange === 0) {
    effectiveShare = 0;
  }
}
  // Volatility adjustment for stable pools
  let volAdjustment = 1.0;
  if (isStable) {
    volAdjustment = 0.5; // stable pools have reduced volatility impact
  }

  // Dynamic fee components (decimals)
  const fVol = (nz(inp.feeMin, 0) + nz(inp.k1, 0) * Math.max(0, sigma - sigmaAnchor)) * volAdjustment;
  const fFlow = nz(inp.k2, 0) * Math.max(0, nz(inp.flowImbalance, 0) - 0.70);
  const spread = nz(inp.sarbRate, 0) - nz(inp.fedRate, 0); // % over 2%
  const fRate = nz(inp.k3, 0) * Math.max(0, (spread - 2.0));
  const fStress = stress ? nz(inp.stressDelta, 0) : 0;

  let fDyn = fVol + fFlow + fRate + fStress;

  // Apply pool type multiplier
  let poolFeeMultiplier = 1.0;
  if (isVolatile) {
    poolFeeMultiplier = 1.2; // volatile pools have higher fees
  } else if (isStable) {
    poolFeeMultiplier = 0.8; // stable pools have lower fees
  }
  // CL pools use 1.0 multiplier (no change)

  fDyn = fDyn * poolFeeMultiplier;
  fDyn = clamp(fDyn, nz(inp.feeMin, 0), nz(inp.feeMax, 0)); // decimal


  // Fees (use effective values for CL)
const feesGross = effectiveShare * effectiveVolume * fDyn;

 // LVR proxy using vol^2 and lag (seconds)
const lagSec = Math.max(0, nz(inp.cexDexLag, 0) / 1000);
const lvr = Math.max(0, (0.35 * sigma * sigma + 0.15 * lagSec) * effectiveShare * effectiveVolume);



// MEV haircut on pro-rata volume
const mevBps = Math.max(0, nz(inp.mevBps ?? 6, 6));
const mevHaircut = effectiveShare * effectiveVolume * (mevBps / 10_000);

  // Rebalance costs
  const rebalanceCost = Math.max(0, nz(inp.rebalancesPerDay, 0)) * Math.max(0, nz(inp.gasPerRebalance, 0));

  // Net
  const netFees = feesGross - lvr - mevHaircut - rebalanceCost;

  // Calculate emissions and bribes
const { emissionsUSD, bribesUSD } = estimateEmissionsAndBribes(inp);
const totalRewardsUSD = emissionsUSD + bribesUSD;

// Enhanced APR calculations using existing position variable
const denominator = inp.useActiveLiquidityAPR && isCL ? 
  Math.max(1e-9, inp.activeLiquidity * inp.currentPrice) : 
  position;

const feesAPR = (netFees / denominator) * 365;
const rewardsAPR = (totalRewardsUSD / denominator) * 365;
const totalAPRCalc = feesAPR + rewardsAPR;

// Update net calculations to include rewards
const enhancedNetPnL = netFees + totalRewardsUSD;

  // APR (simple annualization)
  const dailyReturn = netFees / position;
  const apr = dailyReturn * 365;

  // Break-even fee (decimal)
  const denom = effectiveShare * effectiveVolume;
  const fixedCosts = lvr + mevHaircut + rebalanceCost;
  const breakEvenFee = denom > 0 ? (fixedCosts / denom) : 0;

  // Insurance coverage snapshot
  const insuranceTVL = Math.max(0, nz(inp.insuranceBuffer, 0)) * position;
  const deficit = Math.max(0, -netFees);
  const coveredByInsurance = Math.min(deficit, insuranceTVL);
  const insuranceRemaining = Math.max(0, insuranceTVL - coveredByInsurance);

  // Position valuation and IL calculation
// Position valuation and IL calculation
const p0 = Math.max(1e-9, nz(inp.p0, inp.currentPrice));
const p1 = Math.max(1e-9, nz(inp.p1, inp.currentPrice));


const hodlBaseline = hodlValue(p1, position, p0, nz(inp.targetZarMix, 0.45));

// Calculate position value WITHOUT fees at P1
let positionWithoutFees = position; // fallback

if (inp.poolType === "volatile") {
  positionWithoutFees = valueVolatileAt(p1, position, p0);
} else if (inp.poolType === "stable") {
  positionWithoutFees = valueStableAt(p1, position, p0);
} else if (inp.poolType === "CL") {
  if (inp.amount0 !== undefined && inp.amount1 !== undefined) {
    const amountsAtP1 = amountsFromLiquidity(actualLiquidity, p1, nz(inp.lowerTick, 0), nz(inp.upperTick, 0));
    positionWithoutFees = amountsAtP1.amount0 * p1 + amountsAtP1.amount1;
  } else {
    positionWithoutFees = valueCLAt(p1, actualLiquidity, nz(inp.lowerTick, 0), nz(inp.upperTick, 0), p0, position);
  }
}

// Calculate impermanent loss (HODL - position without fees)
const ilUsd = positionWithoutFees - hodlBaseline;
const ilPct = hodlBaseline > 0 ? (ilUsd / hodlBaseline) * 100 : 0;

// Position value WITH fees
const positionValueAtP1 = positionWithoutFees + netFees;

// PnL vs HODL (including fees)
const pnlVsHodl = positionValueAtP1 - hodlBaseline;

// Net Edge = fees - IL - costs

const netEdge = netFees - ilUsd;

  return {
    dynamicFeePct: fDyn * 100,
    fVolPct: fVol * 100,
    fFlowPct: fFlow * 100,
    fRatePct: fRate * 100,
    fStressPct: fStress * 100,
    stress,

    grossFees: feesGross,
    lvr,
    mevHaircut,
    rebalanceCost,
    netFees,

    aprPct: apr * 100,
    breakEvenFeePct: breakEvenFee * 100,

    deficitCovered: coveredByInsurance,
    insuranceRemaining,
    positionValueAtP1,
pnlVsHodl,
ilPct,
ilUsd,
hodlBaseline,
positionWithoutFees,
netEdge,
emissionsUSD,
bribesUSD, 
totalRewardsUSD,
feesAPR: feesAPR * 100,
rewardsAPR: rewardsAPR * 100,
totalAPR: totalAPRCalc * 100,
enhancedNetPnL,
  };
}

// Types are intentionally minimal and permissive so you don't have to refactor existing code.
// If you already have Inputs/Outputs types, just remove these and keep the function body.
type PoolType = "volatile" | "stable" | "CL";

type Inputs = {
  // Core sizing
  initialUSD: number;               // your position’s USD mark at t0 (denominator for APR)
  swapVolume24hUSD: number;         // total 24h swap volume (pool-wide)
  daysHeld: number;                 // horizon for APR scaling (e.g., 1 for daily)

  // Share model (pick one path)
  yourLPShare?: number;             // for basic pools: 0..1
  yourActiveLiquidity?: number;     // for CL: your L in-range
  totalActiveLiquidity?: number;    // for CL: pool L in-range
  timeInRangeFrac?: number;         // CL realism: 0..1 fraction of time/volume in your range

  // Optional: derive liquidity from token amounts instead of manual input
amount0?: number;          // ZAR token amount for liquidity derivation
amount1?: number;          // USD token amount for liquidity derivation
tickSpacing?: number;      // tick spacing for the pool (e.g., 1, 10, 60, 200)

  // Fee policy
  poolType?: PoolType;              // "volatile" | "stable" | "CL"
  usePoolFee?: boolean;             // if true use poolFeeBps, else compute dynamic
  poolFeeBps?: number;              // e.g., 5 = 0.05%
  // Dynamic fee knobs (if you use a custom policy)
  dynamicFeeParams?: Record<string, number>;

  // Microstructure frictions
  lvrBps?: number;                  // if provided, overrides estimateLVRBps(.)
  mevHaircutBps?: number;           // basis-points haircut on fees, default ~5–20 bps of fees
  // Ops costs
  gasPerRebalanceUSD?: number;      // per rebalance
  rebalancesPerDay?: number;        // count per day
  slippageCostUSD?: number;         // any extra ops slippage you track

  // Insurance / buffer display (optional)
  poolTVLUSD?: number;
  insurancePctOfTVL?: number;       // e.g., 0.5% => 0.005
};

type Outputs = {
  // Fee rate used
  effectiveFeeBps: number;

  // Share numbers
  feeShare: number;                 // fraction of fee flow attributed to you (post in-range logic)
  volumeInRangeUSD: number;         // volume we actually use to accrue fees

  // Gross / net fee economics
  grossFeesUSD: number;             // before haircuts/costs
  mevHaircutUSD: number;
  lvrUSD: number;                   // liquidity value reduction estimate in USD
  gasUSD: number;
  slippageUSD: number;
  netFeesUSD: number;               // after MEV + LVR (if you treat LVR as fee drag)
  netPnLUSD: number;                // after ops costs

  // Ratios
  simpleAPR: number;                // fees-based APR (pre-costs)
  netAPR: number;                   // after costs
  breakEvenFeeBps: number;          // fee bps that would zero out netPnL given volume/share

  // Insurance display (optional)
  insuranceBufferUSD: number;
};

// --- Optional helper stubs (replace with your actual implementations) ---
function dynamicFeeBps(_i: Inputs): number {
  // Your custom dynamic fee model (k1/k2/k3, caps/floors, stress add-on).
  // Default to pool fee if present; else a sane placeholder.
  if (_i.usePoolFee && typeof _i.poolFeeBps === "number") return _i.poolFeeBps;
  return typeof _i.poolFeeBps === "number" ? _i.poolFeeBps : 5; // 0.05% default
}

function estimateLVRBps(i: Inputs): number {
  // Your LVR heuristic (e.g., a*σ² + b*latency + c).
  if (typeof i.lvrBps === "number") return i.lvrBps;
  // Lightweight default: 0 bps if you haven't wired this yet.
  return 0;
}

function bound01(x: number): number {
  if (!isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}
// ---------------------------------------------------------------

export function computeOutputs(i: Inputs): Outputs {
  // 1) Effective fee bps (on-chain or dynamic)
  const effectiveFeeBps = Math.max(0, dynamicFeeBps(i));
  const feeRate = effectiveFeeBps / 1e4;

  // 2) Determine fee share
  // For basic pools: use yourLPShare
  // For CL: use yourActiveLiquidity / totalActiveLiquidity, multiplied by timeInRangeFrac
  const isCL = i.poolType === "CL";
  const baseShareBasic = bound01(i.yourLPShare ?? 0);

  let shareCL = 0;
  if (isCL) {
    const ya = Math.max(0, i.yourActiveLiquidity ?? 0);
    const ta = Math.max(0, i.totalActiveLiquidity ?? 0);
    const tir = bound01(i.timeInRangeFrac ?? 1);
    shareCL = ta > 0 ? bound01((ya / ta) * tir) : 0;
  }

  // Final fee share (choose path by pool type)
  const feeShare = isCL ? shareCL : baseShareBasic;

  // 3) Volume that actually feeds your fees
  const volumeTotal = Math.max(0, i.swapVolume24hUSD);
  const volumeInRangeUSD = volumeTotal * feeShare > 0 && isCL
    ? volumeTotal * bound01(i.timeInRangeFrac ?? 1)
    : volumeTotal;

  // 4) Gross fees (pool volume × fee × your share)
  const grossFeesUSD = volumeInRangeUSD * feeRate * (isCL ? (i.totalActiveLiquidity ? (i.yourActiveLiquidity ?? 0) / (i.totalActiveLiquidity ?? 1) : feeShare) : feeShare);

  // 5) Microstructure haircuts
  // Apply MEV haircut to fees (bps of fees), then subtract LVR as an explicit USD drag.
  const mevBps = Math.max(0, i.mevHaircutBps ?? 0);
  const mevHaircutUSD = grossFeesUSD * (mevBps / 1e4);

  // LVR modeled as USD drag against gross fees
  const lvrBps = Math.max(0, estimateLVRBps(i));
  const lvrUSD = grossFeesUSD * (lvrBps / 1e4);

  const netFeesUSD = Math.max(0, grossFeesUSD - mevHaircutUSD - lvrUSD);

  // 6) Ops costs (gas + slippage)
  const gasUSD =
    Math.max(0, i.gasPerRebalanceUSD ?? 0) * Math.max(0, i.rebalancesPerDay ?? 0) * Math.max(1, i.daysHeld || 1);
  const slippageUSD = Math.max(0, i.slippageCostUSD ?? 0);

  // 7) Net PnL and APRs
  const days = Math.max(1e-9, i.daysHeld || 1);
  const denom = Math.max(1e-9, i.initialUSD || 1);

  const simpleAPR = (netFeesUSD / denom) * (365 / days);                 // before ops costs
  const netPnLUSD = Math.max(0, netFeesUSD - gasUSD - slippageUSD);      // after ops costs
  const netAPR = (netPnLUSD / denom) * (365 / days);

  // 8) Break-even fee bps:
  // Solve netPnLUSD = 0 for feeRate. Approximate by ignoring LVR's dependency on feeRate.
  // costs to cover = lvr + mev + gas + slippage, but mev/lvr scale with gross fees.
  // Let G = volumeInRangeUSD * share. net = G*f - G*f*(mevBps+lvrBps)/1e4 - (gas+slip)
  // => f * (1 - (mevBps+lvrBps)/1e4) = (gas+slip) / G
  const G = Math.max(1e-9, volumeInRangeUSD * (isCL ? (i.totalActiveLiquidity ? (i.yourActiveLiquidity ?? 0) / (i.totalActiveLiquidity ?? 1) : feeShare) : feeShare));
  const haircutFactor = 1 - (mevBps + lvrBps) / 1e4;
  const costsUSD = gasUSD + slippageUSD;
  const breakEvenFeeRate = haircutFactor > 0 ? (costsUSD / G) / haircutFactor : 0;
  const breakEvenFeeBps = Math.max(0, breakEvenFeeRate * 1e4);

  // 9) Insurance buffer display (optional)
  const insuranceBufferUSD =
    Math.max(0, i.poolTVLUSD ?? 0) * Math.max(0, i.insurancePctOfTVL ?? 0);

  return {
    effectiveFeeBps,
    feeShare: isCL ? shareCL : baseShareBasic,
    volumeInRangeUSD: isCL ? volumeInRangeUSD : volumeTotal,

    grossFeesUSD,
    mevHaircutUSD,
    lvrUSD,
    gasUSD,
    slippageUSD,
    netFeesUSD,
    netPnLUSD,

    simpleAPR,
    netAPR,
    breakEvenFeeBps,

    insuranceBufferUSD,
  };
}


/** ---------- React Hook ---------- */

export function useFeeCalculator(initial: Partial<FeeInputs> = {}) {
  const [inputs, setInputs] = useState<FeeInputs>({ ...defaultFeeInputs, ...initial });

  // Small setter helper so you can do set('swapVolume', 15000000)
  const set = <K extends keyof FeeInputs>(key: K, value: FeeInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const outputs = useMemo(() => calculateFeeMetrics(inputs), [inputs]);
  const recalc = useCallback(() => {
    setInputs(prev => ({ ...prev }));
  }, []);


  return { inputs, set, outputs, recalc }; 
}
