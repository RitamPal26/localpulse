import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { MOCK_FEED_DATA } from "../../../src/constants/mockData";
import { getPulseById } from "../../../src/constants/pulses";
import { ShareModal } from "../../../src/components/ShareModal";

const FeedCard = ({ item, onSave, onShare }) => {
  return (
    <View style={[styles.card, { borderLeftColor: item.pulseColor }]}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.pulseInfo}>
          <Text style={styles.pulseIcon}>{item.pulseIcon}</Text>
          <Text style={styles.pulseName}>
            {getPulseById(item.pulseId)?.name || item.pulseId}
          </Text>
        </View>
        <Text style={styles.timeAgo}>{item.timeAgo}</Text>
      </View>

      {/* Content */}
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>

      {/* Meta info */}
      <View style={styles.metaInfo}>
        <Text style={styles.location}>📍 {item.location}</Text>
        <Text style={styles.source}>via {item.source}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onSave(item)}
        >
          <Text style={styles.actionText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onShare(item)}
        >
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [itemToShare, setItemToShare] = useState(null);

  const saveToCollection = useMutation(api.collections.saveToCollection);

  const userPulses = useQuery(api.pulses.getUserPulsePreferences);

  // Filter mock data based on user's selected pulses
  const filteredFeed = MOCK_FEED_DATA.filter(
    (item) => userPulses?.selectedPulses?.includes(item.pulseId) || !userPulses
  );

  const handleSave = async (item) => {
    try {
      await saveToCollection({
        itemId: item.id,
        collectionName: "Saved Items",
      });
      // Show success feedback
      console.log("Saved:", item.title);
      // TODO: Add toast/alert for user feedback
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  const handleShare = (item) => {
    const itemWithPulseName = {
      ...item,
      pulseName: getPulseById(item.pulseId)?.name || item.pulseId,
    };
    setItemToShare(itemWithPulseName);
    setShareModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <FeedCard item={item} onSave={handleSave} onShare={handleShare} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LocalPulse</Text>
        <Text style={styles.headerSubtitle}>
          {userPulses?.selectedPulses?.length || 0} pulses active
        </Text>
      </View>

      <ShareModal
        visible={shareModalVisible}
        item={itemToShare}
        onClose={() => {
          setShareModalVisible(false);
          setItemToShare(null);
        }}
      />

      <FlatList
        data={filteredFeed}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.feed}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => {}} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  feed: {
    flex: 1,
  },
  card: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pulseInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  pulseIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  pulseName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#007AFF",
  },
  timeAgo: {
    fontSize: 12,
    color: "#999",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
    lineHeight: 22,
  },
  cardDescription: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  location: {
    fontSize: 12,
    color: "#666",
  },
  source: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
  },
});
