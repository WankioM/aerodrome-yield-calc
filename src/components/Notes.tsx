import { styled } from '../styles/stitches.config';

const Container = styled('div', {
  minHeight: '100vh',
  backgroundColor: '$background',
  color: '$text',
  fontFamily: '$body',
  padding: '2rem',
  maxWidth: '900px',
  margin: '0 auto',
});

const Header = styled('div', {
  textAlign: 'center',
  marginBottom: '3rem',
});

const Title = styled('h1', {
  fontSize: '2.2rem',
  fontWeight: '700',
  margin: 0,
  background: 'linear-gradient(135deg, $primary, $secondary)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: '0.5rem',
});

const DisclaimerBanner = styled('div', {
  backgroundColor: 'rgba(248, 113, 113, 0.1)',
  border: '1px solid rgba(248, 113, 113, 0.3)',
  borderRadius: '12px',
  padding: '1rem 1.5rem',
  marginBottom: '2rem',
  textAlign: 'center',
  fontSize: '0.9rem',
  fontWeight: '500',
  color: '#f87171',
});

const Section = styled('div', {
  marginBottom: '2.5rem',
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  padding: '2rem',
});

const SectionTitle = styled('h2', {
  fontSize: '1.4rem',
  fontWeight: '600',
  marginBottom: '1rem',
  color: '$primary',
  borderBottom: '1px solid rgba(74, 222, 128, 0.2)',
  paddingBottom: '0.5rem',
});

const Paragraph = styled('p', {
  marginBottom: '1rem',
  lineHeight: '1.6',
  color: 'rgba(255, 255, 255, 0.9)',
});

const FormulaBox = styled('div', {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  padding: '1rem',
  margin: '1rem 0',
  fontFamily: 'Monaco, "Lucida Console", monospace',
  fontSize: '0.9rem',
  color: '$secondary',
  overflow: 'auto',
});

const HighlightBox = styled('div', {
  backgroundColor: 'rgba(56, 189, 248, 0.1)',
  border: '1px solid rgba(56, 189, 248, 0.3)',
  borderRadius: '8px',
  padding: '1rem',
  margin: '1rem 0',
  fontSize: '0.9rem',
  color: 'rgba(255, 255, 255, 0.9)',
});

const WarningBox = styled('div', {
  backgroundColor: 'rgba(251, 191, 36, 0.1)',
  border: '1px solid rgba(251, 191, 36, 0.3)',
  borderRadius: '8px',
  padding: '1rem',
  margin: '1rem 0',
  fontSize: '0.9rem',
  color: '#fbbf24',
});

const List = styled('ul', {
  marginLeft: '1.5rem',
  marginBottom: '1rem',
  
  '& li': {
    marginBottom: '0.5rem',
    lineHeight: '1.5',
    color: 'rgba(255, 255, 255, 0.85)',
  },
});

