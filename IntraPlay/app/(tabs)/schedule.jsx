// React and library imports
import { useState, useMemo } from "react";
import { Link } from "expo-router";
import {
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { parse } from "date-fns";

// Components
import LoadingIndicator from "../components/LoadingIndicator";

// Styles
import styles from "../../assets/styles/scheduleStyles";
import globalstyles from "../../assets/styles/globalstyles";

// Queries
import GET_MATCHES from "../../queries/matchesQuery";
import GET_SCHEDULES from "../../queries/scheduleQuery";
import GET_EVENTS from "../../queries/eventsQuery";
import GET_CATEGORIES from "../../queries/categoriesQuery";
import GET_TEAMS from "../../queries/teamsQuery";

// Apollo Client
import { useQuery } from "@apollo/client";

const Schedule = () => {
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());

  // Queries
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

  // Memoized calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const displayMonth = month + 1;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dayOffset = (firstDay - 1 + 7) % 7;
    const daysOfWeek = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
    return {
      year,
      month,
      displayMonth,
      firstDay,
      daysInMonth,
      dayOffset,
      daysOfWeek,
    };
  }, [currentDate]);

  // Memoized events
  const events = useMemo(() => {
    if (
      matchesLoading ||
      schedulesLoading ||
      eventsLoading ||
      categoriesLoading ||
      teamsLoading ||
      !matchesData ||
      !schedulesData ||
      !eventsData ||
      !categoriesData ||
      !teamsData
    ) {
      return [];
    }

    const matches = matchesData.getMatches;
    const schedules = schedulesData.schedules;
    const eventsMap = new Map(eventsData.events.map((e) => [e.event_id, e]));
    const categoriesMap = new Map(
      categoriesData.categories.map((c) => [c.category_id, c])
    );
    const teamsMap = new Map(teamsData.teams.map((t) => [t.team_id, t]));

    return matches
      .map((match) => {
        const schedule = schedules.find(
          (s) => s.schedule_id === match.schedule_id
        );
        if (!schedule) return null;

        const event = eventsMap.get(schedule.event_id);
        const category = categoriesMap.get(event?.category_id);
        if (!event || !category) return null;

        const teamA = teamsMap.get(match.team_a_id);
        const teamB = teamsMap.get(match.team_b_id);
        if (!teamA || !teamB) return null;

        const eventDate = parse(
          schedule.date,
          "EEEE, MMMM d, yyyy",
          new Date()
        );
        if (isNaN(eventDate.getTime())) return null;

        const timeRange = `${schedule.start_time} - ${schedule.end_time}`;

        return {
          id: match.match_id,
          title: `${event.event_name} - ${category.division}`,
          teams: {
            red: match.team_a_name,
            green: match.team_b_name,
          },
          teamColors: {
            red: teamA.team_color || "#FF4A4A",
            green: teamB.team_color || "#4AD991",
          },
          time: timeRange,
          location: event.venue,
          date: eventDate.getDate(),
          month: eventDate.getMonth() + 1,
          year: eventDate.getFullYear(),
          formattedDate: schedule.date,
        };
      })
      .filter(Boolean);
  }, [
    matchesData,
    schedulesData,
    eventsData,
    categoriesData,
    teamsData,
    matchesLoading,
    schedulesLoading,
    eventsLoading,
    categoriesLoading,
    teamsLoading,
  ]);

  // Handlers
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

  // Render calendar days
  const renderCalendarDays = useMemo(() => {
    const { dayOffset, daysInMonth, daysOfWeek, year, displayMonth } =
      calendarData;
    const emptyDays = Array(dayOffset).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    let allDays = [...emptyDays, ...days];

    while (allDays.length % 7 !== 0) {
      allDays.push(null);
    }

    const lastRow = allDays.slice(-7);
    const allNull = lastRow.every((day) => day === null);
    const cleanedDays = allNull ? allDays.slice(0, -7) : allDays;

    return () => (
      <View style={styles.calendarGrid}>
        {daysOfWeek.map((day) => (
          <View key={day} style={styles.dayHeader}>
            <Text style={styles.dayHeaderText}>{day}</Text>
          </View>
        ))}
        {cleanedDays.map((day, index) => (
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
  }, [calendarData, events, selectedDate]);

  // Render event cards
  const renderEventCards = useMemo(() => {
    return () => {
      const filteredEvents = events.filter(
        (event) =>
          event.date === selectedDate &&
          event.month === calendarData.displayMonth &&
          event.year === calendarData.year
      );

      if (filteredEvents.length === 0) {
        return (
          <Text
            style={{ color: "#6E6E6E", textAlign: "center", marginTop: 20 }}
          >
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
                  { backgroundColor: event.teamColors.red },
                ]}
              />
              <Text style={styles.teamText}>{event.teams.red}</Text>
            </View>
            <Text style={styles.vsText}>vs</Text>
            <View style={styles.teamContainer}>
              <View
                style={[
                  styles.teamIndicator,
                  { backgroundColor: event.teamColors.green },
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
  }, [events, selectedDate, calendarData]);

  // Loading state
  if (
    matchesLoading ||
    schedulesLoading ||
    eventsLoading ||
    categoriesLoading ||
    teamsLoading
  ) {
    return <LoadingIndicator visible={true} />;
  }

  // Error state
  if (
    matchesError ||
    schedulesError ||
    eventsError ||
    categoriesError ||
    teamsError
  ) {
    return (
      <SafeAreaView style={globalstyles.container}>
        <Text style={{ color: "#F38BA8", textAlign: "center", marginTop: 20 }}>
          Error loading data:{" "}
          {matchesError?.message ||
            schedulesError?.message ||
            eventsError?.message ||
            categoriesError?.message ||
            teamsError?.message}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalstyles.container}>
      {/* Login button */}
      <View style={globalstyles.loginButtonContainer}>
        <Link href={"/login"}>
          <MaterialIcons name="login" size={30} color="#22C55E" />
        </Link>
      </View>

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={getPreviousMonth}>
            <MaterialIcons name="chevron-left" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {currentDate.toLocaleString("default", { month: "long" })}{" "}
            {calendarData.year}
          </Text>
          <TouchableOpacity onPress={getNextMonth}>
            <MaterialIcons name="chevron-right" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>
        {renderCalendarDays()}
      </View>

      {/* Events */}
      <ScrollView style={styles.eventsContainer}>
        {renderEventCards()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Schedule;
