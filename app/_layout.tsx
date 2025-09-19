// app/_layout.tsx
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";
import { useKeepAwake } from 'expo-keep-awake';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

export default function RootLayout() {
  useKeepAwake();
  
  return (
    <SafeAreaProvider>
      <ConvexProvider client={convex}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </ConvexProvider>
    </SafeAreaProvider>
  );
}