export const Notes: React.FC = () => {
  return (
    <Container>
      <Header>
        <Title>Understanding Aerodrome Fee Mechanics</Title>
      </Header>

      <DisclaimerBanner>
        #NotFinancialAdvice 
      </DisclaimerBanner>

      <Section data-section="pool-types">
        <SectionTitle>Pool Types on Aerodrome</SectionTitle>
        <Paragraph>
  Aerodrome Finance supports multiple pool architectures. Each pool type has its own pricing model,
  fee mechanics, and risk profile. Understanding the differences is key to using the calculator correctly.
</Paragraph>

<HighlightBox>
  <strong>V2-Style Pools:</strong> These use the constant product formula (x × y = k), the same design
  as Uniswap V2. Liquidity is spread evenly across the entire price curve, meaning LPs earn a share of
  all swap activity regardless of where the price moves. Fees are fixed per pool, and impermanent loss
  follows the classic AMM profile. These pools are simple, “set and forget,” but less capital efficient.
</HighlightBox>

<HighlightBox>
  <strong>Stable Pools:</strong> Designed for assets that trade closely around a peg (e.g., USDC/DAI or
  LST/ETH). They use a stableswap invariant (similar to Curve) that allows for deeper liquidity around
  the peg, reducing slippage for large trades. Fees are generally lower, and impermanent loss risk is
  minimized as long as assets stay correlated.
</HighlightBox>

<HighlightBox>
  <strong>Concentrated Liquidity (CL) Pools:</strong> These “Slipstream” pools allow LPs to allocate
  liquidity to custom price ranges. Within that band, their capital is much more efficient, generating
  higher fee returns if the price remains in range. However, when the price moves outside the chosen
  range, fees stop accruing and the LP’s position becomes fully one-sided. CL pools require active
  management, rebalancing, and are more sensitive to impermanent loss.
</HighlightBox>
      </Section>

      <Section>
        <SectionTitle>Swap Fee Accruals</SectionTitle>
        <Paragraph>
          Every trade executed in a pool generates fees that are distributed proportionally to liquidity providers. The fee structure varies by pool type and market conditions.
        </Paragraph>

        <FormulaBox>
          Fee Earned = Trade Volume × Fee Rate × (Your LP Share of Pool)
        </FormulaBox>

        <Paragraph>
          For concentrated liquidity positions, your share is calculated based on active liquidity within your specified range, not the total pool liquidity. This means you earn fees only when trades occur within your price range.
        </Paragraph>

        <WarningBox>
          <strong>Important:</strong> Fee rates in CL pools can be dynamic, adjusting based on volatility, flow imbalance, and other market conditions. This calculator models these dynamic adjustments.
        </WarningBox>
      </Section>

      <Section data-section="position-valuation">
  <SectionTitle>Position Valuation at t1</SectionTitle>
  <Paragraph>
    Beyond fee income, your position’s value depends on how token balances evolve with price
    changes. The calculator compares your LP position against a simple “HODL baseline” at a
    future price point (t1).
  </Paragraph>

  <HighlightBox>
    <strong>V2-Style & Stable Pools:</strong> Your position is valued as a constant share of the pool’s
    reserves. After price moves, your tokens rebalance along the invariant (x·y=k for volatile pools,
    stableswap invariant for stable pools). Impermanent loss occurs if the LP value underperforms
    simply holding the tokens.
  </HighlightBox>

  <HighlightBox>
    <strong>Concentrated Liquidity (CL) Pools:</strong> Token balances are derived from your
    liquidity range. If the price remains within your range, you hold a mix of both tokens and continue
    earning fees. If the price exits the range, your position becomes fully one-sided (all token0 or all
    token1), and fees stop accruing until you rebalance.
  </HighlightBox>

  <FormulaBox>
    Position Value at t1 = Token0_amount(t1) × Price0(t1) + Token1_amount(t1) × Price1(t1) + Fees Earned
  </FormulaBox>

  Negative IL means your LP position underperformed HODL. Positive IL means LP outperformed HODL.

  <WarningBox>
    <strong>Note:</strong> Impermanent loss is calculated by comparing Position Value at t1 versus
    HODL Value at t1. Even if fees are positive, IL can offset or exceed them when volatility is high.
  </WarningBox>
</Section>


      <Section>
        <SectionTitle>Gauge Emissions & Bribes</SectionTitle>
        <Paragraph>
          Beyond swap fees, Aerodrome LPs earn additional rewards through the gauge system:
        </Paragraph>

        <List>
          <li><strong>AERO Emissions:</strong> Base protocol rewards distributed to pools based on voting weight</li>
          <li><strong>Bribes:</strong> Additional incentives paid by protocols to direct votes toward specific pools</li>
          <li><strong>Vote Weight:</strong> Your share of emissions depends on the total votes directed to your pool</li>
        </List>

        <FormulaBox>
          Your Emissions = Pool Emissions × (Your Vote Weight / Total Pool Votes)
        </FormulaBox>

        <Paragraph>
          The gauge system creates additional yield beyond swap fees, but requires active participation in Aerodrome's governance through veAERO voting or delegation.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>APR Calculation Methods</SectionTitle>
        <Paragraph>
          Aerodrome displays APRs for concentrated liquidity positions using different denominators, which can create confusion when comparing yields:
        </Paragraph>

        <HighlightBox>
          <strong>Method 1 - Active Liquidity (±1 tick):</strong> Uses only liquidity within the immediate price range as denominator. This method typically shows higher APRs and is commonly displayed on Aerodrome's interface.
        </HighlightBox>

        <HighlightBox>
          <strong>Method 2 - Total Position Value:</strong> Uses your total position value as denominator. This method provides a more conservative APR estimate and better reflects actual returns on your deployed capital.
        </HighlightBox>

        <WarningBox>
          Always verify which calculation method is being used when comparing APRs across platforms or making investment decisions.
        </WarningBox>
      </Section>

      

      <Section>
        <SectionTitle>Calculator Limitations</SectionTitle>
        <Paragraph>
          This calculator provides estimates based on current market conditions and historical patterns. Actual results may differ due to:
        </Paragraph>

        <List>
          <li>Changes in market volatility and trading patterns</li>
          <li>Protocol fee updates or gauge weight redistributions</li>
          <li>Macroeconomic events affecting ZAR/USD fundamentals</li>
          <li>Technical risks including smart contract vulnerabilities</li>
          <li>Impermanent loss not fully captured in current IL models</li>
        </List>

        <WarningBox>
          Past performance does not guarantee future results. DeFi protocols carry inherent risks including total loss of funds.
        </WarningBox>
      </Section>

      <Section>
        <SectionTitle>Technical Implementation Notes</SectionTitle>
        <Paragraph>
          The calculator implements academic models for:
        </Paragraph>

        <List>
          <li><strong>LVR Estimation:</strong> Based on Cartea and Paradigm research on predictable loss in AMMs</li>
          <li><strong>Dynamic Fee Pricing:</strong> Multi-factor model responding to volatility, flow, and rate differentials</li>
          <li><strong>Microstructure Costs:</strong> MEV extraction estimates and rebalancing cost modeling</li>
          <li><strong>Risk Management:</strong> Insurance buffer mechanics and stress testing protocols</li>
        </List>

        <Paragraph>
          All calculations are performed client-side and no position data is transmitted or stored externally.
        </Paragraph>
      </Section>
    </Container>
  );
};