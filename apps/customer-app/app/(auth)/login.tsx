import { StyleSheet, Text, TextInput, Pressable } from 'react-native';
import { Screen } from '@/components/layout/Screen';

export default function LoginScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.sub}>Sign in to Happy Home</Text>
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#8a8078" />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#8a8078"
        secureTextEntry
      />
      <Pressable style={styles.btn}>
        <Text style={styles.btnText}>Sign in</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: '#f5f0e8', fontSize: 28, fontWeight: '700' },
  sub: { color: '#8a8078', fontSize: 14, marginTop: 8, marginBottom: 24 },
  input: {
    backgroundColor: '#2a221c',
    borderRadius: 12,
    padding: 16,
    color: '#f5f0e8',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  btn: {
    marginTop: 16,
    backgroundColor: '#d4a853',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: { color: '#1a1410', fontSize: 16, fontWeight: '700' },
});
