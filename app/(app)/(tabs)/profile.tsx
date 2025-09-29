import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AVAILABLE_PULSES } from "../../../src/constants/pulses";
import { authClient } from "../../../src/lib/auth-client";

const PulseSettingsCard = ({ pulse, isSelected, onToggle }) => {
  return (
    <TouchableOpacity
      style={[
        styles.pulseSettingCard,
        { backgroundColor: pulse.color + "15" },
        isSelected && styles.pulseSettingCardSelected,
      ]}
      onPress={() => onToggle(pulse.id)}
      activeOpacity={0.7}
    >
      <View style={styles.pulseSettingHeader}>
        <Text style={styles.pulseSettingIcon}>{pulse.icon}</Text>
        <View
          style={[
            styles.settingCheckbox,
            isSelected && styles.settingCheckboxActive,
          ]}
        >
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </View>

      <Text style={styles.pulseSettingName}>{pulse.name}</Text>
      <Text style={styles.pulseSettingDescription}>{pulse.description}</Text>
    </TouchableOpacity>
  );
};

const StatCard = ({ label, value, icon }) => (
  <View style={styles.statCard}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function ProfileScreen() {
  const { data: session } = authClient.useSession();
  const userPulses = useQuery(api.pulses.getUserPulsePreferences);
  const collections = useQuery(api.collections.getUserCollections);
  const savePulsePreferences = useMutation(api.pulses.savePulsePreferences);

  const [isEditing, setIsEditing] = useState(false);
  const [editingPulses, setEditingPulses] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize editing state
  React.useEffect(() => {
    if (userPulses?.selectedPulses && !isEditing) {
      setEditingPulses(userPulses.selectedPulses);
    }
  }, [userPulses, isEditing]);

  const handleEditPulses = () => {
    setIsEditing(true);
    setEditingPulses(userPulses?.selectedPulses || []);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingPulses(userPulses?.selectedPulses || []);
  };

  const handleSavePulses = async () => {
    if (editingPulses.length === 0) {
      Alert.alert(
        "Select Interests",
        "Please select at least one pulse to continue."
      );
      return;
    }

    setIsSaving(true);
    try {
      await savePulsePreferences({ selectedPulses: editingPulses });
      setIsEditing(false);
      Alert.alert("Success", "Your pulse preferences have been updated!");
    } catch (error) {
      console.error("Error saving preferences:", error);
      Alert.alert("Error", "Failed to update preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const togglePulse = (pulseId: string) => {
    setEditingPulses((prev) =>
      prev.includes(pulseId)
        ? prev.filter((id) => id !== pulseId)
        : [...prev, pulseId]
    );
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => authClient.signOut(),
      },
    ]);
  };

  // Calculate stats
  const totalSavedItems =
    collections?.reduce(
      (total, collection) => total + (collection.items?.length || 0),
      0
    ) || 0;
  const totalCollections = collections?.length || 0;
  const activePulses = userPulses?.selectedPulses?.length || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>
            {session?.email || "LocalPulse User"}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard label="Active Pulses" value={activePulses} icon="📡" />
          <StatCard label="Collections" value={totalCollections} icon="📚" />
          <StatCard label="Saved Items" value={totalSavedItems} icon="💾" />
        </View>

        {/* Pulse Preferences */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Pulses</Text>
            {!isEditing ? (
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEditPulses}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelEdit}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSavePulses}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.pulsesGrid}>
            {AVAILABLE_PULSES.map((pulse) => {
              const currentPulses = isEditing
                ? editingPulses
                : userPulses?.selectedPulses || [];
              const isSelected = currentPulses.includes(pulse.id);

              return (
                <PulseSettingsCard
                  key={pulse.id}
                  pulse={pulse}
                  isSelected={isSelected}
                  onToggle={isEditing ? togglePulse : () => {}}
                />
              );
            })}
          </View>

          {isEditing && (
            <Text style={styles.editingHint}>
              Tap pulses to add or remove them from your feed
            </Text>
          )}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Data & Privacy</Text>
            <Text style={styles.settingValue}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleSignOut}>
            <Text style={[styles.settingLabel, styles.signOutText]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>LocalPulse v1.0</Text>
          <Text style={styles.footerText}>Built for Chennai 🏙️</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
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
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  section: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#007AFF",
    borderRadius: 6,
  },
  editButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  editActions: {
    flexDirection: "row",
    gap: 8,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "500",
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#007AFF",
    borderRadius: 6,
    minWidth: 50,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  pulsesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  pulseSettingCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  pulseSettingCardSelected: {
    borderColor: "#007AFF",
  },
  pulseSettingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pulseSettingIcon: {
    fontSize: 20,
  },
  settingCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  settingCheckboxActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  checkmark: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  pulseSettingName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  pulseSettingDescription: {
    fontSize: 11,
    color: "#666",
    lineHeight: 14,
  },
  editingHint: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 12,
    fontStyle: "italic",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingLabel: {
    fontSize: 16,
    color: "#1a1a1a",
  },
  settingValue: {
    fontSize: 16,
    color: "#666",
  },
  signOutText: {
    color: "#ff4444",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
});
