import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MiniPlayer } from '@/components/MiniPlayer';
import { useAppTheme } from '@/context/ThemeContext';
import { fonts } from '@/constants/theme';

type IconName = keyof typeof Ionicons.glyphMap;

function TabIcon({ name, color, focused }: { name: IconName; color: string; focused: boolean }) {
  const iconName = (focused ? name : `${String(name)}-outline`) as IconName;
  return <Ionicons name={iconName} size={24} color={color} />;
}

export default function TabLayout() {
  const { colors } = useAppTheme();

  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: colors.bgSecondary,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 64,
            paddingBottom: 10,
            paddingTop: 6,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600', fontFamily: fonts.semibold },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'خانه',
            tabBarIcon: ({ color, focused }) => <TabIcon name="home" color={color} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'جستجو',
            tabBarIcon: ({ color, focused }) => <TabIcon name="search" color={color} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'کتابخانه',
            tabBarIcon: ({ color, focused }) => <TabIcon name="library" color={color} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="downloads"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="tools"
          options={{
            title: 'ابزارها',
            tabBarIcon: ({ color, focused }) => <TabIcon name="settings" color={color} focused={focused} />,
          }}
        />
        <Tabs.Screen name="player" options={{ href: null }} />
      </Tabs>
      <View style={styles.miniPlayer}>
        <MiniPlayer />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  miniPlayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 64,
  },
});
