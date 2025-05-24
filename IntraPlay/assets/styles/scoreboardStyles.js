import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9FAFB",
    paddingTop: 20,
    alignItems: "stretch",
    justifyContent: "flex-start",
  },
  contentContainer: {
    flexGrow: 1,
    backgroundColor: "#F9FAFB",
    paddingTop: 20,
    alignItems: "stretch",
    justifyContent: "flex-start",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    margin: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
  },
  icon: {
    marginLeft: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "#6B7280",
    marginHorizontal: 10,
    marginBottom: 10,
  },
  matchesContainer: {
    width: "98%",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    alignSelf: "center",
  },
  matchCardBorder: {
    borderRadius: 10,
    marginBottom: 15,
    padding: 2,
  },
  matchCardContent: {
    backgroundColor: "#FFFFF",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  completedMatchCard: {
    backgroundColor: "#FFFFFF",
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
    color: "#1F2937",
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
    color: "#111827",
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
    color: "#6B7280",
    fontSize: 20,
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
    color: "#6B7280",
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
    color: "#111827",
    textAlign: "center",
    fontSize: 16,
    padding: 10,
  },
});

export default styles;
