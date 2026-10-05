import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Linking,
} from 'react-native';
import SafeIcon from '../components/SafeIcon';

export default function CaregiverDashboardScreen() {
  const [selectedElder] = useState({
    name: 'Deepan Kumar',
    age: 68,
    careCode: 'ELDER-8090',
    relation: 'Son / Daughter',
    phone: '+91 98765 43210',
    healthScore: 78,
    status: 'Stable',
  });

  const [medications, setMedications] = useState([
    { id: 1, name: 'Atorvastatin (Cholesterol)', dose: '20mg', time: '8:30 AM (Breakfast)', taken: true },
    { id: 2, name: 'Lisinopril (Blood Pressure)', dose: '10mg', time: '8:30 PM (Dinner)', taken: true },
    { id: 3, name: 'Calcium + Vit D3 Chewable', dose: '500mg', time: '10:05 AM (Morning)', taken: true },
    { id: 4, name: 'Omega-3 Fish Oil Softgel', dose: '1000mg', time: '10:05 PM (Bedtime)', taken: false },
  ]);

  const toggleMedication = (id) => {
    setMedications(prev =>
      prev.map(m => (m.id === id ? { ...m, taken: !m.taken } : m))
    );
  };

  const handleCallSenior = () => {
    try {
      Linking.openURL(`tel:${selectedElder.phone}`);
    } catch (e) {}
  };

  const handleDispatchDigest = () => {
    Alert.alert(
      '💬 Dispatched Weekly Health Digest',
      `HealthSpan automated digest summary successfully transmitted via WhatsApp & SMS to +91 98765 43210 (Priya Verma - Primary Caregiver).\n\n• Weekly Score: 78/100\n• Adherence: 94.2%\n• Calcium Target: 79% Met`,
      [{ text: 'Great!' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Senior Patient Header Bar */}
        <View style={styles.patientHeaderCard}>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.patientLabel}>Senior Patient: </Text>
              <Text style={styles.patientName}>{selectedElder.name}</Text>
            </View>
            <View style={styles.badgeRow}>
              <View style={styles.ageBadge}>
                <Text style={styles.ageBadgeText}>Age {selectedElder.age}</Text>
              </View>
              <View style={styles.codeBadge}>
                <Text style={styles.codeBadgeText}>Code: {selectedElder.careCode}</Text>
              </View>
            </View>
            <Text style={styles.updateText}>
              Last updated: Today • Relationship: <Text style={{ color: '#10b981', fontWeight: 'bold' }}>{selectedElder.relation}</Text>
            </Text>
          </View>

          <TouchableOpacity style={styles.callSeniorBtn} onPress={handleCallSenior}>
            <SafeIcon name="call" size={14} color="#020617" />
            <Text style={styles.callSeniorBtnText}>Call</Text>
          </TouchableOpacity>
        </View>

        {/* Clean Nutrition & Dietary Adherence Status Card */}
        <View style={styles.nutritionStatusCard}>
          <View style={styles.statusHeaderRow}>
            <View style={styles.greenIconBox}>
              <SafeIcon name="checkmark-circle" size={18} color="#10b981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nutritionTitle}>✨ Clean Nutrition & Dietary Adherence</Text>
              <Text style={styles.nutritionSubtitle}>No fast food logged today • ICMR targets met</Text>
            </View>
          </View>
          <Text style={styles.latestMealText}>
            Latest Meal: <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Sprouted Ragi Kanji & 2 Idlis (8:30 AM)</Text>
          </Text>
        </View>

        {/* Composite Health Score Card */}
        <View style={styles.healthScoreCard}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreLabel}>COMPOSITE HEALTH SCORE</Text>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreBadgeText}>({selectedElder.status})</Text>
            </View>
          </View>

          <View style={styles.scoreCenter}>
            <Text style={styles.scoreBigNumber}>{selectedElder.healthScore}</Text>
            <Text style={styles.scoreTotal}>/100</Text>
          </View>
          <Text style={styles.scoreDesc}>Bone & Cognitive Vital Health Index</Text>
        </View>

        {/* 4-Metric Nutrition & Activity Grid (Figure 3) */}
        <Text style={styles.sectionTitle}>Senior Nutrition & Activity Vitals</Text>
        <View style={styles.gridRow}>
          <View style={styles.gridCard}>
            <SafeIcon name="water" size={20} color="#38bdf8" />
            <Text style={styles.gridValue}>2.5 / 3.0 L</Text>
            <Text style={styles.gridLabel}>Water Intake</Text>
            <Text style={styles.gridSub}>83% of 3.0L Goal</Text>
          </View>

          <View style={styles.gridCard}>
            <SafeIcon name="walk" size={20} color="#10b981" />
            <Text style={styles.gridValue}>30 min</Text>
            <Text style={styles.gridLabel}>Daily Walk</Text>
            <Text style={styles.gridSub}>50% of 60m Goal</Text>
          </View>
        </View>

        <View style={styles.gridRow}>
          <View style={styles.gridCard}>
            <SafeIcon name="nutrition" size={20} color="#818cf8" />
            <Text style={styles.gridValue}>79% RDA</Text>
            <Text style={styles.gridLabel}>Calcium Intake</Text>
            <Text style={[styles.gridSub, { color: '#10b981' }]}>Bone Target Met ✓</Text>
          </View>

          <View style={styles.gridCard}>
            <SafeIcon name="pulse" size={20} color="#f59e0b" />
            <Text style={styles.gridValue}>91% RDA</Text>
            <Text style={styles.gridLabel}>Omega-3 Level</Text>
            <Text style={[styles.gridSub, { color: '#10b981' }]}>Cognitive Optimal ✓</Text>
          </View>
        </View>

        {/* Scheduled Medications Tracker (Figure 3) */}
        <Text style={styles.sectionTitle}>Scheduled Daily Medications</Text>
        <View style={styles.medCard}>
          {medications.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={styles.medRow}
              onPress={() => toggleMedication(m.id)}
            >
              <View style={[styles.checkbox, m.taken && styles.checkboxChecked]}>
                {m.taken && <SafeIcon name="checkmark-circle" size={14} color="#020617" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.medName, m.taken && styles.medNameTaken]}>{m.name}</Text>
                <Text style={styles.medTime}>{m.dose} • {m.time}</Text>
              </View>
              <View style={[styles.takenBadge, m.taken ? styles.badgeTaken : styles.badgePending]}>
                <Text style={[styles.takenBadgeText, m.taken ? { color: '#10b981' } : { color: '#f59e0b' }]}>
                  {m.taken ? 'Taken ✓' : 'Pending'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dispatched Weekly Health Digest Card (Figure 3) */}
        <TouchableOpacity style={styles.digestCard} onPress={handleDispatchDigest}>
          <View style={styles.waIconBox}>
            <SafeIcon name="logo-whatsapp" size={24} color="#ffffff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.digestTitle}>💬 Dispatched Weekly Health Digest</Text>
            <Text style={styles.digestSubtitle}>Trigger instant WhatsApp & SMS dispatch to family caregiver.</Text>
          </View>
        </TouchableOpacity>
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
  patientHeaderCard: {
    backgroundColor: '#0f172a',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  patientLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: 'bold',
  },
  patientName: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 6,
  },
  ageBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ageBadgeText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: 'bold',
  },
  codeBadge: {
    backgroundColor: '#6366f120',
    borderColor: '#6366f140',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  codeBadgeText: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  updateText: {
    color: '#64748b',
    fontSize: 11,
  },
  callSeniorBtn: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  callSeniorBtnText: {
    color: '#020617',
    fontWeight: '900',
    fontSize: 12,
  },
  nutritionStatusCard: {
    backgroundColor: '#10b98110',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#10b98130',
    marginBottom: 14,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  greenIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#10b98120',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutritionTitle: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: 'bold',
  },
  nutritionSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
  },
  latestMealText: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#10b98120',
  },
  healthScoreCard: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
  },
  scoreBadge: {
    backgroundColor: '#10b98115',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  scoreBadgeText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scoreCenter: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 6,
  },
  scoreBigNumber: {
    color: '#10b981',
    fontSize: 38,
    fontWeight: '900',
  },
  scoreTotal: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreDesc: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 4,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  gridValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  gridLabel: {
    color: '#94a3b8',
    fontSize: 11,
  },
  gridSub: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
  medCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 14,
  },
  medRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#64748b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  medName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  medNameTaken: {
    textDecorationLine: 'line-through',
    color: '#64748b',
  },
  medTime: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  takenBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeTaken: {
    backgroundColor: '#10b98115',
  },
  badgePending: {
    backgroundColor: '#f59e0b15',
  },
  takenBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  digestCard: {
    backgroundColor: '#059669',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 4,
  },
  waIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff25',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digestTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  digestSubtitle: {
    color: '#d1fae5',
    fontSize: 11,
    marginTop: 2,
  },
});
