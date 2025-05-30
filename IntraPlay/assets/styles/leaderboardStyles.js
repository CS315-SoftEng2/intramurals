import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E2E",
  },
  contentContainer: {
    paddingHorizontal: 25,
    paddingTop: 50,
    paddingBottom: 50,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
    textAlign: "left",
  },
  leaderboardTable: {
    marginTop: 15,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#2A2A3C",
    borderWidth: 1,
    borderColor: "#aaa",
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#aaa",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#aaa",
  },
  headerCell: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  cell: {
    color: "#fff",
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
