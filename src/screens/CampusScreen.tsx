import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../theme';
import type { CampusPoint, NewsItem, CanteenMenuData } from '../types';
import { translations } from '../constants';
import {
  SectionTitle,
  CampusNews,
  CampusMapWidget,
  CampusCanteen,
  CampusWeather,
  CampusTransport,
  CampusCus,
} from '../components';

export default function CampusScreen({
  news,
  selectedPoint,
  selectedPointId,
  onSelectPoint,
  onOpenExternal,
  weatherData,
  loadingWeather,
  t,
  lang,
  onSectionLayout,
  canteenMenu,
  loadingCanteenMenu,
  onReloadCanteenMenu,
}: {
  news: NewsItem[];
  selectedPoint: CampusPoint;
  selectedPointId: string;
  onSelectPoint: (id: string) => void;
  onOpenExternal: (url: string) => void;
  weatherData: {
    Fisciano: { temp: number; code: number; windspeed: number } | null;
    Baronissi: { temp: number; code: number; windspeed: number } | null;
  };
  loadingWeather: boolean;
  t: (key: keyof typeof translations.IT) => string;
  lang: 'IT' | 'EN';
  onSectionLayout?: (name: string, y: number) => void;
  canteenMenu?: CanteenMenuData | null;
  loadingCanteenMenu?: boolean;
  onReloadCanteenMenu?: () => void;
}) {
  const { colors, styles } = useTheme();

  return (
    <View>
      <SectionTitle title={t('campusTitle')} subtitle={t('campusSubtitle')} />
      
      <CampusNews
        news={news}
        onOpenExternal={onOpenExternal}
        t={t}
        lang={lang}
      />

      <CampusMapWidget
        selectedPoint={selectedPoint}
        selectedPointId={selectedPointId}
        onSelectPoint={onSelectPoint}
        onOpenExternal={onOpenExternal}
        t={t}
        lang={lang}
      />

      <CampusCanteen
        canteenMenu={canteenMenu}
        loadingCanteenMenu={loadingCanteenMenu}
        onReloadCanteenMenu={onReloadCanteenMenu}
        onOpenExternal={onOpenExternal}
        t={t}
        lang={lang}
        onSectionLayout={onSectionLayout}
      />

      <CampusWeather
        weatherData={weatherData}
        loadingWeather={loadingWeather}
        t={t}
        lang={lang}
      />

      <CampusTransport
        t={t}
        lang={lang}
        onSectionLayout={onSectionLayout}
      />

      <CampusCus
        t={t}
        lang={lang}
        onOpenExternal={onOpenExternal}
      />
    </View>
  );
}
