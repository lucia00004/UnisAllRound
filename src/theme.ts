import React, { createContext, useContext } from 'react';

export const getColors = (isDark: boolean) => ({
  background: isDark ? '#121212' : '#F6F7F3',
  surface: isDark ? '#1E1E1E' : '#FFFFFF',
  ink: isDark ? '#FFFFFF' : '#17221C',
  muted: isDark ? '#A0A0A0' : '#65746A',
  border: isDark ? '#2D2D2D' : '#D9E2DA',
  forest: '#E27E07',
  teal: '#137C8B',
  sky: isDark ? '#1E3C47' : '#D9EEF5',
  mint: isDark ? '#2C1D10' : '#FFF4E5',
  amber: '#F0B429',
  amberSoft: isDark ? '#3E351A' : '#FFF3C4',
  coral: '#D96C4A',
  coralSoft: isDark ? '#3D251C' : '#FBE2D8',
  blue: '#315EAD',
  blueSoft: isDark ? '#1D2A47' : '#DEE8FF',
  danger: '#A83E32',
});

export const colors = getColors(false);

export const radii = {
  sm: 8,
  md: 12,
  lg: 18,
};

export const shadow = {
  shadowColor: '#17221C',
  shadowOpacity: 0.08,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};

export const ThemeContext = createContext<{
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  colors: ReturnType<typeof getColors>;
  styles: any;
}>({
  isDarkMode: false,
  toggleDarkMode: () => {},
  colors: getColors(false),
  styles: {},
});

export const useTheme = () => useContext(ThemeContext);
