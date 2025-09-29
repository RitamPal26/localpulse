import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AVAILABLE_PULSES } from "../../src/constants/pulses";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  const [selectedPulses, setSelectedPulses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const savePulsePreferences = useMutation(api.pulses.savePulsePreferences);

  // Toggle pulse selection
  const togglePulse = (pulseId: string) => {
    setSelectedPulses((prev) =>
      prev.includes(pulseId)
        ? prev.filter((id) => id !== pulseId)
        : [...prev, pulseId]
    );
  };

  // Handle completion
  const handleComplete = async () => {
    if (selectedPulses.length === 0) {
      Alert.alert(
        "Select Interests",
        "Please select at least one pulse to continue."
      );
      return;
    }

    setIsLoading(true);
    try {
      await savePulsePreferences({ selectedPulses });
      setShowConfirmation(true);

      // Navigate to main app after short delay
      setTimeout(() => {
        router.replace("/"); // Go back to index.tsx to re-evaluate
      }, 2000);
    } catch (error) {
      console.error("Error saving preferences:", error);
      Alert.alert("Error", "Failed to save preferences. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Confirmation screen
  if (showConfirmation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.confirmationContainer}>
          <Text style={styles.confirmationIcon}>🎉</Text>
          <Text style={styles.confirmationTitle}>All Set!</Text>
          <Text style={styles.confirmationSubtitle}>
            Your ChennaiPulse feed is being personalized...
          </Text>
          <View style={styles.selectedPulsesPreview}>
            {selectedPulses.map((pulseId) => {
              const pulse = AVAILABLE_PULSES.find((p) => p.id === pulseId);
              return (
                <View key={pulseId} style={styles.miniPulseCard}>
                  <Text style={styles.miniPulseIcon}>{pulse?.icon}</Text>
                  <Text style={styles.miniPulseName}>{pulse?.name}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Main onboarding screen
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to ChennaiPulse! 👋</Text>
          <Text style={styles.subtitle}>
            Choose what you&apos;d like to discover in Chennai. You can always
            change these later.
          </Text>
        </View>

        {/* Pulse Selection */}
        <View style={styles.pulsesContainer}>
          {AVAILABLE_PULSES.map((pulse) => {
            const isSelected = selectedPulses.includes(pulse.id);
            return (
              <TouchableOpacity
                key={pulse.id}
                style={[
                  styles.pulseCard,
                  { backgroundColor: pulse.color + "20" }, // Add transparency
                  isSelected && styles.pulseCardSelected,
                ]}
                onPress={() => togglePulse(pulse.id)}
                activeOpacity={0.7}
              >
                {/* Selection indicator */}
                <View style={styles.pulseCardHeader}>
                  <Text style={styles.pulseIcon}>{pulse.icon}</Text>
                  <View
                    style={[
                      styles.selectionIndicator,
                      isSelected && styles.selectionIndicatorActive,
                    ]}
                  >
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </View>

                {/* Content */}
                <Text style={styles.pulseName}>{pulse.name}</Text>
                <Text style={styles.pulseDescription}>{pulse.description}</Text>
                <Text style={styles.pulsePreview}>
                  &quot;{pulse.preview}&quot;
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected count */}
        <View style={styles.selectionSummary}>
          <Text style={styles.selectionText}>
            {selectedPulses.length} pulse
            {selectedPulses.length !== 1 ? "s" : ""} selected
          </Text>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.completeButton,
            selectedPulses.length === 0 && styles.completeButtonDisabled,
          ]}
          onPress={handleComplete}
          disabled={isLoading || selectedPulses.length === 0}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.completeButtonText}>
              Start My ChennaiPulse Journey
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  pulsesContainer: {
    paddingHorizontal: 24,
  },
  pulseCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  pulseCardSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#007AFF10",
  },
  pulseCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  pulseIcon: {
    fontSize: 24,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  selectionIndicatorActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  checkmark: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  pulseName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  pulseDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  pulsePreview: {
    fontSize: 13,
    color: "#888",
    fontStyle: "italic",
  },
  selectionSummary: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: "center",
  },
  selectionText: {
    fontSize: 14,
    color: "#666",
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "white",
  },
  completeButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  completeButtonDisabled: {
    backgroundColor: "#ccc",
  },
  completeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmationContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  confirmationIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  confirmationSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  selectedPulsesPreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  miniPulseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  miniPulseIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  miniPulseName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
  },
});
