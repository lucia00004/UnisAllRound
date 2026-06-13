import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Bell, XCircle } from 'lucide-react-native';

import { useTheme } from '../theme';
import { getNotificationText } from '../utils';
import type { NotificationItem, UserProfile } from '../types';
import type { translations } from '../constants';
import { ActionButton } from './index';

interface NotificationDetailModalProps {
  visible: boolean;
  onClose: () => void;
  selectedNotification: NotificationItem | null;
  currentUser: UserProfile;
  appLanguage: 'IT' | 'EN';
  t: (key: keyof typeof translations.IT) => string;
  onActionClick: (item: NotificationItem) => void;
}

export default function NotificationDetailModal({
  visible,
  onClose,
  selectedNotification,
  currentUser,
  appLanguage,
  t,
  onActionClick,
}: NotificationDetailModalProps) {
  const { colors, styles } = useTheme();

  if (!selectedNotification) {
    return null;
  }

  const translated = getNotificationText(
    selectedNotification.id,
    selectedNotification.title,
    selectedNotification.body,
    currentUser.language || appLanguage
  );

  const titleLower = translated.title.toLowerCase();
  const bodyLower = translated.body.toLowerCase();

  const hasAction =
    titleLower.includes('mensa') ||
    bodyLower.includes('mensa') ||
    selectedNotification.id === 'n-3' ||
    titleLower.includes('esito') ||
    bodyLower.includes('esito') ||
    selectedNotification.id === 'n-1' ||
    titleLower.includes('ticket') ||
    bodyLower.includes('ticket') ||
    selectedNotification.id === 'n-2' ||
    titleLower.includes('ricevimento') ||
    bodyLower.includes('ricevimento') ||
    titleLower.includes('prenotazione') ||
    bodyLower.includes('prenotazione');

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '60%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('notificationDetailTitle')}</Text>
            <Pressable style={styles.modalCloseBtn} onPress={onClose}>
              <XCircle color={colors.ink} size={24} />
            </Pressable>
          </View>
          <View style={{ padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ backgroundColor: colors.amberSoft, padding: 10, borderRadius: 30, marginRight: 12 }}>
                <Bell color={colors.amber} size={24} />
              </View>
              <View style={styles.flexOne}>
                <Text style={[styles.rowTitle, { fontSize: 18, fontWeight: 'bold' }]}>{translated.title}</Text>
                <Text style={[styles.rowMeta, { alignSelf: 'flex-start', marginTop: 4 }]}>{selectedNotification.date}</Text>
              </View>
            </View>
            <ScrollView style={{ maxHeight: 200, marginBottom: 20 }}>
              <Text style={[styles.rowSubtitle, { fontSize: 16, lineHeight: 22, color: colors.ink }]} numberOfLines={0}>
                {translated.body}
              </Text>
            </ScrollView>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
              <ActionButton
                label={t('cancel') === 'Annulla' ? 'Chiudi' : 'Close'}
                variant="secondary"
                onPress={onClose}
              />
              {hasAction ? (
                <ActionButton
                  label={t('notificationSwipeArchive') === 'Archivia' ? 'Apri' : 'Open'}
                  onPress={() => {
                    onActionClick(selectedNotification);
                  }}
                />
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
