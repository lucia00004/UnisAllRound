import React from 'react';
import { Pressable, Text } from 'react-native';

import { useTheme } from '../theme';
import type { IconComponent } from '../utils';

export function ActionButton({
  label,
  onPress,
  variant = 'primary',
  icon: Icon,
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: IconComponent;
  disabled?: boolean;
}) {
  const { colors, styles } = useTheme();
  return (
    <Pressable
      style={[
        styles.actionButton,
        variant === 'secondary' && styles.actionSecondary,
        variant === 'danger' && styles.actionDanger,
        disabled && { opacity: 0.6 },
      ]}
      onPress={() => !disabled && onPress()}
    >
      {Icon && <Icon color={variant === 'secondary' ? colors.forest : colors.surface} size={18} />}
      <Text style={[styles.actionText, variant === 'secondary' && styles.actionSecondaryText]}>
        {label}
      </Text>
    </Pressable>
  );
}
