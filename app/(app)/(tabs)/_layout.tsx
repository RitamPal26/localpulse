import { Tabs } from "expo-router";
import { View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#666",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#eee",
          height: 85,
          paddingBottom: 20,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: () => (
            <View
              style={{
                width: 20,
                height: 20,
                backgroundColor: "#007AFF",
                borderRadius: 10,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="collections"
        options={{
          title: "Collections",
          tabBarIcon: () => (
            <View
              style={{
                width: 20,
                height: 20,
                backgroundColor: "#666",
                borderRadius: 10,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: () => (
            <View
              style={{
                width: 20,
                height: 20,
                backgroundColor: "#666",
                borderRadius: 10,
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
