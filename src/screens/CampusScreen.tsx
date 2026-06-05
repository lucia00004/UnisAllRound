import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import {
  MapPin,
  Megaphone,
  Utensils,
  Bus,
  Trophy,
  Sun,
  CloudSun,
  ChevronDown,
  ChevronRight,
} from 'lucide-react-native';

import { colors, radii } from '../theme';
import { styles } from '../styles';
import type { CampusPoint, NewsItem } from '../types';
import { translations } from '../constants';
import { getWeatherInfo } from '../utils';
import { SectionTitle, ListRow } from '../components';
import { campusPoints } from '../data';
import { busLines } from '../transportData';

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
}) {
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

  const getWeeklyMenu = (currentLang: 'IT' | 'EN') => {
    const menuIT = [
      { day: 'Lun', first: 'Pasta al pomodoro', second: 'Pollo alla griglia', veg: 'Burger di ceci' },
      { day: 'Mar', first: 'Riso primavera', second: 'Merluzzo al forno', veg: 'Insalata greca' },
      { day: 'Mer', first: 'Gnocchi al pesto', second: 'Tacchino e verdure', veg: 'Parmigiana light' },
      { day: 'Gio', first: 'Pasta e lenticchie', second: 'Frittata', veg: 'Cous cous vegetale' },
      { day: 'Ven', first: 'Lasagna', second: 'Pesce spada', veg: 'Tofu speziato' },
    ];

    const menuEN = [
      { day: 'Mon', first: 'Pasta with tomato sauce', second: 'Grilled chicken', veg: 'Chickpea burger' },
      { day: 'Tue', first: 'Spring rice', second: 'Baked cod', veg: 'Greek salad' },
      { day: 'Wed', first: 'Gnocchi with pesto', second: 'Turkey and vegetables', veg: 'Light eggplant parmigiana' },
      { day: 'Thu', first: 'Pasta and lentils', second: 'Omelette', veg: 'Vegetable couscous' },
      { day: 'Fri', first: 'Lasagna', second: 'Swordfish', veg: 'Spiced tofu' },
    ];

    return currentLang === 'IT' ? menuIT : menuEN;
  };

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

  const getPointDetails = (point: CampusPoint, currentLang: 'IT' | 'EN') => {
    if (currentLang === 'EN') {
      if (point.id === 'p-1') return { name: 'Main Canteen', type: 'Canteen', detail: 'Weekly menu and lunch/dinner hours.' };
      if (point.id === 'p-2') return { name: 'Science Library', type: 'Study', detail: 'Bookable seats and quiet study rooms.' };
      if (point.id === 'p-3') return { name: 'F Classrooms', type: 'Teaching', detail: 'Lecture block for computer science and engineering.' };
      if (point.id === 'p-4') return { name: 'CUS Salerno', type: 'Sport', detail: 'Courts, gyms and sports registration office.' };
      if (point.id === 'p-5') return { name: 'Baronissi Campus', type: 'Branch Campus', detail: 'Branch campus with dedicated bus connections.' };
    }
    return point;
  };

  const [expandedLine, setExpandedLine] = useState<string | null>(null);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [contactingActivity, setContactingActivity] = useState<{ name: string; when: string; contact: string } | null>(null);

  const transPoint = getPointDetails(selectedPoint, lang);
  const fiscianoW = getFiscianoWeather();
  const baronissiW = getBaronissiWeather();

  return (
    <View>
      <SectionTitle title={t('campusTitle')} subtitle={t('campusSubtitle')} />
      
      <SectionTitle title={t('newsLabel')} subtitle={t('newsSubtitle')} />
      {news.map((item) => {
        let title = item.title;
        let body = item.body;
        let tag = item.tag;
        if (lang === 'EN') {
          if (item.id === 'news-1') {
            title = 'Master courses open day';
            body = 'Aula Magna in Fisciano, info desks and meetings with course coordinators.';
            tag = 'Academics';
          } else if (item.id === 'news-2') {
            title = 'New CUS schedule';
            body = 'Published updated hours for futsal, tennis, basketball and weight room.';
            tag = 'Campus';
          } else if (item.id === 'news-3') {
            title = 'Scholarships and notices';
            body = 'New notices available for international mobility and tutoring.';
            tag = 'Opportunities';
          }
        }
        return (
          <ListRow
            key={item.id}
            icon={Megaphone}
            title={title}
            subtitle={body}
            meta={tag}
            onActionPress={item.link ? () => onOpenExternal(item.link as string) : undefined}
            actionLabel={item.link ? (lang === 'IT' ? 'Apri' : 'Open') : undefined}
          />
        );
      })}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('mapTitle')}</Text>
        <View style={styles.mapCanvas}>
          <View style={styles.mapBandHorizontal} />
          <View style={styles.mapBandVertical} />
          {campusPoints.map((point) => (
            <Pressable
              key={point.id}
              style={[
                styles.mapPin,
                { left: `${point.x}%`, top: `${point.y}%` },
                selectedPointId === point.id && styles.mapPinActive,
              ]}
              onPress={() => onSelectPoint(point.id)}
            >
              <MapPin color={selectedPointId === point.id ? colors.surface : colors.forest} size={18} />
            </Pressable>
          ))}
        </View>
        <View style={styles.mapDetail}>
          <Text style={styles.cardTitle}>{transPoint.name}</Text>
          <Text style={styles.rowSubtitle}>{transPoint.type}</Text>
          <Text style={styles.bodyText}>{transPoint.detail}</Text>
        </View>
      </View>

      <View onLayout={(e) => onSectionLayout?.('mensa', e.nativeEvent.layout.y)}>
        <SectionTitle title={t('canteenTitle')} subtitle={t('canteenSubtitle')} />
        {getWeeklyMenu(lang).map((day) => (
          <ListRow key={day.day} icon={Utensils} title={`${day.day}: ${day.first}`} subtitle={`${day.second} · ${t('vegLabel')}: ${day.veg}`} compact />
        ))}
      </View>

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

      <View onLayout={(e) => onSectionLayout?.('bus', e.nativeEvent.layout.y)}>
        <SectionTitle title={t('transportTitle')} subtitle={t('transportSubtitle')} />
        {busLines.map((line) => {
          const isLineExpanded = expandedLine === line.line;
          const lineRoute = lang === 'IT' ? line.routeIT : line.routeEN;
          const linePlatform = lang === 'IT' ? line.platformIT : line.platformEN;

          return (
            <View key={line.line} style={styles.transportCard}>
              <Pressable
                style={styles.transportHeader}
                onPress={() => {
                  setExpandedLine(isLineExpanded ? null : line.line);
                  setExpandedRun(null);
                }}
              >
                <View style={styles.transportInfoBlock}>
                  <View style={styles.transportIconContainer}>
                    <Bus color={colors.forest} size={20} />
                  </View>
                  <View style={styles.transportRouteBlock}>
                    <Text style={styles.transportLineNumber}>
                      {lang === 'IT' ? `Linea ${line.line}` : `Line ${line.line}`}
                    </Text>
                    <Text style={styles.transportRouteText} numberOfLines={1}>
                      {lineRoute}
                    </Text>
                  </View>
                </View>
                {isLineExpanded ? (
                  <ChevronDown color={colors.muted} size={20} />
                ) : (
                  <ChevronRight color={colors.muted} size={20} />
                )}
              </Pressable>

              {isLineExpanded && (
                <View style={styles.transportExpandedContent}>
                  <Text style={styles.transportPlatformText}>
                    {lang === 'IT' ? `Fermata: ${linePlatform}` : `Platform: ${linePlatform}`}
                  </Text>

                  <Text style={styles.transportDirectionHeader}>
                    {lang === 'IT' ? 'Corse di Andata' : 'Outbound Runs'}
                  </Text>
                  <View style={styles.transportRunsList}>
                    {line.runs
                      .filter((r) => r.direction === 'Andata')
                      .map((run) => {
                        const isActive = expandedRun === run.id;
                        return (
                          <Pressable
                            key={run.id}
                            style={[styles.transportRunChip, isActive && styles.transportRunChipActive]}
                            onPress={() => setExpandedRun(isActive ? null : run.id)}
                          >
                            <Text style={[styles.transportRunChipText, isActive && styles.transportRunChipTextActive]}>
                              {run.departureTime}
                            </Text>
                          </Pressable>
                        );
                      })}
                  </View>

                  <Text style={styles.transportDirectionHeader}>
                    {lang === 'IT' ? 'Corse di Ritorno' : 'Inbound Runs'}
                  </Text>
                  <View style={styles.transportRunsList}>
                    {line.runs
                      .filter((r) => r.direction === 'Ritorno')
                      .map((run) => {
                        const isActive = expandedRun === run.id;
                        return (
                          <Pressable
                            key={run.id}
                            style={[styles.transportRunChip, isActive && styles.transportRunChipActive]}
                            onPress={() => setExpandedRun(isActive ? null : run.id)}
                          >
                            <Text style={[styles.transportRunChipText, isActive && styles.transportRunChipTextActive]}>
                              {run.departureTime}
                            </Text>
                          </Pressable>
                        );
                      })}
                  </View>

                  {(() => {
                    const selectedRun = line.runs.find((r) => r.id === expandedRun);
                    if (!selectedRun) return null;

                    return (
                      <View style={styles.transportTimelineContainer}>
                        <Text style={styles.transportTimelineTitle}>
                          {lang === 'IT'
                            ? `Fermate e Orari (${selectedRun.departureTime})`
                            : `Stops and Times (${selectedRun.departureTime})`}
                        </Text>
                        {selectedRun.stops.map((stop, idx) => {
                          const isFirst = idx === 0;
                          const isLast = idx === selectedRun.stops.length - 1;
                          const stopName = lang === 'IT' ? stop.name : (stop.nameEN || stop.name);
                          const lineStyle = isFirst
                            ? { top: 14, bottom: 0 }
                            : isLast
                            ? { top: 0, height: 14 }
                            : { top: 0, bottom: 0 };
                          
                          return (
                            <View key={idx} style={styles.transportStopRow}>
                              <View style={[styles.transportStopLine, lineStyle]} />
                              <View
                                style={[
                                  styles.transportStopNode,
                                  (isFirst || isLast) && styles.transportStopNodeActive,
                                ]}
                              />
                              <View style={styles.transportStopInfo}>
                                <Text style={styles.transportStopName} numberOfLines={2}>
                                  {stopName}
                                </Text>
                                <Text style={styles.transportStopTime}>{stop.time}</Text>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    );
                  })()}
                </View>
              )}
            </View>
          );
        })}
      </View>

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
                  style={[styles.iconButton, { minHeight: 48, justifyContent: 'flex-start', paddingHorizontal: 16 }]}
                  onPress={() => {
                    setContactingActivity(null);
                    onOpenExternal('https://wa.me/393483161449');
                  }}
                >
                  <Text style={[styles.iconButtonText, { fontSize: 15, color: colors.ink }]}>💬 WhatsApp</Text>
                </Pressable>

                <Pressable
                  style={[styles.iconButton, { minHeight: 48, justifyContent: 'flex-start', paddingHorizontal: 16 }]}
                  onPress={() => {
                    setContactingActivity(null);
                    onOpenExternal('tel:+39089969166');
                  }}
                >
                  <Text style={[styles.iconButtonText, { fontSize: 15, color: colors.ink }]}>
                    📞 {lang === 'IT' ? 'Telefono' : 'Phone'}
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.iconButton, { minHeight: 48, justifyContent: 'flex-start', paddingHorizontal: 16 }]}
                  onPress={() => {
                    setContactingActivity(null);
                    onOpenExternal(`mailto:${contactingActivity.contact}`);
                  }}
                >
                  <Text style={[styles.iconButtonText, { fontSize: 15, color: colors.ink }]}>
                    ✉️ Email ({contactingActivity.contact})
                  </Text>
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
    </View>
  );
}
