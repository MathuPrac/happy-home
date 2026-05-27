import { StyleSheet, Text, View } from 'react-native';

export default function EarningsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Earnings</Text>
      <Text style={styles.amount}>LKR 0</Text>
      <Text style={styles.sub}>Today&apos;s total</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1410', padding: 24, paddingTop: 60 },
  title: { color: '#f5f0e8', fontSize: 24, fontWeight: '700' },
  amount: { color: '#d4a853', fontSize: 40, fontWeight: '700', marginTop: 24 },
  sub: { color: '#8a8078', fontSize: 14, marginTop: 8 },
});
