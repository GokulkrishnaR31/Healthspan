import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import SafeIcon from './src/components/SafeIcon';

// Screen Imports
import LoginScreen from './src/screens/LoginScreen';
import ElderHomeScreen from './src/screens/ElderHomeScreen';
import ElderVoiceLogScreen from './src/screens/ElderVoiceLogScreen';
import ElderDietPlanScreen from './src/screens/ElderDietPlanScreen';
import ElderCareTeamScreen from './src/screens/ElderCareTeamScreen';
import CaregiverDashboardScreen from './src/screens/CaregiverDashboardScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';

export default function App() {
  const [user, setUser] = useState(null); // null = Logged Out
  const [currentTab, setCurrentTab] = useState('Home');

  // If Not Logged In, Render Full Login Screen
  if (!user) {
    return <LoginScreen onLoginSuccess={(userData) => setUser(userData)} />;
  }

  const handleLogout = () => {
    setUser(null);
    setCurrentTab('Home');
  };

  // Render Portal Based on User Role
  const renderRolePortal = () => {
    if (user.role === 'caregiver') {
      return <CaregiverDashboardScreen />;
    }

    if (user.role === 'admin') {
      return <AdminDashboardScreen />;
    }

    // Elder Role: Multi-Tab Experience
    switch (currentTab) {
      case 'DietPlan':
        return <ElderDietPlanScreen navigation={{ navigate: setCurrentTab }} />;
      case 'VoiceLog':
        return <ElderVoiceLogScreen navigation={{ navigate: setCurrentTab }} />;
      case 'CareTeam':
        return <ElderCareTeamScreen navigation={{ navigate: setCurrentTab }} />;
      default:
        return <ElderHomeScreen navigation={{ navigate: setCurrentTab }} />;
    }
  };

  const elderTabs = [
    { id: 'Home', label: 'Home', icon: 'home', iconOutline: 'home-outline' },
    { id: 'DietPlan', label: 'Diet Plan', icon: 'restaurant', iconOutline: 'restaurant-outline' },
    { id: 'VoiceLog', label: 'Voice Log', icon: 'mic', iconOutline: 'mic-outline' },
    { id: 'CareTeam', label: 'Care Team', icon: 'people', iconOutline: 'people-outline' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      {/* Universal Top Header with User Info & Logout Button */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.headerLogo}>
            <SafeIcon name="pulse" size={16} color="#10b981" />
          </View>
          <View>
            <Text style={styles.headerAppName}>HealthSpan</Text>
            <Text style={styles.headerUserInfo}>
              {user.name || user.email} • <Text style={styles.roleTag}>{user.role?.toUpperCase()}</Text>
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <SafeIcon name="stop" size={14} color="#f43f5e" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Main Active Portal Body */}
      <View style={styles.screenContainer}>
        {renderRolePortal()}
      </View>

      {/* Bottom Tabs (Only for Elder Role) */}
      {user.role === 'elder' && (
        <View style={styles.tabBar}>
          {elderTabs.map((tab) => {
            const isActive = currentTab === tab.id;
            const isVoice = tab.id === 'VoiceLog';

            if (isVoice) {
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={styles.voiceTabButton}
                  onPress={() => setCurrentTab(tab.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.voiceMicCircle, isActive && styles.voiceMicActive]}>
                    <SafeIcon name="mic" size={24} color="#020617" />
                  </View>
                  <Text style={[styles.tabLabel, { color: isActive ? '#10b981' : '#94a3b8' }]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.tabButton}
                onPress={() => setCurrentTab(tab.id)}
                activeOpacity={0.7}
              >
                <SafeIcon
                  name={isActive ? tab.icon : tab.iconOutline}
                  size={22}
                  color={isActive ? '#10b981' : '#64748b'}
                />
                <Text style={[styles.tabLabel, { color: isActive ? '#10b981' : '#64748b' }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    width: '100%',
    alignSelf: 'center',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10b98115',
    borderWidth: 1,
    borderColor: '#10b98130',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAppName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  headerUserInfo: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  roleTag: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f43f5e15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f43f5e30',
  },
  logoutText: {
    color: '#f43f5e',
    fontSize: 11,
    fontWeight: 'bold',
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    height: 68,
    paddingBottom: 6,
    paddingTop: 4,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  voiceTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    top: -12,
  },
  voiceMicCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#10b981',
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  voiceMicActive: {
    backgroundColor: '#34d399',
    transform: [{ scale: 1.05 }],
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
});
