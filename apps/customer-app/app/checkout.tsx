import { StyleSheet, Text } from 'react-native';
import { Screen } from '@/components/layout/Screen';

export default function CheckoutScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Checkout</Text>
      <Text style={styles.sub}>Complete your order</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: '#f5f0e8', fontSize: 28, fontWeight: '700' },
  sub: { color: '#8a8078', fontSize: 14, marginTop: 8 },
});
