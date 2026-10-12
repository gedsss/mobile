import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useState, type ComponentProps, type ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { HeadingFont } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  icon?: ComponentProps<typeof Ionicons>['name'];
  // Texto fixo dentro do campo, à direita (ex.: "cm", "kg").
  unit?: string;
  // Prefixo fixo à esquerda (ex.: "@").
  prefix?: string;
  revealToggle?: boolean;
  trailing?: ReactNode;
};

export const TextField = forwardRef<TextInput, Props>(
  (
    {
      label,
      error,
      helperText,
      style,
      containerStyle,
      icon,
      unit,
      prefix,
      revealToggle,
      trailing,
      secureTextEntry,
      onFocus,
      onBlur,
      ...rest
    },
    ref
  ) => {
    const theme = useTheme();
    const [revealed, setRevealed] = useState(false);
    const [focused, setFocused] = useState(false);
    const secure = revealToggle ? (secureTextEntry ?? true) && !revealed : secureTextEntry;
    const ring = error ? theme.danger : focused ? theme.primary : theme.border;

    return (
      <View style={[styles.wrapper, containerStyle]}>
        {label && <ThemedText type="label">{label}</ThemedText>}
        <View
          style={[
            styles.inputRow,
            {
              backgroundColor: theme.backgroundElement,
              boxShadow: `inset 0 0 0 2px ${ring}`,
            },
          ]}>
          {icon && <Ionicons name={icon} size={20} color={theme.textSecondary} />}
          {prefix && <ThemedText type="bodyBold" themeColor="textSecondary">{prefix}</ThemedText>}
          <TextInput
            ref={ref}
            placeholderTextColor={theme.textSecondary}
            accessibilityLabel={label}
            secureTextEntry={secure}
            onFocus={e => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={e => {
              setFocused(false);
              onBlur?.(e);
            }}
            style={[styles.input, { color: theme.text }, style]}
            {...rest}
          />
          {unit && <ThemedText style={[styles.unit, { color: theme.textSecondary }]}>{unit}</ThemedText>}
          {trailing}
          {revealToggle && (
            <Pressable
              onPress={() => setRevealed(v => !v)}
              style={styles.reveal}
              accessibilityRole="button"
              accessibilityLabel={revealed ? 'Ocultar senha' : 'Mostrar senha'}>
              <Ionicons name={revealed ? 'eye-off-outline' : 'eye-outline'} size={22} color={theme.textSecondary} />
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
  wrapper: { gap: 6 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 54,
    borderRadius: 16,
    paddingLeft: 14,
    paddingRight: 8,
  },
  input: { flex: 1, minWidth: 0, fontSize: 16, fontWeight: '600', paddingVertical: 12 },
  unit: { fontFamily: HeadingFont, fontSize: 15, lineHeight: 20, marginRight: 6 },
  reveal: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
