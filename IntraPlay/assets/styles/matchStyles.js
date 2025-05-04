import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E2E",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  otherContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#CDD6F4",
    marginBottom: 10,
  },
  matchTable: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#2A2A3C",
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#3A3A50",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#3A3A50",
  },
  headerCell: {
    color: "#9090A0",
    fontWeight: "600",
    fontSize: 12,
  },
  cell: {
    color: "#fff",
    fontSize: 12,
  },
  smallCell: {
    width: 55,
  },
  mediumCell: {
    width: 85,
  },
  extraLargeCell: {
    width: 160,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "600",
  },
  tableAddButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addMatchButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(137, 180, 250, 0.1)",
    borderRadius: 8,
    padding: 5,
    marginBottom: 10,
  },
  addScheduleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(137, 180, 250, 0.1)",
    borderRadius: 8,
    padding: 5,
    marginBottom: 10,
  },
  addEventButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(137, 180, 250, 0.1)",
    borderRadius: 8,
    padding: 5,
    marginBottom: 10,
  },
  addCategoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(137, 180, 250, 0.1)",
    borderRadius: 8,
    padding: 5,
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: "rgba(166, 227, 161, 0.1)",
    borderRadius: 8,
    padding: 5,
  },
  deleteButton: {
    backgroundColor: "rgba(243, 139, 168, 0.1)",
    borderRadius: 8,
    padding: 5,
  },
  modal: {
    backgroundColor: "#24273A",
    borderRadius: 12,
    width: width - 40,
    alignSelf: "center",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    color: "#CDD6F4",
    fontSize: 18,
    fontWeight: "700",
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#313244",
    marginBottom: 16,
  },
  formGroup: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    color: "#CDD6F4",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#45475A",
    backgroundColor: "#1E1E2E",
    padding: 12,
    borderRadius: 8,
    color: "#CDD6F4",
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: "#89B4FA",
    paddingVertical: 14,
    marginTop: 8,
    alignItems: "center",
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  submitButtonText: {
    color: "#1E1E2E",
    fontWeight: "700",
    fontSize: 16,
  },
  actionCell: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  addButtonText: {
    color: "#89B4FA",
    fontSize: 12,
    marginLeft: 4,
  },
});

export default styles;
