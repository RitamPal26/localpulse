// app/index.tsx - Simple landing page, no navigation
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <View className="bg-blue-50 p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <Text className="text-4xl font-bold text-center text-blue-600 mb-4">
          📍 LocalPulse
        </Text>
        <Text className="text-gray-700 text-center mb-8">
          Your local community connection
        </Text>
        
        <TouchableOpacity 
          className="bg-blue-500 py-4 rounded-xl mb-3 shadow-md"
          onPress={() => router.push('/(tabs)')}
        >
          <Text className="text-white text-lg font-semibold text-center">
            Enter App
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="border border-blue-500 py-4 rounded-xl"
          onPress={() => router.push('/(auth)/login')}
        >
          <Text className="text-blue-500 text-lg font-semibold text-center">
            Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
