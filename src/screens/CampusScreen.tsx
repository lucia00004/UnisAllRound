import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
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
  Map,
  X,
} from 'lucide-react-native';

import { colors, radii } from '../theme';
import { styles } from '../styles';
import type { CampusPoint, NewsItem } from '../types';
import { translations } from '../constants';
import { getWeatherInfo } from '../utils';
import { SectionTitle, ListRow } from '../components';
import { campusPoints } from '../data';
import { busLines, PERIOD_LEGEND } from '../transportData';

function WhatsappIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M12.004 2C6.48 2 2 6.48 2 12c0 2.17.7 4.19 1.89 5.83L2.03 22l4.31-1.13c1.54.83 3.3 1.3 5.18 1.3 5.52 0 10-4.48 10-10S17.52 2 12.004 2z" fill="#25D366" />
      <Path d="M17.22 14.85c-.29-.14-1.7-1.12-1.95-1.22-.26-.1-.45-.14-.64.14-.19.29-.74.93-.9 1.12-.17.19-.34.22-.64.07-.3-.15-1.27-.47-2.42-1.5-1.15-1.03-1.63-1.63-1.85-2.02-.23-.39-.02-.6.18-.8.18-.18.39-.45.58-.68.19-.23.26-.39.39-.65.13-.26.06-.48-.03-.68-.1-.19-.84-2.03-1.15-2.77-.3-.73-.61-.63-.84-.64-.21-.01-.45-.01-.69-.01-.24 0-.64.09-.98.46-.34.37-1.3 1.27-1.3 3.11s1.34 3.61 1.53 3.86c.19.25 2.63 4.02 6.37 5.63.89.38 1.58.61 2.13.79.89.28 1.7.24 2.34.15.72-.1 2.22-.91 2.53-1.79.31-.88.31-1.64.22-1.79-.09-.15-.34-.24-.63-.38z" fill="#FFF" />
    </Svg>
  );
}

function PhoneIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.forest} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </Svg>
  );
}

