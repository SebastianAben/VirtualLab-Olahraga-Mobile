import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Theme {
  mode: 'light' | 'dark';
  colors: {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    success: string;
    warning: string;
    danger: string;
    chartBackground: string;
    navbar: string;
  };
}

// Light and Dark Themes
export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: '#f1f5f9', 
    card: '#ffffff',       
    text: '#1e293b',       
    textSecondary: '#64748b', 
    border: '#e2e8f0',    
    primary: '#3b82f6',  
    success: '#10b981',    
    warning: '#f59e0b',    
    danger: '#ef4444',    
    chartBackground: '#1e293b', 
    navbar: '#3b82f6',     
  },
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: '#0f172a', 
    card: '#1e293b',       
    text: '#f1f5f9',       
    textSecondary: '#94a3b8', 
    border: '#334155',   
    primary: '#60a5fa',    
    success: '#34d399',   
    warning: '#fbbf24',   
    danger: '#f87171',     
    chartBackground: '#020617', 
    navbar: '#1e293b',    
  },
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  toggleTheme: () => {},
  isDarkMode: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemScheme === 'dark');

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.log('Failed to load theme preference', error);
    }
  };

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      await AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
    } catch (error) {
      console.log('Failed to save theme preference', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
