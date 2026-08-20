import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { login } from '../../core/services/auth.service';

export default function LoginScreen({ onGoToSignup }: { onGoToSignup: () => void }) {  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      await login(email.trim(), password);
    } catch {
      setError('Email ou mot de passe incorrect.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ParkRee</Text>
      <Text style={styles.subtitle}>Espace conducteur</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.button} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Se connecter</Text>}
      </TouchableOpacity>
        <TouchableOpacity onPress={onGoToSignup} style={styles.link}>
             <Text style={styles.linkText}>Créer un compte conducteur</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#002860', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#0098c0', textAlign: 'center', marginBottom: 32 },
  input: {
    borderWidth: 1, borderColor: '#d7dde5', borderRadius: 8,
    padding: 14, marginBottom: 14, fontSize: 16,
  },
  error: { color: '#c0392b', marginBottom: 12, textAlign: 'center' },
  button: {
    backgroundColor: '#002860', borderRadius: 8, padding: 16, alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    link: { marginTop: 18, alignItems: 'center' },
  linkText: { color: '#0098c0', fontWeight: '600' },
});

