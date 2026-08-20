import { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { getAllStations } from '../../core/services/station.service';
import type { Station } from '../../core/models/station.model';
import { colors, spacing, radius, typography } from '../../core/theme';
import Screen from '../../shared/Screen';
import AppInput from '../../shared/AppInput';

export default function StationsScreen() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    setError(null);
    try {
      setStations(await getAllStations());
    } catch {
      setError('Impossible de joindre le serveur.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stations;
    return stations.filter(
      (s) => s.nom.toLowerCase().includes(q) || s.ville.toLowerCase().includes(q),
    );
  }, [stations, search]);

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>Stations</Text>
      <Text style={styles.subtitle}>
        {stations.length} station{stations.length > 1 ? 's' : ''} sur le réseau
      </Text>

      <AppInput
        placeholder="Rechercher une station ou une ville"
        value={search}
        onChangeText={setSearch}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
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
          !error ? <Text style={styles.empty}>Aucune station trouvée.</Text> : null
        }
        renderItem={({ item }) => {
          const dispo = item.bornes.filter((b) => b.statut === 'DISPONIBLE').length;
          const complet = dispo === 0;
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.nom}</Text>
                <View style={[styles.dot, complet && styles.dotFull]} />
              </View>
              <Text style={styles.cardCity}>{item.ville}</Text>
              <Text style={styles.cardAddress}>{item.adresse}</Text>

              <View style={[styles.badge, complet && styles.badgeFull]}>
                <Text style={[styles.badgeText, complet && styles.badgeTextFull]}>
                  {dispo} borne{dispo > 1 ? 's' : ''} libre{dispo > 1 ? 's' : ''} sur{' '}
                  {item.bornes.length}
                </Text>
              </View>
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
  subtitle: { ...typography.small, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm + 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { ...typography.heading, flex: 1 },
  dot: { width: 10, height: 10, borderRadius: radius.pill, backgroundColor: colors.primary },
  dotFull: { backgroundColor: colors.danger },
  cardCity: { color: colors.primaryDark, fontWeight: '500', marginTop: 2 },
  cardAddress: { ...typography.small, marginTop: spacing.xs },
  badge: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    backgroundColor: colors.primarySoft,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.sm,
  },
  badgeFull: { backgroundColor: colors.dangerSoft },
  badgeText: { color: colors.primaryDark, fontWeight: '600', fontSize: 12 },
  badgeTextFull: { color: colors.danger },
  error: { color: colors.danger, marginBottom: spacing.sm },
  empty: { ...typography.small, textAlign: 'center', marginTop: spacing.xl },
});