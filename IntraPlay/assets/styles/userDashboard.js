import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#F9FAFB",
    paddingBottom: 20,
  },
  contentContainer: {
    paddingHorizontal: 25,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
  },
  assignedEventContainer: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    marginBottom: 20,
    borderRadius: 15,
    padding: 15,
  },
  eventNameAndDivision: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  assignEventMatch: {
    color: "#111827",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 5,
  },
  assignEventRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  icon: {
    marginRight: 6,
  },
  assignEventText: {
    color: "#6B7280",
    fontSize: 13,
    flexShrink: 1,
  },
  manageScoreButton: {
    backgroundColor: "#16A34A",
    borderRadius: 8,
    marginBottom: 30,
    alignItems: "center",
  },
  manageScoreText: {
    color: "#fff",
    fontWeight: "bold",
  },
  scoredContainer: {
    backgroundColor: "#22C55E",
    borderRadius: 8,
    marginBottom: 30,
    alignItems: "center",
  },
  scoredText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyText: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E1E2E",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});

export default styles;
