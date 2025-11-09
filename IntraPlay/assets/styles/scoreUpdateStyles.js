import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  contentContainer: {
    top: 25,
    padding: 25,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
    textAlign: "left",
  },
  scoreCard: {
    backgroundColor: "#2A2A3C",
    borderRadius: 15,
    padding: 20,
  },
  vsText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  teamScoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  teamColumn: {
    flex: 1,
    alignItems: "center",
    minWidth: 120,
  },
  teamTitle: {
    color: "#aaa",
    marginBottom: 10,
    textAlign: "center",
    fontSize: 14,
    paddingHorizontal: 5,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    minWidth: 100,
    width: "100%",
  },
  scoreButton: {
    paddingHorizontal: 5,
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    minWidth: 40,
    paddingHorizontal: 5,
    paddingVertical: 5,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  button: {
    fontSize: 24,
    marginHorizontal: 10,
    color: "#16A34A",
  },
  saveButton: {
    backgroundColor: "#16A34A",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default styles;
