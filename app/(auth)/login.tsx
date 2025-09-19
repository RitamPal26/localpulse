// app/(auth)/login.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSignIn, useSignUp } from '../../src/lib/auth-client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const signIn = useSignIn();
  const signUp = useSignUp();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      if (isSignUp) {
        await signUp({ email, password, name: email.split('@')[0] });
        Alert.alert('Success', 'Account created!');
      } else {
        await signIn({ email, password });
      }
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isSignUp ? 'Sign Up' : 'Sign In'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      <Button
        title={isSignUp ? 'Sign Up' : 'Sign In'}
        onPress={handleAuth}
      />

      <Button
        title={isSignUp ? 'Switch to Sign In' : 'Switch to Sign Up'}
        onPress={() => setIsSignUp(!isSignUp)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
  },
});
