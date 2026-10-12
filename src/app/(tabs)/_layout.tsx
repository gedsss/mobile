import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';
import { type ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

// Tab bar da Variação A: encaixada (não flutua), aba ativa com pílula rosa e o
// ＋ central em amarelo com degrau. Catálogo · Feed · (＋) · Coleção · Perfil.
export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const icon = (name: IconName, active: IconName) => {
    const render = ({ focused }: { focused: boolean }) => <TabIcon name={name} active={active} focused={focused} />;
    return render;
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.tabInactive,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
        tabBarStyle: [
          styles.bar,
          {
            backgroundColor: theme.tabBar,
            boxShadow: `0 -2px 0 ${theme.border}`,
            height: 74 + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 10),
          },
        ],
        sceneStyle: { backgroundColor: theme.background },
      }}>
      <Tabs.Screen
        name="species"
        options={{ title: 'Catálogo', tabBarIcon: icon('book-outline', 'book') }}
      />
      <Tabs.Screen
        name="feed"
        options={{ title: 'Feed', tabBarIcon: icon('people-outline', 'people') }}
      />
      <Tabs.Screen
        name="new-catch"
        options={{
          title: '',
          tabBarAccessibilityLabel: 'Nova captura',
          // A barra some no novo registro — o × no topo fecha e volta.
          tabBarStyle: { display: 'none' },
          tabBarIcon: () => (
            <View
              style={[
                styles.plus,
                {
                  backgroundColor: theme.accent,
                  boxShadow: `0 0 0 4px ${theme.tabBar}, 0 8px 0 ${theme.accentLip}`,
                },
              ]}>
              <Ionicons name="add" color={theme.accentText} size={34} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{ title: 'Coleção', tabBarIcon: icon('albums-outline', 'albums') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Perfil', tabBarIcon: icon('person-outline', 'person') }}
      />
    </Tabs>
  );
}

function TabIcon({ name, active, focused }: { name: IconName; active: IconName; focused: boolean }) {
  const theme = useTheme();
  return (
    <View style={[styles.pill, focused && { backgroundColor: theme.primary }]}>
      <Ionicons name={focused ? active : name} size={21} color={focused ? theme.primaryText : theme.tabInactive} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { borderTopWidth: 0, paddingTop: 6, elevation: 0 },
  item: { paddingVertical: 2 },
  label: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  pill: { width: 52, height: 30, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  plus: {
    width: 62,
    height: 62,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -26,
  },
});
