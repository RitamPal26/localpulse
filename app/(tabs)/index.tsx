import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function HomePage() {
  const router = useRouter();

  const handleLogout = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView>
        {/* Header */}
        <View className="bg-white px-6 py-4 shadow-sm">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-2xl font-bold text-gray-800">
                LocalPulse 📍
              </Text>
              <Text className="text-gray-600 mt-1">
                Your neighborhood hub
              </Text>
            </View>
            <TouchableOpacity 
              className="bg-red-500 px-4 py-2 rounded-lg"
              onPress={handleLogout}
            >
              <Text className="text-white font-semibold">Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View className="p-6">
          <View className="bg-blue-100 p-4 rounded-xl mb-6">
            <Text className="text-blue-800 text-lg font-semibold mb-2">
              🎉 Welcome to your community!
            </Text>
            <Text className="text-blue-700">
              Discover local events, connect with neighbors, and explore your area.
            </Text>
          </View>

          {/* Quick Actions Grid */}
          <Text className="text-xl font-bold text-gray-800 mb-4">Quick Actions</Text>
          
          <View className="gap-4"> {/* ✅ Changed from space-y-4 */}
            {/* Row 1 */}
            <View className="flex-row gap-4"> {/* ✅ Changed from space-x-4 */}
              <TouchableOpacity className="flex-1 bg-white p-4 rounded-xl shadow-sm">
                <Text className="text-2xl mb-2">🗺️</Text>
                <Text className="font-semibold text-gray-800">Explore</Text>
                <Text className="text-xs text-gray-600">Find places</Text>
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-1 bg-white p-4 rounded-xl shadow-sm">
                <Text className="text-2xl mb-2">🏪</Text>
                <Text className="font-semibold text-gray-800">Business</Text>
                <Text className="text-xs text-gray-600">Local shops</Text>
              </TouchableOpacity>
            </View>
            
            {/* Row 2 */}
            <View className="flex-row gap-4"> {/* ✅ Changed from space-x-4 */}
              <TouchableOpacity className="flex-1 bg-white p-4 rounded-xl shadow-sm">
                <Text className="text-2xl mb-2">📢</Text>
                <Text className="font-semibold text-gray-800">Community</Text>
                <Text className="text-xs text-gray-600">Updates</Text>
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-1 bg-white p-4 rounded-xl shadow-sm">
                <Text className="text-2xl mb-2">🤝</Text>
                <Text className="font-semibold text-gray-800">Help</Text>
                <Text className="text-xs text-gray-600">Services</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats */}
          <View className="bg-blue-500 p-6 rounded-xl mt-6"> {/* ✅ Changed from gradient */}
            <Text className="text-white text-lg font-bold mb-4">Your Impact</Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">12</Text>
                <Text className="text-blue-100 text-xs">Events</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">5</Text>
                <Text className="text-blue-100 text-xs">Neighbors</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">3</Text>
                <Text className="text-blue-100 text-xs">Reviews</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
