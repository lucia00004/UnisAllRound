import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Sun, CloudSun } from 'lucide-react-native';

import { useTheme } from '../theme';
import { translations } from '../constants';
import { getWeatherInfo } from '../utils';
import { SectionTitle } from './SectionTitle';

export function CampusWeather({
  weatherData,
  loadingWeather,
  t,
  lang,
}: {
  weatherData: {
    Fisciano: { temp: number; code: number; windspeed: number } | null;
    Baronissi: { temp: number; code: number; windspeed: number } | null;
  };
  loadingWeather: boolean;
  t: (key: keyof typeof translations.IT) => string;
  lang: 'IT' | 'EN';
}) {
  const { colors, styles } = useTheme();

  const getFiscianoWeather = () => {
    if (weatherData.Fisciano) {
      const info = getWeatherInfo(weatherData.Fisciano.code, lang);
      return {
        temp: `${weatherData.Fisciano.temp}°C`,
        condition: info.text,
        Icon: info.icon,
        note: `${t('weatherWind')}: ${weatherData.Fisciano.windspeed} km/h`,
      };
    }
    return {
      temp: '24°C',
      condition: lang === 'IT' ? 'Soleggiato' : 'Sunny',
      Icon: Sun,
      note: lang === 'IT' ? 'Vento leggero' : 'Light wind',
    };
  };

  const getBaronissiWeather = () => {
    if (weatherData.Baronissi) {
      const info = getWeatherInfo(weatherData.Baronissi.code, lang);
      return {
        temp: `${weatherData.Baronissi.temp}°C`,
        condition: info.text,
        Icon: info.icon,
        note: `${t('weatherWind')}: ${weatherData.Baronissi.windspeed} km/h`,
      };
    }
    return {
      temp: '22°C',
      condition: lang === 'IT' ? 'Variabile' : 'Partly Cloudy',
      Icon: CloudSun,
      note: lang === 'IT' ? 'Vento moderato' : 'Moderate wind',
    };
  };

  const fiscianoW = getFiscianoWeather();
  const baronissiW = getBaronissiWeather();

  return (
    <>
      <SectionTitle title={t('weatherTitle')} subtitle={t('weatherSubtitle')} />
      {loadingWeather && !weatherData.Fisciano ? (
        <View style={styles.card}>
          <ActivityIndicator color={colors.forest} size="small" />
          <Text style={[styles.mutedText, { textAlign: 'center', marginTop: 8 }]}>{t('weatherLoading')}</Text>
        </View>
      ) : (
        <View style={styles.weatherGrid}>
          {/* Fisciano Weather Card */}
          <View style={styles.weatherCard}>
            <Text style={styles.weatherSite}>{lang === 'IT' ? 'Sede Fisciano' : 'Fisciano Campus'}</Text>
            <View style={styles.weatherMain}>
              <Text style={styles.weatherTemp}>{fiscianoW.temp}</Text>
              <View style={styles.weatherIconWrap}>
                <fiscianoW.Icon color={colors.forest} size={24} />
              </View>
            </View>
            <Text style={styles.weatherCondition}>{fiscianoW.condition}</Text>
            <Text style={styles.weatherNote}>{fiscianoW.note}</Text>
          </View>

          {/* Baronissi Weather Card */}
          <View style={styles.weatherCard}>
            <Text style={styles.weatherSite}>{lang === 'IT' ? 'Sede Baronissi' : 'Baronissi Campus'}</Text>
            <View style={styles.weatherMain}>
              <Text style={styles.weatherTemp}>{baronissiW.temp}</Text>
              <View style={styles.weatherIconWrap}>
                <baronissiW.Icon color={colors.forest} size={24} />
              </View>
            </View>
            <Text style={styles.weatherCondition}>{baronissiW.condition}</Text>
            <Text style={styles.weatherNote}>{baronissiW.note}</Text>
          </View>
        </View>
      )}
    </>
  );
}
