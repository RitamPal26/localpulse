import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { authClient } from "../lib/auth-client";

export const useAutoLogout = (timeoutMinutes: number = 3) => {
  const backgroundTime = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const logout = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("Auto logout failed:", error);
    }
  };

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "background") {
        // Store when app went to background
        backgroundTime.current = Date.now();

        // Set timeout to logout after specified minutes
        timeoutRef.current = setTimeout(
          () => {
            logout();
          },
          timeoutMinutes * 60 * 1000
        );
      } else if (nextAppState === "active") {
        // App is back to foreground
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        // Check if app was in background too long
        if (backgroundTime.current) {
          const timePassed = Date.now() - backgroundTime.current;
          const timeoutMs = timeoutMinutes * 60 * 1000;

          if (timePassed >= timeoutMs) {
            logout();
            return;
          }
        }

        backgroundTime.current = null;
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [timeoutMinutes]);
};
