import { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { User } from 'firebase/auth';
import { observeAuthState } from './core/services/auth.service';
import LoginScreen from './features/login/LoginScreen';
import SignupScreen from './features/login/SignupScreen';
import AppTabs from './navigation/AppTabs';
import { colors } from './core/theme';
import { demanderPermissionNotifications } from './core/services/notification.service';

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

  useEffect(() => {
    demanderPermissionNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {checking ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : user && !signingUp ? (
        <AppTabs />
      ) : mode === 'login' ? (
        <LoginScreen onGoToSignup={() => setMode('signup')} />
      ) : (
        <SignupScreen onGoToLogin={() => setMode('login')} onBusyChange={setSigningUp} />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});