import React, { useState, useEffect } from 'react';
import { styled } from '../styles/stitches.config';
import { InputField } from './InputField';

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


const Button = styled('button', {
    display: 'inline-block',
    background: 'linear-gradient(135deg, $primary, $secondary)',
    backgroundColor: '$primary', // fallback if gradient tokens aren’t defined
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
    // allow a sticky variant
    variants: {
      sticky: {
        true: {
          position: 'sticky',
          bottom: '0',
          marginTop: '1rem',
          zIndex: 2,
        },
      },
    },
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

const OutputCard = styled('div', {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  padding: '1.5rem',
  transition: 'all 0.2s ease',
  
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(134, 239, 172, 0.3)',
  },
});

const OutputLabel = styled('div', {
  fontSize: '0.9rem',
  color: 'rgba(255, 255, 255, 0.7)',
  marginBottom: '0.5rem',
});

const OutputValue = styled('div', {
  fontSize: '1.5rem',
  fontWeight: '600',
  color: '$text',
});

const OutputUnit = styled('span', {
  fontSize: '1rem',
  color: 'rgba(255, 255, 255, 0.6)',
  marginLeft: '0.5rem',
});

export const FeeCalculator: React.FC = () => {
  // Position & Pool Inputs
  const [positionValue, setPositionValue] = useState('100000');
  const [currentPrice, setCurrentPrice] = useState('18.75');
  const [lowerTick, setLowerTick] = useState('18.00');
  const [upperTick, setUpperTick] = useState('19.50');
  const [yourLiquidity, setYourLiquidity] = useState('2.73');
  const [activeLiquidity, setActiveLiquidity] = useState('44609.06');

  
  // Flow & Microstructure
  const [swapVolume, setSwapVolume] = useState('12500000');
  const [flowImbalance, setFlowImbalance] = useState('0.72');
  const [realizedVol, setRealizedVol] = useState('0.17');
  const [cexDexLag, setCexDexLag] = useState('450');

  const [gasPerRebalance, _setGasPerRebalance] = useState('2.40');
  const [rebalancesPerDay, _setRebalancesPerDay] = useState('1');
  
  // Fee Policy
  const [feeMin, setFeeMin] = useState('0.008');
  const [feeMax, setFeeMax] = useState('0.025');
  const [volAnchor, setVolAnchor] = useState('0.12');
  const [k1, setK1] = useState('3.0');
  const [k2, setK2] = useState('0.5');
  const [k3, setK3] = useState('0.2');
  const [stressDelta,_setStressDelta] = useState('0.006');
  const [dailyMovePct, setDailyMovePct] = useState('0.05');
  
  
  // Macro/Carry
  const [sarbRate, setSarbRate] = useState('8.25');
  const [fedRate, setFedRate] = useState('5.50');
  const [insuranceBuffer, setInsuranceBuffer] = useState('0.06');
  const [targetZarMix, _setTargetZarMix] = useState('0.50');

  // Emissions & Bribes
const [weeklyAERO, setWeeklyAERO] = useState('1000000');
const [poolVotes, setPoolVotes] = useState('50000');
const [totalVotes, setTotalVotes] = useState('1000000');
const [yourLPShareInPool, setYourLPShareInPool] = useState('0.001');
const [veBoost, setVeBoost] = useState('1.0');
const [bribesPerVoteUSD, setBribesPerVoteUSD] = useState('0.05');
const [aeroPrice, setAeroPrice] = useState('0.50');

  // Calculated outputs
  const [outputs, setOutputs] = useState({
    dynamicFee: 0,
    grossFees: 0,
    netFees: 0,
    apr: 0,
    lvr: 0,
    mevHaircut: 0,
    rebalanceCost: 0,
    breakEvenFee: 0,
    fVol: 0,
    fFlow: 0,
    fRate: 0,
    fStress: 0,
    stress: false,
    deficitCovered: 0,
    insuranceRemaining: 0,
  
    // add these to match what you set/read later:
    emissionsUSD: 0,
    bribesUSD: 0,
    totalRewardsUSD: 0,
    feesAPR: 0,
    rewardsAPR: 0,
    totalAPR: 0,
    enhancedNetPnL: 0,
  });
  
  


useEffect(() => {
    calculateOutputs(); // compute once on load
  }, []); // <-- empty deps: no auto-recalc on each change
  

      const calculateOutputs = () => {
        // Parse core inputs
        const fMin = parseFloat(feeMin) || 0;
        const fMax = parseFloat(feeMax) || 0;
        const sigma = parseFloat(realizedVol) || 0;      // annualized (0.17)
        const sigmaAnchor = parseFloat(volAnchor) || 0;  // (0.12)
        const imbalance = parseFloat(flowImbalance) || 0;// 0..1
        const sarb = parseFloat(sarbRate) || 0;
        const fed  = parseFloat(fedRate)  || 0;
        const spread = sarb - fed;                        // in %
        const lYou = parseFloat(yourLiquidity) || 0;
        const lActive = Math.max(1e-9, parseFloat(activeLiquidity) || 0); // guard
        const share = lYou / lActive;
        const volume = Math.max(0, parseFloat(swapVolume) || 0);
        const gas = Math.max(0, parseFloat(gasPerRebalance) || 0);
        const nRebals = Math.max(0, parseFloat(rebalancesPerDay) || 0);
        const position = Math.max(1e-9, parseFloat(positionValue) || 0);
      
        // Stress logic (circuit breaker)
        const move = Math.abs(parseFloat(dailyMovePct) || 0); // e.g., 0.051 for 5.1%
        const stress = move >= 0.05 || (sigma - sigmaAnchor) >= 0.03;
      
        // Dynamic fee components
        const fVol   = fMin + (parseFloat(k1) || 0) * Math.max(0, sigma - sigmaAnchor);
        const fFlow  = (parseFloat(k2) || 0) * Math.max(0, imbalance - 0.70);
        const fRate  = (parseFloat(k3) || 0) * Math.max(0, (spread - 2.00)); // % over 2
        const fStress = stress ? (parseFloat(stressDelta) || 0) : 0;
      
        // Final dynamic fee (choose A or B)
        // A) bump by stress add-on:
        let fDyn = Math.min(Math.max(fVol + fFlow + fRate + fStress, fMin), fMax);
        // B) or hard-cap when stressed:
        // let fDyn = stress ? fMax : Math.min(Math.max(fVol + fFlow + fRate, fMin), fMax);
      
        // Gross fees (USD/day)
        const feesGross = share * volume * fDyn;
      
        // LVR estimate using vol^2 and CEX→DEX lag
        const lagSec = Math.max(0, (parseFloat(cexDexLag) || 0) / 1000);
        const lvr = Math.max(0, (0.35 * sigma * sigma + 0.15 * lagSec) * share * volume);
      
        // MEV haircut on pro-rata volume (default 6 bp)
        const mevHaircut = share * volume * (6 / 10000);
      
        // Rebalance cost
        const rebalanceCost = nRebals * gas;
      
        // Net
        const netFees = feesGross - lvr - mevHaircut - rebalanceCost;
      
        // APR (simple)
        const dailyReturn = netFees / position;
        const apr = dailyReturn * 365;
      
        // Break-even fee (decimal)
        const denom = share * volume;
        const fixedCosts = lvr + mevHaircut + rebalanceCost;
        const breakEvenFee = denom > 0 ? (fixedCosts / denom) : 0;
      
        // Insurance coverage
        const insurancePct = Math.max(0, parseFloat(insuranceBuffer) || 0);
        const insuranceTVL = insurancePct * position;
        const deficit = Math.max(0, -netFees);
        const coveredByInsurance = Math.min(deficit, insuranceTVL);
        const insuranceRemaining = Math.max(0, insuranceTVL - coveredByInsurance);

        // Calculate emissions and bribes
const weeklyAEROVal = parseFloat(weeklyAERO) || 0;
const poolVotesVal = parseFloat(poolVotes) || 0;
const totalVotesVal = Math.max(1, parseFloat(totalVotes) || 1);
const lpShareVal = Math.max(0, parseFloat(yourLPShareInPool) || 0);
const veBoostVal = Math.max(1, parseFloat(veBoost) || 1);
const aeroPriceVal = Math.max(0, parseFloat(aeroPrice) || 0);
const bribesPerVoteVal = Math.max(0, parseFloat(bribesPerVoteUSD) || 0);

// Pool emissions allocation
const poolEmissionsWeekly = weeklyAEROVal * (poolVotesVal / totalVotesVal);
const yourEmissionsWeekly = poolEmissionsWeekly * lpShareVal * veBoostVal;
const emissionsDaily = (yourEmissionsWeekly * aeroPriceVal) / 7;

// Bribes calculation
const yourBribesWeekly = bribesPerVoteVal * poolVotesVal * lpShareVal;
const bribesDaily = yourBribesWeekly / 7;

const totalRewards = emissionsDaily + bribesDaily;

// Enhanced APR calculations
const feesAPR = (netFees / position) * 365 * 100;
const rewardsAPR = (totalRewards / position) * 365 * 100;
const totalAPR = feesAPR + rewardsAPR;
      
        setOutputs({
          dynamicFee: fDyn * 100,
          grossFees: feesGross,
          netFees,
          apr: apr * 100,
          lvr,
          mevHaircut,
          rebalanceCost,
          breakEvenFee: breakEvenFee * 100,
          fVol: fVol * 100,
          fFlow: fFlow * 100,
          fRate: fRate * 100,
          fStress: fStress * 100,
          stress,
          deficitCovered: coveredByInsurance,
          insuranceRemaining,
          emissionsUSD: emissionsDaily,
  bribesUSD: bribesDaily,
  totalRewardsUSD: totalRewards,
  feesAPR,
  rewardsAPR,
  totalAPR,
  enhancedNetPnL: netFees + totalRewards,
        });
      };

  return (
    <Container>
      <Header>
        <Title>Aerodrome ZAR/USD Fee Calculator</Title>
        <Subtitle>
  Slipstream Concentrated Liquidity • Target mix: {Math.round(parseFloat(targetZarMix) * 100) || 0}% ZAR / {100 - (Math.round(parseFloat(targetZarMix) * 100) || 0)}% USD
</Subtitle>

      </Header>
      
      <MainGrid>
        <InputSection>
          <SectionTitle>Inputs</SectionTitle>
          
          <InputGroup>
            <GroupTitle>Pool & Position</GroupTitle>
            <InputField
              id="positionValue"
              label="Position USD Value"
              value={positionValue}
              onChange={setPositionValue}
              type="number"
              unit="USD"
              helpText="Total USD value of your LP position"
            />
            <InputField
              id="currentPrice"
              label="Current Price (USD/ZAR)"
              value={currentPrice}
              onChange={setCurrentPrice}
              type="number"
              step="0.01"
              helpText="Current exchange rate"
            />
            <InputField
              id="lowerTick"
              label="Range Lower"
              value={lowerTick}
              onChange={setLowerTick}
              type="number"
              step="0.01"
              unit="USD/ZAR"
            />
            <InputField
              id="upperTick"
              label="Range Upper"
              value={upperTick}
              onChange={setUpperTick}
              type="number"
              step="0.01"
              unit="USD/ZAR"
            />
            <InputField
              id="yourLiquidity"
              label="Your Liquidity"
              value={yourLiquidity}
              onChange={setYourLiquidity}
              type="number"
              step="0.01"
              helpText="Your liquidity units in the pool"
            />
            <InputField
              id="activeLiquidity"
              label="Active Liquidity in Range"
              value={activeLiquidity}
              onChange={setActiveLiquidity}
              type="number"
              step="0.01"
              helpText="Total active liquidity in your range"
            />

<InputField
  id="dailyMovePct"
  label="Daily Move (abs)"
  value={dailyMovePct}
  onChange={setDailyMovePct}
  type="number"
  step="0.001"
  helpText="Absolute daily % move (0.05 = 5%)"
/>

          </InputGroup>

          <InputGroup>
            <GroupTitle>Flow & Microstructure</GroupTitle>
            <InputField
              id="swapVolume"
              label="24h Swap Volume (Crossing Range)"
              value={swapVolume}
              onChange={setSwapVolume}
              type="number"
              unit="USD"
              helpText="Daily volume that crosses your range"
            />
            <InputField
              id="flowImbalance"
              label="Flow Imbalance"
              value={flowImbalance}
              onChange={setFlowImbalance}
              type="number"
              step="0.01"
              min="0"
              max="1"
              helpText="% of one-way trades (0.72 = 72% USD→ZAR)"
            />
            <InputField
              id="realizedVol"
              label="30d Realized Vol (Annual)"
              value={realizedVol}
              onChange={setRealizedVol}
              type="number"
              step="0.01"
              helpText="Annualized volatility (0.17 = 17%)"
            />
            <InputField
              id="cexDexLag"
              label="CEX→DEX Lead/Lag"
              value={cexDexLag}
              onChange={setCexDexLag}
              type="number"
              unit="ms"
              helpText="Latency between CEX and DEX prices"
            />
          </InputGroup>

          <InputGroup>
            <GroupTitle>Fee Policy</GroupTitle>
            <InputField
              id="feeMin"
              label="Fee Floor"
              value={feeMin}
              onChange={setFeeMin}
              type="number"
              step="0.001"
              helpText="Minimum fee rate (0.008 = 0.8%)"
            />
            <InputField
              id="feeMax"
              label="Fee Cap"
              value={feeMax}
              onChange={setFeeMax}
              type="number"
              step="0.001"
              helpText="Maximum fee rate (0.025 = 2.5%)"
            />
            <InputField
              id="volAnchor"
              label="Volatility Anchor"
              value={volAnchor}
              onChange={setVolAnchor}
              type="number"
              step="0.01"
              helpText="Vol threshold where fees start rising"
            />
            <InputField
              id="k1"
              label="Vol Coefficient (k1)"
              value={k1}
              onChange={setK1}
              type="number"
              step="0.1"
              helpText="Volatility scaling factor"
            />
            <InputField
              id="k2"
              label="Flow Coefficient (k2)"
              value={k2}
              onChange={setK2}
              type="number"
              step="0.1"
              helpText="Flow imbalance scaling"
            />
            <InputField
              id="k3"
              label="Rate Coefficient (k3)"
              value={k3}
              onChange={setK3}
              type="number"
              step="0.1"
              helpText="Rate differential scaling"
            />
          </InputGroup>

          <InputGroup>
            <GroupTitle>Macro/Carry</GroupTitle>
            <InputField
              id="sarbRate"
              label="SARB Rate"
              value={sarbRate}
              onChange={setSarbRate}
              type="number"
              step="0.25"
              unit="%"
              helpText="South African Reserve Bank rate"
            />
            <InputField
              id="fedRate"
              label="Fed Rate"
              value={fedRate}
              onChange={setFedRate}
              type="number"
              step="0.25"
              unit="%"
              helpText="Federal Reserve rate"
            />
            <InputField
              id="insuranceBuffer"
              label="Insurance Buffer"
              value={insuranceBuffer}
              onChange={setInsuranceBuffer}
              type="number"
              step="0.01"
              helpText="% of TVL for insurance (0.06 = 6%)"
            />
          </InputGroup>

          <InputGroup>
  <GroupTitle>Emissions & Bribes (ve(3,3))</GroupTitle>
  <InputField
    id="weeklyAERO"
    label="Weekly AERO Emissions"
    value={weeklyAERO}
    onChange={setWeeklyAERO}
    type="number"
    helpText="Total AERO tokens distributed weekly"
  />
  <InputField
    id="poolVotes"
    label="Pool Votes"
    value={poolVotes}
    onChange={setPoolVotes}
    type="number"
    helpText="veAERO votes this pool received"
  />
  <InputField
    id="totalVotes"
    label="Total Votes"
    value={totalVotes}
    onChange={setTotalVotes}
    type="number"
    helpText="Total veAERO votes across all pools"
  />
  <InputField
    id="yourLPShareInPool"
    label="Your LP Share in Pool"
    value={yourLPShareInPool}
    onChange={setYourLPShareInPool}
    type="number"
    step="0.0001"
    helpText="Your fraction of total pool liquidity"
  />
  <InputField
    id="veBoost"
    label="veBoost Factor"
    value={veBoost}
    onChange={setVeBoost}
    type="number"
    step="0.1"
    helpText="Your veNFT boost (1.0 = no boost, 2.5 = max)"
  />
  <InputField
    id="aeroPrice"
    label="AERO Price"
    value={aeroPrice}
    onChange={setAeroPrice}
    type="number"
    step="0.01"
    unit="USD"
    helpText="Current AERO token price"
  />
  <InputField
    id="bribesPerVoteUSD"
    label="Bribes per Vote"
    value={bribesPerVoteUSD}
    onChange={setBribesPerVoteUSD}
    type="number"
    step="0.01"
    unit="USD"
    helpText="USD value of bribes per vote"
  />
</InputGroup>

          <Button sticky onClick={calculateOutputs}>Recalculate</Button>

        </InputSection>

        <OutputSection>
          <SectionTitle>Outputs</SectionTitle>
          
          <OutputGrid>
          <OutputCard>
  <OutputLabel>Dynamic Fee Rate</OutputLabel>
  <OutputValue>
    {outputs.dynamicFee.toFixed(2)}
    <OutputUnit>%</OutputUnit>
  </OutputValue>
  <OutputLabel>
    Components: Vol {outputs.fVol.toFixed(2)}% · Flow {outputs.fFlow.toFixed(2)}% · Rate {outputs.fRate.toFixed(2)}% · Stress {outputs.fStress.toFixed(2)}%
  </OutputLabel>
  <OutputLabel>
    Stress Mode: {outputs.stress ? 'On' : 'Off'}
  </OutputLabel>
</OutputCard>

            
            <OutputCard>
              <OutputLabel>Gross Daily Fees</OutputLabel>
              <OutputValue>
                ${outputs.grossFees.toFixed(2)}
                <OutputUnit>/day</OutputUnit>
              </OutputValue>
            </OutputCard>
            
            <OutputCard>
              <OutputLabel>Net Daily Fees</OutputLabel>
              <OutputValue>
                ${outputs.netFees.toFixed(2)}
                <OutputUnit>/day</OutputUnit>
              </OutputValue>
            </OutputCard>
            
            <OutputCard>
              <OutputLabel>Annual APR</OutputLabel>
              <OutputValue>
                {outputs.apr.toFixed(2)}
                <OutputUnit>%</OutputUnit>
              </OutputValue>
            </OutputCard>
            
            <OutputCard>
              <OutputLabel>LVR Estimate</OutputLabel>
              <OutputValue>
                ${outputs.lvr.toFixed(2)}
                <OutputUnit>/day</OutputUnit>
              </OutputValue>
            </OutputCard>
            
            <OutputCard>
              <OutputLabel>MEV Haircut</OutputLabel>
              <OutputValue>
                ${outputs.mevHaircut.toFixed(2)}
                <OutputUnit>/day</OutputUnit>
              </OutputValue>
            </OutputCard>
            
            <OutputCard>
              <OutputLabel>Rebalance Cost</OutputLabel>
              <OutputValue>
                ${outputs.rebalanceCost.toFixed(2)}
                <OutputUnit>/day</OutputUnit>
              </OutputValue>
            </OutputCard>

            <OutputCard>
  <OutputLabel>Deficit Covered Today</OutputLabel>
  <OutputValue>
    ${outputs.deficitCovered.toFixed(2)}
    <OutputUnit>/day</OutputUnit>
  </OutputValue>
</OutputCard>

<OutputCard>
  <OutputLabel>Insurance Remaining</OutputLabel>
  <OutputValue>
    ${outputs.insuranceRemaining.toFixed(2)}
  </OutputValue>
</OutputCard>

            
            <OutputCard>
              <OutputLabel>Break-even Fee</OutputLabel>
              <OutputValue>
                {outputs.breakEvenFee.toFixed(3)}
                <OutputUnit>%</OutputUnit>
              </OutputValue>
            </OutputCard>

            <OutputCard>
  <OutputLabel>AERO Emissions</OutputLabel>
  <OutputValue>
    ${outputs.emissionsUSD?.toFixed(2) || '0.00'}
    <OutputUnit>/day</OutputUnit>
  </OutputValue>
</OutputCard>

<OutputCard>
  <OutputLabel>Bribes</OutputLabel>
  <OutputValue>
    ${outputs.bribesUSD?.toFixed(2) || '0.00'}
    <OutputUnit>/day</OutputUnit>
  </OutputValue>
</OutputCard>

<OutputCard>
  <OutputLabel>Total APR (Fees + Rewards)</OutputLabel>
  <OutputValue>
    {outputs.totalAPR?.toFixed(2) || '0.00'}
    <OutputUnit>%</OutputUnit>
  </OutputValue>
  <OutputLabel>
    Fees: {outputs.feesAPR?.toFixed(2) || '0.00'}% • Rewards: {outputs.rewardsAPR?.toFixed(2) || '0.00'}%
  </OutputLabel>
</OutputCard>
          </OutputGrid>

          
        </OutputSection>
     
      </MainGrid>
    </Container>
  );
};