import { Tabs } from "expo-router";
import { Text } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return <Text style={{ fontSize: 22, color }}>{emoji}</Text>;
}

export default function TabLayout() {
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.headerBg,
          borderTopColor: colors.headerBorder,
        },
        headerStyle: {
          backgroundColor: colors.headerBg,
        },
        headerTintColor: colors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Research",
          tabBarIcon: ({ color }) => <TabIcon emoji="🔍" color={color} />,
        }}
      />
      <Tabs.Screen
        name="watchlist"
        options={{
          title: "Watchlist",
          tabBarIcon: ({ color }) => <TabIcon emoji="⭐" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <TabIcon emoji="👤" color={color} />,
        }}
      />
    </Tabs>
  );
}
