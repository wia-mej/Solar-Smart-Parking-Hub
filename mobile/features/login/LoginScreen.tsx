import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { login } from '../../core/services/auth.service';
import { colors, spacing, radius, typography } from '../../core/theme';
import AppButton from '../../shared/AppButton';
import AppInput from '../../shared/AppInput';

export default function LoginScreen({ onGoToSignup }: { onGoToSignup: () => void }) {
  const [email, setEmail] = useState('');
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
      <View style={styles.brand}>
        <View style={styles.logoDot} />
        <Text style={styles.brandName}>ParkRee</Text>
        <Text style={styles.brandTagline}>Recharge solaire intelligente</Text>
      </View>

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
        <AppButton label="Se connecter" onPress={submit} loading={loading} />
      </View>

      <TouchableOpacity onPress={onGoToSignup} style={styles.link}>
        <Text style={styles.linkText}>Créer un compte conducteur</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  brand: { alignItems: 'center', marginBottom: spacing.xl },
  logoDot: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    marginBottom: spacing.md,
  },
  brandName: { ...typography.title, fontSize: 34 },
  brandTagline: { ...typography.small, marginTop: spacing.xs },
  error: { color: colors.danger, marginBottom: spacing.sm, textAlign: 'center' },
  link: { marginTop: spacing.lg, alignItems: 'center' },
  linkText: { color: colors.primary, fontWeight: '600' },
});