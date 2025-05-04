import { Text, View, Image, ScrollView } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useQuery } from "@apollo/client";
import { useEffect } from "react";
import { Link } from "expo-router";
import Toast from "react-native-toast-message";
import styles from "../../assets/styles/scoreboardStyles";
import globalstyles from "../../assets/styles/globalstyles";
import GET_MATCHES from "../../queries/matchesQuery";
import GET_SCHEDULES from "../../queries/scheduleQuery";
import GET_EVENTS from "../../queries/eventsQuery";
import GET_CATEGORIES from "../../queries/categoriesQuery";
import GET_TEAMS from "../../queries/teamsQuery";
import LoadingIndicator from "../components/LoadingIndicator";
import { parse } from "date-fns";

const teamLogos = {
  "team1.png": require("../../assets/images/team1.png"),
  "team2.png": require("../../assets/images/team2.png"),
  "team3.png": require("../../assets/images/team3.png"),
};

const getTeamLogo = (filename) => {
  if (!filename) return require("../../assets/images/default_logo.png");
  const cleaned = filename.trim().toLowerCase();
  return teamLogos[cleaned] || require("../../assets/images/default_logo.png");
};

const Scoreboard = () => {
  const {
    data: matchData,
    loading: matchLoading,
    error: matchError,
  } = useQuery(GET_MATCHES);
  const {
    data: scheduleData,
    loading: scheduleLoading,
    error: scheduleError,
  } = useQuery(GET_SCHEDULES);
  const {
    data: eventData,
    loading: eventLoading,
    error: eventError,
  } = useQuery(GET_EVENTS);
  const {
    data: categoryData,
    loading: categoryLoading,
    error: categoryError,
  } = useQuery(GET_CATEGORIES);
  const {
    data: teamData,
    loading: teamLoading,
    error: teamError,
  } = useQuery(GET_TEAMS);

  useEffect(() => {
    if (matchError)
      Toast.show({ type: "error", text1: "Error!", text2: matchError.message });
    if (scheduleError)
      Toast.show({
        type: "error",
        text1: "Error!",
        text2: scheduleError.message,
      });
    if (eventError)
      Toast.show({ type: "error", text1: "Error!", text2: eventError.message });
    if (categoryError)
      Toast.show({
        type: "error",
        text1: "Error!",
        text2: categoryError.message,
      });
    if (teamError)
      Toast.show({ type: "error", text1: "Error!", text2: teamError.message });
  }, [matchError, scheduleError, eventError, categoryError, teamError]);

  if (
    matchLoading ||
    scheduleLoading ||
    eventLoading ||
    categoryLoading ||
    teamLoading
  ) {
    return <LoadingIndicator visible={true} />;
  }

  const matchDetails = [];
  if (matchData && scheduleData && eventData && categoryData && teamData) {
    const matches = matchData.getMatches;
    const schedules = scheduleData.schedules || [];
    const eventsMap = new Map(eventData.events.map((e) => [e.event_id, e]));
    const categoriesMap = new Map(
      categoryData.categories.map((c) => [c.category_id, c])
    );
    const teamsMap = new Map(teamData.teams.map((t) => [t.team_id, t]));

    matches.forEach((match) => {
      const schedule = schedules.find(
        (s) => s.schedule_id === match.schedule_id
      );
      if (!schedule) return;

      const event = eventsMap.get(schedule.event_id);
      if (!event) return;

      const category = categoriesMap.get(event.category_id);
      if (!category) return;

      const teamA = teamsMap.get(match.team_a_id);
      const teamB = teamsMap.get(match.team_b_id);
      if (!teamA || !teamB) return;

      const eventDate = parse(schedule.date, "EEEE, MMMM d, yyyy", new Date());
      if (isNaN(eventDate.getTime())) return;

      matchDetails.push({
        match_id: match.match_id,
        event_name: event.event_name,
        division: category.division,
        event_date: schedule.date,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        venue: event.venue,
        team_a_name: match.team_a_name,
        team_b_name: match.team_b_name,
        team_a_logo: match.team_a_logo,
        team_b_logo: match.team_b_logo,
        team_a_id: match.team_a_id,
        team_b_id: match.team_b_id,
        score_a: match.score_a,
        score_b: match.score_b,
        winner_team_id: match.winner_team_id,
        winner_team_color: match.winner_team_color,
        parsed_date: eventDate,
      });
    });
  }

  const now = new Date();
  const convertToDateTime = (dateStr, timeStr) => {
    try {
      const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!timeMatch) throw new Error(`Invalid time format: ${timeStr}`);
      let [_, hours, minutes, period] = timeMatch;
      hours = parseInt(hours);
      minutes = parseInt(minutes);
      if (period.toUpperCase() === "PM" && hours !== 12) hours += 12;
      if (period.toUpperCase() === "AM" && hours === 12) hours = 0;

      const dateObj = parse(dateStr, "EEEE, MMMM d, yyyy", new Date());
      if (isNaN(dateObj.getTime())) throw new Error(`Invalid date: ${dateStr}`);

      dateObj.setHours(hours, minutes, 0, 0);
      return dateObj;
    } catch (error) {
      return null;
    }
  };

  const completedMatches = matchDetails
    .filter(
      (match) =>
        match.score_a !== null && match.score_b !== null && match.winner_team_id
    )
    .sort((a, b) => {
      const dateA = convertToDateTime(a.event_date, a.end_time) || new Date(0);
      const dateB = convertToDateTime(b.event_date, b.end_time) || new Date(0);
      return dateB - dateA;
    });

  return (
    <ScrollView contentContainerStyle={globalstyles.container}>
      <View style={globalstyles.loginButtonContainer}>
        <Link href={"/login"}>
          <MaterialIcons name="login" size={30} color="#fff" />
        </Link>
      </View>

      <Text style={styles.sectionTitle}>Completed Matches</Text>
      <View style={styles.matchesContainer}>
        {completedMatches.length === 0 ? (
          <Text style={styles.emptyStateText}>
            No completed matches to display.
          </Text>
        ) : (
          completedMatches.map((match, index) => {
            const winnerName =
              match.winner_team_id === match.team_a_id
                ? match.team_a_name
                : match.team_b_name;
            return (
              <View
                key={`${match.match_id}-${index}`}
                style={[
                  styles.completedMatchCard,
                  {
                    borderColor: match.winner_team_color,
                    borderWidth: 1,
                  },
                ]}
              >
                <Text style={styles.eventName}>
                  {match.event_name} - {match.division}
                </Text>
                <View style={styles.teamsContainer}>
                  <View style={styles.teamSection}>
                    <Image
                      source={getTeamLogo(match.team_a_logo)}
                      style={styles.teamLogo}
                    />
                    <Text style={styles.teamName}>
                      Team {match.team_a_name}
                    </Text>
                    <Text style={styles.score}>{match.score_a}</Text>
                  </View>
                  <Text style={styles.versus}>VS</Text>
                  <View style={styles.teamSection}>
                    <Image
                      source={getTeamLogo(match.team_b_logo)}
                      style={styles.teamLogo}
                    />
                    <Text style={styles.teamName}>
                      Team {match.team_b_name}
                    </Text>
                    <Text style={styles.score}>{match.score_b}</Text>
                  </View>
                </View>
                <Text style={styles.winnerText}>Winner: Team {winnerName}</Text>
                <View style={styles.matchInfo}>
                  <MaterialIcons name="location-on" size={15} color="#6E6E6E" />
                  <Text style={styles.venueText}>{match.venue}</Text>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

export default Scoreboard;
