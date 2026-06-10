import React, { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  Animated,
  PanResponder,
} from 'react-native';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Home,
  MapPin,
  ClipboardList,
  CircleUserRound,
  CheckCircle2,
  Archive,
  Trash2,
  RotateCcw,
} from 'lucide-react-native';

import { colors, radii } from './theme';
import type { Role, Ticket as TicketType, MainTab } from './types';
import { translations } from './constants';
import { roleIcon, parsePhone } from './utils';
import type { IconComponent } from './utils';
import { styles } from './styles';

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

export function DomainPicker({
  label,
  value,
  onSelect,
  required,
  lang,
  disabled,
}: {
  label: string;
  value: string;
  onSelect: (val: string) => void;
  required?: boolean;
  lang: 'IT' | 'EN';
  disabled?: boolean;
}) {
  const domains = [
    'Area Didattica',
    'Servizi agli Studenti',
    'Terza Missione',
    'Risorse Umane',
    'Bibliotecario',
    'Ufficio Stampa',
    'Funzionario Amministrativo',
    'Tecnico di Laboratiorio (IT)',
    'Tecnico di Laboratio(CTF)',
    'Addetto Mensa',
  ];
  return (
    <CustomPicker
      label={label}
      value={value}
      options={domains}
      onSelect={onSelect}
      required={required}
      lang={lang}
      disabled={disabled}
      placeholder={lang === 'IT' ? 'Seleziona ambito...' : 'Select work scope...'}
    />
  );
}

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
}) {
  return (
    <View style={styles.field}>
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
      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          editable === false && { backgroundColor: '#e9ecef', color: colors.muted }
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        textAlignVertical={multiline ? 'top' : 'center'}
        editable={editable}
        maxLength={maxLength}
      />
    </View>
  );
}

export function RolePicker({ value, onChange }: { value: Role; onChange: (role: Role) => void }) {
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

export function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={[styles.segment, active && styles.segmentActive]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionHeading}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

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

export function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  onPress,
}: {
  label: string;
  value: string;
  icon: IconComponent;
  tone: 'green' | 'blue' | 'amber' | 'coral' | 'purple';
  onPress?: () => void;
}) {
  const getColors = () => {
    switch (tone) {
      case 'green':
        return { bg: colors.mint, text: colors.forest };
      case 'blue':
        return { bg: colors.blueSoft, text: colors.blue };
      case 'amber':
        return { bg: colors.amberSoft, text: colors.amber };
      case 'coral':
        return { bg: colors.coralSoft, text: colors.coral };
      case 'purple':
        return { bg: '#F2E8FF', text: '#7C3AED' };
    }
  };

  const scheme = getColors();

  return (
    <Pressable 
      style={styles.statCard} 
      onPress={onPress} 
      disabled={!onPress}
    >
      <View style={[styles.statIcon, { backgroundColor: scheme.bg }]}>
        <Icon color={scheme.text} size={18} />
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </Pressable>
  );
}

export function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statPillValue}>{value}</Text>
      <Text style={styles.statPillLabel}>{label}</Text>
    </View>
  );
}

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

export function StatusBadge({ value }: { value: TicketType['status'] }) {
  const getBadgeColor = () => {
    if (value === 'Aperto') return colors.danger;
    if (value === 'In carico') return colors.teal;
    if (value === 'In sospeso') return colors.amber;
    return colors.muted;
  };
  const color = getBadgeColor();
  return (
    <View style={[styles.statusBadge, { borderColor: color }]}>
      <Text style={[styles.statusBadgeText, { color }]}>{value}</Text>
    </View>
  );
}

export function SwipeableRow({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftLabel = 'Archivia',
  rightLabel = 'Elimina',
  leftColor = colors.teal,
  rightColor = colors.danger,
  leftIcon: LeftIcon = Archive,
  rightIcon: RightIcon = Trash2,
}: {
  children: React.ReactNode;
  onSwipeLeft: () => void;
  onSwipeRight?: () => void;
  leftLabel?: string;
  rightLabel?: string;
  leftColor?: string;
  rightColor?: string;
  leftIcon?: any;
  rightIcon?: any;
}) {
  const pan = React.useRef(new Animated.ValueXY()).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (gestureState.dx > 0 && !onSwipeRight) {
          return false;
        }
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 8;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!onSwipeRight && gestureState.dx > 0) {
          pan.x.setValue(0);
        } else {
          pan.x.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 120 && onSwipeRight) {
          Animated.timing(pan, {
            toValue: { x: 500, y: 0 },
            duration: 180,
            useNativeDriver: false,
          }).start(() => {
            onSwipeRight();
            pan.setValue({ x: 0, y: 0 });
          });
        } else if (gestureState.dx < -120) {
          Animated.timing(pan, {
            toValue: { x: -500, y: 0 },
            duration: 180,
            useNativeDriver: false,
          }).start(() => {
            onSwipeLeft();
            pan.setValue({ x: 0, y: 0 });
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={{ position: 'relative', overflow: 'hidden', borderRadius: radii.md, marginBottom: 10 }}>
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          borderRadius: radii.md,
          backgroundColor: pan.x.interpolate({
            inputRange: [-100, 0, 100],
            outputRange: [rightColor, 'transparent', leftColor],
          }),
        }}
      >
        <Animated.View
          style={{
            opacity: pan.x.interpolate({
              inputRange: [0, 50],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            }),
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <LeftIcon color={colors.surface} size={20} />
          <Text style={{ color: colors.surface, fontWeight: 'bold', marginLeft: 8, fontSize: 14 }}>
            {leftLabel}
          </Text>
        </Animated.View>

        <Animated.View
          style={{
            opacity: pan.x.interpolate({
              inputRange: [-50, 0],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            }),
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.surface, fontWeight: 'bold', marginRight: 8, fontSize: 14 }}>
            {rightLabel}
          </Text>
          <RightIcon color={colors.surface} size={20} />
        </Animated.View>
      </Animated.View>

      <Animated.View
        style={{
          transform: [{ translateX: pan.x }],
          backgroundColor: colors.surface,
        }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}
