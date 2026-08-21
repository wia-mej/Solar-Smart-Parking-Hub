import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { StationsStackParamList } from '../../navigation/StationsStack';
import type { Borne, Station, StatutBorne } from '../../core/models/station.model';
import { creerReservation } from '../../core/services/reservation.service';
import { demarrerSession } from '../../core/services/session.service';
import { colors, spacing, radius, typography } from '../../core/theme';
import Screen from '../../shared/Screen';
import AppButton from '../../shared/AppButton';
import { programmerAlertesCharge, programmerRappelFinReservation } from '../../core/services/notification.service';

const DUREES = [
  { label: '1 h', heures: 1 },
  { label: '2 h', heures: 2 },
  { label: '4 h', heures: 4 },
];

const LIBELLE_STATUT: Record<StatutBorne, string> = {
  DISPONIBLE: 'Disponible',
  OCCUPEE: 'Occupée',
  RESERVEE: 'Réservée',
  HORS_SERVICE: 'Hors service',
};

export default function StationDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<StationsStackParamList, 'StationDetail'>>();

  const [station, setStation] = useState<Station>(route.params.station);
  const [borneChoisie, setBorneChoisie] = useState<Borne | null>(null);
  const [dureeHeures, setDureeHeures] = useState(1);
  const [envoi, setEnvoi] = useState(false);

  const majBorne = (identifiant: string, statut: StatutBorne) => {
    setStation((s) => ({
      ...s,
      bornes: s.bornes.map((b) => (b.identifiant === identifiant ? { ...b, statut } : b)),
    }));
  };

  const reserver = async () => {
    if (!borneChoisie) return;
    setEnvoi(true);

    const debut = new Date();
    const fin = new Date(debut.getTime() + dureeHeures * 60 * 60 * 1000);

    try {
      await creerReservation(station.id, borneChoisie.identifiant, debut, fin);
      await programmerRappelFinReservation(station.nom, fin.toISOString());
      majBorne(borneChoisie.identifiant, 'RESERVEE');
      const identifiant = borneChoisie.identifiant;
      setBorneChoisie(null);
      Alert.alert(
        'Réservation confirmée',
        `Borne ${identifiant} réservée pour ${dureeHeures} heure${dureeHeures > 1 ? 's' : ''}.`,
      );
    } catch {
      Alert.alert('Réservation impossible', "Cette borne n'est peut-être plus disponible.");
    } finally {
      setEnvoi(false);
    }
  };

    const demarrer = async () => {
    if (!borneChoisie) return;
    setEnvoi(true);

      const origine = borneChoisie.statut === 'RESERVEE' ? 'RESERVEE' : 'WALK_IN';

      try {
        const session = await demarrerSession(station.id, borneChoisie.identifiant, origine);
        await programmerAlertesCharge(
          session.stationNom,
          session.borneIdentifiant,
          session.puissanceKw,
        );

        majBorne(borneChoisie.identifiant, 'OCCUPEE');
        setBorneChoisie(null);
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
          'Cette borne est peut-être occupée, ou une session est déjà en cours.',
        );
      } finally {
        setEnvoi(false);
      }
  };

  return (
    <Screen>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={22} color={colors.primaryDark} />
        <Text style={styles.backText}>Stations</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{station.nom}</Text>
        <Text style={styles.city}>{station.ville}</Text>
        <Text style={styles.address}>{station.adresse}</Text>

        <View style={styles.solarCard}>
          <Ionicons name="sunny-outline" size={20} color={colors.solar} />
          <Text style={styles.solarText}>
            {station.puissanceSolaireInstalleeKw} kW de solaire installé
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Bornes de recharge</Text>

        {station.bornes.map((borne) => {
          const utilisable = borne.statut === 'DISPONIBLE' || borne.statut === 'RESERVEE';
          const libre = borne.statut === 'DISPONIBLE';

          return (
            <TouchableOpacity
              key={borne.identifiant}
              style={[styles.borneCard, !utilisable && styles.borneCardOff]}
              disabled={!utilisable}
              activeOpacity={0.8}
              onPress={() => {
                setBorneChoisie(borne);
                setDureeHeures(1);
              }}
            >
              <View style={styles.borneInfo}>
                <Text style={styles.borneId}>{borne.identifiant}</Text>
                <Text style={styles.borneSpec}>
                  {borne.type === 'DC_RAPIDE' ? 'Charge rapide' : 'Charge standard'} ·{' '}
                  {borne.puissanceKw} kW
                </Text>
              </View>

              <View
                style={[
                  styles.statut,
                  libre ? styles.statutLibre : borne.statut === 'RESERVEE' ? styles.statutReserve : styles.statutOccupe,
                ]}
              >
                <Text
                  style={[
                    styles.statutText,
                    libre
                      ? styles.statutTextLibre
                      : borne.statut === 'RESERVEE'
                        ? styles.statutTextReserve
                        : styles.statutTextOccupe,
                  ]}
                >
                  {LIBELLE_STATUT[borne.statut]}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      <Modal visible={borneChoisie !== null} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Borne {borneChoisie?.identifiant}</Text>
            <Text style={styles.modalSubtitle}>
              {borneChoisie?.puissanceKw} kW ·{' '}
              {borneChoisie?.type === 'DC_RAPIDE' ? 'charge rapide' : 'charge standard'}
            </Text>

            <AppButton label="Démarrer la charge maintenant" onPress={demarrer} loading={envoi} />

            <View style={styles.separator}>
              <View style={styles.line} />
              <Text style={styles.separatorText}>ou réserver pour</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.durees}>
              {DUREES.map((d) => {
                const actif = d.heures === dureeHeures;
                return (
                  <TouchableOpacity
                    key={d.heures}
                    style={[styles.duree, actif && styles.dureeActive]}
                    onPress={() => setDureeHeures(d.heures)}
                  >
                    <Text style={[styles.dureeText, actif && styles.dureeTextActive]}>{d.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <AppButton
              label="Réserver cette borne"
              variant="outline"
              onPress={reserver}
              disabled={envoi || borneChoisie?.statut === 'RESERVEE'}
            />

            <TouchableOpacity
              style={styles.fermer}
              onPress={() => setBorneChoisie(null)}
              disabled={envoi}
            >
              <Text style={styles.fermerText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  backText: { color: colors.primaryDark, fontWeight: '600' },
  title: { ...typography.title, marginTop: spacing.sm },
  city: { color: colors.primaryDark, fontWeight: '500', marginTop: 2 },
  address: { ...typography.small, marginTop: spacing.xs },
  solarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.solarSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  solarText: { color: '#8A5A00', fontWeight: '600', fontSize: 13 },
  sectionTitle: { ...typography.heading, marginTop: spacing.lg, marginBottom: spacing.sm },
  borneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm + 4,
  },
  borneCardOff: { opacity: 0.55 },
  borneInfo: { flex: 1 },
  borneId: { ...typography.body, fontWeight: '600' },
  borneSpec: { ...typography.small, marginTop: 2 },
  statut: { paddingVertical: 6, paddingHorizontal: spacing.sm + 2, borderRadius: radius.sm },
  statutLibre: { backgroundColor: colors.primarySoft },
  statutReserve: { backgroundColor: colors.solarSoft },
  statutOccupe: { backgroundColor: colors.dangerSoft },
  statutText: { fontSize: 12, fontWeight: '600' },
  statutTextLibre: { color: colors.primaryDark },
  statutTextReserve: { color: '#8A5A00' },
  statutTextOccupe: { color: colors.danger },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  modalTitle: { ...typography.heading },
  modalSubtitle: { ...typography.small, marginTop: spacing.xs, marginBottom: spacing.lg },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.lg,
  },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  separatorText: { ...typography.small, fontSize: 12 },
  durees: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  duree: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  dureeActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  dureeText: { ...typography.small, fontWeight: '600' },
  dureeTextActive: { color: colors.primaryDark },
  fermer: { marginTop: spacing.md, alignItems: 'center', paddingVertical: spacing.sm },
  fermerText: { ...typography.small, fontWeight: '600' },
});