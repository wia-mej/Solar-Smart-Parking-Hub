import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getMonProfil } from '../../core/services/utilisateur.service';
import { logout, getCurrentUser } from '../../core/services/auth.service';
import type { Utilisateur } from '../../core/models/utilisateur.model';
import type { ProfilStackParamList } from '../../navigation/ProfilStack';
import { colors, spacing, radius, typography } from '../../core/theme';
import Screen from '../../shared/Screen';
import AppButton from '../../shared/AppButton';

const LIBELLE_FORMULE: Record<string, string> = {
  BASIC: 'Basic',
  STANDARD: 'Standard',
  PREMIUM: 'Premium',
  CORPORATE: 'Corporate',
};

export default function ProfilScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfilStackParamList>>();

  const [profil, setProfil] = useState<Utilisateur | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setProfil(await getMonProfil());
    } catch {
      setProfil(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const email = profil?.email ?? getCurrentUser()?.email ?? '';
  const initiale = (profil?.prenom ?? email).charAt(0).toUpperCase() || '?';
  const nomComplet = profil ? `${profil.prenom} ${profil.nom}`.trim() : '';

  return (
    <Screen>
      <Text style={styles.title}>Mon compte</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initiale}</Text>
            </View>

            {nomComplet.length > 0 && <Text style={styles.nom}>{nomComplet}</Text>}
            <Text style={styles.email}>{email}</Text>

            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {profil?.role === 'ADMIN' ? 'Administrateur' : 'Conducteur'}
              </Text>
            </View>

            {profil?.telephone ? <Text style={styles.tel}>{profil.telephone}</Text> : null}
          </View>

          <TouchableOpacity
            style={styles.cardLeft}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Abonnement')}
          >
            <View style={styles.ligneEntete}>
              <Text style={styles.sectionTitle}>Abonnement</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </View>

            {profil?.abonnementActif && profil?.abonnementType ? (
              <View style={styles.abonnementBadge}>
                <Text style={styles.abonnementText}>
                  {LIBELLE_FORMULE[profil.abonnementType] ?? profil.abonnementType}
                </Text>
              </View>
            ) : (
              <Text style={styles.sectionBody}>
                Aucun abonnement actif — voir les formules ›
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.cardLeft}>
            <Text style={styles.sectionTitle}>Véhicules</Text>
            <Text style={styles.sectionBody}>
              {profil?.nombreVehicules
                ? `${profil.nombreVehicules} véhicule${profil.nombreVehicules > 1 ? 's' : ''} enregistré${profil.nombreVehicules > 1 ? 's' : ''}.`
                : 'Aucun véhicule enregistré.'}
            </Text>
          </View>

          <View style={{ height: spacing.xl }} />
          <AppButton label="Se déconnecter" variant="outline" onPress={logout} />
          <View style={{ height: spacing.lg }} />
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  cardLeft: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  ligneEntete: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
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
  nom: { ...typography.heading, fontSize: 18 },
  email: { ...typography.small, marginTop: 2 },
  tel: { ...typography.small, marginTop: spacing.sm },
  roleBadge: {
    marginTop: spacing.sm,
    backgroundColor: colors.primarySoft,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.sm,
  },
  roleText: { color: colors.primaryDark, fontWeight: '600', fontSize: 12 },
  sectionTitle: { ...typography.heading, fontSize: 16 },
  sectionBody: { ...typography.small, marginTop: spacing.xs },
  abonnementBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    backgroundColor: colors.solarSoft,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.sm,
  },
  abonnementText: { color: '#8A5A00', fontWeight: '700', fontSize: 12 },
});