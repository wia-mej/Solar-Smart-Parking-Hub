import { useEffect, useState, useMemo } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { getAllStations } from '../../core/services/station.service';
import { logout } from '../../core/services/auth.service';
import type { Station } from '../../core/models/station.model';

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
      setError("Impossible de joindre le serveur. Vérifie que le backend est démarré.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stations;
    return stations.filter(
      (s) => s.nom.toLowerCase().includes(q) || s.ville.toLowerCase().includes(q),
    );
  }, [stations, search]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#002860" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Stations</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Rechercher une station ou une ville"
        value={search}
        onChangeText={setSearch}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
          />
        }
        ListEmptyComponent={
          !error ? <Text style={styles.empty}>Aucune station trouvée.</Text> : null
        }
        renderItem={({ item }) => {
          const dispo = item.bornes.filter((b) => b.statut === 'DISPONIBLE').length;
          return (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.nom}</Text>
              <Text style={styles.cardCity}>{item.ville}</Text>
              <Text style={styles.cardAddress}>{item.adresse}</Text>
              <View style={[styles.badge, dispo === 0 && styles.badgeFull]}>
                <Text style={[styles.badgeText, dispo === 0 && styles.badgeTextFull]}>
                    {dispo} borne{dispo > 1 ? 's' : ''} libre{dispo > 1 ? 's' : ''} sur {item.bornes.length}
                </Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7fa', paddingTop: 56, paddingHorizontal: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f7fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#002860' },
  logout: { color: '#0098c0', fontWeight: '600' },
  search: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#d7dde5',
    borderRadius: 8, padding: 12, marginBottom: 12,
  },
  list: { paddingBottom: 32 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#e6ebf1',
  },
  cardTitle: { fontSize: 17, fontWeight: '600', color: '#002860' },
  cardCity: { color: '#0098c0', marginTop: 2, fontWeight: '500' },
  cardAddress: { color: '#5b6b7f', marginTop: 4, fontSize: 13 },
  badge: {
    alignSelf: 'flex-start', marginTop: 12, backgroundColor: '#e6f6fb',
    paddingVertical: 5, paddingHorizontal: 10, borderRadius: 6,
  },
  badgeFull: { backgroundColor: '#fdeaea' },
  badgeText: { color: '#0098c0', fontWeight: '600', fontSize: 12 },
  badgeTextFull: { color: '#c0392b' },
  error: { color: '#c0392b', marginBottom: 12 },
  empty: { textAlign: 'center', color: '#5b6b7f', marginTop: 32 },
});