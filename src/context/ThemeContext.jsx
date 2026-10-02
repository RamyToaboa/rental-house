import React, { Children, createContext, useContext, useEffect, useState} from "react";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children}) => {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme');
    if(stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return(
    <ThemeContext.Provider value={{theme, toggleTheme, setTheme}}>
      {children}
    </ThemeContext.Provider>
  );
};

// src/context/ThemeContext.jsx
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return ctx;
};