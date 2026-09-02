import { forwardRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  glyph?: 'dot' | 'square' | 'rounded';
  revealToggle?: boolean;
};

export const TextField = forwardRef<TextInput, Props>(
  (
    { label, error, helperText, style, containerStyle, glyph = 'dot', revealToggle, secureTextEntry, ...rest },
    ref
  ) => {
    const theme = useTheme();
    const [revealed, setRevealed] = useState(false);
    const secure = revealToggle ? (secureTextEntry ?? true) && !revealed : secureTextEntry;

    const glyphRadius = glyph === 'dot' ? 999 : glyph === 'rounded' ? 5 : 3;

    return (
      <View style={[styles.wrapper, containerStyle]}>
        <ThemedText type="mono" themeColor="textSecondary" uppercase>
          {label}
        </ThemedText>
        <View
          style={[
            styles.inputRow,
            {
              backgroundColor: theme.backgroundSelected,
              borderColor: error ? theme.danger : theme.border,
            },
          ]}>
          <View style={[styles.glyph, { borderRadius: glyphRadius, borderColor: theme.textFaint }]} />
          <TextInput
            ref={ref}
            placeholderTextColor={theme.textFaint}
            accessibilityLabel={label}
            secureTextEntry={secure}
            style={[styles.input, { color: theme.text }, style]}
            {...rest}
          />
          {revealToggle && (
            <Pressable onPress={() => setRevealed(v => !v)} hitSlop={8} accessibilityRole="button">
              <ThemedText type="monoSmall" style={{ color: theme.accent }}>
                {revealed ? 'OCULTAR' : 'MOSTRAR'}
              </ThemedText>
            </Pressable>
          )}
        </View>
        {(error || helperText) && (
          <ThemedText type="caption" themeColor={error ? 'danger' : 'textSecondary'}>
            {error ?? helperText}
          </ThemedText>
        )}
      </View>
    );
  }
);
TextField.displayName = 'TextField';

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.xs },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 52,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  glyph: { width: 14, height: 14, borderWidth: 2 },
  input: { flex: 1, minWidth: 0, fontSize: 15, fontWeight: '600', paddingVertical: Spacing.sm },
});
