import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';
import { Platform, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

// Barra de abas flutuante do Claude Design: Catálogo · Feed · (＋) · Coleção · Perfil.
// Amigos saiu das abas — agora é uma tela acessada pelo feed e pelo perfil.
export default function TabsLayout() {
  const theme = useTheme();
  const active = theme.accent;
  const inactive = theme.tabInactive;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: inactive,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
        tabBarStyle: [styles.bar, { backgroundColor: theme.tabBar }],
        sceneStyle: { backgroundColor: theme.background },
      }}>
      <Tabs.Screen
        name="species"
        options={{
          title: 'Catálogo',
          tabBarIcon: ({ color }) => <Ionicons name="fish" color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <Ionicons name="newspaper-outline" color={color} size={21} />,
        }}
      />
      <Tabs.Screen
        name="new-catch"
        options={{
          title: '',
          // Como no Claude Design, a barra some na tela de novo registro — o × no
          // topo fecha e volta.
          tabBarStyle: { display: 'none' },
          tabBarIcon: () => (
            <View style={[styles.centerButton, { backgroundColor: theme.primary }]}>
              <Ionicons name="add" color={theme.primaryText} size={28} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: 'Coleção',
          tabBarIcon: ({ color }) => <Ionicons name="grid" color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" color={color} size={21} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: Platform.select({ ios: 24, android: 14, default: 14 }),
    height: 64,
    borderRadius: 24,
    borderTopWidth: 0,
    paddingHorizontal: 6,
    shadowColor: '#05161b',
    shadowOpacity: 0.5,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 16 },
    elevation: 14,
  },
  item: { paddingVertical: 8 },
  label: { fontSize: 9.5, fontWeight: '700', marginTop: 2 },
  centerButton: {
    width: 54,
    height: 54,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
    shadowColor: '#ff8a3d',
    shadowOpacity: 0.7,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
});
