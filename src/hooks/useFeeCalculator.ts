// src/hooks/useFeeCalculator.ts
import { useMemo, useState } from 'react';

/** ---------- Types ---------- */

export interface FeeInputs {
  // Pool & Position
  positionValue: number;     // USD
  currentPrice: number;      // USD/ZAR (not used in math yet, but kept for future IL)
  lowerTick: number;         // range lower (USD/ZAR)
  upperTick: number;         // range upper (USD/ZAR)
  yourLiquidity: number;     // L_you
  activeLiquidity: number;   // L_active in your range

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
}

/** ---------- Defaults ---------- */

export const defaultFeeInputs: FeeInputs = {
  // Pool & Position
  positionValue: 100000,
  currentPrice: 18.75,
  lowerTick: 18.0,
  upperTick: 19.5,
  yourLiquidity: 2.73,
  activeLiquidity: 44609.06,

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
};

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

  // Stress logic: |daily move| ≥ 5% OR realizedVol - anchor ≥ 3%
  const sigma = Math.max(0, nz(inp.realizedVol, 0));
  const sigmaAnchor = Math.max(0, nz(inp.volAnchor, 0));
  const moveAbs = Math.abs(nz(inp.dailyMovePct, 0));
  const stress = moveAbs >= 0.05 || (sigma - sigmaAnchor) >= 0.03;

  // Dynamic fee components (decimals)
  const fVol   = nz(inp.feeMin, 0) + nz(inp.k1, 0) * Math.max(0, sigma - sigmaAnchor);
  const fFlow  = nz(inp.k2, 0) * Math.max(0, nz(inp.flowImbalance, 0) - 0.70);
  const spread = nz(inp.sarbRate, 0) - nz(inp.fedRate, 0); // % over 2%
  const fRate  = nz(inp.k3, 0) * Math.max(0, (spread - 2.0));
  const fStress = stress ? nz(inp.stressDelta, 0) : 0;

  let fDyn = fVol + fFlow + fRate + fStress;
  fDyn = clamp(fDyn, nz(inp.feeMin, 0), nz(inp.feeMax, 0)); // decimal

  // Fees
  const feesGross = share * volume * fDyn;

  // LVR proxy using vol^2 and lag (seconds)
  const lagSec = Math.max(0, nz(inp.cexDexLag, 0) / 1000);
  const lvr = Math.max(0, (0.35 * sigma * sigma + 0.15 * lagSec) * share * volume);

  // MEV haircut on pro-rata volume
  const mevBps = Math.max(0, nz(inp.mevBps ?? 6, 6));
  const mevHaircut = share * volume * (mevBps / 10_000);

  // Rebalance costs
  const rebalanceCost = Math.max(0, nz(inp.rebalancesPerDay, 0)) * Math.max(0, nz(inp.gasPerRebalance, 0));

  // Net
  const netFees = feesGross - lvr - mevHaircut - rebalanceCost;

  // APR (simple annualization)
  const dailyReturn = netFees / position;
  const apr = dailyReturn * 365;

  // Break-even fee (decimal)
  const denom = share * volume;
  const fixedCosts = lvr + mevHaircut + rebalanceCost;
  const breakEvenFee = denom > 0 ? (fixedCosts / denom) : 0;

  // Insurance coverage snapshot
  const insuranceTVL = Math.max(0, nz(inp.insuranceBuffer, 0)) * position;
  const deficit = Math.max(0, -netFees);
  const coveredByInsurance = Math.min(deficit, insuranceTVL);
  const insuranceRemaining = Math.max(0, insuranceTVL - coveredByInsurance);

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

  return { inputs, setInputs, set, outputs };
}
