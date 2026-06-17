import React from 'react';
import { Pressable, View, Text } from 'react-native';

import { useTheme } from '../theme';
import type { IconComponent } from '../utils';

export function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  onPress,
}: {
  label: string;
  value: string;
  icon: IconComponent;
  tone: 'green' | 'blue' | 'amber' | 'coral' | 'purple';
  onPress?: () => void;
}) {
  const { colors, styles } = useTheme();
  const getColors = () => {
    switch (tone) {
      case 'green':
        return { bg: colors.mint, text: colors.forest };
      case 'blue':
        return { bg: colors.blueSoft, text: colors.blue };
      case 'amber':
        return { bg: colors.amberSoft, text: colors.amber };
      case 'coral':
        return { bg: colors.coralSoft, text: colors.coral };
      case 'purple':
        return { bg: '#F2E8FF', text: '#7C3AED' };
    }
  };

  const scheme = getColors();

  return (
    <Pressable 
      style={styles.statCard} 
      onPress={onPress} 
      disabled={!onPress}
    >
      <View style={[styles.statIcon, { backgroundColor: scheme.bg }]}>
        <Icon color={scheme.text} size={18} />
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </Pressable>
  );
}
