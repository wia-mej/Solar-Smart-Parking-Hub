import { TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { colors, radius, spacing } from '../core/theme';

export default function AppInput(props: TextInputProps) {
  return (
    <TextInput
      {...props}
      placeholderTextColor={colors.textMuted}
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm + 4,
    fontSize: 16,
    color: colors.text,
  },
});