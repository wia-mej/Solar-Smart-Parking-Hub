import { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  getMonProfil,
  souscrireAbonnement,
  resilierAbonnement,
} from '../../core/services/utilisateur.service';
import type { TypeAbonnement, Utilisateur } from '../../core/models/utilisateur.model';
import { colors, spacing, radius, typography } from '../../core/theme';
import Screen from '../../shared/Screen';
import AppButton from '../../shared/AppButton';

type Formule = {
  type: TypeAbonnement;
  nom: string;
  cible: string;
  prix: number | null;
  avantages: string[];
};

/** Formules issues du Cahier des Charges §3.4. Tarifs encore indicatifs. */
const FORMULES: Formule[] = [
  {
    type: 'BASIC',
    nom: 'Basic',
    cible: 'Particulier scooter',
    prix: 99,
    avantages: [
      'Swap de batterie scooter illimité',
      'Sans place VE dédiée',
      'Support sous 48 h',
    ],
  },
  {
    type: 'STANDARD',
    nom: 'Standard',
    cible: 'Véhicule électrique',
    prix: 249,
    avantages: [
      '200 kWh inclus par mois',
      'Place en pool ou dédiée',
      'Support sous 24 h',
    ],
  },
  {
    type: 'PREMIUM',
    nom: 'Premium',
    cible: 'Usage mixte',
    prix: 449,
    avantages: [
      '400 kWh inclus par mois',
      'Place dédiée garantie',
      'Swap scooter illimité',
      'Réservation prioritaire',
      'Support sous 12 h',
    ],
  },
  {
    type: 'CORPORATE',
    nom: 'Corporate',
    cible: "Flotte d'entreprise",
    prix: null,
    avantages: [
      'kWh illimités selon contrat',
      'Places réservées sur mesure',
      'Tableau de bord flotte dédié',
      'Facturation consolidée',
      'Support sous 4 h',
    ],
  },
];

