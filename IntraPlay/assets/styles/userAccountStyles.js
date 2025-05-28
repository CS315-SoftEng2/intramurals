import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E2E",
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
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#aaa",
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
    backgroundColor: "#2A2A3C",
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#aaa",
    marginRight: 8,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    marginLeft: 8,
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortButton: {
    padding: 8,
    backgroundColor: "#D1FADF",
    borderWidth: 1,
    borderColor: "#aaa",
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
    backgroundColor: "#16A34A",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#aaa",
  },
  addButtonText: {
    color: "#FFFFFF",
    marginLeft: 4,
    fontWeight: "600",
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  card: {
    backgroundColor: "#2A2A3C",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#aaa",
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 13,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#aaa",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#BFDBFE",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E3A8A",
  },
  userTextInfo: {
    marginLeft: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  tagContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  adminTag: {
    backgroundColor: "#BBF7D0",
  },
  userTag: {
    backgroundColor: "#BFDBFE",
  },
  tag: {
    color: "#065F46",
    fontSize: 12,
    fontWeight: "600",
  },
  userTagText: {
    color: "#1E3A8A",
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
    backgroundColor: "rgba(137, 180, 250, 0.1)",
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: "rgba(243, 139, 168, 0.1)",
  },
  actionText: {
    color: "#1E88E5",
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
    color: "#fff",
    fontSize: 16,
    marginTop: 12,
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
    backgroundColor: "#444",
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
    marginTop: 8,
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
  },
  radioContainer: {
    flexDirection: "row",
  },
  radioButton: {
    borderWidth: 1,
    borderColor: "#aaa",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#BFDBFE",
  },
  radioSelected: {
    backgroundColor: "#BFDBFE",
    borderColor: "#aaa",
  },
  radioText: {
    color: "#1E3A8A",
    fontSize: 14,
  },
  radioTextSelected: {
    color: "#1E3A8A",
    fontWeight: "600",
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
});

export default styles;
