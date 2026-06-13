import React, { useState, useEffect, useRef } from 'react';
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
  Platform,
  Linking,
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
  Navigation,
} from 'lucide-react-native';

import { useTheme, radii } from '../theme';
import type { CampusPoint, NewsItem, CanteenMenuData } from '../types';
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
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedNewsId, setExpandedNewsId] = useState<string | null>(null);
  const [terminalModalVisible, setTerminalModalVisible] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [mapType, setMapType] = useState<'default' | 'satellite' | 'terrain'>('default');
  const webViewRef = useRef<any>(null);
  const iframeRef = useRef<any>(null);
  const previewWebViewRef = useRef<any>(null);
  const previewIframeRef = useRef<any>(null);
  const [customPoint, setCustomPoint] = useState<CampusPoint | null>(null);
  const [loadingGeocoding, setLoadingGeocoding] = useState(false);

  const MAP_PREVIEW_HTML = MAP_HTML.replace(
    "var map = L.map('map', { zoomControl: false }).setView([40.7735, 14.7895], 15);",
    "var map = L.map('map', { zoomControl: false, dragging: false, touchZoom: false, doubleClickZoom: false, scrollWheelZoom: false, boxZoom: false, keyboard: false }).setView([40.7735, 14.7895], 15);"
  );

  // Sync web message event listener
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleWebMessage = (e: MessageEvent) => {
        try {
          const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
          if (data.type === 'selectPoint') {
            onSelectPoint(data.id);
            setCustomPoint(null);
          } else if (data.type === 'geocodingStart') {
            setLoadingGeocoding(true);
            setCustomPoint({
              id: `custom-${data.lat}-${data.lng}`,
              name: lang === 'IT' ? 'Caricamento...' : 'Loading...',
              type: lang === 'IT' ? 'Ricerca in corso' : 'Searching',
              detail: `${data.lat.toFixed(5)}, ${data.lng.toFixed(5)}`,
              lat: data.lat,
              lng: data.lng,
            });
          } else if (data.type === 'selectCustomPoint') {
            setLoadingGeocoding(false);
            setCustomPoint(data.point);
          }
        } catch (err) {}
      };
      window.addEventListener('message', handleWebMessage);
      return () => window.removeEventListener('message', handleWebMessage);
    }
  }, [onSelectPoint, lang]);

  // Sync selected point change to map
  useEffect(() => {
    const point = customPoint ? customPoint : selectedPoint;
    const msg = JSON.stringify({ type: 'selectPoint', lat: point.lat, lng: point.lng, name: point.name });
    if (Platform.OS === 'web') {
      iframeRef.current?.contentWindow?.postMessage(msg, '*');
      previewIframeRef.current?.contentWindow?.postMessage(msg, '*');
    } else {
      webViewRef.current?.injectJavaScript(`window.postMessage(${JSON.stringify(msg)}, '*'); true;`);
      previewWebViewRef.current?.injectJavaScript(`window.postMessage(${JSON.stringify(msg)}, '*'); true;`);
    }
  }, [selectedPointId, customPoint]);

  // Sync map type change to map
  useEffect(() => {
    const msg = JSON.stringify({ type: 'setMapType', mapType });
    if (Platform.OS === 'web') {
      iframeRef.current?.contentWindow?.postMessage(msg, '*');
      previewIframeRef.current?.contentWindow?.postMessage(msg, '*');
    } else {
      webViewRef.current?.injectJavaScript(`window.postMessage(${JSON.stringify(msg)}, '*'); true;`);
      previewWebViewRef.current?.injectJavaScript(`window.postMessage(${JSON.stringify(msg)}, '*'); true;`);
    }
  }, [mapType]);

  const handleWebViewMessage = (event: any) => {
    try {
      const data = typeof event.nativeEvent.data === 'string' ? JSON.parse(event.nativeEvent.data) : event.nativeEvent.data;
      if (data.type === 'selectPoint') {
        onSelectPoint(data.id);
        setCustomPoint(null);
      } else if (data.type === 'geocodingStart') {
        setLoadingGeocoding(true);
        setCustomPoint({
          id: `custom-${data.lat}-${data.lng}`,
          name: lang === 'IT' ? 'Caricamento...' : 'Loading...',
          type: lang === 'IT' ? 'Ricerca in corso' : 'Searching',
          detail: `${data.lat.toFixed(5)}, ${data.lng.toFixed(5)}`,
          lat: data.lat,
          lng: data.lng,
        });
      } else if (data.type === 'selectCustomPoint') {
        setLoadingGeocoding(false);
        setCustomPoint(data.point);
      }
    } catch (e) {
      console.warn('Error parsing WebView message:', e);
    }
  };
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

  const getPointDetails = (point: CampusPoint, currentLang: 'IT' | 'EN'): CampusPoint => {
    if (currentLang === 'EN' && point.id === 'p-1') {
      return { ...point, name: 'Fisciano Campus', type: 'University', detail: 'University of Salerno' };
    }
    return point;
  };

  const [expandedLine, setExpandedLine] = useState<string | null>(null);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [contactingActivity, setContactingActivity] = useState<{ name: string; when: string; contact: string } | null>(null);

  const transPoint = customPoint ? customPoint : getPointDetails(selectedPoint, lang);
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
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text style={styles.cardTitle}>{t('mapTitle')}</Text>
          <Pressable 
            onPress={() => setMapExpanded(true)}
            style={{ paddingVertical: 4, paddingHorizontal: 10, backgroundColor: colors.mint, borderRadius: radii.sm }}
          >
            <Text style={{ color: colors.forest, fontSize: 12, fontWeight: 'bold' }}>
              {lang === 'IT' ? 'Espandi' : 'Expand'}
            </Text>
          </Pressable>
        </View>

        {/* Map Preview Container */}
        <View 
          style={{ 
            height: 180, 
            borderRadius: radii.md, 
            overflow: 'hidden', 
            borderWidth: 1, 
            borderColor: colors.border,
            backgroundColor: colors.mint,
            position: 'relative',
            marginBottom: 12
          }}
        >
          {/* Real Leaflet Map rendered non-interactively */}
          {Platform.OS === 'web' ? (
            <iframe
              ref={previewIframeRef}
              srcDoc={MAP_PREVIEW_HTML}
              style={{ width: '100%', height: '100%', border: 'none' }}
              onLoad={() => {
                setTimeout(() => {
                  const point = customPoint || selectedPoint;
                  previewIframeRef.current?.contentWindow?.postMessage(JSON.stringify({ type: 'selectPoint', lat: point.lat, lng: point.lng, name: point.name }), '*');
                  previewIframeRef.current?.contentWindow?.postMessage(JSON.stringify({ type: 'setMapType', mapType }), '*');
                }, 300);
              }}
            />
          ) : (
            (() => {
              const { WebView } = require('react-native-webview');
              return (
                <WebView
                  ref={previewWebViewRef}
                  originWhitelist={['*']}
                  source={{ html: MAP_PREVIEW_HTML }}
                  style={{ flex: 1 }}
                  onMessage={handleWebViewMessage}
                  onLoadEnd={() => {
                    setTimeout(() => {
                      const point = customPoint || selectedPoint;
                      previewWebViewRef.current?.injectJavaScript(`window.postMessage(${JSON.stringify(JSON.stringify({ type: 'selectPoint', lat: point.lat, lng: point.lng, name: point.name }))}, '*'); true;`);
                      previewWebViewRef.current?.injectJavaScript(`window.postMessage(${JSON.stringify(JSON.stringify({ type: 'setMapType', mapType }))}, '*'); true;`);
                    }, 500);
                  }}
                />
              );
            })()
          )}

          {/* Transparent Pressable Overlay to capture clicks and avoid scrolling/gesture issues */}
          <Pressable 
            onPress={() => setMapExpanded(true)}
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'transparent',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Centered Premium Floating Badge */}
            <View style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              paddingVertical: 8, 
              paddingHorizontal: 14, 
              borderRadius: radii.sm, 
              borderWidth: 1, 
              borderColor: colors.border, 
              flexDirection: 'row', 
              alignItems: 'center', 
              gap: 8, 
              elevation: 4, 
              shadowColor: '#000', 
              shadowOffset: { width: 0, height: 2 }, 
              shadowOpacity: 0.15, 
              shadowRadius: 3 
            }}>
              <Map color={colors.forest} size={16} />
              <Text style={{ color: colors.forest, fontWeight: '800', fontSize: 12 }}>
                {lang === 'IT' ? 'Ingrandisci Mappa' : 'Expand Map'}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Selected Point Details */}
        <View style={styles.mapDetail}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.cardTitle}>{transPoint.name}</Text>
              <Text style={styles.rowSubtitle}>{transPoint.type}</Text>
              <Text style={[styles.bodyText, { marginTop: 4 }]}>{transPoint.detail}</Text>
            </View>
            <Pressable
              onPress={() => {
                const url = Platform.select({
                  ios: `maps://?daddr=${transPoint.lat},${transPoint.lng}`,
                  default: `https://www.google.com/maps/dir/?api=1&destination=${transPoint.lat},${transPoint.lng}`
                });
                Linking.openURL(url).catch(() => {
                  Alert.alert('Errore', 'Impossibile aprire l\'app Mappe');
                });
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingVertical: 8,
                paddingHorizontal: 12,
                backgroundColor: colors.forest,
                borderRadius: radii.sm,
                alignSelf: 'center',
              }}
            >
              <Navigation color={colors.surface} size={14} />
              <Text style={{ color: colors.surface, fontSize: 13, fontWeight: '800' }}>
                {lang === 'IT' ? 'Naviga' : 'Navigate'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Fullscreen Interactive Map Modal */}
      <Modal
        visible={mapExpanded}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setMapExpanded(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          {/* Header */}
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: colors.ink }}>
                {lang === 'IT' ? 'Mappa Interattiva Campus' : 'Interactive Campus Map'}
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                {lang === 'IT' ? 'Trascina e ingrandisci la mappa per navigare' : 'Drag and pinch to zoom the map'}
              </Text>
            </View>
            <Pressable onPress={() => setMapExpanded(false)} style={{ padding: 6 }}>
              <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 15 }}>
                {lang === 'IT' ? 'Chiudi' : 'Close'}
              </Text>
            </Pressable>
          </View>

          {/* Map Type Selector */}
          <View style={{ flexDirection: 'row', gap: 8, padding: 12, backgroundColor: colors.surface }}>
            {(['default', 'satellite', 'terrain'] as const).map((type) => {
              const label = type === 'default' ? (lang === 'IT' ? 'Predefinita' : 'Default') :
                            type === 'satellite' ? (lang === 'IT' ? 'Satellite' : 'Satellite') :
                            (lang === 'IT' ? 'Rilievo' : 'Terrain');
              const isActive = mapType === type;
              return (
                <Pressable
                  key={type}
                  onPress={() => setMapType(type)}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    backgroundColor: isActive ? colors.forest : colors.mint,
                    borderRadius: radii.sm,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: isActive ? colors.forest : colors.border,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: isActive ? colors.surface : colors.forest }}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Interactive Leaflet Map Box */}
          <View style={{ flex: 1 }}>
            {Platform.OS === 'web' ? (
              <iframe
                ref={iframeRef}
                srcDoc={MAP_HTML}
                style={{ width: '100%', height: '100%', border: 'none' }}
                onLoad={() => {
                  setTimeout(() => {
                    const point = customPoint || selectedPoint;
                    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ type: 'selectPoint', lat: point.lat, lng: point.lng, name: point.name }), '*');
                    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ type: 'setMapType', mapType }), '*');
                  }, 300);
                }}
              />
            ) : (
              (() => {
                const { WebView } = require('react-native-webview');
                return (
                  <WebView
                    ref={webViewRef}
                    originWhitelist={['*']}
                    source={{ html: MAP_HTML }}
                    style={{ flex: 1 }}
                    onMessage={handleWebViewMessage}
                    onLoadEnd={() => {
                      setTimeout(() => {
                        const point = customPoint || selectedPoint;
                        webViewRef.current?.injectJavaScript(`window.postMessage(${JSON.stringify(JSON.stringify({ type: 'selectPoint', lat: point.lat, lng: point.lng, name: point.name }))}, '*'); true;`);
                        webViewRef.current?.injectJavaScript(`window.postMessage(${JSON.stringify(JSON.stringify({ type: 'setMapType', mapType }))}, '*'); true;`);
                      }, 500);
                    }}
                  />
                );
              })()
            )}
          </View>

          {/* Detail card and Navigation in Modal */}
          <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: colors.ink }}>{transPoint.name}</Text>
                <Text style={{ fontSize: 13, color: colors.muted, marginTop: 2 }}>{transPoint.type}</Text>
                <Text style={{ fontSize: 12, color: colors.ink, marginTop: 4 }}>{transPoint.detail}</Text>
              </View>
              <Pressable
                onPress={() => {
                  const url = Platform.select({
                    ios: `maps://?daddr=${transPoint.lat},${transPoint.lng}`,
                    default: `https://www.google.com/maps/dir/?api=1&destination=${transPoint.lat},${transPoint.lng}`
                  });
                  Linking.openURL(url).catch(() => {
                    Alert.alert('Errore', 'Impossibile aprire l\'app Mappe');
                  });
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  backgroundColor: colors.forest,
                  borderRadius: radii.sm,
                }}
              >
                <Navigation color={colors.surface} size={14} />
                <Text style={{ color: colors.surface, fontSize: 13, fontWeight: '800' }}>
                  {lang === 'IT' ? 'Naviga' : 'Navigate'}
                </Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

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

