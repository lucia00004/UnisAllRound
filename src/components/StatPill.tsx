import React from 'react';
import { View, Text } from 'react-native';

import { useTheme } from '../theme';

export function StatPill({ label, value }: { label: string; value: string }) {
  const { colors, styles } = useTheme();
  return (
    <View style={styles.statPill}>
      <Text style={styles.statPillValue}>{value}</Text>
      <Text style={styles.statPillLabel}>{label}</Text>
    </View>
  );
}
