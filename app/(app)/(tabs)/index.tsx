import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ShareModal } from "../../../src/components/ShareModal";
import * as Haptics from "expo-haptics";
import { Link } from "expo-router";
import { getPulseById } from "../../../src/constants/pulses"; // Assuming this helper exists

// A list of cities you support.
const CITIES = [
  { id: "chennai", name: "Chennai" },
  { id: "mumbai", name: "Mumbai" },
  { id: "bangalore", name: "Bangalore" },
  { id: "delhi", name: "Delhi" },
];

// --- City Selection Modal Component ---
const CitySelectionModal = ({ visible, onClose, onSelectCity }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select a City</Text>
          {CITIES.map((city) => (
            <TouchableOpacity
              key={city.id}
              style={styles.cityOption}
              onPress={() => onSelectCity(city.name)}
            >
              <Text style={styles.cityOptionText}>{city.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// --- Feed Card Component ---
const FeedCard = ({ item, onSave, onShare }) => {
  return (
    <Link href={`/details/${item.id}`} asChild>
      <TouchableOpacity activeOpacity={0.8}>
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
          <Text style={styles.cardDescription} numberOfLines={3}>
            {item.description}
          </Text>

          {/* Meta info */}
          <View style={styles.metaInfo}>
            <Text style={styles.location}>📍 {item.location}</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation(); // Prevent navigation when tapping button
                onSave(item);
              }}
            >
              <Text style={styles.actionText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation(); // Prevent navigation when tapping button
                onShare(item);
              }}
            >
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

// --- Main Home Screen Component ---
export default function HomeScreen() {
  // State Management
  const [selectedCity, setSelectedCity] = useState<string>("Chennai");
  const [isCityModalVisible, setCityModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [itemToShare, setItemToShare] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [saveStatus, setSaveStatus] = useState({});

  // Convex Hooks
  const saveToCollection = useMutation(api.collections.saveToCollection);
  const me = useQuery(api.users.getMe);
  const saveUserCity = useMutation(api.pulses.saveUserCity);
  const populateContentForCity = useAction(
    api.dataIngestion.populateSingleCity
  );

  // Data Fetching & State Syncing
  useEffect(() => {
    if (me?.city) {
      setSelectedCity(me.city);
    }
  }, [me]);

  const feedData = useQuery(
    api.pulses.getFeedContent,
    selectedCity ? { city: selectedCity } : "skip"
  );

  // Action Handlers
  const onRefresh = async () => {
    if (!selectedCity) return;
    setRefreshing(true);
    try {
      await populateContentForCity({ city: selectedCity });
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    saveUserCity({ city });
    setCityModalVisible(false);
  };

  const handleSave = async (item: any) => {
    const itemId = item.id;
    setSaveStatus((prev) => ({ ...prev, [itemId]: "saving" }));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await saveToCollection({
        itemId: itemId,
        collectionName: "Saved Items", // Default collection name
      });

      setSaveStatus((prev) => ({ ...prev, [itemId]: "success" }));
      // Optionally show a toast or alert here
    } catch (error) {
      console.error("Error saving item:", error);
      setSaveStatus((prev) => ({ ...prev, [itemId]: "error" }));
    } finally {
      // Clear the status indicator after 2 seconds
      setTimeout(() => {
        setSaveStatus((prev) => {
          const newStatus = { ...prev };
          delete newStatus[itemId];
          return newStatus;
        });
      }, 2000);
    }
  };

  const handleShare = (item: any) => {
    setItemToShare(item);
    setShareModalVisible(true);
  };

  console.log("Current City:", selectedCity, "Feed Data:", feedData);

  // Main Render
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LocalPulse</Text>
        <TouchableOpacity
          style={styles.cityButton}
          onPress={() => setCityModalVisible(true)}
        >
          <Text style={styles.cityButtonText}>📍 {selectedCity}</Text>
        </TouchableOpacity>
      </View>

      {/* Feed */}
      <FlatList
        data={feedData ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FeedCard item={item} onSave={handleSave} onShare={handleShare} />
        )}
        contentContainerStyle={styles.feedContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007AFF"]}
            tintColor={"#007AFF"}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            {feedData === undefined ? (
              <ActivityIndicator size="large" color="#007AFF" />
            ) : (
              <Text style={styles.emptyText}>
                No content available for {selectedCity}. Pull down to refresh!
              </Text>
            )}
          </View>
        )}
      />

      {/* Modals */}
      <CitySelectionModal
        visible={isCityModalVisible}
        onClose={() => setCityModalVisible(false)}
        onSelectCity={handleSelectCity}
      />
      <ShareModal
        visible={shareModalVisible}
        item={itemToShare}
        onClose={() => setShareModalVisible(false)}
      />
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#212529" },
  cityButton: {
    backgroundColor: "#e9ecef",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  cityButtonText: { fontSize: 14, fontWeight: "600", color: "#495057" },
  feedContainer: { padding: 16, paddingBottom: 50 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  pulseInfo: { flexDirection: "row", alignItems: "center" },
  pulseIcon: { fontSize: 18, marginRight: 8 },
  pulseName: { fontSize: 14, fontWeight: "600", color: "#6c757d" },
  timeAgo: { fontSize: 12, color: "#adb5bd" },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#343a40",
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: "#495057",
    lineHeight: 20,
    marginBottom: 12,
  },
  metaInfo: { flexDirection: "row", marginBottom: 12 },
  location: { fontSize: 12, color: "#6c757d" },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f3f5",
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#007AFF1A",
    borderRadius: 20,
  },
  actionText: { color: "#007AFF", fontSize: 12, fontWeight: "bold" },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: { fontSize: 16, color: "#6c757d", textAlign: "center" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  cityOption: {
    width: "100%",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cityOptionText: { textAlign: "center", fontSize: 18, color: "#343a40" },
  closeButton: { marginTop: 20 },
  closeButtonText: { fontSize: 16, color: "#007AFF", fontWeight: "600" },
});