const MAP_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>UNISA Campus Map</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { margin: 0; padding: 0; }
    #map { height: 100vh; width: 100vw; }
    .leaflet-popup-content-wrapper {
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .leaflet-popup-content {
      font-size: 14px;
      line-height: 1.4;
      font-weight: 600;
      color: #1A1C1E;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false }).setView([40.7735, 14.7895], 15);
    
    var layers = {
      default: L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: 'Map data &copy; Google'
      }),
      satellite: L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: 'Map data &copy; Google'
      }),
      terrain: L.tileLayer('https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: 'Map data &copy; Google'
      })
    };
    
    var currentLayer = layers.default;
    currentLayer.addTo(map);
    
    function setMapType(type) {
      map.removeLayer(currentLayer);
      currentLayer = layers[type] || layers.default;
      currentLayer.addTo(map);
    }
    
    var currentMarker = null;
    
    function selectPoint(lat, lng, name) {
      if (currentMarker) {
        currentMarker.setLatLng([lat, lng]);
      } else {
        currentMarker = L.marker([lat, lng]).addTo(map);
      }
      currentMarker.bindPopup('<b>' + name + '</b>');
      map.setView([lat, lng], 16, { animate: true });
      currentMarker.openPopup();
    }
    
    map.on('click', function(e) {
      var lat = e.latlng.lat;
      var lng = e.latlng.lng;
      
      if (currentMarker) {
        currentMarker.setLatLng([lat, lng]);
      } else {
        currentMarker = L.marker([lat, lng]).addTo(map);
      }
      currentMarker.bindPopup('<b>Caricamento...</b>').openPopup();
      
      // Notify parent that geocoding started
      var startMsg = JSON.stringify({ type: 'geocodingStart', lat: lat, lng: lng });
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(startMsg);
      } else {
        window.parent.postMessage(startMsg, '*');
      }

      fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + lat + '&lon=' + lng, {
        headers: {
          'Accept-Language': 'it,en'
        }
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        var name = data.name || data.display_name.split(',')[0] || 'Punto sulla mappa';
        if (!name || !isNaN(name) || name === 'bench' || name === 'yes') {
          name = data.address.road || 'Punto sulla mappa';
        }
        var detail = data.display_name || (lat.toFixed(5) + ', ' + lng.toFixed(5));
        var type = data.address.amenity || data.address.building || data.address.shop || data.address.tourism || 'Mappa';
        type = type.charAt(0).toUpperCase() + type.slice(1);

        currentMarker.bindPopup('<b>' + name + '</b>').openPopup();

        var msg = JSON.stringify({
          type: 'selectCustomPoint',
          point: {
            id: 'custom-' + lat + '-' + lng,
            name: name,
            type: type,
            detail: detail,
            lat: lat,
            lng: lng
          }
        });
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(msg);
        } else {
          window.parent.postMessage(msg, '*');
        }
      })
      .catch(function() {
        currentMarker.bindPopup('<b>Punto sulla mappa</b>').openPopup();
        var msg = JSON.stringify({
          type: 'selectCustomPoint',
          point: {
            id: 'custom-' + lat + '-' + lng,
            name: 'Punto sulla mappa',
            type: 'Mappa',
            detail: lat.toFixed(5) + ', ' + lng.toFixed(5),
            lat: lat,
            lng: lng
          }
        });
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(msg);
        } else {
          window.parent.postMessage(msg, '*');
        }
      });
    });
    
    window.addEventListener('message', function(e) {
      try {
        var data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data.type === 'selectPoint') {
          selectPoint(data.lat, data.lng, data.name);
        } else if (data.type === 'setMapType') {
          setMapType(data.mapType);
        }
      } catch (err) {}
    });
  </script>
</body>
</html>
`;
