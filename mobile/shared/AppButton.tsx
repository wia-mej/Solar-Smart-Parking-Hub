import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../core/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
};

export default function AppButton({ label, onPress, variant = 'primary', loading, disabled }: Props) {
  const outline = variant === 'outline';
  return (
    <TouchableOpacity
      style={[styles.base, outline ? styles.outline : styles.primary, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={outline ? colors.primary : colors.textInverse} />
      ) : (
        <Text style={[styles.label, outline && styles.labelOutline]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primary: { backgroundColor: colors.primary },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  disabled: { opacity: 0.5 },
  label: { color: colors.textInverse, fontSize: 16, fontWeight: '600' },
  labelOutline: { color: colors.primary },
});