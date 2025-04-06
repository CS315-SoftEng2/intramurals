import { Tabs } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import CustomTeamIcon from "../../assets/icons/teams";
import ScheduleIcon from "../../assets/icons/schedules";
import ScoreboardIcon from "../../assets/icons/scoreboards";

export default function RootLayout() {
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
        name="schedule"
        options={{
          title: "Schedule",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => 
            <ScheduleIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="team"
        options={{
          title: "Teams",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => 
            <CustomTeamIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="scoreboard"
        options={{
          title: "Scoreboard",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => 
            <ScoreboardIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
