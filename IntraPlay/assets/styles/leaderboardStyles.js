import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  contentContainer: {
    paddingHorizontal: 25,
    paddingTop: 50,
    paddingBottom: 50,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
    textAlign: "left",
  },
  leaderboardTable: {
    marginTop: 15,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#6B7280",
  },
  headerCell: {
    color: "#1F2937",
    fontWeight: "600",
    fontSize: 14,
  },
  cell: {
    color: "#111827",
    fontSize: 16,
  },
  rankCell: {
    width: "15%",
  },
  teamCell: {
    width: "60%",
  },
  scoreCell: {
    width: "25%",
    textAlign: "right",
  },
});

export default styles;
