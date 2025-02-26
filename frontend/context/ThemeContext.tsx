'use client';

import React, { createContext, useContext, useState } from 'react';

// Define available themes
export const THEMES = {
  light: {
    primary: 'bg-white',
    secondary: 'bg-gray-50',
    accent: 'bg-blue-600',
    background: 'bg-gray-50',
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      accent: 'text-blue-600'
    },
    hover: {
      secondary: 'hover:bg-gray-100',
      accent: 'hover:bg-blue-700'
    }
  },
  dark: {
    primary: 'bg-gray-900',
    secondary: 'bg-gray-800',
    accent: 'bg-blue-500',
    background: 'bg-black',
    text: {
      primary: 'text-white',
      secondary: 'text-gray-300',
      accent: 'text-blue-400'
    },
    hover: {
      secondary: 'hover:bg-gray-700',
      accent: 'hover:bg-blue-600'
    }
  },
  sharks: {
    primary: 'bg-[#00737A]',
    secondary: 'bg-[#005761]',
    accent: 'bg-[#EA4B16]',
    background: 'bg-[#0A0A0A]',
    text: {
      primary: 'text-white',
      secondary: 'text-gray-200',
      accent: 'text-[#EA4B16]'
    },
    hover: {
      secondary: 'hover:bg-[#00444F]',
      accent: 'hover:bg-[#d43d0d]'
    }
  }
};

export type ThemeName = keyof typeof THEMES;
export type Theme = typeof THEMES.light;

interface ThemeContextType {
  currentTheme: ThemeName;
  theme: Theme;
  setTheme: (theme: ThemeName | Record<string, any>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('light');
  const [customTheme, setCustomTheme] = useState<Record<string, any> | null>(null);

  const setTheme = (theme: ThemeName | Record<string, any>) => {
    if (typeof theme === 'string' && theme in THEMES) {
      setCurrentTheme(theme as ThemeName);
      setCustomTheme(null);
    } else if (typeof theme === 'object') {
      setCustomTheme(theme);
    }
  };

  const theme = customTheme || THEMES[currentTheme];

  return (
    <ThemeContext.Provider value={{ currentTheme, theme, setTheme }}>
      <div className={theme.background}>{children}</div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}