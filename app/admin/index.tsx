import { useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminIndex() {
  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    const isLoggedIn = await AsyncStorage.getItem('adminLoggedIn');
    if (isLoggedIn) {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/admin/login');
    }
  };

  return null;
}