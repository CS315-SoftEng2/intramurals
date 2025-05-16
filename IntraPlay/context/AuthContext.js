// React and library imports
import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

// Utility imports
import storage from "../utils/storage";

// Create authentication context
const AuthContext = createContext();

// AuthProvider component for managing authentication state
export const AuthProvider = ({ children }) => {
  // State for user data
  const [user, setUser] = useState(null);

  // Check token validity on mount
  useEffect(() => {
    let logoutTimer;

    // Function to verify token and user data
    const checkToken = async () => {
      // Retrieve token, user type, and user data from storage
      const token = await storage.getItem("user_token");
      const userType = await storage.getItem("user_type");
      const userData = await storage.getItem("user_data");

      // Clear user if data is missing
      if (!token || !userType || !userData) {
        setUser(null);
        return;
      }

      try {
        // Decode token and check expiration
        const decoded = jwtDecode(token);
        const exp = decoded.exp * 1000;
        const now = Date.now();
        const timeLeft = exp - now;

        // Log out if token is expired
        if (timeLeft <= 0) {
          Toast.show({
            type: "error",
            text1: "Session Expired",
            text2: "Please log in again.",
          });
          logout();
        } else {
          // Set user data
          setUser({ token, userType, userData: JSON.parse(userData) });

          // Set timer for automatic logout
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

    // Execute token check
    checkToken();

    // Clean up timer on unmount
    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
    };
  }, []);

  // Function to handle user login
  const login = async (token, userType, userData) => {
    // Store token, user type, and user data
    await storage.setItem("user_token", token);
    await storage.setItem("user_type", userType);
    await storage.setItem("user_data", JSON.stringify(userData));
    // Update user state
    setUser({ token, userType, userData });

    // Redirect based on user type
    if (userType === "admin") {
      router.replace("/(admin)/dashboard");
    } else if (userType === "user") {
      router.replace("/(user)/dashboard");
    } else {
      router.replace("/(tabs)");
    }
  };

  // Function to handle user logout
  const logout = async () => {
    // Remove token, user type, and user data from storage
    await storage.deleteItem("user_token");
    await storage.deleteItem("user_type");
    await storage.deleteItem("user_data");
    // Clear user state
    setUser(null);
    // Redirect to login screen
    router.replace("/login");
  };

  // Context value with user data and functions
  const value = { user, login, logout };

  // Provide context to child components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to access authentication context
export const useAuth = () => useContext(AuthContext);
