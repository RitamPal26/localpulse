import { Redirect } from 'expo-router';
import { authClient } from "../src/lib/auth-client"; // Use your auth client
import { View, Text } from 'react-native';

export default function Index() {
  const { data: session, isPending } = authClient.useSession(); // Use authClient

  if (isPending) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Redirect based on auth state
  if (session) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Redirect href="/sign-in" />;
}
