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
          headerShown: false,
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
        name="match/match"
        options={{
          title: "Matches",
          headerShown: false,
          tabBarIcon: ({ color }) => <ScheduleIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="match/schedule"
        options={{
          title: "Schedules",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="schedule" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="match/event"
        options={{
          title: "Events",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="event" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="match/category"
        options={{
          title: "Categories",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="category" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
