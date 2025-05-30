import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E2E",
    paddingTop: 10,
    alignItems: "stretch",
    justifyContent: "flex-start",
  },
  loadingText: {
    color: "#fff",
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
    borderBottomColor: "#444",
    marginBottom: 20,
  },
  headerText: {
    color: "#FFFFFF",
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
    backgroundColor: "#2A2A3C",
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
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  scoreText: {
    color: "#aaa",
    fontSize: 14,
  },
  noScoresContainer: {
    justifyContent: "flex-start",
    alignSelf: "center",
  },
  noScoresText: {
    color: "#fff",
    fontSize: 15,
    paddingTop: 15,
  },
});

export default styles;
