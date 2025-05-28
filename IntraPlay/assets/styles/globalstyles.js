import { StyleSheet } from "react-native";

const globalstyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#1E1E2E",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 10,
  },
  loginButtonContainer: {
    justifyContent: "flex-start",
    alignItems: "flex-end",
    position: "absolute",
    right: 15,
    top: 15,
    zIndex: 10,
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
    color: "#fff",
    fontFamily: "Rubik-Regular",
  },
  inputField: {
    height: 40,
    borderColor: "#fff",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: "#fff",
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    width: "100%",
  },
  buttonText: {
    color: "#1E3A8A",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  nameContainer: {
    width: 100,
    height: 100,
    border: 1,
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    top: 50,
    left: 130,
  },
  text: {
    color: "#fff",
    textAlign: "left",
  },
  textLabel: {
    color: "#fff",
    fontSize: 50,
    fontWeight: "bold",
    top: 10,
    left: 130,
  },
  backButtonContainer: {
    position: "absolute",
    top: 20,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    padding: 3,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Rubik-Regular",
    padding: 5,
  },
});

export default globalstyles;
