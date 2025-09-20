import { Redirect, Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { authClient } from "../../src/lib/auth-client";

export default function AppLayout() {
    const { data: session, isPending } = authClient.useSession();

    if (isPending) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading...</Text>
            </View>
        );
    }

    if (!session) {
        return <Redirect href="/sign-in" />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
        </Stack>
    );
}
