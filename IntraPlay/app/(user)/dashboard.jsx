import { useEffect, useState } from "react";
import { Link, useRouter } from "expo-router";
import storage from "../../utils/storage";
import { useQuery } from "@apollo/client";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import globalstyles from "@/assets/styles/globalstyles";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import GET_MATCHES from "../../queries/matchesQuery";
import GET_SCHEDULE from "../../queries/scheduleQuery";
import GET_EVENTS from "../../queries/eventsQuery";
import GET_TEAMS from "../../queries/teamsQuery";
import LoadingIndicator from "../components/LoadingIndicator";
import useAuthGuard from "@/utils/authGuard";
import { useDimensions } from "../../context/DimensionsContext";

const Dashboard = () => {
  useAuthGuard("user");
  const { width } = useDimensions();
  const router = useRouter();

  const {
    loading: matchLoading,
    error: matchError,
    data: matchData,
  } = useQuery(GET_MATCHES);
  const {
    loading: scheduleLoading,
    error: scheduleError,
    data: scheduleData,
  } = useQuery(GET_SCHEDULE);
  const {
    loading: venueLoading,
    error: venueError,
    data: venueData,
  } = useQuery(GET_EVENTS);
  const {
    loading: teamLoading,
    error: teamError,
    data: teamData,
  } = useQuery(GET_TEAMS);

  const [userId, setUserId] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userString = await storage.getItem("user_data");
        if (!userString) {
          throw new Error(
            "No user data found in storage. Please log in again."
          );
        }
        const user = JSON.parse(userString);
        if (!user?.user_id) {
          throw new Error("Invalid user data. Please log in again.");
        }
        setUserId(user.user_id);
      } catch (error) {
        setAuthError(error.message);
        router.replace("/login");
      } finally {
        setUserLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  if (
    matchLoading ||
    scheduleLoading ||
    venueLoading ||
    userLoading ||
    teamLoading ||
    userId === null ||
    userId === undefined
  ) {
    return <LoadingIndicator visible={true} />;
  }

  if (matchError || scheduleError || venueError || teamError || authError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          {matchError?.message ||
            scheduleError?.message ||
            venueError?.message ||
            teamError?.message ||
            authError ||
            "Error occurred!"}
        </Text>
      </View>
    );
  }

  const schedules = scheduleData?.schedules || [];
  const venueEvent = venueData?.events || []; // Fixed from venueData?.Events
  const teamName = teamData?.teams || [];

  const getEventVenue = (schedule_id) => {
    // Find the schedule by schedule_id to get its event_id
    const schedule = schedules.find(
      (s) => String(s.schedule_id) === String(schedule_id)
    );
    if (!schedule) return "Venue TBD";

    // Find the event by event_id
    const event = venueEvent.find(
      (e) => String(e.event_id) === String(schedule.event_id)
    );
    return event?.venue || "Venue TBD";
  };

  const getScheduleDetails = (scheduleId) =>
    schedules.find((s) => s.schedule_id === scheduleId);

  const getTeamAName = (team_a_id) =>
    teamName.find((team) => team.team_id == team_a_id)?.team_name ||
    "Unknown Team A";

  const getTeamBName = (team_b_id) =>
    teamName.find((team) => team.team_id == team_b_id)?.team_name ||
    "Unknown Team B";

  const assignedMatches =
    matchData?.getMatches?.filter(
      (match) => String(match.user_assigned_id) === String(userId)
    ) || [];

  if (assignedMatches.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>
          You don't have any assigned matches.
        </Text>
      </View>
    );
  }

  const unscoredMatches = assignedMatches.filter(
    (match) =>
      match.score_a === null ||
      match.score_b === null ||
      match.score_a === 0 ||
      match.score_b === 0
  );

  const scoredMatches = assignedMatches.filter(
    (match) =>
      match.score_a !== null &&
      match.score_b !== null &&
      match.score_a !== 0 &&
      match.score_b !== 0
  );

  const isTablet = width >= 768;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={globalstyles.loginButtonContainer}>
        <Link href={"/login"}>
          <MaterialIcons name="login" size={30} color="#fff" />
        </Link>
      </View>

      <View
        style={[
          styles.contentContainer,
          {
            paddingHorizontal: isTablet ? 60 : 25,
            paddingTop: isTablet ? 60 : 50,
          },
        ]}
      >
        <Text
          style={[
            styles.headerTitle,
            {
              fontSize: isTablet ? 28 : 22,
              textAlign: isTablet ? "center" : "left",
            },
          ]}
        >
          My Assigned Events
        </Text>

        {unscoredMatches.length === 0 ? (
          <Text style={styles.emptyText}>
            No matches to score at the moment.
          </Text>
        ) : (
          unscoredMatches.map((match) => {
            const schedule = getScheduleDetails(match.schedule_id);
            const startTime = schedule?.start_time;
            const endTime = schedule?.end_time;

            return (
              <View
                key={match.match_id}
                style={[
                  styles.assignedEventContainer,
                  {
                    height: isTablet ? 200 : 170,
                    padding: isTablet ? 20 : 15,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.eventNameAndDivision,
                    { fontSize: isTablet ? 18 : 15 },
                  ]}
                >
                  {match.event_name} - {match.division}
                </Text>
                <Text
                  style={[
                    styles.assignEventMatch,
                    { fontSize: isTablet ? 15 : 13 },
                  ]}
                >
                  {getTeamAName(match.team_a_id)} vs{" "}
                  {getTeamBName(match.team_b_id)}
                </Text>

                <View style={styles.assignEventRow}>
                  <MaterialIcons
                    name="location-on"
                    size={13}
                    color="#aaa"
                    style={styles.icon}
                  />
                  <Text style={styles.assignEventText}>
                    {getEventVenue(match.schedule_id)}
                  </Text>
                </View>

                <View style={styles.assignEventRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={13}
                    color="#aaa"
                    style={styles.icon}
                  />
                  <Text style={styles.assignEventText}>{schedule?.date}</Text>
                </View>

                <View style={styles.assignEventRow}>
                  <MaterialIcons
                    name="schedule"
                    size={13}
                    color="#aaa"
                    style={styles.icon}
                  />
                  <Text style={styles.assignEventText}>
                    {startTime} - {endTime}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.manageScoreButton,
                    {
                      marginHorizontal: isTablet ? 80 : 55,
                      paddingVertical: isTablet ? 10 : 8,
                    },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: `/score-update/${match.match_id}`,
                      params: {
                        event_name: match.event_name,
                        division: match.division,
                        team_a_id: match.team_a_id,
                        team_b_id: match.team_b_id,
                        score_a: match.score_a || 0,
                        score_b: match.score_b || 0,
                        user_assigned_id: match.user_assigned_id,
                      },
                    })
                  }
                >
                  <Text
                    style={[
                      styles.manageScoreText,
                      { fontSize: isTablet ? 18 : 16 },
                    ]}
                  >
                    Manage Scores
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        {scoredMatches.length > 0 && (
          <>
            <Text
              style={[
                styles.headerTitle,
                {
                  fontSize: isTablet ? 28 : 22,
                  textAlign: isTablet ? "center" : "left",
                  marginTop: 30,
                },
              ]}
            >
              Already Scored
            </Text>

            {scoredMatches.map((match) => {
              const schedule = getScheduleDetails(match.schedule_id);
              const startTime = schedule?.start_time;
              const endTime = schedule?.end_time;

              return (
                <View
                  key={match.match_id}
                  style={[
                    styles.assignedEventContainer,
                    {
                      height: isTablet ? 200 : 170,
                      padding: isTablet ? 20 : 15,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.eventNameAndDivision,
                      { fontSize: isTablet ? 18 : 15 },
                    ]}
                  >
                    {match.event_name} - {match.division}
                  </Text>
                  <Text
                    style={[
                      styles.assignEventMatch,
                      { fontSize: isTablet ? 15 : 13 },
                    ]}
                  >
                    {getTeamAName(match.team_a_id)} vs{" "}
                    {getTeamBName(match.team_b_id)}
                  </Text>

                  <View style={styles.assignEventRow}>
                    <MaterialIcons
                      name="location-on"
                      size={13}
                      color="#aaa"
                      style={styles.icon}
                    />
                    <Text style={styles.assignEventText}>
                      {getEventVenue(match.schedule_id)}
                    </Text>
                  </View>

                  <View style={styles.assignEventRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={13}
                      color="#aaa"
                      style={styles.icon}
                    />
                    <Text style={styles.assignEventText}>{schedule?.date}</Text>
                  </View>

                  <View style={styles.assignEventRow}>
                    <MaterialIcons
                      name="schedule"
                      size={13}
                      color="#aaa"
                      style={styles.icon}
                    />
                    <Text style={styles.assignEventText}>
                      {startTime} - {endTime}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.manageScoreButton,
                      {
                        marginHorizontal: isTablet ? 80 : 55,
                        paddingVertical: isTablet ? 10 : 8,
                      },
                    ]}
                    onPress={() =>
                      router.push({
                        pathname: `/score-update/${match.match_id}`,
                        params: {
                          event_name: match.event_name,
                          division: match.division,
                          team_a_id: match.team_a_id,
                          team_b_id: match.team_b_id,
                          score_a: match.score_a || 0,
                          score_b: match.score_b || 0,
                          user_assigned_id: match.user_assigned_id,
                        },
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.manageScoreText,
                        { fontSize: isTablet ? 18 : 16 },
                      ]}
                    >
                      Update Scores
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#1E1E2E",
    paddingBottom: 20,
  },
  contentContainer: {
    paddingHorizontal: 25,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
  },
  assignedEventContainer: {
    backgroundColor: "#2A2A3C",
    width: "100%",
    marginBottom: 20,
    borderRadius: 15,
    padding: 15,
  },
  eventNameAndDivision: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  assignEventMatch: {
    color: "#aaa",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 5,
  },
  assignEventRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  icon: {
    marginRight: 6,
  },
  assignEventText: {
    color: "#aaa",
    fontSize: 13,
    flexShrink: 1,
  },
  manageScoreButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    marginBottom: 30,
    alignItems: "center",
  },
  manageScoreText: {
    color: "#fff",
    fontWeight: "bold",
  },
  scoredContainer: {
    backgroundColor: "#22C55E",
    borderRadius: 8,
    marginBottom: 30,
    alignItems: "center",
  },
  scoredText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyText: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E1E2E",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});
