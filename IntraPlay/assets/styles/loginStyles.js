import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E1E2E",
  },
  safeContainer: {
    flex: 1,
    backgroundColor: "#1E1E2E",
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 30,
    position: "relative",
  },
  logoDiv: {
    alignItems: "center",
    paddingTop: 25,
  },
  logo: {
    width: 100,
    height: 100,
  },
  loginContainer: {
    width: "100%",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginTop: 20,
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
  passwordContainer: {
    flexDirection: "row",
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
  },
  passwordField: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    color: "#fff",
  },
  eyeIcon: {
    padding: 8,
    justifyContent: "center",
  },
  loginMessageContainer: {
    alignItems: "center",
    padding: 20,
  },
  loginLabel: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 28,
    fontFamily: "Rubik-Medium",
  },
  loginMessage: {
    fontSize: 15,
    color: "#fff",
    fontFamily: "Rubik-Light",
  },
  loginButton: {
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
  errorText: {
    color: "#F87171",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 14,
  },
  backImage1: {
    position: "absolute",
    top: -15,
    left: -30,
    width: 130,
    height: 130,
    zIndex: 1,
    pointerEvents: "none",
  },
  sparkleImage1: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    pointerEvents: "none",
  },
  backImage2: {
    position: "absolute",
    top: -60,
    left: 130,
    width: 130,
    height: 130,
    zIndex: 0,
    pointerEvents: "none",
  },
  sparkleImage2: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    pointerEvents: "none",
  },
  backImage3: {
    position: "absolute",
    top: 350,
    left: -120,
    width: 130,
    height: 130,
    zIndex: 0,
    pointerEvents: "none",
  },
  sparkleImage3: {
    width: 350,
    height: 350,
    resizeMode: "contain",
    pointerEvents: "none",
  },
});

export default styles;
