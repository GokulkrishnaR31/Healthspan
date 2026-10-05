import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

// High-fidelity emoji & symbol icons (100% crash-proof on all Android Hermes, iOS, and Web devices)
const symbolMap = {
  'home': '🏠',
  'home-outline': '🏠',
  'restaurant': '🥗',
  'restaurant-outline': '🥗',
  'mic': '🎙️',
  'mic-outline': '🎙️',
  'people': '👨‍👩‍👧',
  'people-outline': '👨‍👩‍👧',
  'water': '💧',
  'walk': '👟',
  'nutrition': '🥛',
  'pulse': '❤️',
  'warning': '🚨',
  'checkmark-circle': '✅',
  'chevron-forward': '›',
  'call': '📞',
  'logo-whatsapp': '💬',
  'medkit': '💊',
  'leaf': '🌿',
  'stop': '⏹️',
};

export default function SafeIcon({ name, size = 20, color, style }) {
  const symbol = symbolMap[name] || '✨';

  return (
    <View style={[styles.container, { width: size + 4, height: size + 4 }, style]}>
      <Text style={{ fontSize: size * 0.9, textAlign: 'center', includeFontPadding: false }}>
        {symbol}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
