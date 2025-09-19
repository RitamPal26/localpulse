// app/(tabs)/community.tsx
import { View, Text } from 'react-native';

export default function CommunityPage() {
  return (
    <View className="flex-1 justify-center items-center bg-slate-50">
      <Text className="text-2xl font-bold">👥 Community</Text>
      <Text className="text-gray-600 mt-2">Connect with neighbors</Text>
    </View>
  );
}
