import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { register, logout } from '../../core/services/auth.service';
import { inscrireConducteur } from '../../core/services/utilisateur.service';
import { colors, spacing, typography } from '../../core/theme';
import AppButton from '../../shared/AppButton';
import AppInput from '../../shared/AppInput';

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
      setError("Ce compte existe déjà ou l'email est invalide.");
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
      setError('Inscription impossible. Vérifie que le serveur est accessible.');
      setLoading(false);
      onBusyChange(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>
      <Text style={styles.subtitle}>Rejoins le réseau ParkRee</Text>

      <AppInput placeholder="Prénom" value={prenom} onChangeText={setPrenom} />
      <AppInput placeholder="Nom" value={nom} onChangeText={setNom} />
      <AppInput
        placeholder="Téléphone"
        keyboardType="phone-pad"
        value={telephone}
        onChangeText={setTelephone}
      />
      <AppInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <AppInput
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={{ marginTop: spacing.sm }}>
        <AppButton label="S'inscrire" onPress={submit} loading={loading} />
      </View>

      <TouchableOpacity onPress={onGoToLogin} style={styles.link}>
        <Text style={styles.linkText}>J'ai déjà un compte</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: { ...typography.title, textAlign: 'center' },
  subtitle: { ...typography.small, textAlign: 'center', marginBottom: spacing.xl },
  error: { color: colors.danger, marginBottom: spacing.sm, textAlign: 'center' },
  link: { marginTop: spacing.lg, alignItems: 'center' },
  linkText: { color: colors.primary, fontWeight: '600' },
});