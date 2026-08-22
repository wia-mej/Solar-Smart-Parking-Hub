import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { Station } from '../core/models/station.model';
import StationsScreen from '../features/stations/StationsScreen';
import StationDetailScreen from '../features/stations/StationDetailScreen';

export type StationsStackParamList = {
  StationsList: undefined;
  StationDetail: { station: Station };
};

const Stack = createNativeStackNavigator<StationsStackParamList>();

export default function StationsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StationsList" component={StationsScreen} />
      <Stack.Screen name="StationDetail" component={StationDetailScreen} />
    </Stack.Navigator>
  );
}