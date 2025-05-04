import { Link, useRouter } from "expo-router";
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
import useAuthGuard from "../../utils/authGuard";
import globalstyles from "@/assets/styles/globalstyles";
import GET_USERS from "../../queries/userAccountQuery";
import GET_TEAMS from "../../queries/teamsQuery";
import GET_MATCHES from "../../queries/matchesQuery";
import GET_SCHEDULES from "../../queries/scheduleQuery";
import GET_EVENTS from "../../queries/eventsQuery";
import GET_CATEGORIES from "../../queries/categoriesQuery";

const colors = {
  background: "#1E1E2E",
  border: "#2A2A3A",
  cardBackground: "#2A2A3A",
  text: {
    primary: "#fff",
    secondary: "#8F8F9E",
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

  const userCount = usersData?.users?.length || 0;
  const teamCount = teamsData?.teams?.length || 0;
  const matchCount = matchesData?.getMatches?.length || 0;
  const scheduleCount = schedulesData?.schedules?.length || 0;
  const eventCount = eventsData?.events?.length || 0;
  const categoryCount = categoriesData?.categories?.length || 0;

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const dashboardItems = [
    {
      title: "Users",
      count: formatNumber(userCount),
      icon: "people",
      colors: colors.gradients.users,
      isLoading: usersLoading,
      link: "/useraccount",
    },
    {
      title: "Teams",
      count: formatNumber(teamCount),
      icon: "groups",
      colors: colors.gradients.teams,
      isLoading: teamsLoading,
      link: "/team",
    },
    {
      title: "Matches",
      count: formatNumber(matchCount),
      icon: "sports-cricket",
      colors: colors.gradients.matches,
      isLoading: matchesLoading,
      link: "/match",
    },
    {
      title: "Schedules",
      count: formatNumber(scheduleCount),
      icon: "event",
      colors: colors.gradients.schedule,
      isLoading: schedulesLoading,
      link: "/match",
    },
    {
      title: "Events",
      count: formatNumber(eventCount),
      icon: "emoji-events",
      colors: colors.gradients.events,
      isLoading: eventsLoading,
      link: "/match",
    },
    {
      title: "Categories",
      count: formatNumber(categoryCount),
      icon: "category",
      colors: colors.gradients.categories,
      isLoading: categoriesLoading,
      link: "/match",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <View style={globalstyles.loginButtonContainer}>
          <Link href={"/login"}>
            <MaterialIcons name="login" size={30} color={colors.text.primary} />
          </Link>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Overview</Text>
        {(usersError ||
          teamsError ||
          matchesError ||
          schedulesError ||
          eventsError ||
          categoriesError) && (
          <Text style={styles.errorText}>Error loading users data</Text>
        )}
      </View>

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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  loginButton: {
    padding: 6,
    backgroundColor: colors.border,
    borderRadius: 8,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  statsSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
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
  recentSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  activityCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.activityBorder,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
  },
  activityTime: {
    fontSize: 12,
    color: colors.text.secondary,
  },
});
