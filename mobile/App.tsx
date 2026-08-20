import { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { User } from 'firebase/auth';
import { observeAuthState } from './core/services/auth.service';
import LoginScreen from './features/login/LoginScreen';
import SignupScreen from './features/login/SignupScreen';
import StationsScreen from './features/stations/StationsScreen';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [signingUp, setSigningUp] = useState(false);

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
      {user && !signingUp ? (
        <StationsScreen />
      ) : mode === 'login' ? (
        <LoginScreen onGoToSignup={() => setMode('signup')} />
      ) : (
        <SignupScreen onGoToLogin={() => setMode('login')} onBusyChange={setSigningUp} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
});