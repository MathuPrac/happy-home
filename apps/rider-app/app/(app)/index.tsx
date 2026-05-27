import { StyleSheet, Text, View } from 'react-native';

export default function RiderDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active deliveries</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>No active orders</Text>
        <Text style={styles.cardSub}>New delivery requests will appear here.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1410', padding: 24, paddingTop: 60 },
  title: { color: '#f5f0e8', fontSize: 24, fontWeight: '700', marginBottom: 16 },
  card: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#2a221c',
    borderWidth: 1,
    borderColor: 'rgba(212,168,83,0.15)',
  },
  cardTitle: { color: '#f5f0e8', fontSize: 18, fontWeight: '600' },
  cardSub: { color: '#8a8078', fontSize: 14, marginTop: 8 },
});
