import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Bell, RotateCcw, XCircle } from 'lucide-react-native';

import { useTheme } from '../theme';
import { getNotificationText } from '../utils';
import type { NotificationItem, UserProfile } from '../types';
import type { translations } from '../constants';
import { ListRow, SegmentedControl, SwipeableRow } from './index';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  activeNotifTab: 'active' | 'archived';
  onActiveNotifTabChange: (tab: 'active' | 'archived') => void;
  activeNotifications: NotificationItem[];
  archivedNotifications: NotificationItem[];
  currentUser: UserProfile;
  appLanguage: 'IT' | 'EN';
  t: (key: keyof typeof translations.IT) => string;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onSelectNotification: (item: NotificationItem) => void;
}

export default function NotificationsModal({
  visible,
  onClose,
  activeNotifTab,
  onActiveNotifTabChange,
  activeNotifications,
  archivedNotifications,
  currentUser,
  appLanguage,
  t,
  onArchive,
  onRestore,
  onDelete,
  onSelectNotification,
}: NotificationsModalProps) {
  const { colors, styles } = useTheme();
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('notifications')}</Text>
            <Pressable style={styles.modalCloseBtn} onPress={onClose}>
              <XCircle color={colors.ink} size={24} />
            </Pressable>
          </View>

          <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
            <SegmentedControl
              options={[
                { value: 'active', label: t('notificationActive') },
                { value: 'archived', label: t('notificationArchive') },
              ]}
              value={activeNotifTab}
              onChange={(val) => onActiveNotifTabChange(val as 'active' | 'archived')}
            />
          </View>

          <ScrollView style={styles.modalScroll}>
            {activeNotifTab === 'active' ? (
              activeNotifications.length === 0 ? (
                <Text style={styles.emptyNotificationsText}>{t('noNotifications')}</Text>
              ) : (
                activeNotifications.map((item) => {
                  const translated = getNotificationText(
                    item.id,
                    item.title,
                    item.body,
                    currentUser.language || appLanguage
                  );
                  return (
                    <SwipeableRow
                      key={item.id}
                      onSwipeRight={() => onArchive(item.id)}
                      onSwipeLeft={() => onDelete(item.id)}
                      leftLabel={t('notificationSwipeArchive')}
                      rightLabel={t('notificationSwipeDelete')}
                    >
                      <ListRow
                        icon={Bell}
                        title={translated.title}
                        subtitle={translated.body}
                        meta={item.date}
                        compact
                        onPress={() => onSelectNotification(item)}
                      />
                    </SwipeableRow>
                  );
                })
              )
            ) : (
              archivedNotifications.length === 0 ? (
                <Text style={styles.emptyNotificationsText}>{t('noArchivedNotifications')}</Text>
              ) : (
                archivedNotifications.map((item) => {
                  const translated = getNotificationText(
                    item.id,
                    item.title,
                    item.body,
                    currentUser.language || appLanguage
                  );
                  return (
                    <SwipeableRow
                      key={item.id}
                      onSwipeRight={() => onRestore(item.id)}
                      onSwipeLeft={() => onDelete(item.id)}
                      leftLabel={t('notificationSwipeRestore')}
                      rightLabel={t('notificationSwipeDelete')}
                      leftIcon={RotateCcw}
                      leftColor={colors.blue}
                    >
                      <ListRow
                        icon={Bell}
                        title={translated.title}
                        subtitle={translated.body}
                        meta={item.date}
                        compact
                        onPress={() => onSelectNotification(item)}
                      />
                    </SwipeableRow>
                  );
                })
              )
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
