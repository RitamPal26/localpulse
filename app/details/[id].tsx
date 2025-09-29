// app/details/[id].tsx

import React from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// This is a new component for the dynamic, themed header.
// It creates the colorful banner at the top of the page.
const ThemedHeader = ({ icon, color }) => (
  <View style={[styles.themedHeader, { backgroundColor: color || "#6c757d" }]}>
    <Text style={styles.themedHeaderIcon}>{icon || "📍"}</Text>
  </View>
);

const DetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const item = useQuery(api.pulses.getPulseContentById, {
    id: id as Id<"pulseContent">,
  });

  // Loading state
  if (item === undefined) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Not found state
  if (item === null) {
    return (
      <View style={styles.centered}>
        <Text>Item not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 1. BACK NAVIGATION & THEMED HEADER */}
      {/* This component from Expo Router automatically adds a header with a back button. */}
      {/* We are styling it to match the pulse color for a cohesive look. */}
      <Stack.Screen
        options={{
          title: "", // We leave this empty to show the large title below
          headerStyle: { backgroundColor: item.pulseColor },
          headerTintColor: "#fff", // Color of the back arrow and title
          headerShadowVisible: false, // Removes the line under the header
        }}
      />

      {/* 2. THEMED DESIGN */}
      {/* This uses the new component to show a big, friendly icon. */}
      <ThemedHeader icon={item.pulseIcon} color={item.pulseColor} />

      {/* 3. PROPER PADDING & LAYOUT */}
      {/* This container adds padding around the main content. */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.source}>
          via {item.source} • {item.timeAgo}
        </Text>

        {/* Pills for meta info (Price, Rating, etc.) */}
        <View style={styles.pillsContainer}>
          {item.priceRange && (
            <Text style={styles.pill}>💰 {item.priceRange}</Text>
          )}
          {item.rating && (
            <Text style={styles.pill}>⭐ {item.rating.toFixed(1)}</Text>
          )}
          {item.cuisine && <Text style={styles.pill}>🍽️ {item.cuisine}</Text>}
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this Discovery</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.infoContent}>{item.location}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

// NEW: Refreshed styles for a more professional look
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa", // A light grey background
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  themedHeader: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  themedHeaderIcon: {
    fontSize: 64,
    color: "rgba(255, 255, 255, 0.8)",
  },
  contentContainer: {
    padding: 20,
    borderTopLeftRadius: 20, // Creates a nice curve
    borderTopRightRadius: 20,
    backgroundColor: "#f8f9fa",
    marginTop: -20, // Pulls the content area up to overlap with the header curve
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 4,
  },
  source: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 16,
  },
  pillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  pill: {
    backgroundColor: "#e9ecef",
    color: "#495057",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "500",
    overflow: "hidden", // Ensures text stays within rounded corners
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#343a40",
  },
  infoContent: {
    fontSize: 16,
    color: "#343a40",
  },
});

export default DetailScreen;
