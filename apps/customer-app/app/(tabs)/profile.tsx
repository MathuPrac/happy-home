import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { USER } from '@/constants/mock-data';

export default function ProfileScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.card}>
        <Text style={styles.name}>{USER.name}</Text>
        <Text style={styles.email}>hello@happyhome.lk</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: '#f5f0e8', fontSize: 28, fontWeight: '700', marginBottom: 24 },
  card: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#2a221c',
    borderWidth: 1,
    borderColor: 'rgba(212,168,83,0.15)',
  },
  name: { color: '#f5f0e8', fontSize: 20, fontWeight: '600' },
  email: { color: '#8a8078', fontSize: 14, marginTop: 4 },
});
