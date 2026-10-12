import { StyleSheet, Text, type TextProps } from 'react-native';

import { DisplayFont, FontSize, HeadingFont, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'display'
    | 'heading'
    | 'title'
    | 'subtitle'
    | 'number'
    | 'body'
    | 'bodyBold'
    | 'label'
    | 'caption'
    | 'link'
    | 'mono'
    | 'monoSmall';
  themeColor?: ThemeColor;
  uppercase?: boolean;
};

// Escala da Variação A: Baloo 2 para títulos e números, fonte do sistema para
// leitura. 'mono'/'monoSmall' viraram rótulos em caixa-alta (o app não usa mais
// fonte monoespaçada) — o nome ficou para não mexer nos chamadores.
export function ThemedText({ style, type = 'body', themeColor, uppercase, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const isLabel = type === 'mono' || type === 'monoSmall';

  return (
    <Text
      style={[
        { color: theme[themeColor ?? (isLabel ? 'textSecondary' : 'text')] },
        styles[type],
        type === 'link' && { color: theme.primary },
        uppercase && styles.uppercase,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  display: { fontSize: 40, lineHeight: 44, fontFamily: DisplayFont },
  heading: { fontSize: 32, lineHeight: 36, fontFamily: HeadingFont },
  title: { fontSize: 22, lineHeight: 26, fontFamily: HeadingFont },
  subtitle: { fontSize: 18, lineHeight: 22, fontFamily: HeadingFont },
  number: { fontSize: 18, lineHeight: 22, fontFamily: HeadingFont },
  body: { fontSize: FontSize.md, lineHeight: 22, fontWeight: '400' },
  bodyBold: { fontSize: FontSize.md, lineHeight: 22, fontWeight: '700' },
  label: { fontSize: FontSize.sm, lineHeight: 18, fontWeight: '700' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  link: { fontSize: FontSize.sm, lineHeight: 20, fontWeight: '700' },
  mono: { fontSize: 12, lineHeight: 16, fontWeight: '800', letterSpacing: 0.8 },
  monoSmall: { fontSize: 11, lineHeight: 14, fontWeight: '800', letterSpacing: 0.6 },
  uppercase: { textTransform: 'uppercase' },
});
