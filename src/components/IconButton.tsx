import React from 'react';
import { Pressable, Text } from 'react-native';

import { useTheme } from '../theme';
import type { IconComponent } from '../utils';

export function IconButton({
  label,
  onPress,
  icon: Icon,
  tone = 'default',
}: {
  label: string;
  onPress: () => void;
  icon?: IconComponent;
  tone?: 'default' | 'danger';
}) {
  const { colors, styles } = useTheme();
  return (
    <Pressable
      style={[styles.iconButton, tone === 'danger' && styles.iconButtonDanger]}
      onPress={onPress}
    >
      {Icon && <Icon color={tone === 'danger' ? colors.danger : colors.forest} size={15} />}
      <Text style={[styles.iconButtonText, tone === 'danger' && styles.iconButtonTextDanger]}>
        {label}
      </Text>
    </Pressable>
  );
}
