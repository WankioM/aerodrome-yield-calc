
import { createStitches } from '@stitches/react';
import { Home } from './pages/Home';

// Stitches Configuration
const { styled, globalCss } = createStitches({
  theme: {
    colors: {
      background: '#0d0d0d',
      text: '#ffffff',
      primary: '#4ade80',  // green
      secondary: '#38bdf8', // blue
      accent: '#f43f5e',    // red
    },
    fonts: {
      body: 'Inter, sans-serif',
    },
  },
});

// Global styles
const globalStyles = globalCss({
  '*': {
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
  },
  'html, body': {
    fontFamily: '$body',
    backgroundColor: '$background',
    color: '$text',
    lineHeight: 1.5,
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  },
  '#root': {
    minHeight: '100vh',
  },
  // Scrollbar styling
  '*::-webkit-scrollbar': {
    width: '8px',
  },
  '*::-webkit-scrollbar-track': {
    background: 'rgba(255, 255, 255, 0.1)',
  },
  '*::-webkit-scrollbar-thumb': {
    background: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '4px',
  },
  '*::-webkit-scrollbar-thumb:hover': {
    background: 'rgba(255, 255, 255, 0.5)',
  },
  // Focus styles for accessibility
  'button:focus-visible, input:focus-visible': {
    outline: '2px solid #4ade80',
    outlineOffset: '2px',
  },
  // Selection styles
  '::selection': {
    backgroundColor: 'rgba(74, 222, 128, 0.3)',
    color: '$text',
  },
});

const AppContainer = styled('div', {
  minHeight: '100vh',
  backgroundColor: '$background',
  color: '$text',
});

function App() {
  // Apply global styles
  globalStyles();

  return (
    <AppContainer>
      <Home />
    </AppContainer>
  );
}

export default App;