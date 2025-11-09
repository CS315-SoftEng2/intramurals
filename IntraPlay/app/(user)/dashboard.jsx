// React and library imports
import { useRouter } from "expo-router";
import { useQuery } from "@apollo/client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";

// Styles and UI components
import styles from "../../assets/styles/userDashboard";
import globalstyles from "@/assets/styles/globalstyles";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import LoadingIndicator from "../components/LoadingIndicator";

// GraphQL queries
import GET_MATCHES from "../../queries/matchesQuery";
import GET_SCHEDULE from "../../queries/scheduleQuery";
import GET_EVENTS from "../../queries/eventsQuery";
import GET_TEAMS from "../../queries/teamsQuery";

// Utilities and context
import useAuthGuard from "@/utils/authGuard";
import storage from "../../utils/storage";
import { useDimensions } from "../../context/DimensionsContext";
import { useAuth } from "../../context/AuthContext";
import { handleLogout } from "../../utils/handleLogout";

const Dashboard = () => {
  // Check if user has proper access
  useAuthGuard("user");

  // Context and navigation hooks
  const { width } = useDimensions();
  const router = useRouter();
  const { logout } = useAuth();

  // GraphQL queries for data
  const {
    loading: matchLoading,
    error: matchError,
    data: matchData,
  } = useQuery(GET_MATCHES, { pollInterval: 1000 });
  const {
    loading: scheduleLoading,
    error: scheduleError,
    data: scheduleData,
  } = useQuery(GET_SCHEDULE, { pollInterval: 1000 });
  const {
    loading: venueLoading,
    error: venueError,
    data: venueData,
  } = useQuery(GET_EVENTS, { pollInterval: 1000 });
  const {
    loading: teamLoading,
    error: teamError,
    data: teamData,
  } = useQuery(GET_TEAMS, { pollInterval: 1000 });

  // Local state to store and manage user data
  const [userId, setUserId] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Retrieve user info from local storage
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userString = await storage.getItem("user_data");
        if (!userString)
          throw new Error("User data missing. Please log in again.");
        const user = JSON.parse(userString);
        if (!user?.user_id)
          throw new Error("Invalid user info. Please log in again.");
        setUserId(user.user_id);
      } catch (error) {
        setAuthError(error.message);
        router.replace("/login");
      } finally {
        setUserLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Memoized values for performance
  const schedules = useMemo(
    () => scheduleData?.schedules || [],
    [scheduleData]
  );
  const venueEvent = useMemo(() => venueData?.events || [], [venueData]);
  const teamName = useMemo(() => teamData?.teams || [], [teamData]);

  // Helper functions to extract venue and team details
  const getEventVenue = useCallback(
    (schedule_id) => {
      const schedule = schedules.find(
        (s) => String(s.schedule_id) === String(schedule_id)
      );
      const event = venueEvent.find(
        (e) => String(e.event_id) === String(schedule?.event_id)
      );
      return event?.venue || "Venue TBD";
    },
    [schedules, venueEvent]
  );

  const getScheduleDetails = useCallback(
    (scheduleId) => schedules.find((s) => s.schedule_id === scheduleId),
    [schedules]
  );

  const getTeamAName = useCallback(
    (team_a_id) =>
      teamName.find((team) => team.team_id == team_a_id)?.team_name ||
      "Unknown Team A",
    [teamName]
  );

  const getTeamBName = useCallback(
    (team_b_id) =>
      teamName.find((team) => team.team_id == team_b_id)?.team_name ||
      "Unknown Team B",
    [teamName]
  );

  // Filter matches based on assignment and score status
  const assignedMatches = useMemo(
    () =>
      matchData?.getMatches?.filter(
        (match) => String(match.user_assigned_id) === String(userId)
      ) || [],
    [matchData, userId]
  );

  const unscoredMatches = useMemo(
    () =>
      assignedMatches.filter(
        (match) =>
          match.score_a === null ||
          match.score_b === null ||
          match.score_a === 0 ||
          match.score_b === 0
      ),
    [assignedMatches]
  );

  const scoredMatches = useMemo(
    () =>
      assignedMatches.filter(
        (match) =>
          match.score_a !== null &&
          match.score_b !== null &&
          match.score_a !== 0 &&
          match.score_b !== 0
      ),
    [assignedMatches]
  );

  // Determine screen size
  const isTablet = useMemo(() => width >= 768, [width]);

  // Go to score update page
  const handleManageScores = useCallback(
    (match) => {
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
      });
    },
    [router]
  );

  // Show loading spinner while data is loading
  if (
    matchLoading ||
    scheduleLoading ||
    venueLoading ||
    teamLoading ||
    userLoading ||
    userId === null ||
    userId === undefined
  ) {
    return <LoadingIndicator visible={true} />;
  }

  // Show error if any occurs
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

  // If no matches are assigned to this user
  if (assignedMatches.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>
          You don't have any assigned matches.
        </Text>
      </View>
    );
  }

  // Main UI rendering
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Logout button */}
      <View style={globalstyles.loginButtonContainer}>
        <TouchableOpacity onPress={() => handleLogout(logout)}>
          <MaterialIcons name="logout" size={25} color="#fff" />
        </TouchableOpacity>
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
        {/* Unscored Matches */}
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
                  { height: isTablet ? 200 : 170, padding: isTablet ? 20 : 15 },
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
                  onPress={() => handleManageScores(match)}
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

        {/* Scored Matches */}
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
                    onPress={() => handleManageScores(match)}
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
