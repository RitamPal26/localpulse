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

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/", // Changed from "/dashboard" to "/" so it goes through your index.tsx logic
      });
    } catch (error: any) {
      Alert.alert("Error", error.message || "Google sign in failed");
      setLoading(false);
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (session) {
      router.replace("/");
    }
  }, [session]);

  // Show loading while checking session
  if (isPending) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await authClient.signIn.email({
        email,
        password,
      });
      // No need to manually redirect - useEffect will handle it when session updates
    } catch (error: any) {
      Alert.alert("Error", error.message || "Login failed");
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await authClient.signUp.email({
        email,
        password,
        name: email.split("@")[0], // Use email prefix as name
      });
      // No need to manually redirect - useEffect will handle it when session updates
    } catch (error: any) {
      Alert.alert("Error", error.message || "Sign up failed");
      setLoading(false);
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
        Welcome Back To ChennaiPulse
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
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
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
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
        title={loading ? "Signing In..." : "Sign In"}
        onPress={handleLogin}
        disabled={loading}
      />

      {/* Optional: Link to dedicated sign-up page */}
      <TouchableOpacity
        onPress={() => router.push("/sign-up")}
        style={{ marginTop: 20, alignItems: "center" }}
        disabled={loading}
      >
        <Text style={{ color: "blue", opacity: loading ? 0.5 : 1 }}>
          Go to Sign Up Page
        </Text>
      </TouchableOpacity>
    </View>
  );
}
