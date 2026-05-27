import { StyleSheet, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/layout/Screen';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen>
      <Text style={styles.title}>Category</Text>
      <Text style={styles.sub}>Browsing category {id}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: '#f5f0e8', fontSize: 28, fontWeight: '700' },
  sub: { color: '#8a8078', fontSize: 14, marginTop: 8 },
});
