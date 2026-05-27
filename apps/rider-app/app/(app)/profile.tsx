import { StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rider profile</Text>
      <Text style={styles.name}>Delivery partner</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1410', padding: 24, paddingTop: 60 },
  title: { color: '#f5f0e8', fontSize: 24, fontWeight: '700', marginBottom: 16 },
  name: { color: '#8a8078', fontSize: 16 },
});
