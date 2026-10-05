import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import SafeIcon from '../components/SafeIcon';
import api from '../services/api';

export default function LoginScreen({ onLoginSuccess }) {
  const [role, setRole] = useState('elder'); // 'elder' | 'caregiver' | 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickLogin = (selectedRole, userEmail) => {
    setRole(selectedRole);
    setEmail(userEmail);
    setPassword('password123');
  };

  const handleLogin = async () => {
    if (!email) {
      Alert.alert('Missing Email', 'Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    try {
      // Call backend auth API with expected role
      const res = await api.post('/auth/login', {
        email: email.trim(),
        password: password,
        role: role,
        expected_role: role,
      });

      if (res?.data?.user) {
        if (res.data.user.role && res.data.user.role.toLowerCase() !== role.toLowerCase()) {
          const userRoleFormatted = res.data.user.role.charAt(0).toUpperCase() + res.data.user.role.slice(1);
          Alert.alert('Role Access Error', `This account is registered as a ${userRoleFormatted}. Please switch to the ${userRoleFormatted} role tab.`);
          return;
        }
        onLoginSuccess(res.data.user);
      } else {
        Alert.alert('Authentication Failed', 'Unable to authenticate. Please check your credentials.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Invalid email or password. Please verify your credentials.';
      Alert.alert('Login Error', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* App Logo & Branding */}
        <View style={styles.brandingBox}>
          <View style={styles.logoCircle}>
            <SafeIcon name="pulse" size={32} color="#10b981" />
          </View>
          <Text style={styles.appName}>HealthSpan</Text>
          <Text style={styles.appTagline}>AI-Powered Dietary Nutrition & Caregiver Portal</Text>
        </View>

        {/* Role Selection Switcher */}
        <View style={styles.roleCard}>
          <Text style={styles.label}>Select Your Access Role:</Text>
          <View style={styles.roleRow}>
            {[
              { id: 'elder', label: 'Elder Senior', icon: 'home' },
              { id: 'caregiver', label: 'Caregiver', icon: 'people' },
              { id: 'admin', label: 'Admin', icon: 'medkit' },
            ].map((r) => {
              const active = role === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.roleTab, active && styles.roleTabActive]}
                  onPress={() => {
                    setRole(r.id);
                    setEmail('');
                    setPassword('');
                  }}
                >
                  <SafeIcon name={r.icon} size={16} color={active ? '#020617' : '#94a3b8'} />
                  <Text style={[styles.roleTabText, active && styles.roleTabTextActive]}>{r.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Login Form Fields */}
        <View style={styles.formCard}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email address"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor="#64748b"
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.loginBtn, isLoading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginBtnText}>
              {isLoading ? 'Signing In...' : `Sign In as ${role.toUpperCase()}`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 1-Tap Quick Demo Credentials */}
        <View style={styles.demoCard}>
          <Text style={styles.demoTitle}>⚡ 1-Tap Demo Logins:</Text>
          <View style={styles.demoBtnRow}>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => handleQuickLogin('elder', 'elder@healthspan.in')}
            >
              <Text style={styles.demoBtnText}>👵 Elder Account</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => handleQuickLogin('caregiver', 'caregiver@healthspan.in')}
            >
              <Text style={styles.demoBtnText}>👨‍👩‍👧 Caregiver Account</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => handleQuickLogin('admin', 'admin@healthspan.in')}
            >
              <Text style={styles.demoBtnText}>🛡️ Admin Control</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  brandingBox: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10b98115',
    borderWidth: 1,
    borderColor: '#10b98140',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  appName: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  appTagline: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  roleCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16,
  },
  label: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  roleTabActive: {
    backgroundColor: '#10b981',
  },
  roleTabText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: 'bold',
  },
  roleTabTextActive: {
    color: '#020617',
    fontWeight: '900',
  },
  formCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16,
  },
  inputLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#020617',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 14,
  },
  loginBtn: {
    backgroundColor: '#10b981',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  loginBtnText: {
    color: '#020617',
    fontSize: 14,
    fontWeight: '900',
  },
  demoCard: {
    backgroundColor: '#1e293b30',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#33415540',
  },
  demoTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  demoBtnRow: {
    flexDirection: 'row',
    gap: 6,
  },
  demoBtn: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    alignItems: 'center',
  },
  demoBtnText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '700',
  },
});
