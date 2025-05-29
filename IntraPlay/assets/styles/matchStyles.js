import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E2E",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: "#1E1E2E",
  },
  otherContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: "#1E1E2E",
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10,
  },
  matchCard: {
    backgroundColor: "#2A2A3C",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 6,
  },
  cardLabel: {
    fontWeight: "800",
    color: "#fff",
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
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "rgba(243, 139, 168, 0.1)",
    borderRadius: 8,
    padding: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#2A2A3C",
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
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#aaa",
    marginBottom: 16,
  },
  formGroup: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    backgroundColor: "#2A2A3C",
    padding: 12,
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  submitButton: {
    backgroundColor: "#16A34A",
    paddingVertical: 14,
    marginTop: 8,
    alignItems: "center",
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  actionCell: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  addButtonText: {
    color: "#1E88E5",
    fontSize: 12,
    marginLeft: 4,
  },
  editButtonText: {
    color: "#22C55E",
    fontSize: 12,
    marginLeft: 4,
  },
  deleteButtonText: {
    color: "#F38BA8",
    fontSize: 12,
    marginLeft: 4,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#aaa",
  },
  pickerItemText: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: "500",
  },
  pickerText: {
    flex: 1,
    fontSize: 14,
  },
  selectedText: {
    color: "#fff",
  },
  placeholderText: {
    color: "#aaa",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerModal: {
    backgroundColor: "#2A2A3C",
    borderRadius: 12,
    width: width - 40,
    maxHeight: "60%",
  },
  pickerList: {
    maxHeight: 300,
  },
  pickerDoneButton: {
    backgroundColor: "#16A34A",
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  pickerDoneButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: "#fff",
    opacity: 0.6,
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    alignSelf: "center",
  },
  emptyTextContainer: {
    justifyContent: "flex-start",
    alignContent: "center",
  },
});

export default styles;
