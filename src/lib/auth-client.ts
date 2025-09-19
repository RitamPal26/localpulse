import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

const SESSION_KEY = 'localpulse_session';

// Custom hook for session management
export const useSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from storage on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const stored = await AsyncStorage.getItem(SESSION_KEY);
        setSessionId(stored);
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  // Get user data from Convex
  const user = useQuery(api.auth.getCurrentUser, sessionId ? { sessionId } : "skip");

  return {
    user,
    isLoading: isLoading || user === undefined,
    isAuthenticated: !!user,
    sessionId
  };
};

// Hook for signing up
export const useSignUp = () => {
  const signUpMutation = useMutation(api.auth.signUp);
  
  return async (data: { email: string; password: string; name: string }) => {
    const result = await signUpMutation(data);
    if (result.success && result.sessionId) {
      await AsyncStorage.setItem(SESSION_KEY, result.sessionId);
    }
    return result;
  };
};

// Hook for signing in
export const useSignIn = () => {
  const signInMutation = useMutation(api.auth.signIn);
  
  return async (data: { email: string; password: string }) => {
    const result = await signInMutation(data);
    if (result.success && result.sessionId) {
      await AsyncStorage.setItem(SESSION_KEY, result.sessionId);
    }
    return result;
  };
};

// Hook for signing out
export const useSignOut = () => {
  const signOutMutation = useMutation(api.auth.signOut);
  
  return async () => {
    const sessionId = await AsyncStorage.getItem(SESSION_KEY);
    if (sessionId) {
      await signOutMutation({ sessionId });
      await AsyncStorage.removeItem(SESSION_KEY);
    }
  };
};
