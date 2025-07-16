import React, { useState, useMemo, useEffect, createContext, useContext } from 'react';

// Create context
const ThemeContext = createContext();

// Custom hook for using theme context
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a CustomThemeProvider');
  }
  return context;
};

// Theme provider component
export const CustomThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    // Initialize from localStorage or default to 'light'
    const savedMode = localStorage.getItem('theme-mode');
    return savedMode || 'light';
  });

  // Persist theme changes to localStorage
  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const value = useMemo(() => ({ mode, toggleTheme }), [mode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
