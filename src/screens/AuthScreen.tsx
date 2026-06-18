import React from 'react';
import type { Dispatch, SetStateAction } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CheckCircle2, Save, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../theme';
import {
  UNISA_DEPARTMENTS,
  PHONE_PREFIXES,
  getCoursesForDepartment,
  getTeachingsForDegrees,
} from '../data';
import {
  SegmentedControl,
  Field,
  CustomPicker,
  DomainPicker,
  MultiSelectPicker,
  RolePicker,
  ActionButton,
} from '../components';

interface AuthScreenProps {
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  authDraft: any;
  setAuthDraft: Dispatch<SetStateAction<any>>;
  authPhonePrefix: string;
  setAuthPhonePrefix: (prefix: string) => void;
  rememberSession: boolean;
  setRememberSession: Dispatch<SetStateAction<boolean>>;
  appLanguage: 'IT' | 'EN';
  t: (key: any) => string;
  onLogin: () => Promise<void>;
  onRegister: () => Promise<void>;
}

export default function AuthScreen({
  authMode,
  setAuthMode,
  authDraft,
  setAuthDraft,
  authPhonePrefix,
  setAuthPhonePrefix,
  rememberSession,
  setRememberSession,
  appLanguage,
  t,
  onLogin,
  onRegister,
}: AuthScreenProps) {
  const { colors, styles } = useTheme();
  const phoneDigits = authDraft.phone;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fill}>
        <SafeAreaView style={styles.authShell}>
          <ScrollView contentContainerStyle={styles.authContent} keyboardShouldPersistTaps="handled">
            <View style={styles.authHeader}>
              <Image source={require('../../assets/logo.png')} style={{ width: 90, height: 90, borderRadius: 45, marginBottom: 14 }} />
              <Text style={styles.brand}>UnisAllRound</Text>
              <Text style={styles.authSubtitle}>{t('authSubtitleText')}</Text>
            </View>

            <View style={styles.authCard}>
              <SegmentedControl
                options={[
                  { value: 'login', label: t('login') },
                  { value: 'register', label: t('register') },
                ]}
                value={authMode}
                onChange={(value) => setAuthMode(value as 'login' | 'register')}
              />

              {authMode === 'register' ? (
                <>
                  <View style={styles.formGrid}>
                    <Field label={t('name')} required={true} value={authDraft.name} onChangeText={(value) => setAuthDraft((draft: any) => ({ ...draft, name: value }))} />
                    <Field
                      label={t('surname')}
                      required={true}
                      value={authDraft.surname}
                      onChangeText={(value) => setAuthDraft((draft: any) => ({ ...draft, surname: value }))}
                    />
                  </View>
                  <Text style={styles.inputLabel}>{t('role')}<Text style={{ color: colors.danger }}> *</Text></Text>
                  <RolePicker value={authDraft.role} onChange={(role) => setAuthDraft((draft: any) => ({ ...draft, role }))} />
                </>
              ) : null}

              <Field
                label={t('email')}
                autoCapitalize="none"
                keyboardType="email-address"
                required={authMode === 'register'}
                value={authDraft.email}
                onChangeText={(value) => {
                  setAuthDraft((draft: any) => {
                    const updated = { ...draft, email: value };
                    if (authMode === 'register') {
                      if (value.toLowerCase().endsWith('@studenti.unisa.it')) {
                        updated.role = 'Studente';
                      } else if (value.toLowerCase().endsWith('@unisa.it')) {
                        if (updated.role === 'Studente') {
                          updated.role = 'Docente';
                        }
                      }
                    }
                    return updated;
                  });
                }}
              />
              <Field
                label={t('password')}
                secureTextEntry
                required={authMode === 'register'}
                value={authDraft.password}
                onChangeText={(value) => setAuthDraft((draft: any) => ({ ...draft, password: value }))}
                onHelpPress={authMode === 'register' ? () => {
                  Alert.alert(
                    appLanguage === 'IT' ? 'Requisiti Password' : 'Password Requirements',
                    appLanguage === 'IT'
                      ? 'La password deve rispettare i seguenti criteri:\n\n• Minimo 8 caratteri\n• Massimo 16 caratteri\n• Almeno una letteral MAIUSCOLA\n• Almeno un carattere speciale (es. !, @, #, $, %, ^, &, *, ?)'
                      : 'The password must meet the following criteria:\n\n• Minimum 8 characters\n• Maximum 16 characters\n• At least one UPPERCASE letter\n• At least one special character (e.g. !, @, #, $, %, ^, &, *, ?)'
                  );
                } : undefined}
              />

              {authMode === 'register' ? (
                <>
                  {authDraft.role !== 'PTA' ? (
                    <CustomPicker
                      label={authDraft.role === 'Studente' ? (appLanguage === 'IT' ? 'Dipartimento' : 'Department') : t('department')}
                      value={authDraft.department}
                      options={UNISA_DEPARTMENTS}
                      onSelect={(value) => setAuthDraft((draft: any) => {
                        const validCourses = getCoursesForDepartment(value).map(c => c.name);
                        const isCourseValid = validCourses.includes(draft.degreeCourse);
                        const filteredDegrees = draft.teacherDegrees.filter((d: string) => validCourses.includes(d));
                        const filteredTeachings = draft.teachings.filter((t: string) => getTeachingsForDegrees(filteredDegrees).includes(t));
                        return {
                          ...draft,
                          department: value,
                          degreeCourse: isCourseValid ? draft.degreeCourse : '',
                          teacherDegrees: filteredDegrees,
                          teachings: filteredTeachings
                        };
                      })}
                      required={true}
                      lang={appLanguage}
                    />
                  ) : null}
                  {authDraft.role === 'Studente' ? (
                    <>
                      <CustomPicker
                        label={appLanguage === 'IT' ? 'Corso di laurea' : 'Degree Course'}
                        value={authDraft.degreeCourse}
                        options={getCoursesForDepartment(authDraft.department).map((c) => c.name)}
                        onSelect={(value) => setAuthDraft((draft: any) => ({ ...draft, degreeCourse: value }))}
                        required={true}
                        lang={appLanguage}
                        disabled={!authDraft.department}
                        placeholder={appLanguage === 'IT' ? 'Scegli prima il dipartimento...' : 'Select department first...'}
                      />
                      <Field
                        label={appLanguage === 'IT' ? 'Matricola' : 'Student ID'}
                        required={true}
                        value={authDraft.matricola}
                        onChangeText={(value) => {
                          const filtered = value.replace(/\D/g, '');
                          setAuthDraft((draft: any) => ({ ...draft, matricola: filtered }));
                        }}
                        keyboardType="number-pad"
                        maxLength={10}
                        placeholder="0512106789"
                        onHelpPress={() =>
                          Alert.alert(
                            appLanguage === 'IT' ? 'Requisiti Matricola' : 'Student ID Requirements',
                            appLanguage === 'IT'
                              ? 'La matricola deve essere composta da esattamente 10 cifre.'
                              : 'The Student ID must consist of exactly 10 digits.'
                          )
                        }
                      />
                    </>
                  ) : null}
                  {authDraft.role === 'PTA' ? (
                    <DomainPicker
                      label={appLanguage === 'IT' ? 'Ambito lavorativo' : 'Work Scope'}
                      value={authDraft.ptaDomain}
                      onSelect={(value) => setAuthDraft((draft: any) => ({ ...draft, ptaDomain: value }))}
                      required={true}
                      lang={appLanguage}
                    />
                  ) : null}
                  {authDraft.role === 'Docente' ? (
                    <>
                      <MultiSelectPicker
                        label={appLanguage === 'IT' ? 'Corsi di laurea di riferimento' : 'Reference Degree Courses'}
                        values={authDraft.teacherDegrees}
                        options={getCoursesForDepartment(authDraft.department).map((c) => c.name)}
                        onSelect={(value) => setAuthDraft((draft: any) => ({ 
                          ...draft, 
                          teacherDegrees: value,
                          teachings: draft.teachings.filter((t: string) => getTeachingsForDegrees(value).includes(t))
                        }))}
                        lang={appLanguage}
                        disabled={!authDraft.department}
                      />
                      <MultiSelectPicker
                        label={appLanguage === 'IT' ? 'Insegnamenti tenuti' : 'Teachings Held'}
                        values={authDraft.teachings}
                        options={getTeachingsForDegrees(authDraft.teacherDegrees)}
                        onSelect={(value) => setAuthDraft((draft: any) => ({ ...draft, teachings: value }))}
                        lang={appLanguage}
                        disabled={!authDraft.teacherDegrees || authDraft.teacherDegrees.length === 0}
                      />
                    </>
                  ) : null}
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ width: 100 }}>
                      <CustomPicker
                        label={appLanguage === 'IT' ? 'Prefisso' : 'Prefix'}
                        value={authPhonePrefix}
                        options={PHONE_PREFIXES}
                        onSelect={(value) => setAuthPhonePrefix(value)}
                        lang={appLanguage}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Field
                        label={t('phone')}
                        required
                        keyboardType="phone-pad"
                        value={authDraft.phone}
                        onChangeText={(value) => {
                          const digits = value.replace(/\D/g, '').slice(0, 11);
                          setAuthDraft((draft: any) => ({ ...draft, phone: digits }));
                        }}
                      />
                    </View>
                  </View>
                </>
              ) : null}

              <Pressable style={styles.checkboxRow} onPress={() => setRememberSession((value: boolean) => !value)}>
                <View style={[styles.checkbox, rememberSession && styles.checkboxOn]}>
                  {rememberSession ? <CheckCircle2 color={colors.surface} size={16} /> : null}
                </View>
                <Text style={styles.checkboxText}>{t('rememberMe')}</Text>
              </Pressable>

              <ActionButton
                label={authMode === 'login' ? t('submitLogin') : t('submitRegister')}
                icon={authMode === 'login' ? ShieldCheck : Save}
                onPress={authMode === 'login' ? onLogin : onRegister}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
}
