// Mock authentication service for development/testing
// This simulates Firebase auth without requiring actual Firebase setup

interface User {
  uid: string;
  phoneNumber: string | null;
  displayName: string | null;
  email: string | null;
}

// Mock verification storage
let mockVerificationId = '';
let mockPhoneNumber = '';

export const sendOtpWithPhoneNumber = async (phoneNumber: string): Promise<string> => {
  // Validate Pakistani phone number format
  const pakistaniPhoneRegex = /^\+92[0-9]{10}$/;
  
  if (!pakistaniPhoneRegex.test(phoneNumber)) {
    throw new Error('Please enter a valid Pakistani phone number (+92XXXXXXXXXX)');
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Generate mock verification ID
  mockVerificationId = 'mock_verification_' + Date.now();
  mockPhoneNumber = phoneNumber;
  
  console.log(`🔥 MOCK OTP: Use code "123456" for ${phoneNumber}`);
  
  return mockVerificationId;
};

export const confirmOTP = async (verificationId: string, otp: string): Promise<User> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Check verification ID
  if (verificationId !== mockVerificationId) {
    throw new Error('Invalid verification session. Please request a new OTP.');
  }

  // Accept any 6-digit code for demo, but suggest 123456
  if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
    throw new Error('Please enter a valid 6-digit OTP');
  }

  // For demo purposes, accept any 6-digit code
  // In real app, you'd verify against the actual OTP sent
  
  const userData: User = {
    uid: 'mock_user_' + Date.now(),
    phoneNumber: mockPhoneNumber,
    displayName: 'Demo User',
    email: null,
  };

  return userData;
};

export const signOut = async () => {
  // Clear mock data
  mockVerificationId = '';
  mockPhoneNumber = '';
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
};

// Helper function to format Pakistani phone number
export const formatPakistaniNumber = (input: string): string => {
  // Remove all non-digits
  const digits = input.replace(/\D/g, '');
  
  // If starts with 92, add +
  if (digits.startsWith('92')) {
    return '+' + digits;
  }
  
  // If starts with 0, replace with +92
  if (digits.startsWith('0')) {
    return '+92' + digits.substring(1);
  }
  
  // If just digits without country code, add +92
  if (digits.length === 10) {
    return '+92' + digits;
  }
  
  // If already has +92
  if (input.startsWith('+92')) {
    return input;
  }
  
  return '+92' + digits;
};