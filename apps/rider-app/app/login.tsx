import { Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { Link } from 'expo-router';

export default function LoginScreen() {
  return (
    <Link href="/(app)" asChild>
      <Pressable style={styles.container}>
        <Text style={styles.title}>Rider Login</Text>
        <TextInput style={styles.input} placeholder="Phone" placeholderTextColor="#8a8078" />
        <Text style={styles.btn}>Continue →</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1410', padding: 24, justifyContent: 'center' },
  title: { color: '#f5f0e8', fontSize: 28, fontWeight: '700', marginBottom: 24 },
  input: {
    backgroundColor: '#2a221c',
    borderRadius: 12,
    padding: 16,
    color: '#f5f0e8',
    marginBottom: 16,
  },
  btn: { color: '#d4a853', fontSize: 16, fontWeight: '600', textAlign: 'center', marginTop: 16 },
});
