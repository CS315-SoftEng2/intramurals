// React and library imports
import { useState, useEffect, useMemo } from "react";
import { Link } from "expo-router";
import { Text, View, Image, ScrollView, ActivityIndicator } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import * as Font from "expo-font";
import { parse } from "date-fns";
import Toast from "react-native-toast-message";

// Components and helpers
import LoadingIndicator from "../components/LoadingIndicator";
import CountdownTimer from "../../helpers/countDownTimer";

// Styles
import styles from "../../assets/styles/indexStyles";
import globalstyles from "../../assets/styles/globalstyles";

// Queries
import GET_MATCHES from "../../queries/matchesQuery";
import GET_SCHEDULES from "../../queries/scheduleQuery";
import GET_EVENTS from "../../queries/eventsQuery";
import GET_CATEGORIES from "../../queries/categoriesQuery";
import GET_LEADING_TEAM from "../../queries/getLeadingTeamQuery";
import GET_TEAMS from "../../queries/teamsQuery";

// Apollo Client
import { useQuery } from "@apollo/client";

// Team logos
const teamLogos = {
  "team1.png": require("../../assets/images/team1.png"),
  "team2.png": require("../../assets/images/team2.png"),
  "team3.png": require("../../assets/images/team3.png"),
};

// Utility functions
const getTeamLogo = (filename) => {
  if (!filename) return require("../../assets/images/default_logo.png");
  const cleaned = filename.trim().toLowerCase();
  return teamLogos[cleaned] || require("../../assets/images/default_logo.png");
};

const getTeamColor = (teamId, teams) => {
  const team = teams?.find((t) => t.team_id === teamId);
  return team?.team_color || "#22C55E";
};

const colorMap = {
  red: "#FF0000",
  green: "#00FF00",
  yellow: "#FFFF00",
  blue: "#0000FF",
};

const normalizeColor = (color) => {
  if (!color) return "#22C55E";
  const namedColor = color.toLowerCase();
  if (colorMap[namedColor]) return colorMap[namedColor];
  const hexPattern = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;
  return hexPattern.test(color) ? color : "#22C55E";
};

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

