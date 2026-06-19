import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Map, Navigation } from 'lucide-react-native';

import { useTheme, radii } from '../theme';
import type { CampusPoint } from '../types';
import { translations } from '../constants';
import { MAP_HTML } from '../constants/mapHtml';

export function CampusMapWidget({
  selectedPoint,
  selectedPointId,
  onSelectPoint,
  onOpenExternal,
  t,
  lang,
}: {
  selectedPoint: CampusPoint;
  selectedPointId: string;
  onSelectPoint: (id: string) => void;
  onOpenExternal: (url: string) => void;
  t: (key: keyof typeof translations.IT) => string;
  lang: 'IT' | 'EN';
}) {
  const { colors, styles } = useTheme();
  const [mapExpanded, setMapExpanded] = useState(false);
  const [mapType, setMapType] = useState<'default' | 'satellite'>('default');
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
      console.log('Error parsing WebView message:', e);
    }
  };

  const getPointDetails = (point: CampusPoint, currentLang: 'IT' | 'EN'): CampusPoint => {
    if (currentLang === 'EN' && point.id === 'p-1') {
      return { ...point, name: 'Fisciano Campus', type: 'University', detail: 'University of Salerno' };
    }
    return point;
  };

  const transPoint = customPoint ? customPoint : getPointDetails(selectedPoint, lang);

  return (
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
            {(['default', 'satellite'] as const).map((type) => {
              const label = type === 'default' ? (lang === 'IT' ? 'Predefinita' : 'Default') :
                            (lang === 'IT' ? 'Satellite' : 'Satellite');
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
    </View>
  );
}
