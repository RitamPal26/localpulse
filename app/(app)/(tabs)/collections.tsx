import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { MOCK_FEED_DATA } from "../../../src/constants/mockData";
import { getPulseById } from "../../../src/constants/pulses";

const SavedItemCard = ({ item, onRemove }) => {
  // item is now a full object, not just an ID
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
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemove(item.id)}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );
};

const CollectionSection = ({
  collection,
  onRemoveItem,
  onDeleteCollection,
}) => {
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
            {collection.itemCount} items {/* FIXED: Use itemCount */}
          </Text>
        </View>
        <Text style={styles.expandIcon}>{expanded ? "▼" : "▶"}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.collectionItems}>
          {(collection.resolvedItems || []).map(
            (item, index /* FIXED: Use resolvedItems */) => (
              <SavedItemCard
                key={`${collection._id}-${item.id}-${index}`}
                item={item}
                onRemove={(itemId) => onRemoveItem(collection._id, itemId)}
              />
            )
          )}
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

  console.log("Collections with items:", collections);

  const handleRemoveItem = async (collectionId, itemId) => {
    Alert.alert("Remove Item", "Are you sure you want to remove this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await removeFromCollection({ collectionId, itemId });
            console.log("Item removed successfully");
          } catch (error) {
            console.error("Error removing item:", error);
            Alert.alert("Error", "Failed to remove item");
          }
        },
      },
    ]);
  };

  const handleDeleteCollection = (collectionId) => {
    // TODO: Implement collection deletion if needed
    Alert.alert("Info", "Collection deletion coming soon!");
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
              onDeleteCollection={handleDeleteCollection}
            />
          ))}
        </ScrollView>
      )}
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    borderLeftWidth: 4,
  },
  itemHeader: {
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
    fontSize: 14,
    marginRight: 6,
  },
  pulseName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#007AFF",
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ff4444",
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
    lineHeight: 20,
  },
  itemDescription: {
    fontSize: 13,
    color: "#333",
    lineHeight: 18,
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  location: {
    fontSize: 11,
    color: "#666",
  },
  timeAgo: {
    fontSize: 11,
    color: "#999",
  },
  emptyText: {
    padding: 16,
    textAlign: "center",
    color: "#999",
    fontStyle: "italic",
  },
});
