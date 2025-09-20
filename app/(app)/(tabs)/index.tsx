import { View, Text, Button } from 'react-native';
import { authClient } from "../../../src/lib/auth-client";

export default function HomePage() {
    const { data: session } = authClient.useSession();

    const handleSignOut = async () => {
        await authClient.signOut();
    };

    return (
        <View>
            <Text>Welcome, {session?.user?.email}!</Text>
            <Button title="Sign Out" onPress={handleSignOut} />
        </View>
    );
}
