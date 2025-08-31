import React from 'react';
import { styled } from '../styles/stitches.config';
import { InputField } from '../components/InputField';
import { OutputCard } from '../components/OutputCard';
import { useFeeCalculator } from '../hooks/useFeeCalculator';
import { Info } from 'lucide-react';

import { Notes } from '../components/Notes'

const Container = styled('div', {
  minHeight: '100vh',
  backgroundColor: '$background',
  color: '$text',
  fontFamily: '$body',
  padding: '2rem',
});

const Header = styled('div', {
  textAlign: 'center',
  marginBottom: '3rem',
});

const Title = styled('h1', {
  fontSize: '2.5rem',
  fontWeight: '700',
  margin: 0,
  background: 'linear-gradient(135deg, $primary, $secondary)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: '0.5rem',
});

const Subtitle = styled('p', {
  fontSize: '1.1rem',
  color: 'rgba(255, 255, 255, 0.7)',
  margin: 0,
});

const MainGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '2rem',
  maxWidth: '1400px',
  margin: '0 auto',
  
  '@media (max-width: 768px)': {
    gridTemplateColumns: '1fr',
  },
});

const InputSection = styled('div', {
  backgroundColor: 'rgba(216, 180, 254, 0.08)', // Pastel purple tint
  border: '1px solid rgba(216, 180, 254, 0.2)',
  borderRadius: '16px',
  padding: '2rem',
  backdropFilter: 'blur(10px)',
});

const OutputSection = styled('div', {
  backgroundColor: 'rgba(134, 239, 172, 0.08)', // Pastel green tint
  border: '1px solid rgba(134, 239, 172, 0.2)',
  borderRadius: '16px',
  padding: '2rem',
  backdropFilter: 'blur(10px)',
});

const SectionTitle = styled('h2', {
  fontSize: '1.5rem',
  fontWeight: '600',
  marginBottom: '1.5rem',
  color: '$text',
});

const InputGroup = styled('div', {
  marginBottom: '2rem',
  '&:last-child': {
    marginBottom: 0,
  },
});

const GroupTitle = styled('h3', {
  fontSize: '1.1rem',
  fontWeight: '500',
  marginBottom: '1rem',
  color: '$primary',
  borderBottom: '1px solid rgba(74, 222, 128, 0.2)',
  paddingBottom: '0.5rem',
});

const OutputGrid = styled('div', {
  display: 'grid',
  gap: '1rem',
});

const PoolTypeSelector = styled('div', {
  display: 'flex',
  gap: '0.5rem',
  marginBottom: '1rem',
  
  '& button': {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backgroundColor: 'transparent',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
    
    '&:hover': {
      borderColor: '$primary',
    },
    
    '&.active': {
      backgroundColor: '$primary',
      color: 'white',
      borderColor: '$primary',
    },
  },
});

const InfoIcon = styled(Info, {
  width: '16px',
  height: '16px',
  cursor: 'pointer',
  color: 'rgba(255, 255, 255, 0.5)',
  marginLeft: '0.5rem',
  
  '&:hover': {
    color: '$primary',
  },
});

// near other styled() defs
const Button = styled('button', {
  display: 'inline-block',
  background: 'linear-gradient(135deg, $primary, $secondary)',
  color: 'white',
  fontWeight: '600',
  border: 'none',
  borderRadius: '10px',
  padding: '0.9rem 1.25rem',
  cursor: 'pointer',
  boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
  '&:hover': { opacity: 0.95, transform: 'translateY(-1px)' },
  '&:active': { transform: 'translateY(0)' },
  transition: 'all 120ms ease',
  variants: {
    sticky: {
      true: { position: 'sticky', bottom: 0, marginTop: '1rem', zIndex: 2 },
    },
  },
});


