import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';

import { useTheme, radii } from '../theme';
import type { CanteenMenuData } from '../types';
import { translations } from '../constants';
import { SectionTitle } from './SectionTitle';

export function CampusCanteen({
  canteenMenu,
  loadingCanteenMenu,
  onReloadCanteenMenu,
  onOpenExternal,
  t,
  lang,
  onSectionLayout,
}: {
  canteenMenu?: CanteenMenuData | null;
  loadingCanteenMenu?: boolean;
  onReloadCanteenMenu?: () => void;
  onOpenExternal: (url: string) => void;
  t: (key: keyof typeof translations.IT) => string;
  lang: 'IT' | 'EN';
  onSectionLayout?: (name: string, y: number) => void;
}) {
  const { colors, styles } = useTheme();

  return (
    <View onLayout={(e) => onSectionLayout?.('mensa', e.nativeEvent.layout.y)}>
      <SectionTitle title={t('canteenTitle')} subtitle={t('canteenSubtitle')} />

      {loadingCanteenMenu ? (
        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
          <ActivityIndicator color={colors.forest} size="small" />
          <Text style={[styles.mutedText, { marginTop: 8, fontSize: 13 }]}>
            {lang === 'IT' ? 'Caricamento menu in corso...' : 'Loading menus...'}
          </Text>
        </View>
      ) : canteenMenu && (canteenMenu.lunch.length > 0 || canteenMenu.dinner.length > 0) ? (
        <View style={[styles.card, { padding: 16 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 8 }}>
            <Text style={{ fontWeight: '800', color: colors.forest, fontSize: 14 }}>
              {lang === 'IT' ? '📄 Menu Settimanali Ufficiali ADISURC' : '📄 Official ADISURC Weekly Menus'}
            </Text>
            {onReloadCanteenMenu && (
              <Pressable onPress={onReloadCanteenMenu} style={{ padding: 4 }}>
                <Text style={{ fontSize: 11, color: colors.forest, textDecorationLine: 'underline', fontWeight: 'bold' }}>
                  {lang === 'IT' ? 'Aggiorna' : 'Refresh'}
                </Text>
              </Pressable>
            )}
          </View>

          {['Lun', 'Mar', 'Mer', 'Gio', 'Ven'].map((day, idx) => {
            const lunchItem = canteenMenu.lunch.find((l: any) => l.day === day || (day === 'Lun' && l.day === 'Mon') || (day === 'Mar' && l.day === 'Tue') || (day === 'Mer' && l.day === 'Wed') || (day === 'Gio' && l.day === 'Thu') || (day === 'Ven' && l.day === 'Fri'));
            const dinnerItem = canteenMenu.dinner.find((d: any) => d.day === day || (day === 'Lun' && d.day === 'Mon') || (day === 'Mar' && d.day === 'Tue') || (day === 'Mer' && d.day === 'Wed') || (day === 'Gio' && d.day === 'Thu') || (day === 'Ven' && d.day === 'Fri'));

            const dayLabel = lang === 'IT' ? 
              (day === 'Lun' ? 'Lunedì' : day === 'Mar' ? 'Martedì' : day === 'Mer' ? 'Mercoledì' : day === 'Gio' ? 'Giovedì' : 'Venerdì') :
              (day === 'Lun' ? 'Monday' : day === 'Mar' ? 'Tuesday' : day === 'Mer' ? 'Wednesday' : day === 'Gio' ? 'Thursday' : 'Friday');

            if (!lunchItem?.url && !dinnerItem?.url) return null;

            return (
              <View key={day} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: idx < 4 ? 0.5 : 0, borderBottomColor: colors.border }}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 14, color: colors.ink }}>
                    {dayLabel}
                  </Text>
                  {lunchItem?.date ? (
                    <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                      {lunchItem.date}
                    </Text>
                  ) : null}
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {lunchItem?.url ? (
                    <Pressable 
                      onPress={() => onOpenExternal(lunchItem.url)} 
                      style={{ paddingVertical: 6, paddingHorizontal: 12, backgroundColor: colors.forest, borderRadius: radii.sm }}
                    >
                      <Text style={{ color: colors.surface, fontSize: 12, fontWeight: 'bold' }}>
                        {lang === 'IT' ? 'Pranzo' : 'Lunch'}
                      </Text>
                    </Pressable>
                  ) : null}
                  {dinnerItem?.url ? (
                    <Pressable 
                      onPress={() => onOpenExternal(dinnerItem.url)} 
                      style={{ paddingVertical: 6, paddingHorizontal: 12, backgroundColor: colors.forest, borderRadius: radii.sm }}
                    >
                      <Text style={{ color: colors.surface, fontSize: 12, fontWeight: 'bold' }}>
                        {lang === 'IT' ? 'Cena' : 'Dinner'}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            );
          })}

          {canteenMenu.officialPageUrl ? (
            <Pressable 
              onPress={() => onOpenExternal(canteenMenu.officialPageUrl)} 
              style={{ 
                marginTop: 14, 
                paddingVertical: 10, 
                backgroundColor: colors.surface, 
                borderWidth: 1, 
                borderColor: colors.border, 
                borderRadius: radii.sm, 
                alignItems: 'center' 
              }}
            >
              <Text style={{ color: colors.ink, fontSize: 13, fontWeight: '600' }}>
                {lang === 'IT' ? 'Apri Portale Ristorazione ADISURC' : 'Open ADISURC Dining Portal'}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <View style={[styles.card, { padding: 16, alignItems: 'center' }]}>
          <Text style={{ color: colors.muted, fontSize: 13, textAlign: 'center', marginBottom: 12 }}>
            {lang === 'IT' ? 'Impossibile caricare i menu della mensa in tempo reale.' : 'Unable to load real-time canteen menus.'}
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {onReloadCanteenMenu && (
              <Pressable 
                onPress={onReloadCanteenMenu} 
                style={{ 
                  paddingVertical: 8, 
                  paddingHorizontal: 14, 
                  backgroundColor: colors.mint, 
                  borderRadius: radii.sm, 
                  borderWidth: 1, 
                  borderColor: colors.forest, 
                }}
              >
                <Text style={{ color: colors.forest, fontSize: 13, fontWeight: 'bold' }}>
                  {lang === 'IT' ? 'Riprova' : 'Retry'}
                </Text>
              </Pressable>
            )}
            <Pressable 
              onPress={() => onOpenExternal('https://www.adisurcampania.it/ristorazione/mense-ed-esercizi-convenzionati/mensa-di-fisciano-e-baronissi')} 
              style={{ 
                paddingVertical: 8, 
                paddingHorizontal: 14, 
                backgroundColor: colors.surface, 
                borderRadius: radii.sm, 
                borderWidth: 1, 
                borderColor: colors.border, 
              }}
            >
              <Text style={{ color: colors.ink, fontSize: 13, fontWeight: 'bold' }}>
                {lang === 'IT' ? 'Apri Sito ADISURC' : 'Open ADISURC Site'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
