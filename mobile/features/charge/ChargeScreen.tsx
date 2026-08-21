import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  getMaSessionEnCours,
  getMesSessions,
  arreterSession,
} from '../../core/services/session.service';
import { annulerAlertes, CAPACITE_BATTERIE_KWH } from '../../core/services/notification.service';
import type { SessionCharge } from '../../core/models/session.model';
import { formatDateHeure, formatDuree } from '../../core/date';
import { colors, spacing, radius, typography } from '../../core/theme';
import Screen from '../../shared/Screen';
import AppButton from '../../shared/AppButton';

export default function ChargeScreen() {
  const [session, setSession] = useState<SessionCharge | null>(null);
  const [historique, setHistorique] = useState<SessionCharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [arret, setArret] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [baseSecondes, setBaseSecondes] = useState(0);
  const [ancrage, setAncrage] = useState(Date.now());
  const [maintenant, setMaintenant] = useState(Date.now());

  const load = useCallback(async () => {
    setError(null);
    try {
      const [enCours, toutes] = await Promise.all([getMaSessionEnCours(), getMesSessions()]);
      setSession(enCours);
      setBaseSecondes(enCours?.dureeSecondes ?? 0);
      setAncrage(Date.now());
      setMaintenant(Date.now());
      setHistorique(toutes.filter((s) => s.statut !== 'EN_COURS'));
    } catch {
      setError('Impossible de joindre le serveur.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => {
    if (!session) return;
    const timer = setInterval(() => setMaintenant(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [session]);

  const stopper = () => {
    if (!session) return;
    Alert.alert('Arrêter la charge', `Borne ${session.borneIdentifiant} ?`, [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui, arrêter',
        style: 'destructive',
        onPress: async () => {
          setArret(true);
          try {
            await arreterSession(session.id);
            await annulerAlertes();
            await load();
          } catch {
            Alert.alert('Erreur', "La session n'a pas pu être arrêtée.");
          } finally {
            setArret(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  const secondes = session ? baseSecondes + (maintenant - ancrage) / 1000 : 0;
  const energie = (secondes / 3600) * (session?.puissanceKw ?? 0);
  const pourcentage = Math.min(100, (energie / CAPACITE_BATTERIE_KWH) * 100);

  return (
    <Screen>
      <Text style={styles.title}>Ma charge</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <ScrollView showsVerticalScrollIndicator={false}>
        {session ? (
          <>
            {pourcentage >= 100 ? (
              <View style={[styles.banniere, styles.banniereVerte]}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primaryDark} />
                <Text style={styles.banniereVerteText}>
                  Charge complète — pense à libérer la place.
                </Text>
              </View>
            ) : pourcentage >= 80 ? (
              <View style={[styles.banniere, styles.banniereAmbre]}>
                <Ionicons name="battery-charging" size={20} color={colors.solar} />
                <Text style={styles.banniereAmbreText}>
                  Charge à 80 % — tu peux bientôt repartir.
                </Text>
              </View>
            ) : null}

            <View style={styles.liveCard}>
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.livePillText}>Charge en cours</Text>
              </View>

              <Text style={styles.liveStation}>{session.stationNom}</Text>
              <Text style={styles.liveBorne}>
                Borne {session.borneIdentifiant} · {session.puissanceKw} kW
              </Text>

              <Text style={styles.chrono}>{formatDuree(secondes)}</Text>

              <View style={styles.energieBox}>
                <Ionicons name="flash" size={18} color={colors.solar} />
                <Text style={styles.energieText}>{energie.toFixed(2)} kWh estimés</Text>
              </View>

              <View style={styles.barreFond}>
                <View
                  style={[
                    styles.barreRemplie,
                    { width: `${pourcentage}%` },
                    pourcentage >= 100 && styles.barreComplete,
                  ]}
                />
              </View>
              <Text style={styles.barreLegende}>
                {Math.round(pourcentage)} % — estimation sur une batterie de{' '}
                {CAPACITE_BATTERIE_KWH} kWh
              </Text>

              <Text style={styles.depuis}>Démarrée à {formatDateHeure(session.dateDebut)}</Text>

              <View style={{ marginTop: spacing.lg }}>
                <AppButton label="Arrêter la charge" onPress={stopper} loading={arret} />
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="flash-off-outline" size={34} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Aucune charge en cours</Text>
            <Text style={styles.emptyText}>
              Choisis une station dans l'onglet Stations pour démarrer une recharge.
            </Text>
          </View>
        )}

        {historique.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Historique</Text>
            {historique.map((s) => (
              <View key={s.id} style={styles.histCard}>
                <View style={styles.histHeader}>
                  <Text style={styles.histStation}>{s.stationNom}</Text>
                  <Text style={styles.histEnergie}>{s.energieConsommeeKwh} kWh</Text>
                </View>
                <Text style={styles.histInfo}>
                  Borne {s.borneIdentifiant} · {formatDateHeure(s.dateDebut)}
                  {s.dateFin ? ` → ${formatDateHeure(s.dateFin)}` : ''}
                </Text>
              </View>
            ))}
          </>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { ...typography.title, marginBottom: spacing.md },
  banniere: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  banniereAmbre: { backgroundColor: colors.solarSoft },
  banniereAmbreText: { color: '#8A5A00', fontWeight: '600', fontSize: 13, flex: 1 },
  banniereVerte: { backgroundColor: colors.primarySoft },
  banniereVerteText: { color: colors.primaryDark, fontWeight: '600', fontSize: 13, flex: 1 },
  liveCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    padding: spacing.lg,
    alignItems: 'center',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  liveDot: { width: 8, height: 8, borderRadius: radius.pill, backgroundColor: colors.primary },
  livePillText: { color: colors.primaryDark, fontWeight: '700', fontSize: 12 },
  liveStation: { ...typography.heading, marginTop: spacing.md },
  liveBorne: { ...typography.small, marginTop: 2 },
  chrono: {
    fontSize: 44,
    fontWeight: '700',
    color: colors.primaryDark,
    marginTop: spacing.md,
    fontVariant: ['tabular-nums'],
  },
  energieBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.solarSoft,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  energieText: { color: '#8A5A00', fontWeight: '700' },
  barreFond: {
    width: '100%',
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  barreRemplie: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.solar },
  barreComplete: { backgroundColor: colors.primary },
  barreLegende: { ...typography.small, fontSize: 11, marginTop: spacing.sm },
  depuis: { ...typography.small, marginTop: spacing.md },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: { ...typography.heading, fontSize: 17, marginTop: spacing.md },
  emptyText: { ...typography.small, textAlign: 'center', marginTop: spacing.xs, lineHeight: 20 },
  sectionTitle: {
    ...typography.heading,
    fontSize: 17,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  histCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  histHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  histStation: { ...typography.body, fontWeight: '600', flex: 1 },
  histEnergie: { color: colors.primaryDark, fontWeight: '700' },
  histInfo: { ...typography.small, marginTop: spacing.xs },
  error: { color: colors.danger, marginBottom: spacing.sm },
});