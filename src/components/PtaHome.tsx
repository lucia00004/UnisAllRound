import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import {
  Ticket,
  ClipboardList,
  Archive,
  RotateCcw,
  Trash2,
  ChevronDown,
  ChevronRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react-native';

import { useTheme, radii } from '../theme';
import type { UserProfile, Ticket as TicketType } from '../types';
import { translations } from '../constants';
import { StatCard } from './StatCard';
import { SegmentedControl } from './SegmentedControl';
import { SectionTitle } from './SectionTitle';
import { SwipeableRow } from './SwipeableRow';
import { StatusBadge } from './StatusBadge';
import { IconButton } from './IconButton';

export function PtaHome({
  user,
  isWide,
  t,
  tickets,
  onTicketStatus,
  onSectionLayout,
  archivedTicketIds,
  deletedTicketIds,
  onArchiveTicket,
  onDeleteTicket,
}: {
  user: UserProfile;
  isWide: boolean;
  t: (key: keyof typeof translations.IT) => string;
  tickets: TicketType[];
  onTicketStatus: (id: string, status: TicketType['status']) => void;
  onSectionLayout?: (name: string, y: number) => void;
  archivedTicketIds: string[];
  deletedTicketIds: string[];
  onArchiveTicket: (id: string) => void;
  onDeleteTicket: (id: string) => void;
}) {
  const { colors, styles } = useTheme();
  const [activePtaTicketTab, setActivePtaTicketTab] = useState<'active' | 'archived'>('active');
  const [archiveExpanded, setArchiveExpanded] = useState(false);
  const [filterDay, setFilterDay] = useState('Tutti');
  const [filterMonth, setFilterMonth] = useState('Tutti');
  const [filterYear, setFilterYear] = useState('Tutti');
  const [pickerConfig, setPickerConfig] = useState<{ visible: boolean; type: 'day' | 'month' | 'year'; options: string[] } | null>(null);

  const appLang = user?.language || 'IT';

  return (
    <View style={{ marginTop: 10 }}>
      <View style={[styles.quickGrid, isWide && styles.quickGridWide]}>
        <StatCard
          label={t('openTickets')}
          value={`${tickets.filter(t => t.status !== 'Chiuso').length}`}
          icon={Ticket}
          tone="coral"
        />
        <StatCard
          label={t('tasksToday')}
          value={`${tickets.filter(t => t.status === 'In carico').length}`}
          icon={ClipboardList}
          tone="blue"
        />
      </View>

      <SectionTitle title={t('ptaArea')} subtitle={t('ptaAreaSubtitle')} />

      <View onLayout={(e) => onSectionLayout?.('tickets', e.nativeEvent.layout.y)}>
        <SectionTitle title={t('pendingRequests')} subtitle={t('pendingRequestsSubtitle')} />
        
        <SegmentedControl
          options={[
            { value: 'active', label: appLang === 'IT' ? 'Attive' : 'Active' },
            { value: 'archived', label: appLang === 'IT' ? 'Archivio' : 'Archive' },
          ]}
          value={activePtaTicketTab}
          onChange={(val) => setActivePtaTicketTab(val as 'active' | 'archived')}
        />

        <View style={{ marginTop: 8 }}>
          {(() => {
            const filtered = activePtaTicketTab === 'active'
              ? tickets.filter((t) => t.status !== 'Chiuso' && t.domain === user.ptaDomain && (t.status === 'Aperto' || t.assignedTo === user.id || !t.assignedTo) && !archivedTicketIds.includes(t.id) && !deletedTicketIds.includes(t.id))
              : tickets.filter((t) => t.domain === user.ptaDomain && (t.assignedTo === user.id || !t.assignedTo) && (archivedTicketIds.includes(t.id) || t.status === 'Chiuso') && !deletedTicketIds.includes(t.id));

            if (filtered.length === 0) {
              return (
                <Text style={{ color: colors.muted, fontStyle: 'italic', paddingVertical: 12, textAlign: 'center', fontSize: 13 }}>
                  {activePtaTicketTab === 'active'
                    ? (appLang === 'IT' ? 'Nessuna richiesta attiva per il tuo ambito.' : 'No active requests for your scope.')
                    : (appLang === 'IT' ? 'Nessuna richiesta archiviata.' : 'No archived requests.')}
                </Text>
              );
            }
            return filtered.map((ticketItem) => (
              <SwipeableRow
                key={ticketItem.id}
                onSwipeRight={ticketItem.status === 'Chiuso' ? undefined : () => onArchiveTicket(ticketItem.id)}
                onSwipeLeft={() => onDeleteTicket(ticketItem.id)}
                leftLabel={activePtaTicketTab === 'active' ? (appLang === 'IT' ? 'Archivia' : 'Archive') : (appLang === 'IT' ? 'Ripristina' : 'Restore')}
                leftIcon={activePtaTicketTab === 'active' ? Archive : RotateCcw}
                rightLabel={appLang === 'IT' ? 'Elimina' : 'Delete'}
                rightIcon={Trash2}
              >
                <View style={[styles.card, { marginBottom: 0 }]}>
                  <View style={styles.ticketHeader}>
                    <View style={styles.flexOne}>
                      <Text style={styles.cardTitle}>{ticketItem.title}</Text>
                      <Text style={styles.rowSubtitle}>
                        {ticketItem.location} · {t('ticketPriorityLabel')} {ticketItem.priority} · {appLang === 'IT' ? 'Richiedente' : 'Requester'}: {ticketItem.requester}
                      </Text>
                    </View>
                    <StatusBadge value={ticketItem.status} />
                  </View>
                  <Text style={styles.bodyText}>{ticketItem.body}</Text>
                  <View style={styles.rowActions}>
                    <IconButton label={t('takeTicket')} icon={CheckCircle2} onPress={() => onTicketStatus(ticketItem.id, 'In carico')} />
                    <IconButton label={appLang === 'IT' ? 'Sospendi' : 'Suspend'} icon={Clock} onPress={() => onTicketStatus(ticketItem.id, 'In sospeso')} />
                    <IconButton label={t('closeTicket')} icon={ShieldCheck} onPress={() => onTicketStatus(ticketItem.id, 'Chiuso')} />
                  </View>
                </View>
              </SwipeableRow>
            ));
          })()}
        </View>
      </View>

      {/* Ticket Archive Section */}
      <View style={{ marginTop: 16 }}>
        <Pressable
          style={[styles.card, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, marginVertical: 0 }]}
          onPress={() => setArchiveExpanded(!archiveExpanded)}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink }}>
            {appLang === 'IT' ? '📁 Archivio Storico Richieste' : '📁 Request History Archive'}
          </Text>
          {archiveExpanded ? <ChevronDown color={colors.forest} size={20} /> : <ChevronRight color={colors.forest} size={20} />}
        </Pressable>

        {archiveExpanded ? (
          <View style={{ backgroundColor: colors.surface, borderRadius: radii.md, padding: 12, marginTop: 4, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.muted, marginBottom: 8 }}>
              {appLang === 'IT' ? 'FILTRA PER DATA:' : 'FILTER BY DATE:'}
            </Text>
            
            {/* Filter Controls Row */}
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
              {/* Day Picker */}
              <Pressable
                onPress={() => setPickerConfig({
                  visible: true,
                  type: 'day',
                  options: ['Tutti', ...Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))]
                })}
                style={{ flex: 1, padding: 10, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.ink }} numberOfLines={1}>
                  {appLang === 'IT' ? `GG: ${filterDay}` : `Day: ${filterDay}`}
                </Text>
              </Pressable>

              {/* Month Picker */}
              <Pressable
                onPress={() => setPickerConfig({
                  visible: true,
                  type: 'month',
                  options: ['Tutti', ...Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))]
                })}
                style={{ flex: 1, padding: 10, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.ink }} numberOfLines={1}>
                  {appLang === 'IT' ? `MM: ${filterMonth}` : `Month: ${filterMonth}`}
                </Text>
              </Pressable>

              {/* Year Picker */}
              <Pressable
                onPress={() => setPickerConfig({
                  visible: true,
                  type: 'year',
                  options: ['Tutti', '2025', '2026', '2027']
                })}
                style={{ flex: 1, padding: 10, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.ink }} numberOfLines={1}>
                  {appLang === 'IT' ? `AA: ${filterYear}` : `Year: ${filterYear}`}
                </Text>
              </Pressable>
            </View>

            {/* Filtered Tickets List */}
            <View style={{ gap: 8 }}>
              {(() => {
                const filtered = tickets.filter((ticket) => {
                  if (ticket.domain !== user.ptaDomain) return false;
                  if (!ticket.date) return false;
                  const y = ticket.date.substring(0, 4);
                  const m = ticket.date.substring(5, 7);
                  const d = ticket.date.substring(8, 10);
                  
                  if (filterYear !== 'Tutti' && y !== filterYear) return false;
                  if (filterMonth !== 'Tutti' && m !== filterMonth) return false;
                  if (filterDay !== 'Tutti' && d !== filterDay) return false;
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <Text style={{ color: colors.muted, fontStyle: 'italic', paddingVertical: 10, textAlign: 'center' }}>
                      {appLang === 'IT' ? 'Nessun ticket corrispondente ai filtri.' : 'No tickets matching filters.'}
                    </Text>
                  );
                }

                return filtered.map((ticketItem) => (
                  <View key={ticketItem.id} style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={{ fontWeight: '700', color: colors.ink, fontSize: 14, flex: 1, marginRight: 8 }} numberOfLines={1}>
                        {ticketItem.title}
                      </Text>
                      <StatusBadge value={ticketItem.status} />
                    </View>
                    <Text style={{ fontSize: 12, color: colors.muted }}>
                      {ticketItem.location} · {ticketItem.date.split('-').reverse().join('/')}
                    </Text>
                  </View>
                ));
              })()}
            </View>
          </View>
        ) : null}
      </View>

      {/* Picker Modal for Archive Filters */}
      {pickerConfig && pickerConfig.visible ? (
        <Modal transparent visible animationType="fade" onRequestClose={() => setPickerConfig(null)}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }} onPress={() => setPickerConfig(null)}>
            <View style={{ backgroundColor: colors.surface, borderRadius: radii.lg, maxHeight: 400, padding: 18, borderWidth: 1.5, borderColor: colors.border }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: colors.ink, marginBottom: 12 }}>
                {pickerConfig.type === 'day' ? (appLang === 'IT' ? 'Filtra per Giorno' : 'Filter by Day') :
                 pickerConfig.type === 'month' ? (appLang === 'IT' ? 'Filtra per Mese' : 'Filter by Month') :
                 (appLang === 'IT' ? 'Filtra per Anno' : 'Filter by Year')}
              </Text>
              <ScrollView>
                {pickerConfig.options.map((opt) => (
                  <Pressable
                    key={opt}
                    onPress={() => {
                      if (pickerConfig.type === 'day') setFilterDay(opt);
                      if (pickerConfig.type === 'month') setFilterMonth(opt);
                      if (pickerConfig.type === 'year') setFilterYear(opt);
                      setPickerConfig(null);
                    }}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border
                    }}
                  >
                    <Text style={{ fontSize: 16, color: colors.ink, fontWeight: '500' }}>
                      {opt}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}
