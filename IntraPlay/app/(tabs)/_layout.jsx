import { Tabs } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: "#151521" }, 
        tabBarActiveTintColor: "#A4F168", 
        tabBarInactiveTintColor: "gray", 
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <MaterialIcons name="dashboard" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          title: "Login",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <MaterialIcons name="login" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
