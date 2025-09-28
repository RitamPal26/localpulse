import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
  ToastAndroid,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation } from "convex/react";
import * as Haptics from "expo-haptics"; // ← ADD THIS IMPORT
import { api } from "../../../convex/_generated/api";
import { MOCK_FEED_DATA } from "../../../src/constants/mockData";
import { getPulseById } from "../../../src/constants/pulses";

const SavedItemCard = ({ item, onRemove, removalStatus }) => {
  const statusKey = `${item.collectionId}-${item.id}`;
  const status = removalStatus[statusKey] || null;

  return (
    <View style={styles.itemCard}>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemLocation}>📍 {item.location}</Text>
        {item.cuisine && (
          <Text style={styles.itemCuisine}>🍽️ {item.cuisine}</Text>
        )}
        {item.rating && (
          <Text style={styles.itemRating}>⭐ {item.rating.toFixed(1)}</Text>
        )}
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Status indicators */}
        {status === "removing" && (
          <Text style={styles.statusText}>Removing...</Text>
        )}
        {status === "success" && (
          <Text style={styles.successText}>✓ Removed!</Text>
        )}
        {status === "error" && (
          <Text style={styles.errorText}>❌ Failed to remove</Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.removeButton,
          status === "removing" && styles.disabledButton,
        ]}
        onPress={() => onRemove(item.id)}
        disabled={status === "removing"}
      >
        <Text style={styles.removeButtonText}>
          {status === "removing" ? "..." : "×"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const CollectionSection = ({ collection, onRemoveItem, removalStatus }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <View style={styles.collectionContainer}>
      <TouchableOpacity
        style={styles.collectionHeader}
        onPress={() => setExpanded(!expanded)}
      >
        <View>
          <Text style={styles.collectionName}>{collection.name}</Text>
          <Text style={styles.collectionCount}>
            {collection.resolvedItems?.length || 0} items
          </Text>
        </View>
        <Text style={styles.expandIcon}>{expanded ? "▼" : "▶"}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.collectionItems}>
          {(collection.resolvedItems || []).map((item, index) => (
            <SavedItemCard
              key={`${collection._id}-${item.id}-${index}`}
              item={{ ...item, collectionId: collection._id }}
              onRemove={(itemId) => onRemoveItem(collection._id, itemId)}
              removalStatus={removalStatus}
            />
          ))}
          {(!collection.resolvedItems ||
            collection.resolvedItems.length === 0) && (
            <Text style={styles.emptyText}>No items saved yet</Text>
          )}
        </View>
      )}
    </View>
  );
};

export default function CollectionsScreen() {
  const removeFromCollection = useMutation(
    api.collections.removeFromCollection
  );
  const collections = useQuery(api.collections.getUserCollectionsWithItems);

  // State for tracking removal status
  const [removalStatus, setRemovalStatus] = useState({});

  console.log("Collections with items:", collections);

  const handleRemoveItem = async (collectionId, itemId) => {
    Alert.alert("Remove Item", "Are you sure you want to remove this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          const statusKey = `${collectionId}-${itemId}`;

          try {
            // Set removing status
            setRemovalStatus((prev) => ({ ...prev, [statusKey]: "removing" }));

            await removeFromCollection({ collectionId, itemId });
            console.log("Item removed successfully");

            // ✅ Success feedback with haptics
            setRemovalStatus((prev) => ({ ...prev, [statusKey]: "success" }));
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
            );

            // Clear status after 2 seconds
            setTimeout(() => {
              setRemovalStatus((prev) => {
                const updated = { ...prev };
                delete updated[statusKey];
                return updated;
              });
            }, 2000);
          } catch (error) {
            console.error("Error removing item:", error);

            // ❌ Error feedback with haptics
            setRemovalStatus((prev) => ({ ...prev, [statusKey]: "error" }));
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Error
            );

            Alert.alert("Error", "Failed to remove item");

            // Clear error status after 3 seconds
            setTimeout(() => {
              setRemovalStatus((prev) => {
                const updated = { ...prev };
                delete updated[statusKey];
                return updated;
              });
            }, 3000);
          }
        },
      },
    ]);
  };

  const handleDeleteCollection = (collectionId) => {
    Alert.alert("Info", "Collection deletion coming soon!", [
      {
        text: "OK",
        onPress: async () => {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning
          );
        },
      },
    ]);
  };

  if (collections === undefined) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading collections...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Collections</Text>
        <Text style={styles.headerSubtitle}>
          {collections.length} collection{collections.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {collections.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyTitle}>No Collections Yet</Text>
          <Text style={styles.emptyDescription}>
            Start saving interesting content from your feed to see it here!
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {collections.map((collection) => (
            <CollectionSection
              key={collection._id}
              collection={collection}
              onRemoveItem={handleRemoveItem}
              removalStatus={removalStatus}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// Add missing styles
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  collectionContainer: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  collectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  collectionName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  collectionCount: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  expandIcon: {
    fontSize: 16,
    color: "#666",
  },
  collectionItems: {
    backgroundColor: "white",
  },
  itemCard: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  itemLocation: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  itemCuisine: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  itemRating: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 13,
    color: "#333",
    lineHeight: 18,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ff4444",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  removeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyText: {
    padding: 16,
    textAlign: "center",
    color: "#999",
    fontStyle: "italic",
  },
  statusText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginTop: 4,
  },
  successText: {
    fontSize: 12,
    color: "#22C55E",
    fontWeight: "600",
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "600",
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
