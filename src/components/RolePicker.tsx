import React from 'react';
import { View, Text, Pressable } from 'react-native';

import { useTheme } from '../theme';
import type { Role } from '../types';
import { roleIcon } from '../utils';

export function RolePicker({ value, onChange }: { value: Role; onChange: (role: Role) => void }) {
  const { colors, styles } = useTheme();
  return (
    <View style={styles.rolePicker}>
      {(['Studente', 'Docente', 'PTA'] as Role[]).map((role) => {
        const Icon = roleIcon[role];
        const active = value === role;
        return (
          <Pressable
            key={role}
            style={[styles.roleOption, active && styles.roleOptionActive]}
            onPress={() => onChange(role)}
          >
            <Icon color={active ? colors.surface : colors.forest} size={16} />
            <Text style={[styles.roleOptionText, active && styles.roleOptionTextActive]}>
              {role}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
