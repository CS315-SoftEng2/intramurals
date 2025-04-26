import { useState } from "react";
import { Link } from "expo-router";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import globalstyles from "../../assets/styles/globalstyles";
import { useQuery } from "@apollo/client";
import GET_MATCHES from "../../queries/matchesQuery";
import GET_SCHEDULES from "../../queries/scheduleQuery";
import GET_EVENTS from "../../queries/eventsQuery";
import GET_CATEGORIES from "../../queries/categoriesQuery";
import GET_TEAMS from "../../queries/teamsQuery";
import { parse } from "date-fns";
import LoadingIndicator from "../components/LoadingIndicator";

const Schedule = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(today.getDate());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const displayMonth = month + 1;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysOfWeek = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  const {
    data: matchesData,
    loading: matchesLoading,
    error: matchesError,
  } = useQuery(GET_MATCHES);
  const {
    data: schedulesData,
    loading: schedulesLoading,
    error: schedulesError,
  } = useQuery(GET_SCHEDULES);
  const {
    data: eventsData,
    loading: eventsLoading,
    error: eventsError,
  } = useQuery(GET_EVENTS);
  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useQuery(GET_CATEGORIES);
  const {
    data: teamsData,
    loading: teamsLoading,
    error: teamsError,
  } = useQuery(GET_TEAMS);

  const events = [];
  if (
    !matchesLoading &&
    !schedulesLoading &&
    !eventsLoading &&
    !categoriesLoading &&
    !teamsLoading &&
    matchesData &&
    schedulesData &&
    eventsData &&
    categoriesData &&
    teamsData
  ) {
    const matches = matchesData.getMatches;
    const schedules = schedulesData.schedules;
    const eventsMap = new Map(eventsData.events.map((e) => [e.event_id, e]));
    const categoriesMap = new Map(
      categoriesData.categories.map((c) => [c.category_id, c])
    );
    const teamsMap = new Map(teamsData.teams.map((t) => [t.team_id, t]));

    matches.forEach((match) => {
      const schedule = schedules.find(
        (s) => s.schedule_id === match.schedule_id
      );
      if (!schedule) return;

      const event = eventsMap.get(schedule.event_id);
      const category = categoriesMap.get(event?.category_id);
      if (!event || !category) return;

      const teamA = teamsMap.get(match.team_a_id);
      const teamB = teamsMap.get(match.team_b_id);
      if (!teamA || !teamB) return;

      const eventDate = parse(schedule.date, "EEEE, MMMM d, yyyy", new Date());
      if (isNaN(eventDate.getTime())) return;

      const timeRange = `${schedule.start_time} - ${schedule.end_time}`;

      events.push({
        id: match.match_id,
        title: `${event.event_name} - ${category.division}`,
        teams: {
          red: match.team_a_name,
          green: match.team_b_name,
        },
        teamColors: {
          red: teamA.team_color,
          green: teamB.team_color,
        },
        time: timeRange,
        location: event.venue,
        date: eventDate.getDate(),
        month: eventDate.getMonth() + 1,
        year: eventDate.getFullYear(),
        formattedDate: schedule.date,
      });
    });
  }

  const getPreviousMonth = () => {
    const prev = new Date(currentDate);
    prev.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(prev);
    setSelectedDate(1);
  };

  const getNextMonth = () => {
    const next = new Date(currentDate);
    next.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(next);
    setSelectedDate(1);
  };

  const renderCalendarDays = () => {
    const dayOffset = (firstDay - 1 + 7) % 7;
    const emptyDays = Array(dayOffset).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const allDays = [...emptyDays, ...days];

    while (allDays.length % 7 !== 0) {
      allDays.push(null);
    }

    const lastRow = allDays.slice(-7);
    const allNull = lastRow.every((day) => day === null);
    const cleanedDays = allNull ? allDays.slice(0, -7) : allDays;

    return (
      <View style={styles.calendarGrid}>
        {daysOfWeek.map((day) => (
          <View key={day} style={styles.dayHeader}>
            <Text style={styles.dayHeaderText}>{day}</Text>
          </View>
        ))}

        {allDays.map((day, index) => (
          <View key={index} style={styles.dayCell}>
            {day && (
              <TouchableOpacity
                onPress={() => setSelectedDate(day)}
                style={[
                  styles.day,
                  events.some(
                    (event) =>
                      event.date === day &&
                      event.month === displayMonth &&
                      event.year === year
                  ) && styles.eventDay,
                  day === selectedDate && styles.selectedDay,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    day === selectedDate && styles.selectedDayText,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderEventCards = () => {
    const filteredEvents = events.filter(
      (event) =>
        event.date === selectedDate &&
        event.month === displayMonth &&
        event.year === year
    );

    if (filteredEvents.length === 0) {
      return (
        <Text style={{ color: "#6E6E6E", textAlign: "center", marginTop: 20 }}>
          No events for this day.
        </Text>
      );
    }

    return filteredEvents.map((event) => (
      <View key={event.id} style={styles.eventCard}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <View style={styles.eventTeams}>
          <View style={styles.teamContainer}>
            <View
              style={[
                styles.teamIndicator,
                { backgroundColor: event.teamColors.red || "#FF4A4A" },
              ]}
            />
            <Text style={styles.teamText}>{event.teams.red}</Text>
          </View>
          <Text style={styles.vsText}>vs</Text>
          <View style={styles.teamContainer}>
            <View
              style={[
                styles.teamIndicator,
                { backgroundColor: event.teamColors.green || "#4AD991" },
              ]}
            />
            <Text style={styles.teamText}>{event.teams.green}</Text>
          </View>
        </View>
        <View style={styles.eventDetails}>
          <MaterialIcons name="calendar-today" size={16} color="#6E6E6E" />
          <Text style={styles.eventDetailText}>{event.formattedDate}</Text>
        </View>
        <View style={styles.eventDetails}>
          <MaterialIcons name="access-time" size={16} color="#6E6E6E" />
          <Text style={styles.eventDetailText}>{event.time}</Text>
        </View>
        <View style={styles.eventDetails}>
          <MaterialIcons name="location-on" size={16} color="#6E6E6E" />
          <Text style={styles.eventDetailText}>{event.location}</Text>
        </View>
      </View>
    ));
  };

  if (
    matchesLoading ||
    schedulesLoading ||
    eventsLoading ||
    categoriesLoading ||
    teamsLoading
  ) {
    return <LoadingIndicator visible={true} />;
  }

  if (
    matchesError ||
    schedulesError ||
    eventsError ||
    categoriesError ||
    teamsError
  ) {
    return <Text>Error loading data</Text>;
  }

  return (
    <SafeAreaView style={globalstyles.container}>
      <View style={globalstyles.loginButtonContainer}>
        <Link href={"/login"}>
          <MaterialIcons name="login" size={30} color="#fff" />
        </Link>
      </View>

      <View style={styles.calendarContainer}>
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={getPreviousMonth}>
            <MaterialIcons name="chevron-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {currentDate.toLocaleString("default", { month: "long" })} {year}
          </Text>
          <TouchableOpacity onPress={getNextMonth}>
            <MaterialIcons name="chevron-right" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        {renderCalendarDays()}
      </View>

      <ScrollView style={styles.eventsContainer}>
        {renderEventCards()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Schedule;

const styles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: "#1D1C2B",
    marginTop: 50,
    padding: 15,
    width: "100%",
  },
  monthSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
  },
  monthText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  dayHeader: {
    width: "14.28%",
    paddingVertical: 5,
    alignItems: "center",
  },
  dayHeaderText: {
    color: "#6E6E6E",
    fontWeight: "bold",
    fontSize: 12,
  },
  dayCell: {
    width: "14.28%",
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 2,
  },
  day: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    color: "#fff",
    fontSize: 12,
  },
  eventDay: {
    backgroundColor: "#4A4A6A",
  },
  selectedDay: {
    backgroundColor: "#A633D6",
  },
  selectedDayText: {
    color: "#fff",
    fontWeight: "bold",
  },
  eventsContainer: {
    padding: 16,
    width: "100%",
  },
  eventCard: {
    backgroundColor: "#2A2A3C",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    width: "100%",
  },
  eventTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  eventTeams: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    width: "100%",
  },
  teamContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  teamIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  teamText: {
    color: "#fff",
  },
  vsText: {
    color: "#6E6E6E",
    marginHorizontal: 8,
  },
  eventDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    width: "100%",
  },
  eventDetailText: {
    color: "#D3D3D3",
    marginLeft: 6,
    flex: 1,
  },
});
