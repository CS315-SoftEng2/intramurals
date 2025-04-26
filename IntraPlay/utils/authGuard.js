import { useEffect } from "react";
import { router } from "expo-router";
import storage from "./storage";

export default function useAuthGuard(requiredRole) {
  useEffect(() => {
    const checkAuth = async () => {
      const token = await storage.getItem("user_token");
      const userType = await storage.getItem("user_type");
      const userData = await storage.getItem("user_data");

      if (!token || !userType || !userData) {
        router.replace("/login");
        return;
      }

      if (requiredRole && userType !== requiredRole) {
        router.replace("/unauthorized");
        return;
      }
    };

    checkAuth();
  }, []);
}
