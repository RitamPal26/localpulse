import { Stack } from 'expo-router';
import { ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react"; 
import { authClient } from "../src/lib/auth-client"; 

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL as string);

export const unstable_settings = {
  initialRouteName: 'index', // Start with index
};

export default function RootLayout() {
  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
    </ConvexBetterAuthProvider>
  );
}
