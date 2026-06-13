import React from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { View, Text, Alert, Pressable } from 'react-native';
import { User, Save, LogOut, Trash2, Lock } from 'lucide-react-native';

import { useTheme } from '../theme';
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
  onPasswordChange,
  onDelete,
  onLogout,
  t,
}: {
  user: UserProfile;
  draft: DraftProfile;
  setDraft: Dispatch<SetStateAction<DraftProfile>>;
  onLanguageChange: (lang: 'IT' | 'EN') => void;
  onSave: () => void;
  onPasswordChange: (newPassword: string) => void;
  onDelete: () => void;
  onLogout: () => void;
  t: (key: keyof typeof translations.IT) => string;
}) {
  const { colors, styles, isDarkMode, toggleDarkMode } = useTheme();
  const getRoleLabelForProfile = (roleName: Role, currentLang: 'IT' | 'EN') => {
    if (roleName === 'Studente') return currentLang === 'IT' ? 'Studente' : 'Student';
    if (roleName === 'Docente') return currentLang === 'IT' ? 'Docente' : 'Professor';
    if (roleName === 'PTA') return currentLang === 'IT' ? 'PTA' : 'Staff';
    return roleName;
  };

  const lang = draft.language;
  const { prefix: profilePhonePrefix, number: profilePhoneNumber } = parsePhone(draft.phone);

  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');

  const isNewPasswordEditable = oldPassword === user.password;

  const handleUpdatePasswordLocal = () => {
    if (!newPassword.trim()) {
      Alert.alert(lang === 'IT' ? 'La nuova password non può essere vuota.' : 'New password cannot be empty.');
      return;
    }
    if (newPassword.length < 8 || newPassword.length > 16) {
      Alert.alert(lang === 'IT' ? 'La password deve contenere tra 8 e 16 caratteri.' : 'Password must be between 8 and 16 characters.');
      return;
    }
    onPasswordChange(newPassword);
    setOldPassword('');
    setNewPassword('');
    Alert.alert(lang === 'IT' ? 'Password aggiornata con successo.' : 'Password updated successfully.');
  };

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
              onChangeText={(value) => {
                const digits = value.replace(/\D/g, '').slice(0, 10);
                setDraft((current) => ({ ...current, matricola: digits }));
              }}
              required={true}
              keyboardType="number-pad"
              maxLength={10}
              editable={true}
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
              disabled={true}
            />
            <MultiSelectPicker
              label={draft.language === 'IT' ? 'Insegnamenti tenuti' : 'Teachings Held'}
              values={draft.teachings || []}
              options={getTeachingsForDegrees(draft.teacherDegrees || [])}
              onSelect={(value) => setDraft((current) => ({ ...current, teachings: value }))}
              lang={draft.language}
              disabled={true}
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
            disabled={true}
          />
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

        <Text style={[styles.inputLabel, { marginTop: 12 }]}>
          {lang === 'IT' ? 'Tema applicazione' : 'Application Theme'}
        </Text>
        <SegmentedControl
          options={[
            { value: 'light', label: lang === 'IT' ? 'Chiaro' : 'Light' },
            { value: 'dark', label: lang === 'IT' ? 'Scuro' : 'Dark' },
          ]}
          value={isDarkMode ? 'dark' : 'light'}
          onChange={(val) => {
            if ((val === 'dark' && !isDarkMode) || (val === 'light' && isDarkMode)) {
              toggleDarkMode();
            }
          }}
        />

        <ActionButton label={t('saveChangesBtn')} icon={Save} onPress={onSave} />
      </View>

      {/* Password Management Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{lang === 'IT' ? 'Sicurezza e Password' : 'Security and Password'}</Text>
        
        {/* View Current Password */}
        <Field
          label={lang === 'IT' ? 'Password Attuale' : 'Current Password'}
          value={user.password || 'Password123!'}
          onChangeText={() => {}}
          editable={false}
          secureTextEntry={true}
        />

        {/* Change Password Form */}
        <Text style={[styles.inputLabel, { marginTop: 14, marginBottom: 4, fontWeight: '700' }]}>
          {lang === 'IT' ? 'Modifica Password' : 'Change Password'}
        </Text>
        <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 10 }}>
          {lang === 'IT' 
            ? 'Inserisci la vecchia password per poter inserire una nuova password.' 
            : 'Enter your current password to enable entering a new password.'}
        </Text>

        <Field
          label={lang === 'IT' ? 'Inserisci Vecchia Password *' : 'Enter Old Password *'}
          value={oldPassword}
          onChangeText={setOldPassword}
          secureTextEntry={true}
          placeholder={lang === 'IT' ? 'Vecchia password...' : 'Old password...'}
        />

        <View style={{ marginBottom: 16 }}>
          <Field
            label={lang === 'IT' ? 'Nuova Password *' : 'New Password *'}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={true}
            editable={isNewPasswordEditable}
            placeholder={
              !isNewPasswordEditable 
                ? (lang === 'IT' ? 'Inserisci prima la vecchia password...' : 'Enter old password first...') 
                : (lang === 'IT' ? 'Nuova password...' : 'New password...')
            }
          />
        </View>

        <ActionButton 
          label={lang === 'IT' ? 'Aggiorna Password' : 'Update Password'} 
          icon={Lock} 
          onPress={handleUpdatePasswordLocal} 
          disabled={!isNewPasswordEditable || !newPassword.trim()}
        />
      </View>

      <View style={styles.dangerZone}>
        <ActionButton label={t('logout')} icon={LogOut} onPress={onLogout} variant="secondary" />
        <ActionButton label={t('deleteAccount')} icon={Trash2} onPress={onDelete} variant="danger" />
      </View>
    </View>
  );
}
