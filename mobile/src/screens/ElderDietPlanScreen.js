import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import SafeIcon from '../components/SafeIcon';

export default function ElderDietPlanScreen() {
  const [dietPlan] = useState([
    {
      meal: 'Breakfast (8:30 AM)',
      items: 'Sprouted Ragi Kanji + 2 Steamed Rice Idlis + Mint Chutney',
      calcium: '320 mg',
      gi: 'Low GI (42)',
      tag: 'Bone Target Boost',
    },
    {
      meal: 'Mid-Morning Snack (11:00 AM)',
      items: 'Tender Coconut Water (Fresh) + 4 Roasted Almonds',
      calcium: '65 mg',
      gi: 'Low GI',
      tag: 'Hydration & Minerals',
    },
    {
      meal: 'Lunch (1:30 PM)',
      items: 'Red Rice / Brown Rice (1 cup) + Drumstick Moong Sambar + Lauki Curry + Curd (100g)',
      calcium: '280 mg',
      gi: 'Low GI (45)',
      tag: 'High Calcium & Fiber',
    },
    {
      meal: 'Evening Snack (5:00 PM)',
      items: 'Steamed Moong Dal Sundal + Cardamom Green Tea',
      calcium: '90 mg',
      gi: 'Low GI',
      tag: 'Protein Booster',
    },
    {
      meal: 'Dinner (8:00 PM)',
      items: '2 Soft Phulkas / Oats Upma + Steamed Palak Dal + Warm Turmeric Milk',
      calcium: '340 mg',
      gi: 'Soft Chew Diet',
      tag: 'Anti-inflammatory',
    },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Personalized ICMR Diet Plan</Text>
        <Text style={styles.pageSubtitle}>Tailored for Senior Bone Health (Calcium target: 1,000 mg/day) & Cognitive Support.</Text>

        {dietPlan.map((slot, index) => (
          <View key={index} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealTime}>{slot.meal}</Text>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{slot.tag}</Text>
              </View>
            </View>

            <Text style={styles.mealItems}>{slot.items}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <SafeIcon name="nutrition" size={14} color="#818cf8" />
                <Text style={styles.metaText}>Calcium: {slot.calcium}</Text>
              </View>
              <View style={styles.metaItem}>
                <SafeIcon name="leaf" size={14} color="#10b981" />
                <Text style={styles.metaText}>{slot.gi}</Text>
              </View>
            </View>
          </View>
        ))}
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
  pageTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  pageSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  mealCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 14,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTime: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tagBadge: {
    backgroundColor: '#10b98115',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: 'bold',
  },
  mealItems: {
    color: '#f8fafc',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
});
