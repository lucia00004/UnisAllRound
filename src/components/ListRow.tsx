import React from 'react';
import { Pressable, View, Text } from 'react-native';
import { ChevronDown, ChevronRight } from 'lucide-react-native';

import { useTheme } from '../theme';
import type { IconComponent } from '../utils';

export function ListRow({
  title,
  subtitle,
  meta,
  icon: Icon,
  onActionPress,
  actionLabel,
  compact,
  onPress,
  hideChevron = false,
  expanded = false,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  icon?: IconComponent;
  onActionPress?: () => void;
  actionLabel?: string;
  compact?: boolean;
  onPress?: () => void;
  hideChevron?: boolean;
  expanded?: boolean;
}) {
  const { colors, styles } = useTheme();
  if (onPress) {
    return (
      <Pressable style={[styles.listRow, compact && styles.listRowCompact]} onPress={onPress}>
        {Icon && (
          <View style={styles.listIcon}>
            <Icon color={colors.forest} size={18} />
          </View>
        )}
        <View style={styles.flexOne}>
          <Text style={styles.rowTitle} numberOfLines={expanded ? undefined : 1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.rowSubtitle} numberOfLines={expanded ? undefined : 1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {meta ? <Text style={styles.rowMeta}>{meta}</Text> : null}
        {onActionPress && actionLabel ? (
          <Pressable onPress={onActionPress}>
            <Text style={styles.rowActionText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
        {!onActionPress && !hideChevron && (
          expanded ? (
            <ChevronDown color={colors.muted} size={18} />
          ) : (
            <ChevronRight color={colors.muted} size={18} />
          )
        )}
      </Pressable>
    );
  }

  return (
    <View style={[styles.listRow, compact && styles.listRowCompact]}>
      {Icon && (
        <View style={styles.listIcon}>
          <Icon color={colors.forest} size={18} />
        </View>
      )}
      <View style={styles.flexOne}>
        <Text style={styles.rowTitle} numberOfLines={expanded ? undefined : 1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.rowSubtitle} numberOfLines={expanded ? undefined : 1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {meta ? <Text style={styles.rowMeta}>{meta}</Text> : null}
      {onActionPress && actionLabel ? (
        <Pressable onPress={onActionPress}>
          <Text style={styles.rowActionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
      {!onActionPress && !hideChevron && (
        expanded ? (
          <ChevronDown color={colors.muted} size={18} />
        ) : (
          <ChevronRight color={colors.muted} size={18} />
        )
      )}
    </View>
  );
}
