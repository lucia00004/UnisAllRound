import React, { createContext, useContext } from 'react';

export const getColors = () => ({
  background: '#F6F7F3',
  surface: '#FFFFFF',
  ink: '#17221C',
  muted: '#65746A',
  border: '#D9E2DA',
  forest: '#E27E07',
  teal: '#137C8B',
  sky: '#D9EEF5',
  mint: '#FFF4E5',
  amber: '#F0B429',
  amberSoft: '#FFF3C4',
  coral: '#D96C4A',
  coralSoft: '#FBE2D8',
  blue: '#315EAD',
  blueSoft: '#DEE8FF',
  danger: '#A83E32',
});

export const colors = getColors();

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
  colors: getColors(),
  styles: {},
});

export const useTheme = () => useContext(ThemeContext);
