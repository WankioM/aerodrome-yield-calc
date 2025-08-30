import React from 'react';
import { styled } from '../styles/stitches.config';

const InputContainer = styled('div', {
  marginBottom: '$2',
  '&:last-child': {
    marginBottom: 0,
  },
});

const Label = styled('label', {
  display: 'block',
  marginBottom: '0.5rem',
  fontSize: '0.9rem',
  fontWeight: '500',
  color: '$text',
  fontFamily: '$body',
});

const StyledInput = styled('input', {
  width: '100%',
  padding: '0.75rem 1rem',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  color: '$text',
  fontSize: '0.95rem',
  fontFamily: '$body',
  outline: 'none',
  transition: 'all 0.2s ease',
  
  '&:focus': {
    borderColor: '$primary',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    boxShadow: '0 0 0 3px rgba(74, 222, 128, 0.1)',
  },
  
  '&::placeholder': {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

const HelpText = styled('div', {
  fontSize: '0.8rem',
  color: 'rgba(255, 255, 255, 0.6)',
  marginTop: '0.25rem',
  fontFamily: '$body',
});

const InputGroup = styled('div', {
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center',
});

const Unit = styled('span', {
  fontSize: '0.85rem',
  color: 'rgba(255, 255, 255, 0.7)',
  fontFamily: '$body',
  minWidth: 'fit-content',
});

interface InputFieldProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'number';
  placeholder?: string;
  helpText?: string;
  unit?: string;
  disabled?: boolean;
  step?: string;
  min?: string;
  max?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  helpText,
  unit,
  disabled = false,
  step,
  min,
  max,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <InputContainer>
      <Label htmlFor={id}>{label}</Label>
      <InputGroup>
        <StyledInput
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          step={step}
          min={min}
          max={max}
        />
        {unit && <Unit>{unit}</Unit>}
      </InputGroup>
      {helpText && <HelpText>{helpText}</HelpText>}
    </InputContainer>
  );
};