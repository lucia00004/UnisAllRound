import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Bell } from 'lucide-react-native';

import { useTheme } from '../theme';
import type { UserProfile } from '../types';
import type { translations } from '../constants';
import { getRoleCopy, getRoleLabel, roleIcon } from '../utils';

interface HeaderProps {
  currentUser: UserProfile;
  appLanguage: 'IT' | 'EN';
  t: (key: keyof typeof translations.IT) => string;
  activeNotificationsCount: number;
  onOpenNotifications: () => void;
}

export default function Header({
  currentUser,
  appLanguage,
  t,
  activeNotificationsCount,
  onOpenNotifications,
}: HeaderProps) {
  const { colors, styles } = useTheme();
  const ActiveRoleIcon = roleIcon[currentUser.role];
  const roleCopy = getRoleCopy(currentUser.role, currentUser.language || appLanguage);

  return (
    <View style={styles.topBar}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
        <Image source={require('../../assets/logo.png')} style={{ width: 34, height: 34, borderRadius: 17 }} />
        <View style={styles.topTitleBlock}>
          <Text style={styles.smallCaps}>{t('univSalerno')}</Text>
          <Text style={styles.appTitle} numberOfLines={1} ellipsizeMode="tail">
            UnisAllRound
          </Text>
        </View>
      </View>
      <View style={styles.headerActions}>
        <Pressable onPress={onOpenNotifications} style={styles.bellButton}>
          <Bell color={colors.ink} size={20} />
          {activeNotificationsCount > 0 ? (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>{activeNotificationsCount}</Text>
            </View>
          ) : null}
        </Pressable>
        <View style={styles.roleBadge}>
          <ActiveRoleIcon color={roleCopy.accent} size={18} />
          <Text style={[styles.roleBadgeText, { color: roleCopy.accent }]}>
            {getRoleLabel(currentUser.role, currentUser.language || appLanguage)}
          </Text>
        </View>
      </View>
    </View>
  );
}
