// React and library imports
import { useEffect } from "react";
import { router } from "expo-router";

// Utility imports
import storage from "../utils/storage";

// Index component for authentication check and redirection
export default function Index() {
  useEffect(() => {
    // Function to verify user token and user type
    const checkAuth = async () => {
      try {
        // Retrieve token and user type from storage
        const token = await storage.getItem("user_token");
        const userType = await storage.getItem("user_type");

        // Redirect based on authentication and user type
        if (!token || !userType) {
          router.replace("/(tabs)");
        } else if (userType === "user") {
          router.replace("/(user)/dashboard");
        } else if (userType === "admin") {
          router.replace("/(admin)/dashboard");
        } else {
          router.replace("/(tabs)");
        }
      } catch (e) {
        // Redirect to tabs on error
        router.replace("/(tabs)");
      }
    };

    // Execute authentication check
    checkAuth();
  }, []);
}
