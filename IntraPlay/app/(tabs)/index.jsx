import { Link } from "expo-router";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import * as Font from "expo-font";
import { useState, useEffect } from "react";
import globalstyles from "../../assets/styles/globalstyles";
import GET_MATCHES from "../../queries/matchesQuery";
import GET_SCHEDULES from "../../queries/scheduleQuery";
import GET_EVENTS from "../../queries/eventsQuery";
import GET_CATEGORIES from "../../queries/categoriesQuery";
import GET_LEADING_TEAM from "../../queries/getLeadingTeamQuery";
import GET_TEAMS from "../../queries/teamsQuery";
import { useQuery } from "@apollo/client";
import { parse } from "date-fns";
import CountdownTimer from "../../helpers/countDownTimer";
import LoadingIndicator from "../components/LoadingIndicator";
import Toast from "react-native-toast-message";

const Index = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // GraphQL Queries
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

  const { data: leadingData, error: leadingError } = useQuery(GET_LEADING_TEAM);
  if (leadingError) {
    Toast.show({
      type: "error",
      text1: "Error!",
      text2: leadingError.message,
    });
  }

  // Error Notifications
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

  // Load Fonts
  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        "Oswald-Semi-Bold": require("../../assets/fonts/oswald-semi-bold.ttf"),
        "Racing Sans One-Regular": require("../../assets/fonts/RacingSansOne-Regular.ttf"),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  // Loading State
  if (
    !fontsLoaded ||
    matchLoading ||
    scheduleLoading ||
    eventLoading ||
    categoryLoading ||
    teamLoading
  ) {
    return <LoadingIndicator visible={true} />;
  }

  // Build eventDetails for Upcoming and Ongoing Matches
  const eventDetails = [];
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

      eventDetails.push({
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
        parsed_date: eventDate,
      });
    });
  }

  // Date and Time Utilities
  const today = new Date();
  today.setHours(0, 0, 0, 0);
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

  // Filter Upcoming Events
  const upcomingEvents = eventDetails.filter((event) => {
    const eventDate = parse(event.event_date, "EEEE, MMMM d, yyyy", new Date());
    if (isNaN(eventDate.getTime())) return false;
    return eventDate >= today;
  });

  // Filter Ongoing Matches
  const ongoingMatches = eventDetails.filter((event) => {
    const startTime = convertToDateTime(event.event_date, event.start_time);
    const endTime = convertToDateTime(event.event_date, event.end_time);
    return startTime && endTime && now >= startTime && now <= endTime;
  });

  // Group Upcoming Events by Date
  const groupedEvents = {};
  upcomingEvents.forEach((event) => {
    const dateKey = event.event_date;
    if (!groupedEvents[dateKey]) {
      groupedEvents[dateKey] = [];
    }
    groupedEvents[dateKey].push(event);
  });

  const sortedKeys = Object.keys(groupedEvents).sort(
    (a, b) =>
      parse(a, "EEEE, MMMM d, yyyy", new Date()) -
      parse(b, "EEEE, MMMM d, yyyy", new Date())
  );

  // Filter and sort completed matches for Just Now Section
  const completedMatches =
    matchData?.getMatches
      ?.filter(
        (match) =>
          match.score_a !== null &&
          match.score_b !== null &&
          match.winner_team_id
      )
      ?.map((match) => {
        const schedule = scheduleData?.schedules?.find(
          (s) => s.schedule_id === match.schedule_id
        );
        const event = eventData?.events?.find(
          (e) => e.event_id === schedule?.event_id
        );
        const category = categoryData?.categories?.find(
          (c) => c.category_id === event?.category_id
        );
        const winnerTeam = teamData?.teams?.find(
          (t) => t.team_id === match.winner_team_id
        );
        // Handle invalid or null score_updated_at
        let parsedUpdatedAt;
        if (match.score_updated_at) {
          // Check if score_updated_at is a Unix timestamp (numeric string)
          if (/^\d+$/.test(match.score_updated_at)) {
            parsedUpdatedAt = new Date(parseInt(match.score_updated_at, 10));
          } else {
            parsedUpdatedAt = new Date(match.score_updated_at);
          }
        } else {
          // Fallback to distant past for null score_updated_at
          parsedUpdatedAt = new Date("1970-01-01T00:00:00Z");
        }
        return {
          ...match,
          event_name: event?.event_name || "Unknown Event",
          division: category?.division || "Unknown Division",
          venue: event?.venue || "Unknown Venue",
          winner_team_color:
            match.winner_team_color || winnerTeam?.team_color || "#22C55E",
          parsed_updated_at: parsedUpdatedAt,
        };
      })
      ?.sort((a, b) => b.parsed_updated_at - a.parsed_updated_at) || [];

  // Debug logging
  console.log(
    "Completed Matches:",
    completedMatches.map((m) => ({
      match_id: m.match_id,
      score_a: m.score_a,
      score_b: m.score_b,
      score_updated_at: m.score_updated_at,
      parsed_updated_at: m.parsed_updated_at.toISOString(),
      event_name: m.event_name,
    }))
  );

  // Leading Team
  const leadingTeam = leadingData?.teamScores?.find(
    (team) => team.overall_ranking === 1
  ) || {
    team_logo: "default_logo.png",
    total_score: 0,
  };

  // Team Logos
  const teamLogos = {
    "team1.png": require("../../assets/images/team1.png"),
    "team2.png": require("../../assets/images/team2.png"),
    "team3.png": require("../../assets/images/team3.png"),
  };

  const getTeamLogo = (filename) => {
    if (!filename) return require("../../assets/images/default_logo.png");
    const cleaned = filename.trim().toLowerCase();
    return (
      teamLogos[cleaned] || require("../../assets/images/default_logo.png")
    );
  };

  const getTeamColor = (teamId) => {
    const team = teamData?.teams?.find((t) => t.team_id === teamId);
    return team?.team_color || "#22C55E";
  };

  // Map named colors to hex values
  const colorMap = {
    red: "#FF0000",
    green: "#00FF00",
    yellow: "#FFFF00",
    blue: "#0000FF",
  };

  // Convert color to hex if it's a named color, or validate hex
  const normalizeColor = (color) => {
    if (!color) return "#22C55E";
    const namedColor = color.toLowerCase();
    if (colorMap[namedColor]) {
      return colorMap[namedColor];
    }
    const hexPattern = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;
    if (hexPattern.test(color)) {
      return color;
    }
    return "#22C55E";
  };

  // Darken the color for the gradient
  const darkenColor = (hex) => {
    let color = hex.startsWith("#") ? hex.slice(1) : hex;
    if (color.length === 3)
      color = color
        .split("")
        .map((c) => c + c)
        .join("");
    const r = parseInt(color.slice(0, 2), 16);
    const g = parseInt(color.slice(2, 4), 16);
    const b = parseInt(color.slice(4, 6), 16);
    const factor = 0.6;
    return `rgb(${Math.round(r * factor)}, ${Math.round(
      g * factor
    )}, ${Math.round(b * factor)})`;
  };

  return (
    <ScrollView contentContainerStyle={globalstyles.container}>
      <View style={globalstyles.loginButtonContainer}>
        <Link href={"/login"}>
          <MaterialIcons name="login" size={30} color="#fff" />
        </Link>
      </View>

      <Text style={styles.headerTitleUpcomingEvents}>
        {upcomingEvents.some((event) => {
          const eventDate = parse(
            event.event_date,
            "EEEE, MMMM d, yyyy",
            new Date()
          );
          return eventDate.toDateString() === today.toDateString();
        })
          ? "Upcoming Events Today"
          : "Upcoming Events"}
      </Text>

      <View style={styles.upcomingEventsContainer}>
        {sortedKeys.length === 0 ? (
          <Text style={{ color: "#fff", textAlign: "center" }}>
            No upcoming events found.
          </Text>
        ) : (
          sortedKeys.map((dateKey) => (
            <View key={dateKey}>
              <Text style={styles.dateHeader}>{dateKey}</Text>
              <View style={styles.eventList}>
                {groupedEvents[dateKey].map((event, index) => (
                  <View
                    key={`${event.match_id}-${index}`}
                    style={styles.eventCard}
                  >
                    <View style={styles.eventCardContent}>
                      <View style={styles.eventNameContainer}>
                        <Text style={styles.eventName}>
                          {event.event_name} - {event.division}
                        </Text>
                        <View style={styles.eventTimeRow}>
                          <MaterialIcons
                            name="schedule"
                            size={12}
                            color="#aaa"
                          />
                          <Text style={styles.eventTime}>
                            {event.start_time} - {event.end_time}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.locationContainer}>
                        <Text style={styles.locationText}>{event.venue}</Text>
                        <Text style={styles.teamText}>
                          {event.team_a_name} vs {event.team_b_name}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </View>

      <Text style={styles.headerTitleLeadingTeam}>Leading Team</Text>

      <View style={styles.leadingTeamContainer}>
        <Image
          source={getTeamLogo(leadingTeam?.team_logo)}
          style={styles.team1Logo}
        />
        <View style={styles.scoreContainer}>
          <Text style={styles.totalScoreLabel}>TOTAL SCORE</Text>
          <Text style={styles.totalScoreValue}>
            {leadingTeam?.total_score ?? 0}
          </Text>
        </View>
      </View>

      <Text style={styles.headerTitleOngoingMatches}>Ongoing Matches</Text>

      <View style={styles.ongoingMatchesContainer}>
        {matchLoading ||
        scheduleLoading ||
        eventLoading ||
        categoryLoading ||
        teamLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : matchError ||
          scheduleError ||
          eventError ||
          categoryError ||
          teamError ? (
          <Text style={styles.errorText}>
            Error:{" "}
            {matchError?.message ||
              scheduleError?.message ||
              eventError?.message ||
              categoryError?.message ||
              teamError?.message}
          </Text>
        ) : ongoingMatches.length === 0 ? (
          <Text style={styles.emptyStateText}>
            No ongoing matches right now.
          </Text>
        ) : (
          ongoingMatches.map((match, index) => (
            <LinearGradient
              key={`${match.match_id}-${index}`}
              colors={[
                getTeamColor(match.team_a_id),
                getTeamColor(match.team_b_id),
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.matchGradientBorder}
            >
              <View style={styles.matchCardContent}>
                <Text style={styles.eventNameMatch}>
                  {match.event_name} - {match.division}
                </Text>
                <View style={styles.teamsMatchupContainer}>
                  <Image
                    source={getTeamLogo(match.team_a_logo)}
                    style={styles.ongoingMatchesTeamLogos}
                  />
                  <Text style={styles.matchingTeamNames}>
                    {match.team_a_name} vs {match.team_b_name}
                  </Text>
                  <Image
                    source={getTeamLogo(match.team_b_logo)}
                    style={styles.ongoingMatchesTeamLogos}
                  />
                </View>
                <View style={styles.matchVenueContainer}>
                  <MaterialIcons
                    name="location-on"
                    size={15}
                    color="#6E6E6E"
                    style={{ marginRight: 2 }}
                  />
                  <Text style={styles.venueText}>
                    {match.venue} -{" "}
                    <CountdownTimer
                      eventDate={match.event_date}
                      endTime={match.end_time}
                    />
                  </Text>
                </View>
              </View>
            </LinearGradient>
          ))
        )}
      </View>

      <Text style={styles.headerTitleJustNow}>Just Now</Text>

      <View style={styles.justNowContainer}>
        {completedMatches.length === 0 ? (
          <Text style={styles.justNowEmptyText}>
            No completed matches to display.
          </Text>
        ) : (
          completedMatches.map((match, index) => {
            const winnerName =
              match.winner_team_id === match.team_a_id
                ? match.team_a_name
                : match.team_b_name;
            const loserName =
              match.winner_team_id === match.team_a_id
                ? match.team_b_name
                : match.team_a_name;
            const winnerLogo =
              match.winner_team_id === match.team_a_id
                ? match.team_a_logo
                : match.team_b_logo;
            const winnerColor = normalizeColor(match.winner_team_color);
            const darkerColor = darkenColor(winnerColor);

            return (
              <LinearGradient
                key={`${match.match_id}-${index}`}
                colors={[winnerColor, darkerColor]}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 0 }}
                style={styles.justNowCard}
              >
                <Image
                  source={getTeamLogo(winnerLogo)}
                  style={styles.justNowTeamLogo}
                />
                <View style={styles.justNowTextContainer}>
                  <Text style={styles.justNowTitle}>
                    {`${winnerName} WINS ${match.event_name}`.toUpperCase()}
                  </Text>
                  <Text style={styles.justNowSubtitle}>
                    {`DEFEATED ${loserName} ${match.score_a} - ${match.score_b}`.toUpperCase()}
                  </Text>
                </View>
              </LinearGradient>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

export default Index;

// ... (Styles remain unchanged)
const styles = StyleSheet.create({
  headerTitleUpcomingEvents: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginTop: 40,
    alignSelf: "flex-start",
    marginLeft: 25,
  },
  headerTitleLeadingTeam: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginTop: 20,
    alignSelf: "flex-start",
    marginLeft: 25,
  },
  headerTitleJustNow: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 25,
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  headerTitleOngoingMatches: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginTop: 10,
    marginBottom: 5,
    marginLeft: 25,
    alignSelf: "flex-start",
  },
  upcomingEventsContainer: {
    backgroundColor: "#2A2A3C",
    width: "90%",
    marginTop: 15,
    marginBottom: 20,
    borderRadius: 15,
    padding: 15,
    paddingBottom: 20,
  },
  dateHeader: {
    color: "#22C55E",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  eventList: {
    width: "100%",
  },
  eventCard: {
    backgroundColor: "#1E1E2E",
    borderRadius: 10,
    marginBottom: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  eventCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eventNameContainer: {
    flex: 1,
    paddingRight: 8,
  },
  eventName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  eventTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  eventTime: {
    color: "#aaa",
    fontSize: 12,
  },
  venueText: {
    color: "#aaa",
    fontSize: 12,
  },
  locationContainer: {
    alignItems: "flex-end",
  },
  locationText: {
    color: "#ddd",
    fontSize: 12,
    marginBottom: 2,
  },
  teamText: {
    color: "#aaa",
    fontSize: 11,
  },
  leadingTeamContainer: {
    height: 120,
    width: "98%",
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 15,
  },
  matchVenueContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  team1Logo: {
    width: 75,
    height: 75,
    borderRadius: 50,
  },
  scoreContainer: {
    marginLeft: 20,
    alignItems: "center",
  },
  totalScoreLabel: {
    fontFamily: "Oswald-Semi-Bold",
    fontSize: 18,
    color: "#fff",
    marginBottom: 5,
  },
  totalScoreValue: {
    fontFamily: "Racing Sans One-Regular",
    fontSize: 50,
    color: "#fff",
  },
  justNowContainer: {
    width: "95%",
    borderRadius: 15,
    padding: 15,
    paddingBottom: 20,
  },
  justNowCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    minHeight: 60,
  },
  justNowTeamLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  justNowTextContainer: {
    flex: 1,
  },
  justNowTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  justNowSubtitle: {
    color: "#fff",
    fontSize: 12,
    textTransform: "uppercase",
  },
  justNowEmptyText: {
    color: "#fff",
    textAlign: "center",
    padding: 10,
  },
  eventNameMatch: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Racing Sans One-Regular",
    textAlign: "center",
    margin: -5,
    marginBottom: 5,
  },
  matchingTeamNames: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Oswald-Semi-Bold",
    textAlign: "center",
  },
  ongoingMatchesTeamLogos: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  ongoingMatchesContainer: {
    width: "98%",
    borderRadius: 15,
    padding: 15,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    padding: 10,
  },
  emptyStateText: {
    color: "#fff",
    textAlign: "center",
    padding: 10,
  },
  matchGradientBorder: {
    borderRadius: 10,
    marginBottom: 15,
    padding: 2,
    width: "100%",
  },
  matchCardContent: {
    backgroundColor: "#2A2A3C",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  teamsMatchupContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    width: "100%",
    paddingHorizontal: 10,
  },
});
