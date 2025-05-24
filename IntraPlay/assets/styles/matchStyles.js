import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
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
    color: "#1F2937",
    marginBottom: 10,
  },
  matchCard: {
    backgroundColor: "#FFFFFF",
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
    color: "#1F2937",
    marginBottom: 6,
  },
  cardLabel: {
    fontWeight: "600",
    color: "#374151",
  },
  matchTable: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerCell: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 12,
  },
  cell: {
    color: "#6B7280",
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
    backgroundColor: "#FFFFFF",
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
    color: "#1F2937",
    fontSize: 18,
    fontWeight: "700",
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginBottom: 16,
  },
  formGroup: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    color: "#111827",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    color: "111827",
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
    borderBottomColor: "#6B7280",
  },
  pickerItemText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },
  pickerText: {
    flex: 1,
    fontSize: 14,
  },
  selectedText: {
    color: "#111827",
  },
  placeholderText: {
    color: "grey",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerModal: {
    backgroundColor: "#F3F4F6",
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
    color: "#111827",
    fontWeight: "700",
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: "#2D3748",
    opacity: 0.6,
  },
});

export default styles;
