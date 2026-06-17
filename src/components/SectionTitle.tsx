import React from 'react';
import { View, Text } from 'react-native';

import { useTheme } from '../theme';

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  const { colors, styles } = useTheme();
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionHeading}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}
