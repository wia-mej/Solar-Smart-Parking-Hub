import { View, Text, StyleSheet } from 'react-native';
import { getCurrentUser, logout } from '../../core/services/auth.service';
import { colors, spacing, radius, typography } from '../../core/theme';
import Screen from '../../shared/Screen';
import AppButton from '../../shared/AppButton';

export default function ProfilScreen() {
  const user = getCurrentUser();

  return (
    <Screen>
      <Text style={styles.title}>Mon compte</Text>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.email?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Conducteur</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Abonnement</Text>
        <Text style={styles.sectionBody}>Aucun abonnement actif.</Text>
      </View>

      <View style={styles.spacer} />
      <AppButton label="Se déconnecter" variant="outline" onPress={logout} />
      <View style={{ height: spacing.lg }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { fontSize: 26, fontWeight: '700', color: colors.primaryDark },
  email: { ...typography.body, fontWeight: '600' },
  roleBadge: {
    marginTop: spacing.sm,
    backgroundColor: colors.primarySoft,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.sm,
  },
  roleText: { color: colors.primaryDark, fontWeight: '600', fontSize: 12 },
  sectionTitle: { ...typography.heading, fontSize: 16, alignSelf: 'flex-start' },
  sectionBody: { ...typography.small, alignSelf: 'flex-start', marginTop: spacing.xs },
  spacer: { flex: 1 },
});