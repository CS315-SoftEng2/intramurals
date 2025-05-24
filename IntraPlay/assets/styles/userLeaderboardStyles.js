import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingTop: 20,
    alignItems: "stretch",
    justifyContent: "flex-start",
  },
  loadingText: {
    color: "#111827",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#6B7280",
    marginBottom: 20,
  },
  headerText: {
    color: "#1F2937",
    fontSize: 24,
    fontWeight: "bold",
  },
  icon: {
    marginLeft: 10,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
    flexGrow: 1,
    width: "100%",
  },
  teamCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 8,
    padding: 12,
  },
  rankContainer: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 50,
    justifyContent: "center",
  },
  rankText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  rankIcon: {
    marginLeft: 5,
  },
  teamLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginHorizontal: 10,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  scoreText: {
    color: "#6B7280",
    fontSize: 14,
  },
});

export default styles;
