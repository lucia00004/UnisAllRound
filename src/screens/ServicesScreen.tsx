import React, { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
} from 'react-native';
import {
  Library,
  ExternalLink,
  Ticket,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Archive,
  Trash2,
  RotateCcw,
} from 'lucide-react-native';

import { useTheme, radii } from '../theme';
import type { Ticket as TicketType } from '../types';
import { translations } from '../constants';
import {
  SectionTitle,
  ServiceTile,
  Field,
  DomainPicker,
  SegmentedControl,
  ActionButton,
  StatusBadge,
  SwipeableRow,
} from '../components';

export default function ServicesScreen({
  ticketDraft,
  setTicketDraft,
  onFeedback,
  onCreateTicket,
  onOpenExternal,
  t,
  tickets,
  archivedTicketIds,
  deletedTicketIds,
  onArchiveTicket,
  onDeleteTicket,
}: {
  ticketDraft: { title: string; location: string; body: string; priority: TicketType['priority']; ptaDomain: string };
  setTicketDraft: Dispatch<SetStateAction<{ title: string; location: string; body: string; priority: TicketType['priority']; ptaDomain: string }>>;
  onFeedback: () => void;
  onCreateTicket: () => void;
  onOpenExternal: (url: string) => void;
  t: (key: keyof typeof translations.IT) => string;
  tickets: TicketType[];
  archivedTicketIds: string[];
  deletedTicketIds: string[];
  onArchiveTicket: (id: string) => void;
  onDeleteTicket: (id: string) => void;
}) {
  const { colors, styles } = useTheme();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [activeStudentTicketTab, setActiveStudentTicketTab] = useState<'active' | 'archived'>('active');
  const isEnglish = t('langLabel') === 'Language';

  const faqCategories = isEnglish ? [
    {
      id: 'academics',
      title: '📚 Academics & Career',
      items: [
        { q: 'Are career statistics calculated automatically?', a: 'Yes. The app calculates passed exams, acquired CFU, arithmetic/weighted averages, and course progress percentage.' },
        { q: 'How do I add a passed exam?', a: 'On the Home tab, fill in the Course Name, CFU, and Grade in the "Add Exam" section and press "Save".' },
        { q: 'How do I accept or reject an exam grade?', a: 'In the "Published Results" section on the Home tab, tap the green checkmark to accept or the red cross to reject a grade.' },
        { q: 'As a professor, how do I publish an exam result?', a: 'On the Home tab, fill in the "Publish Exam Result" form with student name, course, and grade, then press publish.' }
      ]
    },
    {
      id: 'campus',
      title: '🌳 Campus & Services',
      items: [
        { q: 'How do I book a seat in the library?', a: 'In the Services tab, tap the "Book Library Seat" tile to be redirected to the official UNISA library booking portal.' },
        { q: 'Where can I find the canteen menu?', a: 'On the Campus tab, under "Main Canteen", you can see the daily menu, including traditional and vegetarian options.' },
        { q: 'What sports activities are available at CUS?', a: 'CUS Salerno offers activities like futsal, tennis, and gym. You can contact them directly using the quick links on the Campus tab.' },
        { q: 'How can I contact CUS Salerno?', a: 'Click the "Contact" button on any sports activity under the Campus tab to call them, write on WhatsApp, or send an email.' },
        { q: 'How do I access the University E-Learning platform?', a: 'In the Services section, tap the "UNISA E-Learning" shortcut to open the official university portal for course materials.' }
      ]
    },
    {
      id: 'support',
      title: '⚙️ Support & Account',
      items: [
        { q: 'Can I stay logged in on this device?', a: 'Yes. By checking the "Keep me logged in" option during login, your session will be securely stored on this device.' },
        { q: 'How do I report a campus maintenance issue?', a: 'In the Services tab, you can fill out the "Request PTA Support" form with a title, location, and description to open a ticket.' },
        { q: 'How do I change the app language?', a: 'In your Profile, you can switch between Italian and English using the selector at the bottom.' },
        { q: 'As PTA staff, how do I manage support tickets?', a: 'On your Home tab, you will see a list of open tickets. You can mark them "In Progress" or "Resolved" using the buttons.' },
        { q: 'How do I send feedback to the developers?', a: 'Fill in the "Send feedback to developers" field in the Services tab and press submit. It will open your mail client with a pre-filled message.' }
      ]
    }
  ] : [
    {
      id: 'academics',
      title: '📚 Didattica e Carriera',
      items: [
        { q: 'I dati carriera sono calcolati automaticamente?', a: 'Sì. L\'app calcola esami superati, CFU acquisiti, medie aritmetica e ponderata, e percentuale di avanzamento del corso.' },
        { q: 'Come inserisco un esame superato?', a: 'Dalla Home, nella sezione "Inserisci Esame", compila i campi relativi a Nome Corso, CFU e Voto e premi "Salva in Carriera".' },
        { q: 'Come posso accettare o rifiutare un voto d\'esame?', a: 'Nella sezione "Esiti Pubblicati" della Home, tocca il dispensatore verde di spunta per accettare o la croce rossa per rifiutarlo.' },
        { q: 'Come docente, come posso caricare un esame?', a: 'Dalla Home, compila il modulo "Pubblica Esito Esame" inserendo nome dello studente, insegnamento e voto, quindi premi invia.' }
      ]
    },
    {
      id: 'campus',
      title: '🌳 Campus e Servizi',
      items: [
        { q: 'Come posso prenotare un posto in biblioteca?', a: 'Nella sezione Servizi, premi sulla tile "Prenota Posto Biblioteca" per essere reindirizzato al portale ufficiale delle biblioteche UNISA.' },
        { q: 'Dove trovo il menu della mensa centrale?', a: 'Nella sezione Campus, sotto la voce "Mensa Centrale", trovi il menu del giorno con piatti tradizionali e vegetariani.' },
        { q: 'Quali attività sportive sono disponibili al CUS?', a: 'Il CUS Salerno offre attività come calcetto, tennis, sala pesi e altro. Puoi contattarli direttamente tramite i pulsanti nella sezione Campus.' },
        { q: 'Come posso contattare il CUS Salerno?', a: 'Fai clic sul pulsante "Contatta" su qualsiasi attività sportiva nella scheda Campus per telefonare, scrivere su WhatsApp o inviare un\'e-mail.' },
        { q: 'Come posso accedere all\'E-Learning di Ateneo?', a: 'Nella sezione Servizi, tocca la scorciatoia "E-Learning UNISA" per aprire direttamente la piattaforma istituzionale per le lezioni.' }
      ]
    },
    {
      id: 'support',
      title: '⚙️ Supporto e Account',
      items: [
        { q: 'Posso restare loggato su questo dispositivo?', a: 'Sì, selezionando l\'opzione "Resta loggato" durante l\'accesso, la tua sessione verrà salvata sul dispositivo in modo sicuro.' },
        { q: 'Come segnalo un malfunzionamento nel campus?', a: 'Nella sezione Servizi, puoi compilare il form "Richiedi supporto PTA" inserendo titolo, luogo e descrizione per aprire un ticket.' },
        { q: 'Come cambio la lingua dell\'applicazione?', a: 'Nel tuo Profilo, puoi selezionare la lingua desiderata (Italiano o Inglese) tramite il controllo in fondo alla pagina.' },
        { q: 'Come PTA, come posso gestire i ticket assegnati?', a: 'Nella tua Home compare la lista dei ticket aperti. Puoi modificarne lo stato in "In carico" o "Risolto" con i relativi pulsanti.' },
        { q: 'Come posso inviare un feedback o un suggerimento agli sviluppatori?', a: 'Compila il campo "Invia feedback agli sviluppatori" nel tab Servizi e premi invia: aprirà il tuo client mail precompilato per i 4 sviluppatori.' }
      ]
    }
  ];

  return (
    <View>
      <SectionTitle title={t('servicesTitle')} subtitle={t('servicesSubtitle')} />
      <View style={styles.tileGrid}>
        <ServiceTile label={t('bookLibrarySeat')} detail={t('bookLibrarySeatDetail')} icon={Library} onPress={() => onOpenExternal('https://biblioteche.unisa.it/')} />
        <ServiceTile label={t('elearning')} detail={t('elearningDetail')} icon={ExternalLink} onPress={() => onOpenExternal('https://elearning.unisa.it/')} />
      </View>

      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={[styles.cardTitle, { marginBottom: 0 }]}>{t('requestPtaSupport')}</Text>
          <Pressable 
            onPress={() => setShowHistory(!showHistory)}
            style={{ paddingVertical: 4, paddingHorizontal: 10, backgroundColor: showHistory ? colors.mint : colors.border, borderRadius: radii.sm }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: showHistory ? colors.forest : colors.ink }}>
              {showHistory 
                ? (isEnglish ? '✍️ New Request' : '✍️ Nuova Richiesta') 
                : (isEnglish ? '📁 History' : '📁 Storico')}
            </Text>
          </Pressable>
        </View>

        {showHistory ? (
          <View style={{ marginTop: 8 }}>
            <SegmentedControl
              options={[
                { value: 'active', label: isEnglish ? 'Active' : 'Attive' },
                { value: 'archived', label: isEnglish ? 'Archive' : 'Archivio' },
              ]}
              value={activeStudentTicketTab}
              onChange={(val) => setActiveStudentTicketTab(val as 'active' | 'archived')}
            />

            <View style={{ gap: 12, marginTop: 12 }}>
              {(() => {
                const filtered = activeStudentTicketTab === 'active'
                  ? tickets.filter((t) => t.status !== 'Chiuso' && !archivedTicketIds.includes(t.id) && !deletedTicketIds.includes(t.id))
                  : tickets.filter((t) => (archivedTicketIds.includes(t.id) || t.status === 'Chiuso') && !deletedTicketIds.includes(t.id));

                if (filtered.length === 0) {
                  return (
                    <Text style={{ color: colors.muted, fontStyle: 'italic', paddingVertical: 12, textAlign: 'center', fontSize: 13 }}>
                      {activeStudentTicketTab === 'active'
                        ? (isEnglish ? 'You have no active requests.' : 'Nessuna richiesta attiva.')
                        : (isEnglish ? 'You have no archived requests.' : 'Nessuna richiesta archiviata.')}
                    </Text>
                  );
                }

                return filtered.map((t) => (
                  <SwipeableRow
                    key={t.id}
                    onSwipeRight={t.status === 'Chiuso' ? undefined : () => onArchiveTicket(t.id)}
                    onSwipeLeft={() => onDeleteTicket(t.id)}
                    leftLabel={activeStudentTicketTab === 'active' ? (isEnglish ? 'Archive' : 'Archivia') : (isEnglish ? 'Restore' : 'Ripristina')}
                    leftIcon={activeStudentTicketTab === 'active' ? Archive : RotateCcw}
                    rightLabel={isEnglish ? 'Delete' : 'Elimina'}
                    rightIcon={Trash2}
                  >
                    <View style={{ padding: 12, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <Text style={{ fontWeight: '700', fontSize: 14, color: colors.ink, flex: 1, marginRight: 8 }}>
                          {t.title}
                        </Text>
                        <StatusBadge value={t.status} />
                      </View>
                      <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
                        {t.location} · {t.date}
                      </Text>
                      <Text style={{ fontSize: 13, color: colors.ink }}>
                        {t.body}
                      </Text>
                    </View>
                  </SwipeableRow>
                ));
              })()}
            </View>
          </View>
        ) : (
          <>
            <Field label={t('ticketTitleLabel')} required={true} value={ticketDraft.title} onChangeText={(value) => setTicketDraft((draft) => ({ ...draft, title: value }))} />
            <Field label={t('ticketLocationLabel')} required={true} value={ticketDraft.location} onChangeText={(value) => setTicketDraft((draft) => ({ ...draft, location: value }))} />
            <DomainPicker
              label={isEnglish ? 'Request Scope' : 'Ambito della richiesta'}
              value={ticketDraft.ptaDomain}
              onSelect={(value) => setTicketDraft((draft) => ({ ...draft, ptaDomain: value }))}
              required={true}
              lang={isEnglish ? 'EN' : 'IT'}
            />
            <Field label={t('ticketDescLabel')} required={true} multiline value={ticketDraft.body} onChangeText={(value) => setTicketDraft((draft) => ({ ...draft, body: value }))} />
            <Text style={styles.inputLabel}>
              {t('ticketPriorityLabel')}
              <Text style={{ color: colors.danger }}> *</Text>
            </Text>
            <SegmentedControl
              options={[
                { value: 'Bassa', label: t('ticketLow') },
                { value: 'Media', label: t('ticketMedium') },
                { value: 'Alta', label: t('ticketHigh') },
              ]}
              value={ticketDraft.priority}
              onChange={(value) => setTicketDraft((draft) => ({ ...draft, priority: value as TicketType['priority'] }))}
            />
            <ActionButton label={t('submitTicketBtn')} icon={Ticket} onPress={onCreateTicket} />
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('feedbackTitle')}</Text>
        <ActionButton label={t('submitFeedbackBtn')} icon={MessageSquare} onPress={onFeedback} />
      </View>

      <SectionTitle title={t('faqTitle')} subtitle={t('faqSubtitle')} />
      {faqCategories.map((cat) => {
        const isExpanded = expandedCategory === cat.id;
        const ToggleIcon = isExpanded ? ChevronDown : ChevronRight;
        return (
          <View key={cat.id} style={{ marginBottom: 10 }}>
            <Pressable
              style={[
                styles.card,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 14,
                  marginVertical: 0,
                }
              ]}
              onPress={() => {
                setExpandedCategory(isExpanded ? null : cat.id);
                setExpandedQuestion(null);
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink }}>
                {cat.title}
              </Text>
              <ToggleIcon color={colors.teal} size={20} />
            </Pressable>
            
            {isExpanded ? (
              <View style={{ backgroundColor: colors.surface, borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 4, marginTop: 4, borderWidth: 1, borderColor: colors.border }}>
                {cat.items.map((row, index) => {
                  const isQExpanded = expandedQuestion === row.q;
                  const QToggleIcon = isQExpanded ? ChevronDown : ChevronRight;
                  return (
                    <View key={row.q} style={{ borderBottomWidth: index === cat.items.length - 1 ? 0 : 1, borderBottomColor: colors.border }}>
                      <Pressable
                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}
                        onPress={() => setExpandedQuestion(isQExpanded ? null : row.q)}
                      >
                        <Text style={{ fontWeight: '600', color: colors.ink, fontSize: 14, flex: 1, paddingRight: 8 }}>{row.q}</Text>
                        <QToggleIcon color={colors.muted} size={16} />
                      </Pressable>
                      {isQExpanded ? (
                        <View style={{ paddingBottom: 12, paddingTop: 2 }}>
                          <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 20 }}>{row.a}</Text>
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
