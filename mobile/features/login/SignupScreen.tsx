import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { register, logout } from '../../core/services/auth.service';
import { inscrireConducteur } from '../../core/services/utilisateur.service';

type Props = {
  onGoToLogin: () => void;
  onBusyChange: (busy: boolean) => void;
};

export default function SignupScreen({ onGoToLogin, onBusyChange }: Props) {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!nom.trim() || !prenom.trim() || !email.trim() || password.length < 6) {
      setError('Remplis tous les champs (mot de passe : 6 caractères minimum).');
      return;
    }

    setLoading(true);
    setError(null);
    onBusyChange(true);

    try {
      await register(email.trim(), password);
    } catch {
      setError('Ce compte existe déjà ou l\'email est invalide.');
      setLoading(false);
      onBusyChange(false);
      return;
    }

    try {
      await inscrireConducteur(nom.trim(), prenom.trim(), telephone.trim());
      onBusyChange(false);
    } catch {
      // Le compte Firebase existe mais l'enregistrement métier a échoué :
      // on déconnecte pour ne pas laisser l'utilisateur dans un état incohérent.
      await logout();
      setError("Inscription impossible. Vérifie que le serveur est accessible.");
      setLoading(false);
      onBusyChange(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>
      <Text style={styles.subtitle}>Espace conducteur</Text>

      <TextInput style={styles.input} placeholder="Prénom" value={prenom} onChangeText={setPrenom} />
      <TextInput style={styles.input} placeholder="Nom" value={nom} onChangeText={setNom} />
      <TextInput
        style={styles.input} placeholder="Téléphone" keyboardType="phone-pad"
        value={telephone} onChangeText={setTelephone}
      />
      <TextInput
        style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address"
        value={email} onChangeText={setEmail}
      />
      <TextInput
        style={styles.input} placeholder="Mot de passe" secureTextEntry
        value={password} onChangeText={setPassword}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.button} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>S'inscrire</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={onGoToLogin} style={styles.link}>
        <Text style={styles.linkText}>J'ai déjà un compte</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#002860', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#0098c0', textAlign: 'center', marginBottom: 28 },
  input: {
    borderWidth: 1, borderColor: '#d7dde5', borderRadius: 8,
    padding: 14, marginBottom: 12, fontSize: 16,
  },
  error: { color: '#c0392b', marginBottom: 12, textAlign: 'center' },
  button: { backgroundColor: '#002860', borderRadius: 8, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { marginTop: 18, alignItems: 'center' },
  linkText: { color: '#0098c0', fontWeight: '600' },
});