export default function AbonnementScreen() {
  const navigation = useNavigation();

  const [profil, setProfil] = useState<Utilisateur | null>(null);
  const [loading, setLoading] = useState(true);
  const [formuleChoisie, setFormuleChoisie] = useState<Formule | null>(null);
  const [paiement, setPaiement] = useState(false);

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

  const payer = async () => {
    if (!formuleChoisie) return;
    setPaiement(true);

    // Paiement fictif : on simule le délai d'une passerelle bancaire.
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const maj = await souscrireAbonnement(formuleChoisie.type);
      setProfil(maj);
      const nom = formuleChoisie.nom;
      setFormuleChoisie(null);
      Alert.alert('Abonnement activé', `Ta formule ${nom} est active pour un mois.`);
    } catch {
      Alert.alert('Échec', "L'abonnement n'a pas pu être enregistré.");
    } finally {
      setPaiement(false);
    }
  };

  const resilier = () => {
    Alert.alert('Résilier', 'Ton abonnement restera actif jusqu\'à sa date de fin.', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Résilier',
        style: 'destructive',
        onPress: async () => {
          try {
            setProfil(await resilierAbonnement());
          } catch {
            Alert.alert('Erreur', "La résiliation n'a pas pu être enregistrée.");
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

  const actif = profil?.abonnementActif ? profil.abonnementType : null;

  return (
    <Screen>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={22} color={colors.primaryDark} />
        <Text style={styles.backText}>Mon compte</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Abonnements</Text>
        <Text style={styles.subtitle}>Choisis la formule adaptée à ton usage</Text>

        {actif && (
          <View style={styles.actifCard}>
            <Text style={styles.actifLabel}>FORMULE ACTIVE</Text>
            <Text style={styles.actifNom}>
              {FORMULES.find((f) => f.type === actif)?.nom ?? actif}
            </Text>
            <TouchableOpacity onPress={resilier} style={styles.resilier}>
              <Text style={styles.resilierText}>Résilier mon abonnement</Text>
            </TouchableOpacity>
          </View>
        )}

        {FORMULES.map((formule) => {
          const estActive = formule.type === actif;

          return (
            <View
              key={formule.type}
              style={[styles.carte, estActive && styles.carteActive]}
            >
              <View style={styles.carteEntete}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.carteNom}>{formule.nom}</Text>
                  <Text style={styles.carteCible}>{formule.cible}</Text>
                </View>
                <View>
                  {formule.prix !== null ? (
                    <>
                      <Text style={styles.prix}>{formule.prix}</Text>
                      <Text style={styles.prixUnite}>MAD / mois</Text>
                    </>
                  ) : (
                    <Text style={styles.surDevis}>Sur devis</Text>
                  )}
                </View>
              </View>

              {formule.avantages.map((avantage) => (
                <View key={avantage} style={styles.avantage}>
                  <Ionicons name="checkmark" size={15} color={colors.primary} />
                  <Text style={styles.avantageText}>{avantage}</Text>
                </View>
              ))}

              <View style={{ marginTop: spacing.md }}>
                <AppButton
                  label={estActive ? 'Formule active' : 'Choisir cette formule'}
                  variant={estActive ? 'outline' : 'primary'}
                  disabled={estActive}
                  onPress={() => setFormuleChoisie(formule)}
                />
              </View>
            </View>
          );
        })}

        <Text style={styles.note}>
          Tarifs indicatifs, en attente de validation par Nalida Power. Le paiement est simulé
          dans cette version : aucun débit réel n'est effectué.
        </Text>

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      <Modal visible={formuleChoisie !== null} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.simulationBandeau}>
              <Ionicons name="information-circle-outline" size={16} color="#8A5A00" />
              <Text style={styles.simulationText}>
                Paiement simulé — aucun débit réel
              </Text>
            </View>

            <Text style={styles.modalTitre}>Formule {formuleChoisie?.nom}</Text>
            <Text style={styles.modalCible}>{formuleChoisie?.cible}</Text>

            <View style={styles.recap}>
              <View style={styles.recapLigne}>
                <Text style={styles.recapLabel}>Montant</Text>
                <Text style={styles.recapValeur}>
                  {formuleChoisie?.prix !== null && formuleChoisie?.prix !== undefined
                    ? `${formuleChoisie.prix} MAD`
                    : 'Sur devis'}
                </Text>
              </View>
              <View style={styles.recapLigne}>
                <Text style={styles.recapLabel}>Durée</Text>
                <Text style={styles.recapValeur}>1 mois</Text>
              </View>
              <View style={styles.recapLigne}>
                <Text style={styles.recapLabel}>Moyen de paiement</Text>
                <Text style={styles.recapValeur}>Carte •••• 4242</Text>
              </View>
            </View>

            <AppButton
              label={paiement ? 'Paiement en cours' : 'Confirmer et payer'}
              onPress={payer}
              loading={paiement}
            />

            <TouchableOpacity
              style={styles.fermer}
              onPress={() => setFormuleChoisie(null)}
              disabled={paiement}
            >
              <Text style={styles.fermerText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  back: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  backText: { color: colors.primaryDark, fontWeight: '600' },
  title: { ...typography.title, marginTop: spacing.sm },
  subtitle: { ...typography.small, marginTop: 2, marginBottom: spacing.lg },
  actifCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  actifLabel: { fontSize: 10, fontWeight: '700', color: colors.primaryDark, letterSpacing: 0.5 },
  actifNom: { ...typography.heading, color: colors.primaryDark, marginTop: 2 },
  resilier: { marginTop: spacing.sm },
  resilierText: { color: colors.danger, fontWeight: '600', fontSize: 13 },
  carte: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  carteActive: { borderColor: colors.primary, borderWidth: 1.5 },
  carteEntete: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  carteNom: { ...typography.heading, fontSize: 19 },
  carteCible: { ...typography.small, marginTop: 2 },
  prix: { fontSize: 24, fontWeight: '700', color: colors.primaryDark, textAlign: 'right' },
  prixUnite: { ...typography.small, fontSize: 11, textAlign: 'right' },
  surDevis: { ...typography.body, fontWeight: '700', color: colors.primaryDark },
  avantage: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  avantageText: { ...typography.small, flex: 1 },
  note: {
    ...typography.small,
    fontSize: 11,
    lineHeight: 16,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  simulationBandeau: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.solarSoft,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  simulationText: { color: '#8A5A00', fontWeight: '700', fontSize: 12 },
  modalTitre: { ...typography.heading },
  modalCible: { ...typography.small, marginTop: 2 },
  recap: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    marginBottom: spacing.lg,
  },
  recapLigne: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  recapLabel: { ...typography.small },
  recapValeur: { ...typography.body, fontWeight: '600' },
  fermer: { marginTop: spacing.md, alignItems: 'center', paddingVertical: spacing.sm },
  fermerText: { ...typography.small, fontWeight: '600' },
});