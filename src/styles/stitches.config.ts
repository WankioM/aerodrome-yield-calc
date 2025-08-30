// src/styles/stitches.config.ts
import { createStitches } from '@stitches/react';

export const { styled, css, globalCss } = createStitches({
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

