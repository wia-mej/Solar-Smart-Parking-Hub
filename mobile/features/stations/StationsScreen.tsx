import { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getAllStations } from '../../core/services/station.service';
import type { Station } from '../../core/models/station.model';
import type { StationsStackParamList } from '../../navigation/StationsStack';
import { colors, spacing, radius, typography } from '../../core/theme';
import Screen from '../../shared/Screen';
import AppInput from '../../shared/AppInput';
import StationsMap from './StationsMap';

type Vue = 'liste' | 'carte';

export default function StationsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<StationsStackParamList>>();

  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [vue, setVue] = useState<Vue>('liste');

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

  const ouvrir = (station: Station) => navigation.navigate('StationDetail', { station });

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
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Stations</Text>
          <Text style={styles.subtitle}>
            {stations.length} station{stations.length > 1 ? 's' : ''} sur le réseau
          </Text>
        </View>

        <View style={styles.switch}>
          {(['liste', 'carte'] as Vue[]).map((v) => {
            const actif = vue === v;
            return (
              <TouchableOpacity
                key={v}
                style={[styles.switchItem, actif && styles.switchItemActif]}
                onPress={() => setVue(v)}
              >
                <Ionicons
                  name={v === 'liste' ? 'list' : 'map'}
                  size={16}
                  color={actif ? colors.textInverse : colors.textMuted}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {vue === 'carte' ? (
        <View style={styles.mapWrapper}>
          <StationsMap stations={stations} onSelect={ouvrir} />
        </View>
      ) : (
        <>
          <AppInput
            placeholder="Rechercher une station ou une ville"
            value={search}
            onChangeText={setSearch}
          />

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
                <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => ouvrir(item)}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.nom}</Text>
                    <View style={[styles.dot, complet && styles.dotFull]} />
                  </View>
                  <Text style={styles.cardCity}>{item.ville}</Text>
                  <Text style={styles.cardAddress}>{item.adresse}</Text>

                  <View style={styles.cardFooter}>
                    <View style={[styles.badge, complet && styles.badgeFull]}>
                      <Text style={[styles.badgeText, complet && styles.badgeTextFull]}>
                        {dispo} borne{dispo > 1 ? 's' : ''} libre{dispo > 1 ? 's' : ''} sur{' '}
                        {item.bornes.length}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  title: typography.title,
  subtitle: { ...typography.small, marginTop: 2 },
  switch: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    padding: 3,
    marginTop: spacing.xs,
  },
  switchItem: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: radius.pill },
  switchItemActif: { backgroundColor: colors.primary },
  mapWrapper: {
    flex: 1,
    marginHorizontal: -spacing.md,
    overflow: 'hidden',
  },
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
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  badge: {
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