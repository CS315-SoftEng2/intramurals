import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: "#F3F4F6",
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
    color: "#1F2937",
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
    color: "#111827",
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
    color: "#6B7280",
    fontSize: 12,
  },
  eventDay: {
    backgroundColor: "#E6F4EA",
  },
  selectedDay: {
    backgroundColor: "#34C759",
  },
  selectedDayText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  eventsContainer: {
    padding: 16,
    width: "100%",
  },
  eventCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    width: "100%",
  },
  eventTitle: {
    color: "#111827",
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
    color: "#6B7280",
  },
  vsText: {
    color: "#6B7280",
    marginHorizontal: 8,
  },
  eventDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    width: "100%",
  },
  eventDetailText: {
    color: "#6B7280",
    marginLeft: 6,
    flex: 1,
  },
});

export default styles;
