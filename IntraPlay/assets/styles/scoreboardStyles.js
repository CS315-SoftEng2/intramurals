import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginTop: 40,
    marginLeft: 25,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    justifyContent: "flex-start",
    alignSelf: "flex-start",
    margin: 20,
  },
  matchesContainer: {
    width: "98%",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  matchCardBorder: {
    borderRadius: 10,
    marginBottom: 15,
    padding: 2,
  },
  matchCardContent: {
    backgroundColor: "#2A2A3C",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  completedMatchCard: {
    backgroundColor: "#2A2A3C",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  eventName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Racing Sans One-Regular",
    textAlign: "center",
    marginBottom: 10,
  },
  teamsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  teamSection: {
    alignItems: "center",
    flex: 1,
  },
  teamLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
  },
  teamName: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Oswald-Semi-Bold",
    textAlign: "center",
    marginBottom: 5,
  },
  score: {
    color: "#22C55E",
    fontSize: 24,
    fontWeight: "bold",
  },
  versus: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 10,
  },
  matchInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  venueText: {
    color: "#aaa",
    fontSize: 14,
    marginLeft: 5,
  },
  winnerText: {
    color: "#22C55E",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  emptyStateText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    padding: 10,
  },
});

export default styles;
