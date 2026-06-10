import React from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { View, Text } from 'react-native';
import { User, Save, LogOut, Trash2 } from 'lucide-react-native';

import { colors } from '../theme';
import { styles } from '../styles';
import type { UserProfile, Role, DraftProfile } from '../types';
import { translations } from '../constants';
import { capitalizeWords, parsePhone } from '../utils';
import {
  SectionTitle,
  Field,
  CustomPicker,
  MultiSelectPicker,
  DomainPicker,
  SegmentedControl,
  ActionButton,
} from '../components';
import {
  PHONE_PREFIXES,
  UNISA_DEPARTMENTS,
  getCoursesForDepartment,
  getTeachingsForDegrees,
} from '../data';

export default function ProfileScreen({
  user,
  draft,
  setDraft,
  onLanguageChange,
  onSave,
  onDelete,
  onLogout,
  t,
}: {
  user: UserProfile;
  draft: DraftProfile;
  setDraft: Dispatch<SetStateAction<DraftProfile>>;
  onLanguageChange: (lang: 'IT' | 'EN') => void;
  onSave: () => void;
  onDelete: () => void;
  onLogout: () => void;
  t: (key: keyof typeof translations.IT) => string;
}) {
  const getRoleLabelForProfile = (roleName: Role, currentLang: 'IT' | 'EN') => {
    if (roleName === 'Studente') return currentLang === 'IT' ? 'Studente' : 'Student';
    if (roleName === 'Docente') return currentLang === 'IT' ? 'Docente' : 'Professor';
    if (roleName === 'PTA') return currentLang === 'IT' ? 'PTA' : 'Staff';
    return roleName;
  };

  const lang = draft.language;
  const { prefix: profilePhonePrefix, number: profilePhoneNumber } = parsePhone(draft.phone);

  return (
    <View>
      <SectionTitle title={t('profileTitle')} subtitle={t('profileSubtitle')} />
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <User color={colors.surface} size={28} />
        </View>
        <View style={styles.flexOne}>
          <Text style={styles.profileName}>
            {capitalizeWords(user.name)} {capitalizeWords(user.surname)}
          </Text>
          <Text style={styles.rowSubtitle}>
            {getRoleLabelForProfile(user.role, lang)}
            {user.role !== 'PTA' ? ` · ${capitalizeWords(user.department)}` : ''}
            {user.role === 'Studente' && user.degreeCourse ? ` · ${capitalizeWords(user.degreeCourse)}` : ''}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('personalDataTitle')}</Text>
        <View style={styles.formGrid}>
          <Field label={t('name')} value={draft.name} onChangeText={(value) => setDraft((current) => ({ ...current, name: value }))} />
          <Field label={t('surname')} value={draft.surname} onChangeText={(value) => setDraft((current) => ({ ...current, surname: value }))} />
        </View>
        <Field label={t('email')} autoCapitalize="none" value={draft.email} onChangeText={(value) => setDraft((current) => ({ ...current, email: value }))} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ width: 100 }}>
            <CustomPicker
              label={draft.language === 'IT' ? 'Prefisso' : 'Prefix'}
              value={profilePhonePrefix}
              options={PHONE_PREFIXES}
              onSelect={(val) => setDraft((current) => ({ ...current, phone: `${val} ${profilePhoneNumber}` }))}
              lang={draft.language}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Field
              label={t('phone')}
              required
              keyboardType="phone-pad"
              value={profilePhoneNumber}
              onChangeText={(value) => {
                const digits = value.replace(/\D/g, '').slice(0, 11);
                setDraft((current) => ({ ...current, phone: `${profilePhonePrefix} ${digits}` }));
              }}
            />
          </View>
        </View>
        {user.role !== 'PTA' ? (
          <CustomPicker
            label={user.role === 'Studente' ? (draft.language === 'IT' ? 'Dipartimento' : 'Department') : t('department')}
            value={draft.department}
            options={UNISA_DEPARTMENTS}
            onSelect={(value) => setDraft((current) => ({ ...current, department: value }))}
            lang={draft.language}
            disabled={user.role === 'Studente' || user.role === 'Docente'}
          />
        ) : null}
        {user.role === 'Studente' ? (
          <>
            <CustomPicker
              label={draft.language === 'IT' ? 'Corso di laurea' : 'Degree Course'}
              value={draft.degreeCourse || ''}
              options={getCoursesForDepartment(user.department).map((c) => c.name)}
              onSelect={(value) => setDraft((current) => ({ ...current, degreeCourse: value }))}
              lang={draft.language}
              disabled={user.role === 'Studente'}
            />
            <Field
              label={draft.language === 'IT' ? 'Matricola' : 'Student ID'}
              value={draft.matricola || ''}
              onChangeText={() => {}}
              editable={false}
            />
          </>
        ) : null}
        {user.role === 'Docente' ? (
          <>
            <MultiSelectPicker
              label={draft.language === 'IT' ? 'Corsi di laurea di riferimento' : 'Reference Degree Courses'}
              values={draft.teacherDegrees || []}
              options={getCoursesForDepartment(user.department).map((c) => c.name)}
              onSelect={(value) => setDraft((current) => ({ 
                ...current, 
                teacherDegrees: value,
                teachings: (current.teachings || []).filter((t) => getTeachingsForDegrees(value).includes(t))
              }))}
              lang={draft.language}
            />
            <MultiSelectPicker
              label={draft.language === 'IT' ? 'Insegnamenti tenuti' : 'Teachings Held'}
              values={draft.teachings || []}
              options={getTeachingsForDegrees(draft.teacherDegrees || [])}
              onSelect={(value) => setDraft((current) => ({ ...current, teachings: value }))}
              lang={draft.language}
            />
          </>
        ) : null}
        {user.role === 'PTA' ? (
          <DomainPicker
            label={draft.language === 'IT' ? 'Ambito lavorativo' : 'Work Scope'}
            value={draft.ptaDomain || ''}
            onSelect={(value) => setDraft((current) => ({ ...current, ptaDomain: value }))}
            required={true}
            lang={draft.language}
            disabled={false}
          />
        ) : null}
        {user.role === 'PTA' ? (
          <View style={{ marginTop: 12 }}>
            <Text style={[styles.cardTitle, { fontSize: 15, marginTop: 8 }]}>
              {draft.language === 'IT' ? 'Orario di lavoro (Turni)' : 'Work Schedule (Shifts)'}
            </Text>
            {['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì'].map((day, index) => (
              <Field
                key={day}
                label={day}
                value={draft.shifts?.[index] || ''}
                placeholder="e.g. 08:00 - 14:00"
                onChangeText={(val) => {
                  setDraft((curr) => {
                    const newShifts = [...(curr.shifts || ['', '', '', '', ''])];
                    newShifts[index] = val;
                    return { ...curr, shifts: newShifts };
                  });
                }}
              />
            ))}
          </View>
        ) : null}
        <Text style={styles.inputLabel}>{t('langLabel')}</Text>
        <SegmentedControl
          options={[
            { value: 'IT', label: 'IT' },
            { value: 'EN', label: 'EN' },
          ]}
          value={draft.language}
          onChange={(value) => onLanguageChange(value as 'IT' | 'EN')}
        />
        <ActionButton label={t('saveChangesBtn')} icon={Save} onPress={onSave} />
      </View>

      <View style={styles.dangerZone}>
        <ActionButton label={t('logout')} icon={LogOut} onPress={onLogout} variant="secondary" />
        <ActionButton label={t('deleteAccount')} icon={Trash2} onPress={onDelete} variant="danger" />
      </View>
    </View>
  );
}
