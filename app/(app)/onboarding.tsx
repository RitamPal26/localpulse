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
import { SafeAreaView } from "react-native-safe-area-context";

// A list of cities you support. You can expand this list later.
const CITIES = [
  { id: "chennai", name: "Chennai" },
  { id: "mumbai", name: "Mumbai" },
  { id: "bangalore", name: "Bangalore" },
  { id: "delhi", name: "Delhi" },
];

export default function OnboardingScreen() {
  // NEW: State to manage the onboarding step ('city' or 'pulses')
  const [step, setStep] = useState("city");
  // NEW: State to store the user's chosen city
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const [selectedPulses, setSelectedPulses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Convex mutations
  const saveCity = useMutation(api.pulses.saveUserCity);
  const savePulsePreferences = useMutation(api.pulses.savePulsePreferences);

  const togglePulse = (pulseId: string) => {
    setSelectedPulses((prev) =>
      prev.includes(pulseId)
        ? prev.filter((id) => id !== pulseId)
        : [...prev, pulseId]
    );
  };

  // UPDATED: handleComplete now saves both city and pulses
  const handleComplete = async () => {
    if (!selectedCity) {
      Alert.alert("Select City", "Please select your city to continue.");
      return;
    }
    if (selectedPulses.length === 0) {
      Alert.alert("Select Interests", "Please select at least one pulse.");
      return;
    }

    setIsLoading(true);
    try {
      // Save both the city and the pulse preferences
      await saveCity({ city: selectedCity });
      await savePulsePreferences({ selectedPulses });

      setShowConfirmation(true);

      setTimeout(() => {
        router.replace("/");
      }, 2000);
    } catch (error) {
      console.error("Error saving preferences:", error);
      Alert.alert("Error", "Failed to save preferences. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- UI Rendering ---

  // Confirmation screen (no changes needed here)
  if (showConfirmation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.confirmationContainer}>
          <Text style={styles.confirmationIcon}>🎉</Text>
          <Text style={styles.confirmationTitle}>All Set!</Text>
          <Text style={styles.confirmationSubtitle}>
            Your LocalPulse feed for {selectedCity} is being personalized...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // NEW: Step 1 - City Selection UI
  if (step === "city") {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to LocalPulse! 📍</Text>
            <Text style={styles.subtitle}>
              First, let&apos;s find your city.
            </Text>
          </View>
          <View style={styles.pulsesContainer}>
            {CITIES.map((city) => (
              <TouchableOpacity
                key={city.id}
                style={[
                  styles.pulseCard,
                  selectedCity === city.name && styles.pulseCardSelected,
                ]}
                onPress={() => setSelectedCity(city.name)}
              >
                <Text style={styles.pulseName}>{city.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.completeButton,
              !selectedCity && styles.completeButtonDisabled,
            ]}
            onPress={() => setStep("pulses")}
            disabled={!selectedCity}
          >
            <Text style={styles.completeButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // MODIFIED: Step 2 - Pulse Selection UI
  if (step === "pulses") {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>What&apos;s your pulse? ✨</Text>
            <Text style={styles.subtitle}>
              Choose what you&apos;d like to discover in {selectedCity}. You can
              always change these later.
            </Text>
          </View>

          <View style={styles.pulsesContainer}>
            {AVAILABLE_PULSES.map((pulse) => {
              const isSelected = selectedPulses.includes(pulse.id);
              return (
                <TouchableOpacity
                  key={pulse.id}
                  style={[
                    styles.pulseCard,
                    { backgroundColor: pulse.color + "20" },
                    isSelected && styles.pulseCardSelected,
                  ]}
                  onPress={() => togglePulse(pulse.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.pulseCardHeader}>
                    <Text style={styles.pulseIcon}>{pulse.icon}</Text>
                    {/* ... selection indicator */}
                  </View>
                  <Text style={styles.pulseName}>{pulse.name}</Text>
                  <Text style={styles.pulseDescription}>
                    {pulse.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
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
                Start My LocalPulse Journey
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return null; // Fallback
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
