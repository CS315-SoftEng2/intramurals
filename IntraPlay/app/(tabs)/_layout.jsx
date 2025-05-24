import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import CustomTeamIcon from "../../assets/icons/teams";
import ScheduleIcon from "../../assets/icons/schedules";
import ScoreboardIcon from "../../assets/icons/scoreboards";

export default function GuestTabs() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
          borderTopColor: "#E5E7EB",
          shadowColor: "#000000",
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarActiveTintColor: "#22C55E",
        tabBarInactiveTintColor: "#6B7280",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="dashboard" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Schedule",
          headerShown: false,
          tabBarIcon: ({ color }) => <ScheduleIcon color={color} />,
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
        name="scoreboard"
        options={{
          title: "Scoreboard",
          headerShown: false,
          tabBarIcon: ({ color }) => <ScoreboardIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="trophy" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
