import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SpendsScreenRoute() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transactions & Spends Ledger</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
  },
});
