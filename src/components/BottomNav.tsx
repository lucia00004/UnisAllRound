import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Home, MapPin, ClipboardList, CircleUserRound } from 'lucide-react-native';

import { useTheme } from '../theme';
import type { Role, MainTab } from '../types';
import { translations } from '../constants';
import type { IconComponent } from '../utils';

export function BottomNav({
  activeTab,
  onChange,
  role,
  t,
  lang,
}: {
  activeTab: MainTab;
  onChange: (tab: MainTab) => void;
  role: Role;
  t: (key: keyof typeof translations.IT) => string;
  lang: 'IT' | 'EN';
}) {
  const { colors, styles } = useTheme();
  const items: Array<{ key: MainTab; label: string; icon: IconComponent }> = [
    { key: 'home', label: t('home'), icon: Home },
    { key: 'campus', label: t('campus'), icon: MapPin },
    { key: 'services', label: t('services'), icon: ClipboardList },
    { key: 'profile', label: t('profile'), icon: CircleUserRound },
  ];

  return (
    <View style={styles.bottomNav}>
      {items.map((item) => {
        const Icon = item.icon;
        const active = activeTab === item.key;
        return (
          <Pressable key={item.key} style={styles.navItem} onPress={() => onChange(item.key)}>
            <View style={[styles.navIconWrap, active && styles.navIconWrapActive]}>
              <Icon color={active ? colors.surface : colors.muted} size={19} />
            </View>
            <Text style={[styles.navText, active && styles.navTextActive]} numberOfLines={1}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
