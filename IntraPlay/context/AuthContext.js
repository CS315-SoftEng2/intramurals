import React, { createContext, useState, useEffect, useContext } from "react";
import storage from "../utils/storage";
import { jwtDecode } from "jwt-decode";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let logoutTimer;

    const checkToken = async () => {
      const token = await storage.getItem("user_token");
      const userType = await storage.getItem("user_type");
      const userData = await storage.getItem("user_data");

      if (!token || !userType || !userData) {
        setUser(null);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const exp = decoded.exp * 1000;
        const now = Date.now();
        const timeLeft = exp - now;

        if (timeLeft <= 0) {
          Toast.show({
            type: "error",
            text1: "Session Expired",
            text2: "Please log in again.",
          });
          logout();
        } else {
          setUser({ token, userType, userData: JSON.parse(userData) });

          logoutTimer = setTimeout(() => {
            Toast.show({
              type: "error",
              text1: "Session Expired",
              text2: "You have been logged out automatically.",
            });
            logout();
          }, timeLeft);
        }
      } catch (err) {
        console.error("Token decode error:", err);
        logout();
      }
    };

    checkToken();

    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
    };
  }, []);

  const login = async (token, userType, userData) => {
    await storage.setItem("user_token", token);
    await storage.setItem("user_type", userType);
    await storage.setItem("user_data", JSON.stringify(userData)); 
    setUser({ token, userType, userData });

    if (userType === "admin") {
      router.replace("/(admin)/dashboard");
    } else if (userType === "user") {
      router.replace("/(user)/dashboard");
    } else {
      router.replace("/(tabs)");
    }
  };

  const logout = async () => {
    await storage.deleteItem("user_token");
    await storage.deleteItem("user_type");
    await storage.deleteItem("user_data"); 
    setUser(null);
    router.replace("/login");
  };

  const value = { user, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
