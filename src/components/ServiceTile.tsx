import React from 'react';
import { Pressable, View, Text } from 'react-native';

import { useTheme } from '../theme';
import type { IconComponent } from '../utils';

export function ServiceTile({
  label,
  detail,
  icon: Icon,
  onPress,
}: {
  label: string;
  detail: string;
  icon: IconComponent;
  onPress: () => void;
}) {
  const { colors, styles } = useTheme();
  return (
    <Pressable style={styles.serviceTile} onPress={onPress}>
      <View style={styles.tileIcon}>
        <Icon color={colors.forest} size={20} />
      </View>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileDetail} numberOfLines={2}>
        {detail}
      </Text>
    </Pressable>
  );
}
