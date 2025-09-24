import { Redirect } from "expo-router";
import { authClient } from "../src/lib/auth-client";
import { View, Text } from "react-native";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function Index() {
  const { data: session, isPending } = authClient.useSession();

  // Only check onboarding if user is authenticated
  const hasCompletedOnboarding = useQuery(
    api.pulses.hasCompletedOnboarding,
    session ? {} : "skip" // Skip query if no session
  );

  // Show loading while checking auth or onboarding status
  if (isPending || (session && hasCompletedOnboarding === undefined)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Not authenticated - go to sign in
  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  // Authenticated but no onboarding completed - go to onboarding
  if (hasCompletedOnboarding === false) {
    return <Redirect href="/(app)/onboarding" />;
  }

  // Authenticated and onboarding completed - go to main app
  return <Redirect href="/(app)/(tabs)" />;
}
