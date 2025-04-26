import { useEffect } from "react";
import { router } from "expo-router";
import storage from "../utils/storage";

export default function Index() {
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await storage.getItem("user_token");
        const userType = await storage.getItem("user_type");

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
        console.error("Error checking auth:", e);
        router.replace("/(tabs)");
      }
    };

    checkAuth();
  }, []);
}
