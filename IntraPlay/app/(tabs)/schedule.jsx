import { Link } from 'expo-router';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from 'react';

const Index = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(today.getDate());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysOfWeek = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  const events = [
    {
      id: 1,
      title: "Men's Volleyball",
      teams: { red: "Team Red", green: "Team Green" },
      time: "9:30AM - 10:30AM",
      location: "Bishop Centillas Gym - SHS Building",
      date: 14,
      month: 4,
      year: 2025
    },
    {
      id: 2,
      title: "Women's Single Badminton",
      teams: { red: "Team Red", green: "Team Green" },
      time: "9:30AM - 10:30AM",
      location: "Mandia Gym - 2nd Floor JHS Building",
      date: 14,
      month: 4,
      year: 2025
    }
  ];

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
    const dayOffset = (firstDay + 6) % 7;
    const emptyDays = Array(dayOffset).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const allDays = [...emptyDays, ...days];

    while (allDays.length % 7 !== 0) {
      allDays.push(null);
    }

    const lastRow = allDays.slice(-7);
    const allNull = lastRow.every(day => day === null);
    const cleanedDays = allNull ? allDays.slice(0, -7) : allDays;

    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    return (
      <View style={styles.calendarGrid}>
        {daysOfWeek.map(day => (
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
                  events.some(event =>
                    event.date === day &&
                    event.month === month &&
                    event.year === year
                  ) && styles.eventDay,
                  day === selectedDate && styles.selectedDay
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    day === selectedDate && styles.selectedDayText
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
    const filteredEvents = events.filter(event =>
      event.date === selectedDate &&
      event.month === month &&
      event.year === year
    );

    if (filteredEvents.length === 0) {
      return (
        <Text style={{ color: "#6E6E6E", textAlign: "center", marginTop: 20 }}>
          No events for this day.
        </Text>
      );
    }

    return filteredEvents.map(event => (
      <View key={event.id} style={styles.eventCard}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <View style={styles.eventTeams}>
          <View style={styles.teamContainer}>
            <View style={[styles.teamIndicator, { backgroundColor: '#FF4A4A' }]} />
            <Text style={styles.teamText}>{event.teams.red}</Text>
          </View>
          <Text style={styles.vsText}>vs</Text>
          <View style={styles.teamContainer}>
            <View style={[styles.teamIndicator, { backgroundColor: '#4AD991' }]} />
            <Text style={styles.teamText}>{event.teams.green}</Text>
          </View>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loginBottonContainer}>
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
            {currentDate.toLocaleString('default', { month: 'long' })} {year}
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

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E2E',
  },
  loginBottonContainer: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 10,
  },
  calendarContainer: {
    backgroundColor: '#1D1C2B',
    marginTop: 50,
    padding: 15,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  monthText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayHeader: {
    width: '14.28%',
    paddingVertical: 5,
    alignItems: 'center',
  },
  dayHeaderText: {
    color: '#6E6E6E',
    fontWeight: 'bold',
    fontSize: 12,
  },
  dayCell: {
    width: '14.28%',
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  day: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    color: '#fff',
    fontSize: 12,
  },
  eventDay: {
    backgroundColor: '#4A4A6A',
  },
  eventDayText: {
    color: '#fff',
  },
  selectedDay: {
    backgroundColor: '#A633D6',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  eventsContainer: {
    flex: 1,
    padding: 16,
  },
  eventCard: {
    backgroundColor: '#2A2A3C',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  eventTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  teamText: {
    color: '#fff',
  },
  vsText: {
    color: '#6E6E6E',
    marginHorizontal: 8,
  },
  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventDetailText: {
    color: '#6E6E6E',
    marginLeft: 6,
  },
});
