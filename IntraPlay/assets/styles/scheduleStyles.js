import { StyleSheet } from "react-native";

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

export default styles;
