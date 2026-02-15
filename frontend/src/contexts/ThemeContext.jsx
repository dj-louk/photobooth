import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'dark',
  setTheme: () => {},
  themes: ['dark', 'light', 'louk-party']
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children, defaultTheme = 'dark' }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dj-louk-theme') || defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('dark', 'light', 'louk-party');
    
    // Add current theme class
    if (theme === 'louk-party') {
      root.classList.add('louk-party');
    } else if (theme === 'dark') {
      root.classList.add('dark');
    }
    // Light theme doesn't need a class (it's the default)
    
    // Store preference
    localStorage.setItem('dj-louk-theme', theme);
  }, [theme]);

  const value = {
    theme,
    setTheme,
    themes: ['dark', 'light', 'louk-party']
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
