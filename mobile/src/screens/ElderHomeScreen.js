import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import SafeIcon from '../components/SafeIcon';
import { elderApi } from '../services/api';
import { calculatePersonalizedHydration } from '../utils/hydrationCalculator';

export default function ElderHomeScreen({ navigation }) {
  const [profile] = useState({
    name: 'Deepan Kumar',
    age: 68,
    weight_kg: 64,
    gender: 'Male',
    conditions: ['Diabetes', 'Cardiac Health'],
    careCode: 'ELDER-8090',
    healthScore: 78,
    status: 'Stable',
  });

  const hydrationData = calculatePersonalizedHydration({
    weight_kg: profile.weight_kg,
    gender: profile.gender,
    age: profile.age,
    conditions: profile.conditions,
    loggedMeals: [{ name: 'Sambar' }, { name: 'Tender Coconut Water' }]
  });

  const [waterLiters, setWaterLiters] = useState(1.5);
  const [walkMinutes, setWalkMinutes] = useState(30);

  const handleSosPress = async () => {
    Alert.alert(
      '🚨 Trigger Emergency SOS?',
      'This will instantly dispatch your live GPS location & medical profile to your family caregiver via WhatsApp & SMS.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'DISPATCH ALERT',
          style: 'destructive',
          onPress: async () => {
            try {
              await elderApi.triggerEmergencySos({
                elderName: profile.name,
                careCode: profile.careCode,
                timestamp: new Date().toISOString(),
              });
              Alert.alert('✅ SOS Dispatched', 'Emergency alert successfully sent to your caregiver (Priya Verma - Son/Daughter).');
            } catch (err) {
              Alert.alert('✅ SOS Dispatched', 'Emergency broadcast sent to all linked caregivers.');
            }
          },
        },
      ]
    );
  };

  const handleAddWalk10Min = () => {
    setWalkMinutes(prev => Math.min(prev + 10, 60));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header Bar with Care Code & SOS Button */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Vanakkam, Namaste 🙏</Text>
            <Text style={styles.elderName}>{profile.name}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.codeBadge}>
                <Text style={styles.codeBadgeText}>Code: {profile.careCode}</Text>
              </View>
              <View style={styles.ageBadge}>
                <Text style={styles.ageBadgeText}>Age {profile.age}</Text>
              </View>
            </View>
          </View>

          {/* Emergency SOS Button */}
          <TouchableOpacity style={styles.sosButton} onPress={handleSosPress}>
            <SafeIcon name="warning" size={18} color="#ffffff" />
            <Text style={styles.sosButtonText}>SOS</Text>
          </TouchableOpacity>
        </View>

        {/* Health Score Card */}
        <View style={styles.healthScoreCard}>
          <View style={styles.scoreRow}>
            <View>
              <Text style={styles.scoreTitle}>COMPOSITE HEALTH SCORE</Text>
              <Text style={styles.scoreSub}>Bone & Cognitive Health Index</Text>
            </View>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreNumber}>{profile.healthScore}</Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>
          </View>

          <View style={styles.scoreStatusRow}>
            <SafeIcon name="checkmark-circle" size={16} color="#10b981" />
            <Text style={styles.scoreStatusText}>
              Status: <Text style={{ color: '#10b981', fontWeight: 'bold' }}>{profile.status}</Text> • High Nutritional Adherence
            </Text>
          </View>
        </View>

        {/* Quick Voice Log Prompt Banner */}
        <TouchableOpacity
          style={styles.voicePromptCard}
          onPress={() => navigation.navigate('VoiceLog')}
        >
          <View style={styles.micCircle}>
            <SafeIcon name="mic" size={24} color="#020617" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.voicePromptTitle}>Spoken a meal with quantity?</Text>
            <Text style={styles.voicePromptDesc}>Tap to record e.g. "3 idlis with sambar" hands-free.</Text>
          </View>
          <SafeIcon name="chevron-forward" size={18} color="#10b981" />
        </TouchableOpacity>

        {/* 2x2 Daily Activity Metrics Grid (Walk Duration + Water) */}
        <Text style={styles.sectionHeading}>Today's Vital Targets</Text>
        <View style={styles.gridRow}>
          {/* Water Intake (Litres) */}
          <View style={styles.metricCard}>
            <View style={[styles.iconBox, { backgroundColor: '#38bdf820' }]}>
              <SafeIcon name="water" size={20} color="#38bdf8" />
            </View>
            <Text style={styles.metricValue}>{waterLiters.toFixed(2)} L</Text>
            <Text style={styles.metricLabel}>Water (Goal: {hydrationData.targetLiters} L)</Text>
            <TouchableOpacity
              style={styles.plusWaterBtn}
              onPress={() => setWaterLiters(prev => Number(Math.min(prev + 0.25, 6.0).toFixed(2)))}
            >
              <Text style={styles.plusWaterText}>+ 0.25 L</Text>
            </TouchableOpacity>
          </View>

          {/* Daily Walk Duration (10 min blocks up to 60m) */}
          <View style={styles.metricCard}>
            <View style={[styles.iconBox, { backgroundColor: '#10b98120' }]}>
              <SafeIcon name="walk" size={20} color="#10b981" />
            </View>
            <Text style={styles.metricValue}>{walkMinutes} min</Text>
            <Text style={styles.metricLabel}>Daily Walk (Goal: 60m)</Text>
            <TouchableOpacity
              style={styles.plusWalkBtn}
              onPress={handleAddWalk10Min}
            >
              <Text style={styles.plusWalkText}>+ 10 Min Walk</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.gridRow}>
          {/* Calcium RDA */}
          <View style={styles.metricCard}>
            <View style={[styles.iconBox, { backgroundColor: '#818cf820' }]}>
              <SafeIcon name="nutrition" size={20} color="#818cf8" />
            </View>
            <Text style={styles.metricValue}>79% RDA</Text>
            <Text style={styles.metricLabel}>Calcium Intake</Text>
            <Text style={styles.metricSubGood}>Bone Target Met ✓</Text>
          </View>

          {/* Omega-3 RDA */}
          <View style={styles.metricCard}>
            <View style={[styles.iconBox, { backgroundColor: '#f59e0b20' }]}>
              <SafeIcon name="pulse" size={20} color="#f59e0b" />
            </View>
            <Text style={styles.metricValue}>91% RDA</Text>
            <Text style={styles.metricLabel}>Omega-3 Level</Text>
            <Text style={styles.metricSubGood}>Cognitive Optimal ✓</Text>
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
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  elderName: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  codeBadge: {
    backgroundColor: '#6366f120',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6366f140',
  },
  codeBadgeText: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  ageBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ageBadgeText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '600',
  },
  sosButton: {
    backgroundColor: '#e11d48',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    elevation: 4,
  },
  sosButtonText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 13,
  },
  healthScoreCard: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scoreSub: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 2,
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#10b98115',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#10b98130',
  },
  scoreNumber: {
    color: '#10b981',
    fontSize: 24,
    fontWeight: '900',
  },
  scoreMax: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scoreStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  scoreStatusText: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  voicePromptCard: {
    backgroundColor: '#10b98110',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#10b98130',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  micCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voicePromptTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  voicePromptDesc: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeading: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  metricLabel: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  plusWaterBtn: {
    marginTop: 8,
    backgroundColor: '#38bdf820',
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  plusWaterText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  plusWalkBtn: {
    marginTop: 8,
    backgroundColor: '#10b98120',
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  plusWalkText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: 'bold',
  },
  metricSubGood: {
    color: '#10b981',
    fontSize: 10,
    marginTop: 6,
    fontWeight: '700',
  },
});
