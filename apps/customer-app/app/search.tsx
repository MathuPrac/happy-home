import { StyleSheet, Text } from 'react-native';
import { Screen } from '@/components/layout/Screen';

export default function SearchScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Search</Text>
      <Text style={styles.sub}>Find your favourite dishes</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: '#f5f0e8', fontSize: 28, fontWeight: '700' },
  sub: { color: '#8a8078', fontSize: 14, marginTop: 8 },
});
