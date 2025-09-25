import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
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

      {/* Additional restaurant info */}
      {item.cuisine && (
        <View style={styles.additionalInfo}>
          <Text style={styles.cuisine}>🍽️ {item.cuisine}</Text>
          {item.rating && (
            <Text style={styles.rating}>⭐ {item.rating.toFixed(1)}</Text>
          )}
          {item.priceRange && (
            <Text style={styles.priceRange}>{item.priceRange}</Text>
          )}
        </View>
      )}

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
  const [refreshing, setRefreshing] = useState(false);

  const saveToCollection = useMutation(api.collections.saveToCollection);
  const populateContent = useAction(api.dataIngestion.populateFeedContent);

  // Use real data from your database
  const feedData = useQuery(api.pulses.getFeedContent);
  const contentStats = useQuery(api.pulses.getContentStats);

  const rawFeedData = useQuery(api.pulses.getRawFeedContent);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await populateContent({});
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSave = async (item) => {
    try {
      console.log("Saving item with ID:", item.id); // Debug log

      await saveToCollection({
        itemId: item.id, // This should be the _id from the database
        collectionName: "Saved Items",
      });
      console.log("Saved:", item.title);
      // TODO: Add success feedback
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  const handleShare = (item) => {
    setItemToShare(item);
    setShareModalVisible(true);
  };

  // Use the real feed data
  const displayFeed = feedData || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with stats */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LocalPulse</Text>
        {contentStats && (
          <Text style={styles.statsText}>
            📊 {contentStats.total} discoveries available
          </Text>
        )}
      </View>

      {/* Feed */}
      <FlatList
        data={displayFeed}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FeedCard item={item} onSave={handleSave} onShare={handleShare} />
        )}
        contentContainerStyle={styles.feedContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {feedData === undefined
                ? "Loading discoveries..."
                : "No content available. Pull to refresh!"}
            </Text>
          </View>
        )}
      />

      {/* Share Modal */}
      <ShareModal
        visible={shareModalVisible}
        item={itemToShare}
        onClose={() => {
          setShareModalVisible(false);
          setItemToShare(null);
        }}
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
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  statsText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  feedContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    marginRight: 8,
  },
  pulseName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  timeAgo: {
    fontSize: 12,
    color: "#999",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  location: {
    fontSize: 12,
    color: "#888",
  },
  source: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
  additionalInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  cuisine: {
    fontSize: 12,
    color: "#666",
    marginRight: 12,
  },
  rating: {
    fontSize: 12,
    color: "#666",
    marginRight: 12,
  },
  priceRange: {
    fontSize: 12,
    color: "#666",
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#007AFF",
    borderRadius: 6,
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
