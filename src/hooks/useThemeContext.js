import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext.js';

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a CustomThemeProvider');
  }
  return context;
};