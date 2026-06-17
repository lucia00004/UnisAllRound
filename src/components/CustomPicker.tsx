import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

import { useTheme, radii } from '../theme';

export function CustomPicker({
  label,
  value,
  options,
  onSelect,
  required,
  placeholder,
  lang,
  disabled,
}: {
  label: string;
  value: string;
  options: string[];
  onSelect: (val: string) => void;
  required?: boolean;
  placeholder?: string;
  lang: 'IT' | 'EN';
  disabled?: boolean;
}) {
  const { colors, styles } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.inputLabel}>
        {label}
        {required ? <Text style={{ color: colors.danger }}> *</Text> : null}
      </Text>
      <Pressable
        style={[styles.input, { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', backgroundColor: disabled ? '#e9ecef' : colors.surface }]}
        onPress={() => !disabled && setModalOpen(true)}
      >
        <Text style={{ color: disabled ? colors.muted : (value ? colors.ink : colors.muted), fontSize: 15 }} numberOfLines={1}>
          {value || placeholder || (lang === 'IT' ? 'Seleziona...' : 'Select...')}
        </Text>
        {!disabled && <ChevronDown color={colors.muted} size={18} />}
      </Pressable>

      {modalOpen ? (
        <Modal transparent visible animationType="fade" onRequestClose={() => setModalOpen(false)}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }} onPress={() => setModalOpen(false)}>
            <View style={{ backgroundColor: colors.surface, borderRadius: radii.lg, maxHeight: 400, padding: 18, borderWidth: 1.5, borderColor: colors.border }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: colors.ink, marginBottom: 12 }}>
                {label}
              </Text>
              <ScrollView keyboardShouldPersistTaps="handled">
                {options.map((opt) => (
                  <Pressable
                    key={opt}
                    onPress={() => {
                      onSelect(opt);
                      setModalOpen(false);
                    }}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                      backgroundColor: value === opt ? colors.mint : 'transparent',
                    }}
                  >
                    <Text style={{ fontSize: 15, color: colors.ink, fontWeight: value === opt ? '700' : '500' }}>
                      {opt}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}
