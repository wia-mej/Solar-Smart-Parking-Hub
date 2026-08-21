import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../core/theme';
import AccueilScreen from '../features/accueil/AccueilScreen';
import StationsStack from './StationsStack';
import ProfilStack from './ProfilStack';
import ChargeScreen from '../features/charge/ChargeScreen';
import ReservationsScreen from '../features/reservations/ReservationsScreen';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  const insets = useSafeAreaInsets();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 62 + insets.bottom,
            paddingTop: 6,
            paddingBottom: insets.bottom + 8,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tab.Screen
          name="Accueil"
          component={AccueilScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Stations"
          component={StationsStack}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="location-outline" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Réservations"
          component={ReservationsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar-outline" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Ma charge"
          component={ChargeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="flash-outline" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Profil"
          component={ProfilStack}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}