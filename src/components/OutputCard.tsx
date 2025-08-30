import React from 'react';
import { styled } from '../styles/stitches.config';

const Card = styled('div', {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  padding: '1.5rem',
  transition: 'all 0.2s ease',
  position: 'relative',
  overflow: 'hidden',
  
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(134, 239, 172, 0.3)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
  },
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, transparent, $primary, transparent)',
    opacity: 0,
    transition: 'opacity 0.2s ease',
  },
  
  '&:hover::before': {
    opacity: 1,
  },
  
  variants: {
    status: {
      positive: {
        borderColor: 'rgba(134, 239, 172, 0.3)',
        backgroundColor: 'rgba(134, 239, 172, 0.05)',
      },
      negative: {
        borderColor: 'rgba(248, 113, 113, 0.3)',
        backgroundColor: 'rgba(248, 113, 113, 0.05)',
      },
      warning: {
        borderColor: 'rgba(251, 191, 36, 0.3)',
        backgroundColor: 'rgba(251, 191, 36, 0.05)',
      },
      neutral: {
        borderColor: 'rgba(156, 163, 175, 0.3)',
        backgroundColor: 'rgba(156, 163, 175, 0.05)',
      },
    },
    size: {
      small: {
        padding: '1rem',
        fontSize: '0.9rem',
      },
      medium: {
        padding: '1.5rem',
      },
      large: {
        padding: '2rem',
        fontSize: '1.1rem',
      },
    },
  },
  
  defaultVariants: {
    status: 'neutral',
    size: 'medium',
  },
});

const Label = styled('div', {
  fontSize: '0.9rem',
  color: 'rgba(255, 255, 255, 0.7)',
  marginBottom: '0.5rem',
  fontWeight: '500',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
});

const Value = styled('div', {
  fontSize: '1.5rem',
  fontWeight: '600',
  color: '$text',
  display: 'flex',
  alignItems: 'baseline',
  gap: '0.25rem',
  marginBottom: '0.5rem',
  
  variants: {
    size: {
      small: {
        fontSize: '1.2rem',
      },
      medium: {
        fontSize: '1.5rem',
      },
      large: {
        fontSize: '2rem',
      },
    },
  },
  
  defaultVariants: {
    size: 'medium',
  },
});

const Unit = styled('span', {
  fontSize: '1rem',
  color: 'rgba(255, 255, 255, 0.6)',
  fontWeight: '400',
});

const SubText = styled('div', {
  fontSize: '0.8rem',
  color: 'rgba(255, 255, 255, 0.6)',
  lineHeight: '1.4',
  marginTop: '0.25rem',
  
  '& + &': {
    marginTop: '0.15rem',
  },
});

const Badge = styled('span', {
  display: 'inline-block',
  padding: '0.2rem 0.6rem',
  borderRadius: '12px',
  fontSize: '0.75rem',
  fontWeight: '500',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginTop: '0.5rem',
  
  variants: {
    variant: {
      success: {
        backgroundColor: 'rgba(134, 239, 172, 0.2)',
        color: '#86efac',
        border: '1px solid rgba(134, 239, 172, 0.3)',
      },
      warning: {
        backgroundColor: 'rgba(251, 191, 36, 0.2)',
        color: '#fbbf24',
        border: '1px solid rgba(251, 191, 36, 0.3)',
      },
      error: {
        backgroundColor: 'rgba(248, 113, 113, 0.2)',
        color: '#f87171',
        border: '1px solid rgba(248, 113, 113, 0.3)',
      },
      info: {
        backgroundColor: 'rgba(96, 165, 250, 0.2)',
        color: '#60a5fa',
        border: '1px solid rgba(96, 165, 250, 0.3)',
      },
    },
  },
  
  defaultVariants: {
    variant: 'info',
  },
});

const Breakdown = styled('div', {
  marginTop: '0.75rem',
  padding: '0.75rem',
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  borderRadius: '8px',
  border: '1px solid rgba(255, 255, 255, 0.05)',
});

const BreakdownItem = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '0.8rem',
  color: 'rgba(255, 255, 255, 0.7)',
  
  '& + &': {
    marginTop: '0.25rem',
  },
});

const BreakdownLabel = styled('span', {
  color: 'rgba(255, 255, 255, 0.6)',
});

const BreakdownValue = styled('span', {
  fontWeight: '500',
  color: '$text',
});

interface OutputCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subText?: string | string[];
  status?: 'positive' | 'negative' | 'warning' | 'neutral';
  size?: 'small' | 'medium' | 'large';
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'error' | 'info';
  };
  breakdown?: Array<{
    label: string;
    value: string | number;
    unit?: string;
  }>;
  onClick?: () => void;
}

export const OutputCard: React.FC<OutputCardProps> = ({
  label,
  value,
  unit,
  subText,
  status = 'neutral',
  size = 'medium',
  badge,
  breakdown,
  onClick,
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      // Handle different number formats
      if (Math.abs(val) >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (Math.abs(val) >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      } else if (Math.abs(val) < 0.01 && val !== 0) {
        return val.toExponential(2);
      } else {
        return val.toFixed(2);
      }
    }
    return String(val);
  };

  const renderSubText = () => {
    if (!subText) return null;
    
    if (Array.isArray(subText)) {
      return subText.map((text, index) => (
        <SubText key={index}>{text}</SubText>
      ));
    }
    
    return <SubText>{subText}</SubText>;
  };

  return (
    <Card 
      status={status} 
      size={size} 
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <Label>{label}</Label>
      
      <Value size={size}>
        {formatValue(value)}
        {unit && <Unit>{unit}</Unit>}
      </Value>
      
      {renderSubText()}
      
      {badge && (
        <Badge variant={badge.variant}>
          {badge.text}
        </Badge>
      )}
      
      {breakdown && breakdown.length > 0 && (
        <Breakdown>
          {breakdown.map((item, index) => (
            <BreakdownItem key={index}>
              <BreakdownLabel>{item.label}</BreakdownLabel>
              <BreakdownValue>
                {formatValue(item.value)}
                {item.unit && ` ${item.unit}`}
              </BreakdownValue>
            </BreakdownItem>
          ))}
        </Breakdown>
      )}
    </Card>
  );
};