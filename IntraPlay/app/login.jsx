import React, { useState, useEffect } from "react";
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
import globalstyles from "../assets/styles/globalstyles";
import styles from "../assets/styles/loginStyles";
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

      await login(token, user.user_type, user);

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
