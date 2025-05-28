// React and library imports
import { useMemo } from "react";
import { useRouter } from "expo-router";
import {
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@apollo/client";

// Styles
import globalstyles from "../../assets/styles/globalstyles";

// Context and utilities
import useAuthGuard from "../../utils/authGuard";
import { useAuth } from "../../context/AuthContext";
import { handleLogout } from "../../utils/handleLogout";

// Queries
import GET_USERS from "../../queries/userAccountQuery";
import GET_TEAMS from "../../queries/teamsQuery";
import GET_MATCHES from "../../queries/matchesQuery";
import GET_SCHEDULES from "../../queries/scheduleQuery";
import GET_EVENTS from "../../queries/eventsQuery";
import GET_CATEGORIES from "../../queries/categoriesQuery";

const colors = {
  background: "#1E1E2E",
  border: "#444",
  cardBackground: "#2A2A3A",
  text: {
    primary: "#fff",
    secondary: "#fff",
  },
  activityBorder: "#383852",
  iconBackground: "rgba(255, 255, 255, 0.2)",
  gradients: {
    users: ["#4a148c", "#7c43bd"],
    teams: ["#01579b", "#0288d1"],
    matches: ["#bf360c", "#f4511e"],
    schedule: ["#004d40", "#00897b"],
    events: ["#e65100", "#ff9800"],
    categories: ["#263238", "#546e7a"],
  },
  activityDots: {
    purple: "#4a148c",
    blue: "#01579b",
    orange: "#bf360c",
  },
};

const DashboardCard = ({
  title,
  count,
  icon,
  gradientColors,
  isLoading,
  link,
}) => {
  const router = useRouter();

  const handlePress = () => {
    if (link) {
      router.push(link);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.card}>
      <LinearGradient
        colors={gradientColors}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{title}</Text>
          <View style={styles.iconContainer}>
            <MaterialIcons name={icon} size={28} color={colors.text.primary} />
          </View>
        </View>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.text.primary}
            style={styles.loader}
          />
        ) : (
          <Text style={styles.cardCount}>{count}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const Dashboard = () => {
  useAuthGuard("admin");
  const { logout } = useAuth();

  const {
    loading: usersLoading,
    error: usersError,
    data: usersData,
  } = useQuery(GET_USERS);
  const {
    loading: teamsLoading,
    error: teamsError,
    data: teamsData,
  } = useQuery(GET_TEAMS);
  const {
    loading: matchesLoading,
    error: matchesError,
    data: matchesData,
  } = useQuery(GET_MATCHES);
  const {
    loading: schedulesLoading,
    error: schedulesError,
    data: schedulesData,
  } = useQuery(GET_SCHEDULES);
  const {
    loading: eventsLoading,
    error: eventsError,
    data: eventsData,
  } = useQuery(GET_EVENTS);
  const {
    loading: categoriesLoading,
    error: categoriesError,
    data: categoriesData,
  } = useQuery(GET_CATEGORIES);

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const dashboardItems = useMemo(
    () => [
      {
        title: "Users",
        count: formatNumber(usersData?.users?.length || 0),
        icon: "people",
        colors: colors.gradients.users,
        isLoading: usersLoading,
        link: "/useraccount",
      },
      {
        title: "Teams",
        count: formatNumber(teamsData?.teams?.length || 0),
        icon: "groups",
        colors: colors.gradients.teams,
        isLoading: teamsLoading,
        link: "/team",
      },
      {
        title: "Matches",
        count: formatNumber(matchesData?.getMatches?.length || 0),
        icon: "sports-cricket",
        colors: colors.gradients.matches,
        isLoading: matchesLoading,
        link: "match/match",
      },
      {
        title: "Schedules",
        count: formatNumber(schedulesData?.schedules?.length || 0),
        icon: "event",
        colors: colors.gradients.schedule,
        isLoading: schedulesLoading,
        link: "match/schedule",
      },
      {
        title: "Events",
        count: formatNumber(eventsData?.events?.length || 0),
        icon: "emoji-events",
        colors: colors.gradients.events,
        isLoading: eventsLoading,
        link: "match/event",
      },
      {
        title: "Categories",
        count: formatNumber(categoriesData?.categories?.length || 0),
        icon: "category",
        colors: colors.gradients.categories,
        isLoading: categoriesLoading,
        link: "match/category",
      },
    ],
    [
      usersData,
      teamsData,
      matchesData,
      schedulesData,
      eventsData,
      categoriesData,
      usersLoading,
      teamsLoading,
      matchesLoading,
      schedulesLoading,
      eventsLoading,
      categoriesLoading,
    ]
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with logout button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        {/* Logout button */}
        <View style={globalstyles.loginButtonContainer}>
          <TouchableOpacity onPress={() => handleLogout(logout)}>
            <MaterialIcons name="logout" size={25} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats overview */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Overview</Text>
        {(usersError ||
          teamsError ||
          matchesError ||
          schedulesError ||
          eventsError ||
          categoriesError) && (
          <Text style={styles.errorText}>Error loading data</Text>
        )}
      </View>

      {/* Dashboard cards */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.cardsContainer}>
          {dashboardItems.map((item, index) => (
            <DashboardCard
              key={index}
              title={item.title}
              count={item.count}
              icon={item.icon}
              gradientColors={item.colors}
              isLoading={item.isLoading}
              link={item.link}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 17,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  errorText: {
    color: "#ff6b6b",
    marginTop: 5,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  card: {
    width: "48%",
    borderRadius: 16,
    marginBottom: 15,
    overflow: "hidden",
  },
  gradientBackground: {
    padding: 16,
    borderRadius: 16,
    minHeight: 120,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  iconContainer: {
    borderRadius: 8,
    padding: 4,
    backgroundColor: colors.iconBackground,
  },
  cardCount: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text.primary,
    marginTop: 15,
  },
  loader: {
    marginTop: 15,
  },
});