const Index = () => {
  // State
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Queries
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
  const {
    data: leadingData,
    loading: leadingLoading,
    error: leadingError,
  } = useQuery(GET_LEADING_TEAM);

  // Error handling
  useEffect(() => {
    const errors = [
      { error: matchError, message: matchError?.message },
      { error: scheduleError, message: scheduleError?.message },
      { error: eventError, message: eventError?.message },
      { error: categoryError, message: categoryError?.message },
      { error: teamError, message: teamError?.message },
      { error: leadingError, message: leadingError?.message },
    ];
    errors.forEach(({ error, message }) => {
      if (error) {
        Toast.show({
          type: "error",
          text1: "Error!",
          text2: message,
        });
      }
    });
  }, [
    matchError,
    scheduleError,
    eventError,
    categoryError,
    teamError,
    leadingError,
  ]);

  // Font loading
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

  // Memoized event details
  const eventDetails = useMemo(() => {
    if (
      !matchData ||
      !scheduleData ||
      !eventData ||
      !categoryData ||
      !teamData
    ) {
      return [];
    }

    const matches = matchData.getMatches;
    const schedules = scheduleData.schedules || [];
    const eventsMap = new Map(eventData.events.map((e) => [e.event_id, e]));
    const categoriesMap = new Map(
      categoryData.categories.map((c) => [c.category_id, c])
    );
    const teamsMap = new Map(teamData.teams.map((t) => [t.team_id, t]));

    return matches
      .map((match) => {
        const schedule = schedules.find(
          (s) => s.schedule_id === match.schedule_id
        );
        if (!schedule) return null;

        const event = eventsMap.get(schedule.event_id);
        if (!event) return null;

        const category = categoriesMap.get(event.category_id);
        if (!category) return null;

        const teamA = teamsMap.get(match.team_a_id);
        const teamB = teamsMap.get(match.team_b_id);
        if (!teamA || !teamB) return null;

        const eventDate = parse(
          schedule.date,
          "EEEE, MMMM d, yyyy",
          new Date()
        );
        if (isNaN(eventDate.getTime())) return null;

        return {
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
        };
      })
      .filter(Boolean);
  }, [matchData, scheduleData, eventData, categoryData, teamData]);

  // Memoized derived data
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const now = new Date();

  const upcomingEvents = useMemo(() => {
    return eventDetails.filter((event) => {
      const eventDate = parse(
        event.event_date,
        "EEEE, MMMM d, yyyy",
        new Date()
      );
      const startTime = convertToDateTime(event.event_date, event.start_time);
      const endTime = convertToDateTime(event.event_date, event.end_time);

      const isOngoing =
        startTime && endTime && now >= startTime && now <= endTime;

      return !isNaN(eventDate.getTime()) && eventDate >= today && !isOngoing;
    });
  }, [eventDetails, today]);

  const ongoingMatches = useMemo(() => {
    return eventDetails.filter((event) => {
      const startTime = convertToDateTime(event.event_date, event.start_time);
      const endTime = convertToDateTime(event.event_date, event.end_time);
      return startTime && endTime && now >= startTime && now <= endTime;
    });
  }, [eventDetails]);

  const groupedEvents = useMemo(() => {
    const grouped = {};
    upcomingEvents.forEach((event) => {
      const dateKey = event.event_date;
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [upcomingEvents]);

  const sortedKeys = useMemo(() => {
    return Object.keys(groupedEvents).sort(
      (a, b) =>
        parse(a, "EEEE, MMMM d, yyyy", new Date()) -
        parse(b, "EEEE, MMMM d, yyyy", new Date())
    );
  }, [groupedEvents]);

  const completedMatches = useMemo(() => {
    if (
      !matchData ||
      !scheduleData ||
      !eventData ||
      !categoryData ||
      !teamData
    ) {
      return [];
    }

    return (
      matchData.getMatches
        ?.filter(
          (match) =>
            match.score_a !== null &&
            match.score_b !== null &&
            match.winner_team_id
        )
        ?.map((match) => {
          const schedule = scheduleData.schedules?.find(
            (s) => s.schedule_id === match.schedule_id
          );
          const event = eventData.events?.find(
            (e) => e.event_id === schedule?.event_id
          );
          const category = categoryData.categories?.find(
            (c) => c.category_id === event?.category_id
          );
          const winnerTeam = teamData.teams?.find(
            (t) => t.team_id === match.winner_team_id
          );

          let parsedUpdatedAt;
          if (match.score_updated_at) {
            parsedUpdatedAt = /^\d+$/.test(match.score_updated_at)
              ? new Date(parseInt(match.score_updated_at, 10))
              : new Date(match.score_updated_at);
          } else {
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
        ?.sort((a, b) => b.parsed_updated_at - a.parsed_updated_at) || []
    );
  }, [matchData, scheduleData, eventData, categoryData, teamData]);

  const leadingTeam = useMemo(() => {
    return (
      leadingData?.teamScores?.find((team) => team.overall_ranking === 1) || {
        team_logo: "default_logo.png",
        total_score: 0,
      }
    );
  }, [leadingData]);

  // Loading state
  if (
    !fontsLoaded ||
    matchLoading ||
    scheduleLoading ||
    eventLoading ||
    categoryLoading ||
    teamLoading ||
    leadingLoading
  ) {
    return <LoadingIndicator visible={true} />;
  }

  return (
    <ScrollView contentContainerStyle={globalstyles.container}>
      {/* Login button */}
      <View style={globalstyles.loginButtonContainer}>
        <Link href={"/login"}>
          <MaterialIcons name="login" size={30} color="#fff" />
        </Link>
      </View>

      {/* Upcoming events */}
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

      {/* Leading team */}
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

      {/* Ongoing matches */}
      <Text style={styles.headerTitleOngoingMatches}>Ongoing Matches</Text>

      <View style={styles.ongoingMatchesContainer}>
        {ongoingMatches.length === 0 ? (
          <Text style={styles.emptyStateText}>
            No ongoing matches right now.
          </Text>
        ) : (
          ongoingMatches.map((match, index) => (
            <LinearGradient
              key={`${match.match_id}-${index}`}
              colors={[
                getTeamColor(match.team_a_id, teamData?.teams),
                getTeamColor(match.team_b_id, teamData?.teams),
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

      {/* Completed matches */}
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
