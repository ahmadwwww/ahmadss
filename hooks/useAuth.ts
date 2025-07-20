import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  uid: string;
  phoneNumber: string | null;
  displayName: string | null;
  email: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    isMountedRef.current = true;
    if (!initialized) {
      checkAuthState();
      setInitialized(true);
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [initialized]);

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData && isMountedRef.current) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const signIn = async (userData: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      if (isMountedRef.current) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('user');
      if (isMountedRef.current) {
        setUser(null);
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return { user, loading, signIn, signOut };
}