import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  modal: {
    justifyContent: "center",
    margin: 0,
  },
  container: {
    backgroundColor: "#24273A",
    borderRadius: 12,
    width: width - 40,
    alignSelf: "center",
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    color: "#CDD6F4",
    fontSize: 18,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#313244",
    marginBottom: 16,
  },
  message: {
    color: "#A6ADC8",
    fontSize: 14,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cancelButton: {
    backgroundColor: "rgba(166, 173, 200, 0.1)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#A6ADC8",
    fontSize: 14,
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: "#F38BA8",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: "#1E1E2E",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default styles;
