import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../core/theme';
import Screen from './Screen';

export default function PlaceholderScreen({ title, message }: { title: string; message: string }) {
  return (
    <Screen>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.box}>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, marginBottom: spacing.lg },
  box: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: spacing.xl * 2 },
  message: { ...typography.small, textAlign: 'center' },
});