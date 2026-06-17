import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { ChevronDown, CheckCircle2 } from 'lucide-react-native';

import { useTheme, radii } from '../theme';

export function MultiSelectPicker({
  label,
  values,
  options,
  onSelect,
  required,
  lang,
  disabled,
}: {
  label: string;
  values: string[];
  options: string[];
  onSelect: (vals: string[]) => void;
  required?: boolean;
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
        <Text style={{ color: disabled ? colors.muted : (values.length > 0 ? colors.ink : colors.muted), fontSize: 15 }} numberOfLines={1}>
          {values.length > 0 ? values.join(', ') : (lang === 'IT' ? 'Seleziona...' : 'Select...')}
        </Text>
        {!disabled && <ChevronDown color={colors.muted} size={18} />}
      </Pressable>

      {modalOpen ? (
        <Modal transparent visible animationType="fade" onRequestClose={() => setModalOpen(false)}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }} onPress={() => setModalOpen(false)}>
            <View style={{ backgroundColor: colors.surface, borderRadius: radii.lg, maxHeight: 400, padding: 18, borderWidth: 1.5, borderColor: colors.border }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: colors.ink }}>{label}</Text>
                <Pressable onPress={() => setModalOpen(false)} style={{ padding: 6, backgroundColor: colors.forest, borderRadius: radii.sm }}>
                  <Text style={{ color: colors.surface, fontWeight: '800', fontSize: 12 }}>OK</Text>
                </Pressable>
              </View>
              <ScrollView keyboardShouldPersistTaps="handled">
                {options.map((opt) => {
                  const isSelected = values.includes(opt);
                  return (
                    <Pressable
                      key={opt}
                      onPress={() => {
                        if (isSelected) {
                          onSelect(values.filter((v) => v !== opt));
                        } else {
                          onSelect([...values, opt]);
                        }
                      }}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 8,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: isSelected ? colors.mint : 'transparent',
                      }}
                    >
                      <Text style={{ fontSize: 15, color: colors.ink, fontWeight: isSelected ? '700' : '500', flex: 1, paddingRight: 8 }}>
                        {opt}
                      </Text>
                      {isSelected ? (
                        <CheckCircle2 color={colors.forest} size={18} />
                      ) : (
                        <View style={{ width: 18, height: 18, borderWidth: 1.5, borderColor: colors.muted, borderRadius: radii.sm, justifyContent: 'center', alignItems: 'center' }} />
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}