export const Home: React.FC = () => {
  const { inputs, set, outputs, recalc } = useFeeCalculator();


  return (
    <Container>
      <Header>
        <Title>Aerodrome Fee Calculator</Title>
        <Subtitle>
          Slipstream Concentrated Liquidity • Target mix: {Math.round(inputs.targetZarMix * 100)}% ZAR / {100 - Math.round(inputs.targetZarMix * 100)}% USD
        </Subtitle>
      </Header>
      
      <MainGrid>
        <InputSection>
          <SectionTitle>Inputs</SectionTitle>
          
          <InputGroup>
          <GroupTitle>
    Pool & Position
    <InfoIcon onClick={() => {
      const notesSection = document.querySelector('[data-section="pool-types"]');
      notesSection?.scrollIntoView({ behavior: 'smooth' });
    }} />
  </GroupTitle>
  
  <PoolTypeSelector>
    <button 
      className={inputs.poolType === "volatile" ? "active" : ""}
      onClick={() => set('poolType', "volatile")}
    >
      V2 Volatile
    </button>
    <button 
      className={inputs.poolType === "stable" ? "active" : ""}
      onClick={() => set('poolType', "stable")}
    >
      V2 Stable
    </button>
    <button 
      className={inputs.poolType === "CL" ? "active" : ""}
      onClick={() => set('poolType', "CL")}
    >
      Concentrated Liquidity
    </button>
  </PoolTypeSelector>
            <InputField
              id="positionValue"
              label="Position USD Value"
              value={inputs.positionValue}
              onChange={(value) => set('positionValue', parseFloat(value) || 0)}
              type="number"
              unit="USD"
              helpText="Total USD value of your LP position"
            />
            <InputField
              id="currentPrice"
              label="Current Price (USD/ZAR)"
              value={inputs.currentPrice}
              onChange={(value) => set('currentPrice', parseFloat(value) || 0)}
              type="number"
              step="0.01"
              helpText="Current exchange rate"
            />

<InputField
  id="p0"
  label="Initial Price (P0)"
  value={inputs.p0}
  onChange={(value) => set('p0', parseFloat(value) || 0)}
  type="number"
  step="0.01"
  unit="USD/ZAR"
  helpText="Starting price for IL calculation"
/>
<InputField
  id="p1"
  label="Scenario Price (P1)"
  value={inputs.p1}
  onChange={(value) => set('p1', parseFloat(value) || 0)}
  type="number"
  step="0.01"
  unit="USD/ZAR"
  helpText="Target price for IL calculation"
/>
<div style={{
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.8rem',
  color: 'rgba(255, 255, 255, 0.6)',
  marginTop: '0.5rem',
  marginBottom: '1rem',
  cursor: 'pointer'
}}
onClick={() => {
  const notesSection = document.querySelector('[data-section="position-valuation"]');
  notesSection?.scrollIntoView({ behavior: 'smooth' });
}}
>
  <InfoIcon style={{ width: '14px', height: '14px', marginRight: '0.5rem' }} />
  Learn about position valuation & impermanent loss
</div>
            <InputField
              id="lowerTick"
              label="Range Lower"
              value={inputs.lowerTick}
              onChange={(value) => set('lowerTick', parseFloat(value) || 0)}
              type="number"
              step="0.01"
              unit="USD/ZAR"
            />
            <InputField
              id="upperTick"
              label="Range Upper"
              value={inputs.upperTick}
              onChange={(value) => set('upperTick', parseFloat(value) || 0)}
              type="number"
              step="0.01"
              unit="USD/ZAR"
            />
            <InputField
              id="yourLiquidity"
              label="Your Liquidity"
              value={inputs.yourLiquidity}
              onChange={(value) => set('yourLiquidity', parseFloat(value) || 0)}
              type="number"
              step="0.01"
              helpText="Your liquidity units in the pool"
            />
            <InputField
              id="activeLiquidity"
              label="Active Liquidity in Range"
              value={inputs.activeLiquidity}
              onChange={(value) => set('activeLiquidity', parseFloat(value) || 0)}
              type="number"
              step="0.01"
              helpText="Total active liquidity in your range"
            />
            <InputField
              id="dailyMovePct"
              label="Daily Move (abs)"
              value={inputs.dailyMovePct}
              onChange={(value) => set('dailyMovePct', parseFloat(value) || 0)}
              type="number"
              step="0.001"
              helpText="Absolute daily % move (0.05 = 5%)"
            />

<InputField
  id="timeInRangeFrac"
  label="Time in Range"
  value={inputs.timeInRangeFrac}
  onChange={(value) => set('timeInRangeFrac', parseFloat(value) || 0)}
  type="number"
  step="0.1"
  min="0"
  max="1"
  helpText="Fraction of time price stays in your range (1.0 = 100%)"
/>
          </InputGroup>

          <InputGroup>
            <GroupTitle>Flow & Microstructure</GroupTitle>
            <InputField
              id="swapVolume"
              label="24h Swap Volume (Crossing Range)"
              value={inputs.swapVolume}
              onChange={(value) => set('swapVolume', parseFloat(value) || 0)}
              type="number"
              unit="USD"
              helpText="Daily volume that crosses your range"
            />
            <InputField
              id="flowImbalance"
              label="Flow Imbalance"
              value={inputs.flowImbalance}
              onChange={(value) => set('flowImbalance', parseFloat(value) || 0)}
              type="number"
              step="0.01"
              min="0"
              max="1"
              helpText="% of one-way trades (0.72 = 72% USD→ZAR)"
            />
            <InputField
              id="realizedVol"
              label="30d Realized Vol (Annual)"
              value={inputs.realizedVol}
              onChange={(value) => set('realizedVol', parseFloat(value) || 0)}
              type="number"
              step="0.01"
              helpText="Annualized volatility (0.17 = 17%)"
            />
            <InputField
              id="cexDexLag"
              label="CEX→DEX Lead/Lag"
              value={inputs.cexDexLag}
              onChange={(value) => set('cexDexLag', parseFloat(value) || 0)}
              type="number"
              unit="ms"
              helpText="Latency between CEX and DEX prices"
            />
            <InputField
              id="rebalancesPerDay"
              label="Rebalances per Day"
              value={inputs.rebalancesPerDay}
              onChange={(value) => set('rebalancesPerDay', parseFloat(value) || 0)}
              type="number"
              step="0.1"
              helpText="Expected daily rebalance frequency"
            />
            <InputField
              id="gasPerRebalance"
              label="Gas per Rebalance"
              value={inputs.gasPerRebalance}
              onChange={(value) => set('gasPerRebalance', parseFloat(value) || 0)}
              type="number"
              step="0.1"
              unit="USD"
              helpText="Cost per rebalance including gas and slippage"
            />
          </InputGroup>

          <InputGroup>
            <GroupTitle>Fee Policy</GroupTitle>
            <InputField
              id="feeMin"
              label="Fee Floor"
              value={inputs.feeMin}
              onChange={(value) => set('feeMin', parseFloat(value) || 0)}
              type="number"
              step="0.001"
              helpText="Minimum fee rate (0.008 = 0.8%)"
            />
            <InputField
              id="feeMax"
              label="Fee Cap"
              value={inputs.feeMax}
              onChange={(value) => set('feeMax', parseFloat(value) || 0)}
              type="number"
              step="0.001"
              helpText="Maximum fee rate (0.025 = 2.5%)"
            />
            <InputField
              id="volAnchor"
              label="Volatility Anchor"
              value={inputs.volAnchor}
              onChange={(value) => set('volAnchor', parseFloat(value) || 0)}
              type="number"
              step="0.01"
              helpText="Vol threshold where fees start rising"
            />
            <InputField
              id="k1"
              label="Vol Coefficient (k1)"
              value={inputs.k1}
              onChange={(value) => set('k1', parseFloat(value) || 0)}
              type="number"
              step="0.1"
              helpText="Volatility scaling factor"
            />
            <InputField
              id="k2"
              label="Flow Coefficient (k2)"
              value={inputs.k2}
              onChange={(value) => set('k2', parseFloat(value) || 0)}
              type="number"
              step="0.1"
              helpText="Flow imbalance scaling"
            />
            <InputField
              id="k3"
              label="Rate Coefficient (k3)"
              value={inputs.k3}
              onChange={(value) => set('k3', parseFloat(value) || 0)}
              type="number"
              step="0.1"
              helpText="Rate differential scaling"
            />
            <InputField
              id="stressDelta"
              label="Stress Delta"
              value={inputs.stressDelta}
              onChange={(value) => set('stressDelta', parseFloat(value) || 0)}
              type="number"
              step="0.001"
              helpText="Additional fee bump when stressed (0.006 = 0.6%)"
            />

            {/* CL Liquidity Derivation - only show for CL pools */}
{inputs.poolType === "CL" && (
  <>
    <InputField
      id="amount0"
      label="ZAR Amount (optional)"
      value={inputs.amount0 || ''}
      onChange={(value) => set('amount0', value ? parseFloat(value) : undefined)}
      type="number"
      step="0.01"
      unit="ZAR"
      helpText="Derive liquidity from token amounts instead of manual L"
    />
    <InputField
      id="amount1"
      label="USD Amount (optional)"
      value={inputs.amount1 || ''}
      onChange={(value) => set('amount1', value ? parseFloat(value) : undefined)}
      type="number"
      step="0.01"
      unit="USD"
      helpText="USD token amount for liquidity derivation"
    />
    <InputField
      id="tickSpacing"
      label="Tick Spacing"
      value={inputs.tickSpacing || 1}
      onChange={(value) => set('tickSpacing', parseFloat(value) || 1)}
      type="number"
      step="1"
      helpText="Pool tick spacing (1, 10, 60, 200)"
    />
  </>
)}
          </InputGroup>

          <InputGroup>
            <GroupTitle>Macro/Carry</GroupTitle>
            <InputField
              id="sarbRate"
              label="SARB Rate"
              value={inputs.sarbRate}
              onChange={(value) => set('sarbRate', parseFloat(value) || 0)}
              type="number"
              step="0.25"
              unit="%"
              helpText="South African Reserve Bank rate"
            />
            <InputField
              id="fedRate"
              label="Fed Rate"
              value={inputs.fedRate}
              onChange={(value) => set('fedRate', parseFloat(value) || 0)}
              type="number"
              step="0.25"
              unit="%"
              helpText="Federal Reserve rate"
            />
            <InputField
              id="insuranceBuffer"
              label="Insurance Buffer"
              value={inputs.insuranceBuffer}
              onChange={(value) => set('insuranceBuffer', parseFloat(value) || 0)}
              type="number"
              step="0.01"
              helpText="% of TVL for insurance (0.06 = 6%)"
            />
            <InputField
              id="targetZarMix"
              label="Target ZAR Mix"
              value={inputs.targetZarMix}
              onChange={(value) => set('targetZarMix', parseFloat(value) || 0)}
              type="number"
              step="0.05"
              min="0"
              max="1"
              helpText="Target ZAR allocation (0.45 = 45%)"
            />
            <InputField
              id="mevBps"
              label="MEV Haircut (bp)"
              value={inputs.mevBps || 6}
              onChange={(value) => set('mevBps', parseFloat(value) || 6)}
              type="number"
              step="1"
              unit="bp"
              helpText="MEV haircut on pro-rata volume (default 6bp)"
            />
          </InputGroup>

          <Button sticky onClick={recalc}>Recalculate</Button>
        </InputSection>

        <OutputSection>
          <SectionTitle>Outputs</SectionTitle>
          
          <OutputGrid>
            {/* Dynamic Fee with detailed breakdown */}
            <OutputCard
              label="Dynamic Fee Rate"
              value={outputs.dynamicFeePct.toFixed(2)}
              unit="%"
              status={outputs.stress ? 'warning' : 'neutral'}
              badge={outputs.stress ? { text: 'Stress Mode', variant: 'warning' } : undefined}
              breakdown={[
                { label: 'Vol Component', value: outputs.fVolPct.toFixed(2), unit: '%' },
                { label: 'Flow Component', value: outputs.fFlowPct.toFixed(2), unit: '%' },
                { label: 'Rate Component', value: outputs.fRatePct.toFixed(2), unit: '%' },
                { label: 'Stress Component', value: outputs.fStressPct.toFixed(2), unit: '%' },
              ]}
            />

            {/* Gross Fees */}
            <OutputCard
              label="Gross Daily Fees"
              value={outputs.grossFees}
              unit="USD/day"
              status={outputs.grossFees > 0 ? 'positive' : 'neutral'}
              subText="Before haircuts and costs"
            />

            {/* Net Fees with status indication */}
            <OutputCard
              label="Net Daily Fees"
              value={outputs.netFees}
              unit="USD/day"
              status={outputs.netFees > 0 ? 'positive' : outputs.netFees < 0 ? 'negative' : 'neutral'}
              subText={
                outputs.netFees < 0 
                  ? "Loss covered by insurance buffer" 
                  : "Profit after all costs"
              }
              badge={
                outputs.netFees < 0 
                  ? { text: 'Insurance Used', variant: 'error' }
                  : outputs.netFees > outputs.grossFees * 0.5 
                  ? { text: 'High Efficiency', variant: 'success' }
                  : undefined
              }
            />

            {/* APR with context */}
            <OutputCard
              label="Annual APR"
              value={outputs.aprPct.toFixed(2)}
              unit="%"
              status={
                outputs.aprPct > 20 ? 'positive' : 
                outputs.aprPct > 10 ? 'neutral' : 
                outputs.aprPct < 0 ? 'negative' : 'warning'
              }
              subText={`${(outputs.aprPct / 365).toFixed(3)}% daily return`}
            />

            {/* Cost Breakdown */}
            <OutputCard
              label="Daily Cost Breakdown"
              value={outputs.lvr + outputs.mevHaircut + outputs.rebalanceCost}
              unit="USD/day"
              status="warning"
              breakdown={[
                { label: 'LVR (Predictable Loss)', value: outputs.lvr.toFixed(2), unit: 'USD' },
                { label: 'MEV Haircut', value: outputs.mevHaircut.toFixed(2), unit: 'USD' },
                { label: 'Rebalance Cost', value: outputs.rebalanceCost.toFixed(2), unit: 'USD' },
              ]}
              subText="Total operational costs reducing net fees"
            />

            {/* Insurance Status */}
            <OutputCard
              label="Insurance Status"
              value={outputs.insuranceRemaining}
              unit="USD"
              status={
                outputs.deficitCovered > 0 ? 'negative' : 
                outputs.insuranceRemaining < 1000 ? 'warning' : 'positive'
              }
              subText={[
                `Deficit covered today: $${outputs.deficitCovered.toFixed(2)}`,
                `Buffer utilization: ${(((inputs.positionValue * inputs.insuranceBuffer) - outputs.insuranceRemaining) / (inputs.positionValue * inputs.insuranceBuffer) * 100).toFixed(1)}%`
              ]}
              badge={
                outputs.deficitCovered > 0 
                  ? { text: 'Active Coverage', variant: 'error' }
                  : { text: 'Buffer Ready', variant: 'success' }
              }
            />

            {/* Break-even Analysis */}
            <OutputCard
              label="Break-even Fee Rate"
              value={outputs.breakEvenFeePct.toFixed(3)}
              unit="%"
              status={
                outputs.breakEvenFeePct > outputs.dynamicFeePct ? 'negative' : 
                outputs.breakEvenFeePct > outputs.dynamicFeePct * 0.8 ? 'warning' : 'positive'
              }
              subText={
                outputs.breakEvenFeePct > outputs.dynamicFeePct 
                  ? "Current fee below break-even" 
                  : `${((outputs.dynamicFeePct - outputs.breakEvenFeePct) / outputs.dynamicFeePct * 100).toFixed(1)}% safety margin`
              }
            />

            {/* Position Value */}
<OutputCard
  label="Position Value @ P1"
  value={outputs.positionValueAtP1.toFixed(2)}
  unit="USD"
  status={outputs.pnlVsHodl > 0 ? 'positive' : outputs.pnlVsHodl < 0 ? 'negative' : 'neutral'}
  subText={`At price ${inputs.p1} USD/ZAR`}
/>

{/* IL Analysis */}
<OutputCard
  label="PnL vs HODL"
  value={outputs.pnlVsHodl >= 0 ? `+${outputs.pnlVsHodl.toFixed(2)}` : outputs.pnlVsHodl.toFixed(2)}
  unit="USD"
  status={outputs.pnlVsHodl > 0 ? 'positive' : outputs.pnlVsHodl < 0 ? 'negative' : 'neutral'}
  subText={`IL: ${outputs.ilPct >= 0 ? '+' : ''}${outputs.ilPct.toFixed(2)}%`}
  badge={
    Math.abs(outputs.ilPct) > 5 
      ? { text: 'High IL', variant: 'warning' }
      : Math.abs(outputs.ilPct) > 2
      ? { text: 'Moderate IL', variant: 'info' }  // ← Changed to 'info'
      : { text: 'Low IL', variant: 'success' }
  }
/>

{/* IL Breakdown */}
<OutputCard
  label="Impermanent Loss"
  value={outputs.ilUsd >= 0 ? `+${outputs.ilUsd.toFixed(2)}` : outputs.ilUsd.toFixed(2)}
  unit="USD"
  status={outputs.ilUsd > 0 ? 'negative' : outputs.ilUsd < -50 ? 'positive' : 'neutral'}
  subText={`${outputs.ilPct >= 0 ? '+' : ''}${outputs.ilPct.toFixed(2)}% vs HODL`}
  breakdown={[
    { label: 'HODL Value @ P1', value: outputs.hodlBaseline.toFixed(2), unit: 'USD' },
    { label: 'Position w/o Fees', value: outputs.positionWithoutFees.toFixed(2), unit: 'USD' },
  ]}
/>

{/* Net Edge */}
<OutputCard
  label="Net Edge"
  value={outputs.netEdge >= 0 ? `+${outputs.netEdge.toFixed(2)}` : outputs.netEdge.toFixed(2)}
  unit="USD/day"
  status={outputs.netEdge > 0 ? 'positive' : 'negative'}
  subText="Fees - IL - Costs (true daily edge)"
  badge={
    outputs.netEdge > 50 
      ? { text: 'Strong Edge', variant: 'success' }
      : outputs.netEdge > 0
      ? { text: 'Positive', variant: 'info' }
      : { text: 'Negative Edge', variant: 'error' }
  }
/>

            {/* Position Health Summary */}
            <OutputCard
              label="Position Health"
              value={outputs.netFees > 0 ? "Profitable" : "At Risk"}
              status={outputs.netFees > 0 ? 'positive' : 'negative'}
              size="large"
              subText={[
                `Daily P&L: ${outputs.netFees >= 0 ? '+' : ''}$${outputs.netFees.toFixed(2)}`,
                `Efficiency: ${((outputs.netFees / Math.max(outputs.grossFees, 1)) * 100).toFixed(1)}%`,
                outputs.stress ? "⚠️ Stress conditions detected" : "✅ Normal operating conditions"
              ]}
              badge={
                outputs.stress 
                  ? { text: 'High Volatility', variant: 'warning' }
                  : outputs.netFees > 0 
                  ? { text: 'Healthy', variant: 'success' }
                  : { text: 'Monitor', variant: 'error' }
              }
            />
          </OutputGrid>
        </OutputSection>
       
      </MainGrid>
      <Notes />
    </Container>
  );
};