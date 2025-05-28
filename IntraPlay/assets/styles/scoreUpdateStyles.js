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
    marginBottom: 20,
  },
  teamColumn: {
    alignItems: "center",
    width: "45%",
  },
  teamTitle: {
    color: "#aaa",
    marginBottom: 5,
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginHorizontal: 15,
  },
  scoreButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
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
