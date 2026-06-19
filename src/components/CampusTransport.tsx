import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bus, ChevronDown, ChevronRight, Map } from 'lucide-react-native';

import { useTheme, radii } from '../theme';
import { translations } from '../constants';
import { busLines, PERIOD_LEGEND } from '../transportData';
import { SectionTitle } from './SectionTitle';

export function CampusTransport({
  t,
  lang,
  onSectionLayout,
}: {
  t: (key: keyof typeof translations.IT) => string;
  lang: 'IT' | 'EN';
  onSectionLayout?: (name: string, y: number) => void;
}) {
  const { colors, styles } = useTheme();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedLine, setExpandedLine] = useState<string | null>(null);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [terminalModalVisible, setTerminalModalVisible] = useState(false);

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

  return (
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

      {categories.map((category) => {
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
      })}

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
