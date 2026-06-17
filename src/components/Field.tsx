import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

import { useTheme } from '../theme';

export function Field({
  label,
  value,
  onChangeText,
  multiline,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  required,
  placeholder,
  onHelpPress,
  editable = true,
  maxLength,
  containerStyle,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'number-pad' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  required?: boolean;
  placeholder?: string;
  onHelpPress?: () => void;
  editable?: boolean;
  maxLength?: number;
  containerStyle?: any;
}) {
  const { colors, styles } = useTheme();
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View style={[styles.field, containerStyle]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={styles.inputLabel}>
          {label}
          {required ? <Text style={{ color: colors.danger }}> *</Text> : null}
        </Text>
        {onHelpPress && (
          <Pressable onPress={onHelpPress} style={{ paddingHorizontal: 8, paddingVertical: 1, borderRadius: 10, backgroundColor: colors.mint, marginBottom: 6 }}>
            <Text style={{ color: colors.forest, fontWeight: '900', fontSize: 13 }}>?</Text>
          </Pressable>
        )}
      </View>
      <View style={{ position: 'relative', justifyContent: 'center' }}>
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            editable === false && { backgroundColor: '#e9ecef', color: colors.muted },
            secureTextEntry && { paddingRight: 45 }
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          multiline={multiline}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          textAlignVertical={multiline ? 'top' : 'center'}
          editable={editable}
          maxLength={maxLength}
        />
        {secureTextEntry ? (
          <Pressable
            onPress={() => setIsSecure(!isSecure)}
            style={{
              position: 'absolute',
              right: 12,
              padding: 6,
            }}
          >
            {isSecure ? (
              <EyeOff color={colors.muted} size={18} />
            ) : (
              <Eye color={colors.forest} size={18} />
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
