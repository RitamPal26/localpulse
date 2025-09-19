// app/(tabs)/explore.tsx
import { View, Text } from 'react-native';

export default function ExplorePage() {
  return (
    <View className="flex-1 justify-center items-center bg-slate-50">
      <Text className="text-2xl font-bold">🗺️ Explore</Text>
      <Text className="text-gray-600 mt-2">Discover your neighborhood</Text>
    </View>
  );
}
