import { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getMesReservations, annulerReservation } from '../../core/services/reservation.service';
import { demarrerSession } from '../../core/services/session.service';
import { programmerAlertesCharge } from '../../core/services/notification.service';
import type { Reservation, StatutReservation } from '../../core/models/reservation.model';
import { formatDateHeure } from '../../core/date';
import { colors, spacing, radius, typography } from '../../core/theme';
import Screen from '../../shared/Screen';
import AppButton from '../../shared/AppButton';

const STATUT_STYLE: Record<StatutReservation, { label: string; bg: string; fg: string }> = {
  CONFIRMEE: { label: 'Confirmée', bg: colors.primarySoft, fg: colors.primaryDark },
  EN_ATTENTE: { label: 'En attente', bg: colors.solarSoft, fg: '#8A5A00' },
  ANNULEE: { label: 'Annulée', bg: colors.dangerSoft, fg: colors.danger },
  TERMINEE: { label: 'Terminée', bg: colors.border, fg: colors.textMuted },
};

export default function ReservationsScreen() {
  const navigation = useNavigation();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demarrageId, setDemarrageId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setReservations(await getMesReservations());
    } catch {
      setError('Impossible de joindre le serveur.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const lancerCharge = async (reservation: Reservation) => {
    setDemarrageId(reservation.id);
    try {
      const session = await demarrerSession(
        reservation.stationId,
        reservation.borneIdentifiant,
        'RESERVEE',
        reservation.id,
      );

      await programmerAlertesCharge(
        session.stationNom,
        session.borneIdentifiant,
        session.puissanceKw,
      );

      await load();

      Alert.alert('Charge démarrée', 'Tu seras prévenue à 80 % et en fin de charge.', [
        { text: 'Plus tard', style: 'cancel' },
        {
          text: 'Voir ma charge',
          onPress: () => navigation.getParent()?.navigate('Ma charge' as never),
        },
      ]);
    } catch {
      Alert.alert(
        'Démarrage impossible',
        'La borne est peut-être occupée, ou une session est déjà en cours.',
      );
    } finally {
      setDemarrageId(null);
    }
  };

  const demanderAnnulation = (reservation: Reservation) => {
    Alert.alert(
      'Annuler la réservation',
      `Borne ${reservation.borneIdentifiant} à ${reservation.stationNom} ?`,
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            try {
              await annulerReservation(reservation.id);
              load();
            } catch {
              Alert.alert('Erreur', "L'annulation n'a pas pu être enregistrée.");
            }
          },
        },
      ],
    );
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

  const actives = reservations.filter(
    (r) => r.statut === 'CONFIRMEE' || r.statut === 'EN_ATTENTE',
  ).length;

  return (
    <Screen>
      <Text style={styles.title}>Réservations</Text>
      <Text style={styles.subtitle}>
        {actives} réservation{actives > 1 ? 's' : ''} active{actives > 1 ? 's' : ''}
      </Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={reservations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.xl, paddingTop: spacing.sm }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.primary}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        ListEmptyComponent={
          !error ? (
            <Text style={styles.empty}>
              Aucune réservation pour l'instant.{'\n'}
              Choisis une station pour réserver une borne.
            </Text>
          ) : null
        }
        renderItem={({ item }) => {
          const statut = STATUT_STYLE[item.statut];
          const active = item.statut === 'CONFIRMEE' || item.statut === 'EN_ATTENTE';

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.station}>{item.stationNom}</Text>
                <View style={[styles.badge, { backgroundColor: statut.bg }]}>
                  <Text style={[styles.badgeText, { color: statut.fg }]}>{statut.label}</Text>
                </View>
              </View>

              <View style={styles.row}>
                <Ionicons name="flash-outline" size={15} color={colors.textMuted} />
                <Text style={styles.rowText}>Borne {item.borneIdentifiant}</Text>
              </View>
              <View style={styles.row}>
                <Ionicons name="time-outline" size={15} color={colors.textMuted} />
                <Text style={styles.rowText}>
                  {formatDateHeure(item.dateDebut)} → {formatDateHeure(item.dateFin)}
                </Text>
              </View>

              {active && (
                <>
                  <View style={{ marginTop: spacing.md }}>
                    <AppButton
                      label="Démarrer la charge"
                      onPress={() => lancerCharge(item)}
                      loading={demarrageId === item.id}
                      disabled={demarrageId !== null}
                    />
                  </View>

                  <TouchableOpacity style={styles.cancel} onPress={() => demanderAnnulation(item)}>
                    <Text style={styles.cancelText}>Annuler la réservation</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: typography.title,
  subtitle: { ...typography.small, marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm + 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  station: { ...typography.heading, fontSize: 17, flex: 1 },
  badge: { paddingVertical: 5, paddingHorizontal: spacing.sm + 2, borderRadius: radius.sm },
  badgeText: { fontSize: 12, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  rowText: { ...typography.small },
  cancel: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    alignItems: 'center',
  },
  cancelText: { color: colors.danger, fontWeight: '600', fontSize: 14 },
  error: { color: colors.danger, marginBottom: spacing.sm },
  empty: { ...typography.small, textAlign: 'center', marginTop: spacing.xl, lineHeight: 21 },
});