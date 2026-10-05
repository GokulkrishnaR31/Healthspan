import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import SafeIcon from '../components/SafeIcon';

export default function AdminDashboardScreen() {
  const [activeTab, setActiveTab] = useState('analytics');

  const stats = [
    { label: 'Registered Seniors', value: '1,248', icon: 'people', color: '#10b981' },
    { label: 'Active Caregivers', value: '412', icon: 'home', color: '#6366f1' },
    { label: 'Meals Analyzed', value: '3,342', icon: 'nutrition', color: '#38bdf8' },
    { label: 'Compliance Rate', value: '94.2%', icon: 'checkmark-circle', color: '#f59e0b' },
  ];

  const benchmarks = [
    { metric: 'Health Score Latency', target: '< 2.0s', result: '1.18s', status: 'Passed ✓' },
    { metric: 'Daily Diet Plan Gen', target: '< 3.0s', result: '2.24s', status: 'Passed ✓' },
    { metric: 'NLP Dual Extraction', target: '< 800ms', result: '520ms', status: 'Passed ✓' },
    { metric: 'Database Query Time', target: '< 100ms', result: '42ms', status: 'Passed ✓' },
    { metric: 'Caregiver Delivery', target: '> 95%', result: '100% (612)', status: 'Passed ✓' },
  ];

  const foods = [
    { name: 'Sprouted Ragi Kanji', category: 'Breakfast', cal: 280, gi: 'Low (GI 42)', status: 'ICMR Recommended' },
    { name: 'Steamed Rice Idli (2 pcs)', category: 'Breakfast', cal: 150, gi: 'Med (GI 60)', status: 'Soft Diet ✓' },
    { name: 'Moong Dal Khichdi', category: 'Lunch', cal: 420, gi: 'Low (GI 38)', status: 'Diabetes Friendly' },
    { name: 'Steamed Moong Sundal', category: 'Snack', cal: 180, gi: 'Low (GI 35)', status: 'Protein Booster' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Admin Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Admin Control Center</Text>
          <Text style={styles.sub}>Clinical Research & System Analytics</Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabRow}>
          {[
            { id: 'analytics', label: 'Population Analytics' },
            { id: 'benchmarks', label: 'System Table I' },
            { id: 'food_db', label: 'IFCT Food DB' },
          ].map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.tab, activeTab === t.id && styles.tabActive]}
              onPress={() => setActiveTab(t.id)}
            >
              <Text style={[styles.tabText, activeTab === t.id && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'analytics' && (
          <View style={{ gap: 14 }}>
            {/* 4 Overview Metric Cards */}
            <View style={styles.grid}>
              {stats.map((s, i) => (
                <View key={i} style={styles.statCard}>
                  <SafeIcon name={s.icon} size={20} color={s.color} />
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* 4-Week Cohort Results (Fig. 4) */}
            <View style={styles.progressionCard}>
              <Text style={styles.cardHeader}>4-Week Pilot Study Progression (Fig. 4)</Text>
              <Text style={styles.cardSub}>Evaluated across elderly cohort (n=148, Chennai)</Text>

              <View style={styles.weekRow}>
                {[
                  { w: 'W1', score: '58.4', cal: '61%' },
                  { w: 'W2', score: '62.8', cal: '66%' },
                  { w: 'W3', score: '67.5', cal: '73%' },
                  { w: 'W4', score: '72.1', cal: '79%' },
                ].map((wk, idx) => (
                  <View key={idx} style={[styles.weekBox, idx === 3 && styles.weekBoxHighlight]}>
                    <Text style={styles.weekLabel}>{wk.w}</Text>
                    <Text style={styles.weekScore}>{wk.score}</Text>
                    <Text style={styles.weekCal}>Cal: {wk.cal}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.gainText}>⚡ Overall +23.5% Score Gain at Endpoint</Text>
            </View>
          </View>
        )}

        {activeTab === 'benchmarks' && (
          <View style={styles.benchmarkCard}>
            <Text style={styles.cardHeader}>System Performance Evaluation (Table I)</Text>
            {benchmarks.map((b, i) => (
              <View key={i} style={styles.benchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.benchMetric}>{b.metric}</Text>
                  <Text style={styles.benchTarget}>Target: {b.target}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.benchResult}>{b.result}</Text>
                  <Text style={styles.benchStatus}>{b.status}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'food_db' && (
          <View style={styles.foodCard}>
            <Text style={styles.cardHeader}>IFCT 2017 Validated Indian Food Items</Text>
            {foods.map((f, i) => (
              <View key={i} style={styles.foodRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.foodName}>{f.name}</Text>
                  <Text style={styles.foodMeta}>{f.category} • {f.cal} kcal • {f.gi}</Text>
                </View>
                <View style={styles.foodTag}>
                  <Text style={styles.foodTagText}>{f.status}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
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
    marginBottom: 14,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
  sub: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#6366f1',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '900',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 6,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  progressionCard: {
    backgroundColor: '#0f172a',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardHeader: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cardSub: {
    color: '#64748b',
    fontSize: 11,
    marginBottom: 14,
  },
  weekRow: {
    flexDirection: 'row',
    gap: 8,
  },
  weekBox: {
    flex: 1,
    backgroundColor: '#020617',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  weekBoxHighlight: {
    borderColor: '#10b98150',
    backgroundColor: '#10b98110',
  },
  weekLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  weekScore: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '900',
    marginVertical: 2,
  },
  weekCal: {
    color: '#64748b',
    fontSize: 9,
  },
  gainText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
  },
  benchmarkCard: {
    backgroundColor: '#0f172a',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  benchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  benchMetric: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  benchTarget: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 2,
  },
  benchResult: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: 'bold',
  },
  benchStatus: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '700',
  },
  foodCard: {
    backgroundColor: '#0f172a',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    gap: 8,
  },
  foodName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  foodMeta: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  foodTag: {
    backgroundColor: '#10b98115',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  foodTagText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
