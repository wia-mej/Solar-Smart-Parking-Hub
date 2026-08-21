import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfilScreen from '../features/profil/ProfilScreen';
import AbonnementScreen from '../features/abonnement/AbonnementScreen';

export type ProfilStackParamList = {
  ProfilAccueil: undefined;
  Abonnement: undefined;
};

const Stack = createNativeStackNavigator<ProfilStackParamList>();

export default function ProfilStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfilAccueil" component={ProfilScreen} />
      <Stack.Screen name="Abonnement" component={AbonnementScreen} />
    </Stack.Navigator>
  );
}