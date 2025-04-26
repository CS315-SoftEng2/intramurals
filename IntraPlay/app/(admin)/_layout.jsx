import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import CustomTeamIcon from "../../assets/icons/teams";
import ScheduleIcon from "../../assets/icons/schedules";

export default function AdminTabs() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#151521",
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarActiveTintColor: "#A4F168",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="dashboard" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="useraccount"
        options={{
          title: "Accounts",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-sharp" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="team"
        options={{
          title: "Teams",
          headerShown: false,
          tabBarIcon: ({ color }) => <CustomTeamIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="match"
        options={{
          title: "Matches",
          headerShown: false,
          tabBarIcon: ({ color }) => <ScheduleIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
