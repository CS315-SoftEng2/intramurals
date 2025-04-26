import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Font from "expo-font";
import { useMutation } from "@apollo/client";
import { useRouter } from "expo-router";
import globalstyles from "../assets/styles/globalstyles";
import { Link } from "expo-router";
import LOGIN_USER from "../mutations/loginMutation";
import { useAuth } from "../context/AuthContext";
import Toast from "react-native-toast-message";
import LoadingIndicator from "./components/LoadingIndicator";

const Login = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [loginError, setLoginError] = useState("");
  const router = useRouter();

  const [loginMutation, { loading }] = useMutation(LOGIN_USER, {
    onCompleted: async (data) => {
      const { type, message, token, user } = data.userLogin;

      if (type == "error") {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: message,
        });
        return;
      }

      Toast.show({
        type: "success",
        text1: "Login Successful",
        text2: `Welcome back! Logged in as ${user.user_name}`,
      });

      await login(token, user.user_type, user); // Pass the full user object

      if (user.user_type === "admin") {
        router.replace("/(admin)/dashboard");
      } else if (user.user_type === "user") {
        router.replace("/(user)/dashboard");
      } else {
        router.replace("/(tabs)");
      }
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Something went wrong",
        text2: error.message,
      });
    },
  });

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
          "Rubik-Light": require("../assets/fonts/Rubik-Light.ttf"),
          "Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"),
        });
        setFontsLoaded(true);
      } catch (e) {
        console.error("Error loading fonts:", e);
        setFontsLoaded(false);
      }
    }
    loadFonts();
  }, []);

  const handleLogin = async () => {
    setLoginError("");
    if (!username.trim() || !password.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing fields",
        text2: "Please enter both username and password",
      });
      return;
    }

    try {
      await loginMutation({
        variables: {
          userName: username.trim(),
          password: password.trim(),
        },
      });
    } catch (e) {
      console.error("Mutation execution error:", e);

      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: e.message.includes("token expired")
          ? "Your session has expired. Please log in again."
          : "An error occurred. Please try again",
      });
    }
  };

  if (!fontsLoaded) {
    return <LoadingIndicator visible={true} message="Loading..." />;
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <LinearGradient
        colors={["rgba(30, 58, 138, 0.1)", "rgba(34, 197, 94, 0.9)"]}
        start={{ x: 0.8, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <Link href="/(tabs)" asChild>
          <TouchableOpacity style={globalstyles.backButtonContainer}>
            <MaterialIcons name="arrow-back" size={25} color="#fff" />
          </TouchableOpacity>
        </Link>

        <View style={styles.backImage1}>
          <Image
            source={require("../assets/images/sparkle.png")}
            style={styles.sparkleImage1}
          />
        </View>
        <View style={styles.backImage2}>
          <Image
            source={require("../assets/images/sparkle.png")}
            style={styles.sparkleImage2}
          />
        </View>

        <View style={styles.logoDiv}>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logo}
          />
        </View>

        <View style={styles.loginMessageContainer}>
          <Text style={styles.loginLabel}>Login!</Text>
          <Text style={styles.loginMessage}>
            Game Time! Sign in to track your teams and stats
          </Text>
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.inputField}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            placeholderTextColor="#fff"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordField}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#fff"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialIcons
                name={showPassword ? "visibility" : "visibility-off"}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          {loginError ? (
            <Text style={styles.errorText}>{loginError}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.loginButton, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#1E3A8A" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.backImage3}>
          <Image
            source={require("../assets/images/sparkle.png")}
            style={styles.sparkleImage3}
          />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Login;

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
