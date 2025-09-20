// Your protected layout file, e.g., app/(app)/_layout.tsx

import { Redirect, Stack } from "expo-router";
import { Text, View } from "react-native";
import { authClient } from "../../src/lib/auth-client";
import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api"; // Adjust path if needed

export default function AppLayout() {
  const { data: session, isPending } = authClient.useSession();

  // 1. Get the mutation function from Convex
  const storeUser = useMutation(api.users.store);

  // 2. Add the effect to call the mutation when the user has a session
  useEffect(() => {
    // If a session exists, it means the user is authenticated.
    // We then call storeUser() to create their DB record if it doesn't exist.
    if (session) {
      storeUser();
    }
  }, [session, storeUser]); // This effect runs when the session object changes

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

  // 3. If authenticated, render the rest of your app
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
