import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { User } from 'firebase/auth';
import { observeAuthState, logout } from './core/services/auth.service';
import LoginScreen from './features/login/LoginScreen';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = observeAuthState((u) => {
      setUser(u);
      setChecking(false);
    });
    return unsubscribe;
  }, []);

  if (checking) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#002860" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      {user ? (
        <View style={styles.center}>
          <Text style={styles.welcome}>Connectée en tant que</Text>
          <Text style={styles.email}>{user.email}</Text>
          <TouchableOpacity style={styles.logout} onPress={logout}>
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <LoginScreen />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 24 },
  welcome: { fontSize: 16, color: '#5b6b7f' },
  email: { fontSize: 20, fontWeight: '600', color: '#002860', marginBottom: 28 },
  logout: { borderWidth: 1, borderColor: '#002860', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 24 },
  logoutText: { color: '#002860', fontWeight: '600' },
});