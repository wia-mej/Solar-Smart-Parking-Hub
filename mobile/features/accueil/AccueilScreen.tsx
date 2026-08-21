import { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getMonProfil } from '../../core/services/utilisateur.service';
import { getMaSessionEnCours, getMesSessions } from '../../core/services/session.service';
import { getMesReservations } from '../../core/services/reservation.service';
import { getAllStations } from '../../core/services/station.service';
import { getMeilleurCreneau } from '../../core/services/prediction.service';
import type { Utilisateur } from '../../core/models/utilisateur.model';
import type { SessionCharge } from '../../core/models/session.model';
import type { Reservation } from '../../core/models/reservation.model';
import type { MeilleurCreneau } from '../../core/models/prediction.model';
import { formatDateHeure } from '../../core/date';
import { colors, spacing, radius, typography } from '../../core/theme';
import Screen from '../../shared/Screen';

/** Villes pour lesquelles un modèle de prédiction a été entraîné. */
const VILLES_IA = ['Casablanca', 'Rabat', 'Tanger', 'Marrakech'];

export default function AccueilScreen() {
  const navigation = useNavigation();

  const [profil, setProfil] = useState<Utilisateur | null>(null);
  const [session, setSession] = useState<SessionCharge | null>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [sessions, setSessions] = useState<SessionCharge[]>([]);
  const [villes, setVilles] = useState<string[]>([]);
  const [ville, setVille] = useState<string | null>(null);
  const [creneaux, setCreneaux] = useState<MeilleurCreneau | null>(null);
  const [creneauxErreur, setCreneauxErreur] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [monProfil, enCours, mesReservations, mesSessions, stations] = await Promise.all([
        getMonProfil(),
        getMaSessionEnCours(),
        getMesReservations(),
        getMesSessions(),
        getAllStations(),
      ]);

      setProfil(monProfil);
      setSession(enCours);
      setSessions(mesSessions);
      setReservation(
        mesReservations.find((r) => r.statut === 'CONFIRMEE' || r.statut === 'EN_ATTENTE') ?? null,
      );

      const disponibles = VILLES_IA.filter((v) =>
        stations.some((s) => s.ville.toLowerCase() === v.toLowerCase()),
      );
      setVilles(disponibles);
      setVille((actuelle) => actuelle ?? disponibles[0] ?? null);
    } catch {
      // Les cartes concernées resteront simplement vides
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // La recommandation est rechargée dès que la ville change
  useFocusEffect(
    useCallback(() => {
      if (!ville) return;
      let annule = false;
      setCreneauxErreur(false);

      getMeilleurCreneau(ville)
        .then((r) => {
          if (!annule) setCreneaux(r);
        })
        .catch(() => {
          if (!annule) setCreneauxErreur(true);
        });

      return () => {
        annule = true;
      };
    }, [ville]),
  );

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  const debutMois = new Date();
  debutMois.setDate(1);
  debutMois.setHours(0, 0, 0, 0);

  const sessionsDuMois = sessions.filter(
    (s) => s.statut !== 'EN_COURS' && new Date(s.dateDebut) >= debutMois,
  );
  const energieMois = sessionsDuMois.reduce((total, s) => total + s.energieConsommeeKwh, 0);

  const maxPct = creneaux ? Math.max(...creneaux.creneaux.map((c) => c.disponibilitePct), 1) : 1;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.bonjour}>
          Bonjour{profil?.prenom ? `, ${profil.prenom}` : ''}
        </Text>
        <Text style={styles.sousTitre}>
          {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </Text>

        {session && (
          <TouchableOpacity
            style={styles.carteCharge}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Ma charge' as never)}
          >
            <View style={styles.ligne}>
              <View style={styles.pointVert} />
              <Text style={styles.chargeLabel}>Charge en cours</Text>
            </View>
            <Text style={styles.chargeStation}>{session.stationNom}</Text>
            <Text style={styles.chargeInfo}>
              Borne {session.borneIdentifiant} · {session.puissanceKw} kW
            </Text>
            <Text style={styles.chargeLien}>Voir le suivi ›</Text>
          </TouchableOpacity>
        )}

        {!session && reservation && (
          <TouchableOpacity
            style={styles.carte}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Réservations' as never)}
          >
            <Text style={styles.carteTitre}>Prochaine réservation</Text>
            <Text style={styles.carteValeur}>{reservation.stationNom}</Text>
            <Text style={styles.carteInfo}>
              Borne {reservation.borneIdentifiant} · {formatDateHeure(reservation.dateDebut)}
            </Text>
          </TouchableOpacity>
        )}

        {!session && !reservation && (
          <TouchableOpacity
            style={styles.carte}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Stations' as never)}
          >
            <Text style={styles.carteTitre}>Aucune charge prévue</Text>
            <Text style={styles.carteInfo}>Trouve une station et réserve une borne ›</Text>
          </TouchableOpacity>
        )}

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValeur}>{energieMois.toFixed(1)}</Text>
            <Text style={styles.statLabel}>kWh ce mois</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValeur}>{sessionsDuMois.length}</Text>
            <Text style={styles.statLabel}>
              recharge{sessionsDuMois.length > 1 ? 's' : ''} ce mois
            </Text>
          </View>
        </View>

        <View style={styles.carteIa}>
          <View style={styles.ligne}>
            <Ionicons name="sunny" size={18} color={colors.solar} />
            <Text style={styles.iaTitre}>Meilleur moment pour recharger</Text>
          </View>

          {villes.length > 1 && (
            <View style={styles.villes}>
              {villes.map((v) => {
                const actif = v === ville;
                return (
                  <TouchableOpacity
                    key={v}
                    style={[styles.villeChip, actif && styles.villeChipActif]}
                    onPress={() => setVille(v)}
                  >
                    <Text style={[styles.villeText, actif && styles.villeTextActif]}>{v}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {creneauxErreur ? (
            <Text style={styles.iaErreur}>
              Prédiction indisponible — le service IA ne répond pas.
            </Text>
          ) : creneaux?.meilleur ? (
            <>
              <Text style={styles.iaHeure}>
                {new Date(creneaux.meilleur.heure).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <Text style={styles.iaDetail}>
                {Math.round(creneaux.meilleur.disponibilitePct)} % de bornes libres prévues à{' '}
                {ville}
              </Text>

              <View style={styles.graphique}>
                {creneaux.creneaux.map((c) => {
                  const hauteur = Math.max(4, (c.disponibilitePct / maxPct) * 54);
                  const estMeilleur = c.heure === creneaux.meilleur?.heure;
                  return (
                    <View key={c.heure} style={styles.barreBloc}>
                      <View
                        style={[
                          styles.barre,
                          { height: hauteur },
                          estMeilleur && styles.barreMeilleure,
                        ]}
                      />
                      <Text style={styles.barreLabel}>
                        {new Date(c.heure).getHours()}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <Text style={styles.iaNote}>
                Prédiction du modèle IA sur les 12 prochaines heures, privilégiant les heures
                d'ensoleillement.
              </Text>
            </>
          ) : (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
          )}
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bonjour: { ...typography.title },
  sousTitre: { ...typography.small, marginTop: 2, marginBottom: spacing.lg, textTransform: 'capitalize' },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  carteCharge: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  pointVert: { width: 8, height: 8, borderRadius: radius.pill, backgroundColor: colors.primary },
  chargeLabel: { color: colors.primaryDark, fontWeight: '700', fontSize: 12 },
  chargeStation: { ...typography.heading, marginTop: spacing.sm },
  chargeInfo: { ...typography.small, marginTop: 2 },
  chargeLien: { color: colors.primary, fontWeight: '700', fontSize: 13, marginTop: spacing.md },
  carte: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  carteTitre: { ...typography.small, fontWeight: '700', textTransform: 'uppercase', fontSize: 11 },
  carteValeur: { ...typography.heading, marginTop: spacing.sm },
  carteInfo: { ...typography.small, marginTop: spacing.xs },
  stats: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValeur: { fontSize: 24, fontWeight: '700', color: colors.primaryDark },
  statLabel: { ...typography.small, fontSize: 11, marginTop: 2, textAlign: 'center' },
  carteIa: {
    backgroundColor: colors.solarSoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  iaTitre: { color: '#8A5A00', fontWeight: '700', fontSize: 13 },
  villes: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  villeChip: {
    paddingVertical: 5,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  villeChipActif: { backgroundColor: colors.solar },
  villeText: { fontSize: 12, fontWeight: '600', color: '#8A5A00' },
  villeTextActif: { color: '#fff' },
  iaHeure: { fontSize: 34, fontWeight: '700', color: '#8A5A00', marginTop: spacing.md },
  iaDetail: { ...typography.small, color: '#8A5A00' },
  graphique: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    height: 72,
  },
  barreBloc: { alignItems: 'center', flex: 1 },
  barre: {
    width: 10,
    borderRadius: 3,
    backgroundColor: 'rgba(245,158,11,0.35)',
  },
  barreMeilleure: { backgroundColor: colors.solar },
  barreLabel: { fontSize: 9, color: '#8A5A00', marginTop: 4 },
  iaNote: { fontSize: 10, color: '#8A5A00', opacity: 0.8, marginTop: spacing.md, lineHeight: 14 },
  iaErreur: { ...typography.small, color: '#8A5A00', marginTop: spacing.md },
});