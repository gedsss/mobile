import { StyleSheet, Text, type TextProps } from 'react-native';

import { FontSize, HeadingFont, HeadingFontSemiBold, MonoFont, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'heading' | 'title' | 'subtitle' | 'body' | 'bodyBold' | 'caption' | 'link' | 'mono' | 'monoSmall';
  themeColor?: ThemeColor;
  uppercase?: boolean;
};

export function ThemedText({ style, type = 'body', themeColor, uppercase, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const isMono = type === 'mono' || type === 'monoSmall';

  return (
    <Text
      style={[
        { color: theme[themeColor ?? (isMono ? 'textFaint' : 'text')] },
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
  heading: {
    fontSize: 29,
    lineHeight: 33,
    fontFamily: HeadingFont,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 22,
    lineHeight: 27,
    fontFamily: HeadingFont,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 23,
    fontFamily: HeadingFontSemiBold,
  },
  body: {
    fontSize: FontSize.sm,
    lineHeight: 21,
    fontWeight: '400',
  },
  bodyBold: {
    fontSize: FontSize.sm,
    lineHeight: 21,
    fontWeight: '800',
  },
  caption: {
    fontSize: FontSize.xs,
    lineHeight: 17,
    fontWeight: '600',
  },
  link: {
    fontSize: FontSize.sm,
    lineHeight: 21,
    fontWeight: '700',
  },
  mono: {
    fontFamily: MonoFont,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  monoSmall: {
    fontFamily: MonoFont,
    fontSize: 8.5,
    letterSpacing: 0.8,
  },
  uppercase: {
    textTransform: 'uppercase',
  },
});
