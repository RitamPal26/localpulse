import { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Button,
  Alert,
  Text,
  TouchableOpacity,
} from "react-native";
import { authClient } from "../src/lib/auth-client";
import { router } from "expo-router";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false); // ← Add this missing state
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session) {
      router.replace("/(app)/(tabs)");
    }
  }, [session]);

  const handleSignUp = async () => {
    // Add validation
    if (!email || !password || !name) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    console.log("Starting sign-up...");
    console.log("Email:", email);
    console.log("Password length:", password.length);
    console.log("Name:", name);

    setLoading(true); // ← Set loading state
    try {
      console.log("Calling authClient.signUp.email...");
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });
      console.log("Sign-up result:", result);

      // Optional: Show success message
      Alert.alert("Success", "Account created successfully!");
    } catch (error: any) {
      console.error("Sign-up error:", error);
      Alert.alert("Error", error.message || "Sign up failed");
    } finally {
      setLoading(false); // ← Reset loading state
    }
  };

  return (
    <View style={{ padding: 20, flex: 1, justifyContent: "center" }}>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: 30,
        }}
      >
        Create Account
      </Text>

      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        editable={!loading} // ← Disable during loading
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 10,
          borderRadius: 5,
          backgroundColor: loading ? "#f5f5f5" : "white",
        }}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading} // ← Disable during loading
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 10,
          borderRadius: 5,
          backgroundColor: loading ? "#f5f5f5" : "white",
        }}
      />
      <TextInput
        placeholder="Password (min 6 characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading} // ← Disable during loading
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 20,
          borderRadius: 5,
          backgroundColor: loading ? "#f5f5f5" : "white",
        }}
      />
      <Button
        title={loading ? "Creating Account..." : "Sign Up"}
        onPress={handleSignUp}
        disabled={loading}
      />

      <TouchableOpacity
        onPress={() => router.push("/sign-in")}
        style={{ marginTop: 20, alignItems: "center" }}
        disabled={loading} // ← Disable during loading
      >
        <Text style={{ color: loading ? "#999" : "blue" }}>
          Already have an account? Sign In
        </Text>
      </TouchableOpacity>
    </View>
  );
}
