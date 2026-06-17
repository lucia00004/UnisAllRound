import React from 'react';
import { View, Text } from 'react-native';

import { useTheme } from '../theme';
import type { Ticket as TicketType } from '../types';

export function StatusBadge({ value }: { value: TicketType['status'] }) {
  const { colors, styles } = useTheme();
  const getBadgeColor = () => {
    if (value === 'Aperto') return colors.danger;
    if (value === 'In carico') return colors.teal;
    if (value === 'In sospeso') return colors.amber;
    return colors.muted;
  };
  const color = getBadgeColor();
  return (
    <View style={[styles.statusBadge, { borderColor: color }]}>
      <Text style={[styles.statusBadgeText, { color }]}>{value}</Text>
    </View>
  );
}
