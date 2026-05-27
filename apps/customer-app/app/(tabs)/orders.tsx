import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';

export default function OrdersScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Your orders</Text>
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptySub}>Your order history will appear here.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: '#f5f0e8', fontSize: 28, fontWeight: '700', marginBottom: 24 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#2a221c',
  },
  emptyTitle: { color: '#f5f0e8', fontSize: 18, fontWeight: '600' },
  emptySub: { color: '#8a8078', fontSize: 14, marginTop: 8 },
});
