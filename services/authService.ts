import { auth } from '@/config/firebase';
import { 
  PhoneAuthProvider, 
  signInWithCredential,
  ApplicationVerifier
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Re-export mock auth service for now
export { 
  sendOtpWithPhoneNumber, 
  confirmOTP, 
  formatPakistaniNumber 
} from './mockAuthService';

export const sendOtpWithPhoneNumber = async (phoneNumber: string, appVerifier: ApplicationVerifier): Promise<string> => {
  // Check if Firebase is properly configured
  if (!process.env.EXPO_PUBLIC_FIREBASE_API_KEY || process.env.EXPO_PUBLIC_FIREBASE_API_KEY === 'your_firebase_api_key_here') {
    throw new Error('Firebase is not configured. Please update your .env file with actual Firebase configuration values.');
  }

  // Validate Pakistani phone number format
  const pakistaniPhoneRegex = /^\+92[0-9]{10}$/;
  
  if (!pakistaniPhoneRegex.test(phoneNumber)) {
    throw new Error('Please enter a valid Pakistani phone number (+92XXXXXXXXXX)');
  }

  try {
    // Send OTP using Firebase
    const { signInWithPhoneNumber } = await import('firebase/auth');
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    
    // Store verification ID
    await AsyncStorage.setItem('verificationId', confirmationResult.verificationId);
    
    console.log(`OTP sent to ${phoneNumber}`);
    return confirmationResult.verificationId;
    
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/invalid-phone-number') {
      throw new Error('Invalid phone number format');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many requests. Please try again later');
    } else if (error.code === 'auth/quota-exceeded') {
      throw new Error('SMS quota exceeded. Please try again tomorrow');
    } else {
      throw new Error('Failed to send OTP. Please check your number and try again');
    }
  }
};

export const confirmOTP = async (verificationId: string, otp: string) => {
  try {
    // Create credential with verification ID and OTP
    const credential = PhoneAuthProvider.credential(verificationId, otp);
    
    // Sign in with the credential
    const userCredential = await signInWithCredential(auth, credential);
    const user = userCredential.user;
    
    const userData = {
      uid: user.uid,
      phoneNumber: user.phoneNumber,
      displayName: user.displayName || 'Pakistani User',
      email: user.email,
    };
    
    // Store user data
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    
    return userData;
    
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/invalid-verification-code') {
      throw new Error('Invalid OTP. Please check and try again');
    } else if (error.code === 'auth/code-expired') {
      throw new Error('OTP has expired. Please request a new one');
    } else {
      throw new Error('Failed to verify OTP. Please try again');
    }
  }
};

export const signOut = async () => {
  try {
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('verificationId');
  } catch (error) {
    console.error('Error signing out:', error);
    throw new Error('Failed to sign out');
  }
};