function EmailIcon() {
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
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedNewsId, setExpandedNewsId] = useState<string | null>(null);
  const [terminalModalVisible, setTerminalModalVisible] = useState(false);
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
        const isExpanded = expandedNewsId === item.id;
        return (
          <ListRow
            key={item.id}
            icon={Megaphone}
            title={title}
            subtitle={body}
            meta={tag}
            onPress={() => setExpandedNewsId(isExpanded ? null : item.id)}
            expanded={isExpanded}
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
          <ListRow key={day.day} icon={Utensils} title={`${day.day}: ${day.first}`} subtitle={`${day.second} · ${t('vegLabel')}: ${day.veg}`} compact hideChevron={true} />
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
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 10 }}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.sectionHeading}>{t('transportTitle')}</Text>
            <Text style={styles.sectionSubtitle}>{t('transportSubtitle')}</Text>
          </View>
          <Pressable
            onPress={() => setTerminalModalVisible(true)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 14,
              backgroundColor: colors.mint,
              borderRadius: radii.sm,
              borderWidth: 1,
              borderColor: colors.forest,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Map color={colors.forest} size={16} />
            <Text style={{ color: colors.forest, fontWeight: '800', fontSize: 13 }}>
              Terminal
            </Text>
          </Pressable>
        </View>
        {(() => {
          const categories = [
            'Salerno',
            'Avellino',
            'Benevento',
            'Cava-Nocera-Paesi Vesuviani',
            'Napoli',
            'Sud-Battipaglia',
            'Fuori Regione',
            'Campus'
          ];
          return categories.map((category) => {
            const isCategoryExpanded = expandedCategory === category;
            const categoryLines = busLines.filter((l) => l.category === category);
            
            return (
              <View key={category} style={{ marginBottom: 12 }}>
                <Pressable
                  onPress={() => {
                    setExpandedCategory(isCategoryExpanded ? null : category);
                    setExpandedLine(null);
                    setExpandedRun(null);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: colors.surface,
                    borderWidth: 1.5,
                    borderColor: colors.border,
                    borderRadius: radii.md,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Bus color={colors.forest} size={20} />
                    <Text style={{ fontSize: 15, fontWeight: '800', color: colors.ink }}>
                      {category}
                    </Text>
                  </View>
                  {isCategoryExpanded ? (
                    <ChevronDown color={colors.muted} size={20} />
                  ) : (
                    <ChevronRight color={colors.muted} size={20} />
                  )}
                </Pressable>

                {isCategoryExpanded && (
                  <View style={{ marginTop: 10, paddingLeft: 6 }}>
                    {categoryLines.length === 0 ? (
                      <View style={[styles.transportCard, { paddingVertical: 20, alignItems: 'center' }]}>
                        <Text style={{ color: colors.muted, fontStyle: 'italic', fontSize: 13 }}>
                          {lang === 'IT' ? 'Nessuna linea registrata per questa tratta.' : 'No lines registered for this route.'}
                        </Text>
                      </View>
                    ) : (
                      categoryLines.map((line) => {
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
                                          style={[styles.transportRunChip, isActive && styles.transportRunChipActive, { alignItems: 'center', minWidth: 80 }]}
                                          onPress={() => setExpandedRun(isActive ? null : run.id)}
                                        >
                                          <Text style={[styles.transportRunChipText, isActive && styles.transportRunChipTextActive]}>
                                            {run.departureTime}
                                          </Text>
                                          {run.periodCode && (
                                            <Text style={{ fontSize: 9, color: isActive ? colors.forest : colors.muted, marginTop: 2, fontWeight: '600' }}>
                                              {run.periodCode}
                                            </Text>
                                          )}
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
                                          style={[styles.transportRunChip, isActive && styles.transportRunChipActive, { alignItems: 'center', minWidth: 80 }]}
                                          onPress={() => setExpandedRun(isActive ? null : run.id)}
                                        >
                                          <Text style={[styles.transportRunChipText, isActive && styles.transportRunChipTextActive]}>
                                            {run.departureTime}
                                          </Text>
                                          {run.periodCode && (
                                            <Text style={{ fontSize: 9, color: isActive ? colors.forest : colors.muted, marginTop: 2, fontWeight: '600' }}>
                                              {run.periodCode}
                                            </Text>
                                          )}
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

                                      {selectedRun.periodCode && (
                                        <View style={{ marginBottom: 10, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                                          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.forest }}>
                                            {lang === 'IT' ? 'Periodo di servizio:' : 'Service Period:'}{' '}
                                            <Text style={{ color: colors.ink, fontWeight: '500' }}>
                                              {selectedRun.periodCode} - {PERIOD_LEGEND[selectedRun.periodCode]?.[lang] || selectedRun.periodCode}
                                            </Text>
                                          </Text>
                                        </View>
                                      )}

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
                      })
                    )}
                  </View>
                )}
              </View>
            );
          });
        })()}
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

      {/* Modal Mappa Terminal */}
      <Modal
        visible={terminalModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setTerminalModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{ padding: 18, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: colors.ink }}>
                {lang === 'IT' ? 'Mappa Stalli Terminal Bus' : 'Bus Terminal Stops Map'}
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                UNISA - Fisciano
              </Text>
            </View>
            <Pressable onPress={() => setTerminalModalVisible(false)} style={{ padding: 6 }}>
              <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 15 }}>
                {lang === 'IT' ? 'Chiudi' : 'Close'}
              </Text>
            </Pressable>
          </View>
          
          <ScrollView 
            contentContainerStyle={{ padding: 10 }}
            horizontal={true}
          >
            <ScrollView 
              contentContainerStyle={{ padding: 10 }}
              maximumZoomScale={3.0}
              minimumZoomScale={1.0}
            >
              <Image
                source={require('../../assets/terminal_map.png')}
                style={{
                  width: 1000,
                  height: 625,
                  resizeMode: 'contain',
                }}
              />
            </ScrollView>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
