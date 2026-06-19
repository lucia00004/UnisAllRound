import React from 'react';
import { ScrollView, Text, View, RefreshControl, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { getStyles } from './src/styles';
import { getCoursesForDepartment, lessons } from './src/data';
import { BottomNav } from './src/components';

import HomeScreen from './src/screens/HomeScreen';
import CampusScreen from './src/screens/CampusScreen';
import ServicesScreen from './src/screens/ServicesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AuthScreen from './src/screens/AuthScreen';

import Header from './src/components/Header';
import SearchHeader from './src/components/SearchHeader';
import NotificationsModal from './src/components/NotificationsModal';
import NotificationDetailModal from './src/components/NotificationDetailModal';
import useAppState from './src/hooks/useAppState';
import { ThemeContext, getColors, useTheme } from './src/theme';
import type { MainTab } from './src/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const themeColors = getColors();
  const themeStyles = getStyles();

  return (
    <ThemeContext.Provider value={{ isDarkMode: false, toggleDarkMode: () => {}, colors: themeColors, styles: themeStyles }}>
      <MainApp />
    </ThemeContext.Provider>
  );
}

function MainApp() {
  const { styles, colors, isDarkMode } = useTheme();

  const {
    booting,
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
    handleLogin,
    handleRegister,
    currentUser,
    setCurrentUser,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    searchResults,
    showNotificationsModal,
    setShowNotificationsModal,
    activeNotifications,
    archivedNotifications,
    activeNotifTab,
    setActiveNotifTab,
    handleArchive,
    handleRestore,
    handleDelete,
    selectedNotification,
    setSelectedNotification,
    handleNotificationClick,
    careerStats,
    exams,
    newExam,
    setNewExam,
    handleAddExam,
    updateExamStatus,
    deleteExam,
    openExternal,
    teacherMessage,
    setTeacherMessage,
    teacherResult,
    setTeacherResult,
    reception,
    setReception,
    publishTeacherResult,
    sendTeacherMessage,
    tickets,
    updateTicketStatus,
    handleSectionLayout,
    receptionSlots,
    syncSlots,
    addNotification,
    users,
    setUsers,
    customNotifications,
    archivedTicketIds,
    deletedTicketIds,
    setArchivedTicketIds,
    setDeletedTicketIds,
    ateneoNews,
    selectedPointId,
    setSelectedPointId,
    weatherData,
    loadingWeather,
    canteenMenu,
    loadingCanteenMenu,
    loadCanteenMenu,
    ticketDraft,
    setTicketDraft,
    sendFeedback,
    createTicket,
    profileDraft,
    setProfileDraft,
    saveProfile,
    handlePasswordChange,
    deleteAccount,
    handleLogout,
    showNotice,
    toast,
    isWide,
    mainScrollRef,
    refreshing,
    refreshData,
  } = useAppState();

  const prevTabIndexRef = React.useRef(0);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const tabs = ['home', 'campus', 'services', 'profile'];
    const currentIndex = tabs.indexOf(activeTab);
    const prevIndex = prevTabIndexRef.current;
    prevTabIndexRef.current = currentIndex;

    const direction = currentIndex > prevIndex ? 1 : -1;
    const startOffset = direction * 25; // 25px offset

    fadeAnim.setValue(0);
    slideAnim.setValue(startOffset);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  }, [activeTab]);


  if (booting) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.boot}>
          <StatusBar style="dark" />
          <Text style={styles.brand}>UnisAllRound</Text>
          <Text style={styles.mutedText}>{t('loadingSession')}</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (!currentUser) {
    return (
      <AuthScreen
        authMode={authMode}
        setAuthMode={setAuthMode}
        authDraft={authDraft}
        setAuthDraft={setAuthDraft}
        authPhonePrefix={authPhonePrefix}
        setAuthPhonePrefix={setAuthPhonePrefix}
        rememberSession={rememberSession}
        setRememberSession={setRememberSession}
        appLanguage={appLanguage}
        t={t}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.appShell}>
        <Header
          currentUser={currentUser}
          appLanguage={appLanguage}
          t={t}
          activeNotificationsCount={activeNotifications.length}
          onOpenNotifications={() => setShowNotificationsModal(true)}
        />

        <SearchHeader
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          searchResults={searchResults}
          onSelectResult={setActiveTab}
          t={t}
        />

        <View style={{ flex: 1 }}>
          <ScrollView
            ref={mainScrollRef}
            contentContainerStyle={[styles.content, isWide && styles.contentWide]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refreshData}
                colors={[colors.teal]}
                tintColor={colors.teal}
              />
            }
          >
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }], flex: 1 }}>
            {activeTab === 'home' ? (
            <HomeScreen
              user={currentUser}
              isWide={isWide}
              careerStats={careerStats}
              onOpenTab={setActiveTab}
              exams={exams}
              newExam={newExam}
              setNewExam={setNewExam}
              lessons={(() => {
                const dept = currentUser.department;
                return lessons.filter(l => l.teacher === `${currentUser.name} ${currentUser.surname}` || (currentUser.role === 'Studente' && (currentUser.degreeCourse ? getCoursesForDepartment(dept).map(c => c.name).includes(currentUser.degreeCourse) : false)));
              })()}
              onAddExam={handleAddExam}
              onExamStatus={updateExamStatus}
              onDeleteExam={deleteExam}
              onOpenExternal={openExternal}
              t={t}
              teacherMessage={teacherMessage}
              setTeacherMessage={setTeacherMessage}
              teacherResult={teacherResult}
              setTeacherResult={setTeacherResult}
              reception={reception}
              setReception={setReception}
              onPublishResult={publishTeacherResult}
              onSendTeacherMessage={sendTeacherMessage}
              tickets={tickets}
              onTicketStatus={updateTicketStatus}
              onSectionLayout={handleSectionLayout}
              receptionSlots={receptionSlots}
              onSyncSlots={syncSlots}
              onAddNotification={addNotification}
              users={users}
              customNotifications={customNotifications}
              archivedTicketIds={archivedTicketIds}
              deletedTicketIds={deletedTicketIds}
              onArchiveTicket={(id) => {
                setArchivedTicketIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
                showNotice(appLanguage === 'IT' ? 'Operazione completata' : 'Operation completed');
              }}
              onDeleteTicket={(id) => {
                setDeletedTicketIds(prev => [...prev, id]);
                showNotice(appLanguage === 'IT' ? 'Richiesta eliminata' : 'Request deleted');
              }}
            />
          ) : null}
          {activeTab === 'campus' ? (
            <CampusScreen
              news={ateneoNews}
              selectedPoint={(() => {
                const campusPointsList = require('./src/data').campusPoints;
                return campusPointsList.find((point: any) => point.id === selectedPointId) ?? campusPointsList[0];
              })()}
              selectedPointId={selectedPointId}
              onSelectPoint={setSelectedPointId}
              onOpenExternal={openExternal}
              weatherData={weatherData}
              loadingWeather={loadingWeather}
              t={t}
              lang={currentUser.language || appLanguage}
              onSectionLayout={handleSectionLayout}
              canteenMenu={canteenMenu}
              loadingCanteenMenu={loadingCanteenMenu}
              onReloadCanteenMenu={loadCanteenMenu}
            />
          ) : null}
          {activeTab === 'services' ? (
            <ServicesScreen
              ticketDraft={ticketDraft}
              setTicketDraft={setTicketDraft}
              onFeedback={sendFeedback}
              onCreateTicket={createTicket}
              onOpenExternal={openExternal}
              t={t}
              tickets={tickets}
              archivedTicketIds={archivedTicketIds}
              deletedTicketIds={deletedTicketIds}
              onArchiveTicket={(id) => {
                const ticket = tickets.find(t => t.id === id);
                if (ticket && ticket.status === 'Chiuso') return;
                setArchivedTicketIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
                showNotice(appLanguage === 'IT' ? 'Operazione completata' : 'Operation completed');
              }}
              onDeleteTicket={(id) => {
                setDeletedTicketIds(prev => [...prev, id]);
                showNotice(appLanguage === 'IT' ? 'Richiesta eliminata' : 'Request deleted');
              }}
            />
          ) : null}
          {activeTab === 'profile' ? (
            <ProfileScreen
              user={currentUser}
              draft={profileDraft}
              setDraft={setProfileDraft}
              onLanguageChange={(newLang) => {
                setProfileDraft((current) => ({ ...current, language: newLang }));
                if (currentUser) {
                  const updated = { ...currentUser, language: newLang };
                  setCurrentUser(updated);
                  setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
                }
                showNotice(newLang === 'IT' ? 'Lingua impostata su Italiano' : 'Language set to English');
              }}
              onSave={saveProfile}
              onPasswordChange={handlePasswordChange}
              onDelete={deleteAccount}
              onLogout={handleLogout}
              t={t}
            />
          ) : null}
            </Animated.View>
        </ScrollView>
        </View>

        <BottomNav
          activeTab={activeTab}
          onChange={setActiveTab}
          role={currentUser.role}
          t={t}
          lang={currentUser.language || appLanguage}
        />
        {toast ? (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        ) : null}

        <NotificationsModal
          visible={showNotificationsModal}
          onClose={() => setShowNotificationsModal(false)}
          activeNotifTab={activeNotifTab}
          onActiveNotifTabChange={setActiveNotifTab}
          activeNotifications={activeNotifications}
          archivedNotifications={archivedNotifications}
          currentUser={currentUser}
          appLanguage={appLanguage}
          t={t}
          onArchive={handleArchive}
          onRestore={handleRestore}
          onDelete={handleDelete}
          onSelectNotification={setSelectedNotification}
        />

        <NotificationDetailModal
          visible={selectedNotification !== null}
          onClose={() => setSelectedNotification(null)}
          selectedNotification={selectedNotification}
          currentUser={currentUser}
          appLanguage={appLanguage}
          t={t}
          onActionClick={handleNotificationClick}
        />

      </SafeAreaView>
    </SafeAreaProvider>
  );
}
