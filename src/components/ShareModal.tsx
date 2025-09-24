import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAction } from 'convex/react';
import { api } from "../../convex/_generated/api";

export const ShareModal = ({ visible, item, onClose }) => {
  const [friendEmail, setFriendEmail] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const sendItemShare = useAction(api.emails.sendItemShare);

  const handleSend = async () => {
    if (!friendEmail.trim()) {
      Alert.alert("Error", "Please enter your friend's email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(friendEmail.trim())) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsSending(true);
    try {
      await sendItemShare({
        itemId: item.id,
        friendEmail: friendEmail.trim(),
        personalMessage: personalMessage.trim() || undefined,
        itemTitle: item.title,
        itemDescription: item.description,
        itemLocation: item.location,
        itemSource: item.source,
        pulseIcon: item.pulseIcon,
        pulseName: item.pulseName || "LocalPulse",
      });

      Alert.alert(
        "Success!",
        `Your recommendation has been sent to ${friendEmail}!`
      );
      setFriendEmail("");
      setPersonalMessage("");
      onClose();
    } catch (error) {
      console.error("Error sharing item:", error);
      Alert.alert("Error", "Failed to send email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setFriendEmail("");
    setPersonalMessage("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Share with a Friend</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Preview */}
            {item && (
              <View style={styles.preview}>
                <Text style={styles.previewTitle}>{item.title}</Text>
                <Text style={styles.previewLocation}>📍 {item.location}</Text>
              </View>
            )}

            {/* Form */}
            <View style={styles.form}>
              <Text style={styles.label}>Friend&apos;s Email</Text>
              <TextInput
                style={styles.input}
                value={friendEmail}
                onChangeText={setFriendEmail}
                placeholder="friend@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.label}>Personal Message (Optional)</Text>
              <TextInput
                style={[styles.input, styles.messageInput]}
                value={personalMessage}
                onChangeText={setPersonalMessage}
                placeholder="You might love this place!"
                multiline={true}
                numberOfLines={3}
              />
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                disabled={isSending}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  isSending && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={isSending}
              >
                {isSending ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.sendText}>Send Email</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontSize: 18,
    color: "#666",
  },
  preview: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  previewLocation: {
    fontSize: 12,
    color: "#666",
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "white",
  },
  messageInput: {
    height: 80,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  sendButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  sendText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
