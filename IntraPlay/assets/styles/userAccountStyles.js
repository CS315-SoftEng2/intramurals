import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1B26",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#CDD6F4",
  },
  subtitle: {
    fontSize: 14,
    color: "#A6ADC8",
    marginTop: 4,
  },
  searchBarContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#24273A",
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#313244",
    marginRight: 8,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: "#CDD6F4",
    marginLeft: 8,
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortButton: {
    padding: 8,
    backgroundColor: "#313244",
    borderRadius: 8,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#89B4FA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#1E1E2E",
    marginLeft: 4,
    fontWeight: "600",
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  card: {
    backgroundColor: "#24273A",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#313244",
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#313244",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#89B4FA",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E1E2E",
  },
  userTextInfo: {
    marginLeft: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#CDD6F4",
  },
  userId: {
    color: "#A6ADC8",
    fontSize: 12,
    marginTop: 2,
  },
  tagContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  adminTag: {
    backgroundColor: "#F5C2E7",
  },
  userTag: {
    backgroundColor: "#89B4FA",
  },
  tag: {
    color: "#1E1E2E",
    fontSize: 12,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    padding: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#313244",
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: "rgba(243, 139, 168, 0.1)",
  },
  actionText: {
    color: "#89B4FA",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  deleteText: {
    color: "#F38BA8",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  errorText: {
    color: "#F38BA8",
    fontSize: 16,
    textAlign: "center",
    marginHorizontal: 20,
    marginTop: 16,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    color: "#A6ADC8",
    fontSize: 16,
    marginTop: 12,
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
  radioContainer: {
    flexDirection: "row",
  },
  radioButton: {
    borderWidth: 1,
    borderColor: "#45475A",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  radioSelected: {
    backgroundColor: "#89B4FA",
    borderColor: "#89B4FA",
  },
  radioText: {
    color: "#CDD6F4",
    fontSize: 14,
  },
  radioTextSelected: {
    color: "#1E1E2E",
    fontWeight: "600",
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
});

export default styles;
