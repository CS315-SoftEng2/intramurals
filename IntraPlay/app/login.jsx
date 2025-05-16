// React and library imports
import { useState, useEffect } from "react";
import {
  TouchableOpacity,
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
import Toast from "react-native-toast-message";

// Context and helper imports
import { useAuth } from "../context/AuthContext";

// Component imports
import LoadingIndicator from "./components/LoadingIndicator";

// Style imports
import globalstyles from "../assets/styles/globalstyles";
import styles from "../assets/styles/loginStyles";

// Mutation imports
import LOGIN_USER from "../mutations/loginMutation";

// Link imports
import { Link } from "expo-router";

// Login component for user authentication
const Login = () => {
  // Authentication context
  const { login } = useAuth();

  // State for form inputs and UI
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Router for navigation
  const router = useRouter();

  // Mutation for login request
  const [loginMutation, { loading }] = useMutation(LOGIN_USER, {
    // Handle successful login
    onCompleted: async (data) => {
      const { type, message, token, user } = data.userLogin;

      // Show error if login fails
      if (type === "error") {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: message,
        });
        return;
      }

      // Show success message
      Toast.show({
        type: "success",
        text1: "Login Successful",
        text2: `Welcome back! Logged in as ${user.user_name}`,
      });

      // Store token and user data
      await login(token, user.user_type, user);

      // Redirect based on user type
      if (user.user_type === "admin") {
        router.replace("/(admin)/dashboard");
      } else if (user.user_type === "user") {
        router.replace("/(user)/dashboard");
      } else {
        router.replace("/(tabs)");
      }
    },
    // Handle login errors
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Something went wrong",
        text2: error.message,
      });
    },
  });

  // Load custom fonts
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
        setFontsLoaded(false);
      }
    }
    loadFonts();
  }, []);

  // Handle login button press
  const handleLogin = async () => {
    setLoginError("");
    // Validate inputs
    if (!username.trim() || !password.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing fields",
        text2: "Please enter both username and password",
      });
      return;
    }

    try {
      // Execute login mutation
      await loginMutation({
        variables: {
          userName: username.trim(),
          password: password.trim(),
        },
      });
    } catch (e) {
      // Show specific error for expired token
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: e.message.includes("token expired")
          ? "Your session has expired. Please log in again."
          : "An error occurred. Please try again",
      });
    }
  };

  // Show loading indicator until fonts are loaded
  if (!fontsLoaded) {
    return <LoadingIndicator visible={true} message="Loading..." />;
  }

  return (
    // Main container with safe area
    <SafeAreaView style={styles.safeContainer}>
      {/*Gradient background*/}
      <LinearGradient
        colors={["rgba(30, 58, 138, 0.1)", "rgba(34, 197, 94, 0.9)"]}
        start={{ x: 0.8, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/*Back button to tabs*/}
        <Link href="/(tabs)" asChild>
          <TouchableOpacity style={globalstyles.backButtonContainer}>
            <MaterialIcons name="arrow-back" size={25} color="#fff" />
          </TouchableOpacity>
        </Link>
        {/*Background images*/}
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
        {/*Logo display*/}
        <View style={styles.logoDiv}>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logo}
          />
        </View>
        {/*Login message*/}
        <View style={styles.loginMessageContainer}>
          <Text style={styles.loginLabel}>Login!</Text>
          <Text style={styles.loginMessage}>
            Game Time! Sign in to track your teams and stats
          </Text>
        </View>
        {/*Login form*/}
        <View style={styles.loginContainer}>
          {/*Username input*/}
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.inputField}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            placeholderTextColor="#fff"
            autoCapitalize="none"
          />
          {/*Password input*/}
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
            {/*Toggle password visibility*/}
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
          {/*Error message display*/}
          {loginError ? (
            <Text style={styles.errorText}>{loginError}</Text>
          ) : null}
          {/*Login button*/}
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
        {/*Additional background image*/}
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
