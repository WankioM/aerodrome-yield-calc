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
        #NotFinancialAdvice - This calculator is for educational purposes only. 
        Always do your own research and consider professional advice.
      </DisclaimerBanner>

      <Section>
        <SectionTitle>Pool Types on Aerodrome</SectionTitle>
        <Paragraph>
          Aerodrome Finance operates two distinct types of liquidity pools, each with different mechanics and fee structures:
        </Paragraph>
        
        <HighlightBox>
          <strong>V2-Style Pools:</strong> Traditional constant product (x×y=k) pools where liquidity is distributed across the entire price curve. These pools use fixed fee rates and are suitable for stable pairs or when you want broad price exposure.
        </HighlightBox>
        
        <HighlightBox>
          <strong>Concentrated Liquidity (CL) Pools:</strong> Slipstream pools that allow LPs to concentrate liquidity within specific price ranges. This calculator focuses on CL pools, which offer higher capital efficiency but require active management.
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
        <SectionTitle>ZAR/USD Specific Considerations</SectionTitle>
        <Paragraph>
          The ZAR/USD pair exhibits unique characteristics that distinguish it from typical DeFi pairs:
        </Paragraph>

        <List>
          <li><strong>Directional Flow Bias:</strong> Often experiences sustained one-way pressure due to carry trades and macro flows</li>
          <li><strong>Interest Rate Sensitivity:</strong> Heavily influenced by SARB-Fed rate differentials and carry trade dynamics</li>
          <li><strong>CEX Price Leadership:</strong> DEX prices typically lag centralized exchanges, creating MEV opportunities</li>
          <li><strong>Volatility Clustering:</strong> Periods of low volatility followed by sharp moves during macro events</li>
          <li><strong>Emerging Market Dynamics:</strong> Subject to capital flow reversals and sovereign risk premiums</li>
        </List>
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