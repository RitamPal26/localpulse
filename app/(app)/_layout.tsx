import { Redirect, Stack } from "expo-router";
import { Text, View } from "react-native";
import { authClient } from "../../src/lib/auth-client";
import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function AppLayout() {
  const { data: session, isPending } = authClient.useSession();

  // Store user in DB when authenticated
  const storeUser = useMutation(api.users.store);

  // Store user when session exists
  useEffect(() => {
    if (session) {
      storeUser();
    }
  }, [session, storeUser]);

  if (isPending) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  // Just render the stack - no onboarding logic here
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
