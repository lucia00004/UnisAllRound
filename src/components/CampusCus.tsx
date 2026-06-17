import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { Trophy } from 'lucide-react-native';
import Svg, { Path, Rect, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { useTheme, radii } from '../theme';
import { translations } from '../constants';
import { SectionTitle } from './SectionTitle';
import { ListRow } from './ListRow';

function WhatsappIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M12.004 2C6.48 2 2 6.48 2 12c0 2.17.7 4.19 1.89 5.83L2.03 22l4.31-1.13c1.54.83 3.3 1.3 5.18 1.3 5.52 0 10-4.48 10-10S17.52 2 12.004 2z" fill="#25D366" />
      <Path d="M17.22 14.85c-.29-.14-1.7-1.12-1.95-1.22-.26-.1-.45-.14-.64.14-.19.29-.74.93-.9 1.12-.17.19-.34.22-.64.07-.3-.15-1.27-.47-2.42-1.5-1.15-1.03-1.63-1.63-1.85-2.02-.23-.39-.02-.6.18-.8.18-.18.39-.45.58-.68.19-.23.26-.39.39-.65.13-.26.06-.48-.03-.68-.1-.19-.84-2.03-1.15-2.77-.3-.73-.61-.63-.84-.64-.21-.01-.45-.01-.69-.01-.24 0-.64.09-.98.46-.34.37-1.3 1.27-1.3 3.11s1.34 3.61 1.53 3.86c.19.25 2.63 4.02 6.37 5.63.89.38 1.58.61 2.13.79.89.28 1.7.24 2.34.15.72-.1 2.22-.91 2.53-1.79.31-.88.31-1.64.22-1.79-.09-.15-.34-.24-.63-.38z" fill="#FFF" />
    </Svg>
  );
}

function PhoneIcon() {
  const { colors } = useTheme();
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.forest} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </Svg>
  );
}

function EmailIcon() {
  const { colors } = useTheme();
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.forest} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <Path d="M22 6l-10 7L2 6" />
    </Svg>
  );
}

function InstagramIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="instaGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#FEC564" />
          <Stop offset="30%" stopColor="#E1306C" />
          <Stop offset="100%" stopColor="#833AB4" />
        </LinearGradient>
      </Defs>
      <Rect width={24} height={24} rx={6} fill="url(#instaGrad)" />
      <Rect x={4.5} y={4.5} width={15} height={15} rx={4.5} stroke="#FFF" strokeWidth={1.8} />
      <Circle cx={12} cy={12} r={3.5} stroke="#FFF" strokeWidth={1.8} />
      <Circle cx={16.5} cy={7.5} r={1} fill="#FFF" />
    </Svg>
  );
}

export function CampusCus({
  t,
  lang,
  onOpenExternal,
}: {
  t: (key: keyof typeof translations.IT) => string;
  lang: 'IT' | 'EN';
  onOpenExternal: (url: string) => void;
}) {
  const { colors, styles } = useTheme();
  const [contactingActivity, setContactingActivity] = useState<{ name: string; when: string; contact: string } | null>(null);

  const getCusActivities = (currentLang: 'IT' | 'EN') => {
    const actIT = [
      { name: 'Calcetto', when: 'Lun/Mer 18:00 - 22:00', contact: 'cus@unisa.it' },
      { name: 'Tennis', when: 'Mar/Gio 16:00 - 20:00', contact: 'tennis.cus@unisa.it' },
      { name: 'Sala pesi', when: 'Lun-Ven 09:00 - 21:00', contact: 'fitness.cus@unisa.it' },
    ];

    const actEN = [
      { name: 'Futsal / Soccer', when: 'Mon/Wed 18:00 - 22:00', contact: 'cus@unisa.it' },
      { name: 'Tennis', when: 'Tue/Thu 16:00 - 20:00', contact: 'tennis.cus@unisa.it' },
      { name: 'Gym / Weight room', when: 'Mon-Fri 09:00 - 21:00', contact: 'fitness.cus@unisa.it' },
    ];

    return currentLang === 'IT' ? actIT : actEN;
  };

  return (
    <>
      <SectionTitle title={t('cusTitle')} subtitle={t('cusSubtitle')} />
      {getCusActivities(lang).map((activity) => (
        <ListRow
          key={activity.name}
          icon={Trophy}
          title={activity.name}
          subtitle={lang === 'IT' ? 'CUS Salerno' : 'Salerno CUS'}
          compact
          actionLabel={lang === 'IT' ? 'Contatta' : 'Contact'}
          onActionPress={() => setContactingActivity(activity)}
        />
      ))}

      {contactingActivity && (
        <Modal transparent visible animationType="fade" onRequestClose={() => setContactingActivity(null)}>
          <Pressable style={styles.modalOverlay} onPress={() => setContactingActivity(null)}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {lang === 'IT' ? `Contatta ${contactingActivity.name}` : `Contact ${contactingActivity.name}`}
                </Text>
              </View>
              
              <Text style={[styles.bodyText, { marginBottom: 18 }]}>
                {lang === 'IT' ? 'Scegli la modalità di contatto:' : 'Choose contact method:'}
              </Text>

              <View style={{ gap: 10, marginBottom: 18 }}>
                <Pressable
                  style={[styles.iconButton, { minHeight: 48, justifyContent: 'flex-start', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }]}
                  onPress={() => {
                    setContactingActivity(null);
                    onOpenExternal('https://wa.me/393483161449');
                  }}
                >
                  <WhatsappIcon />
                  <Text style={[styles.iconButtonText, { fontSize: 15, color: colors.ink }]}>WhatsApp</Text>
                </Pressable>

                <Pressable
                  style={[styles.iconButton, { minHeight: 48, justifyContent: 'flex-start', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }]}
                  onPress={() => {
                    setContactingActivity(null);
                    onOpenExternal('tel:+39089969166');
                  }}
                >
                  <PhoneIcon />
                  <Text style={[styles.iconButtonText, { fontSize: 15, color: colors.ink }]}>
                    {lang === 'IT' ? 'Telefono' : 'Phone'}
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.iconButton, { minHeight: 48, justifyContent: 'flex-start', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }]}
                  onPress={() => {
                    setContactingActivity(null);
                    onOpenExternal(`mailto:${contactingActivity.contact}`);
                  }}
                >
                  <EmailIcon />
                  <Text style={[styles.iconButtonText, { fontSize: 15, color: colors.ink }]} numberOfLines={1}>
                    Email ({contactingActivity.contact})
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.iconButton, { minHeight: 48, justifyContent: 'flex-start', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }]}
                  onPress={() => {
                    setContactingActivity(null);
                    onOpenExternal('https://www.instagram.com/cus_salerno/');
                  }}
                >
                  <InstagramIcon />
                  <Text style={[styles.iconButtonText, { fontSize: 15, color: colors.ink }]}>Instagram</Text>
                </Pressable>
              </View>

              <Pressable
                style={[styles.actionButton, styles.actionSecondary, { minHeight: 46 }]}
                onPress={() => setContactingActivity(null)}
              >
                <Text style={[styles.actionText, styles.actionSecondaryText, { fontSize: 15 }]}>
                  {lang === 'IT' ? 'Annulla' : 'Cancel'}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
}
