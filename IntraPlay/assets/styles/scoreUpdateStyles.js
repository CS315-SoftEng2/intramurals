import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  contentContainer: {
    top: 25,
    padding: 25,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
    textAlign: "left",
  },
  scoreCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
  },
  vsText: {
    fontSize: 18,
    color: "#111827",
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
    color: "#111827",
    marginBottom: 5,
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
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
