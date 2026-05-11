import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          position: "absolute",

          left: 20,
          right: 20,
          bottom: 40,

          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,

          height: 75,
          paddingBottom: 10,
          paddingTop: 10,

          borderRadius: 25,

          elevation: 12,

          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 8,
          },
          shadowOpacity: 0.08,
          shadowRadius: 16,
        },

        tabBarActiveTintColor: "#2D6A4F",
        tabBarInactiveTintColor: "#94A3B8",

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendario",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="bonsai"
        options={{
          title: "Bonsái",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="leaf-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
