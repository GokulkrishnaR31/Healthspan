import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  SafeAreaView,
} from 'react-native';
import SafeIcon from '../components/SafeIcon';

export default function ElderCareTeamScreen() {
  const caregivers = [
    {
      name: 'Priya Verma',
      relation: 'Daughter / Primary Caregiver',
      phone: '+91 98765 43210',
      status: 'Active • Linked via ELDER-8090',
    },
    {
      name: 'Dr. A. Kalaivani',
      relation: 'Family Physician & Geriatrician',
      phone: '+91 98400 12345',
      status: 'Verified Doctor',
    },
  ];

  const handleCall = (phone) => {
    try {
      Linking.openURL(`tel:${phone}`);
    } catch (e) {}
  };

  const handleWhatsApp = (phone) => {
    try {
      Linking.openURL(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=Hello,%20this%20is%20Deepan%20Kumar%20from%20HealthSpan.`);
    } catch (e) {}
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Family Care Team</Text>
        <Text style={styles.pageSubtitle}>Connected family members receive your real-time nutrition alerts, health digests & emergency SOS broadcasts.</Text>

        {caregivers.map((c, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.caregiverName}>{c.name}</Text>
              <Text style={styles.caregiverRelation}>{c.relation}</Text>
              <Text style={styles.caregiverPhone}>{c.phone}</Text>
              <Text style={styles.caregiverStatus}>{c.status}</Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.callBtn} onPress={() => handleCall(c.phone)}>
                <SafeIcon name="call" size={16} color="#ffffff" />
                <Text style={styles.callBtnText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.waBtn} onPress={() => handleWhatsApp(c.phone)}>
                <SafeIcon name="logo-whatsapp" size={16} color="#ffffff" />
                <Text style={styles.waBtnText}>WhatsApp</Text>
              </TouchableOpacity>
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
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 14,
  },
  cardInfo: {
    marginBottom: 12,
  },
  caregiverName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  caregiverRelation: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  caregiverPhone: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 4,
  },
  caregiverStatus: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 10,
  },
  callBtn: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  callBtnText: {
    color: '#020617',
    fontWeight: 'bold',
    fontSize: 13,
  },
  waBtn: {
    flex: 1,
    backgroundColor: '#22c55e',
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  waBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
