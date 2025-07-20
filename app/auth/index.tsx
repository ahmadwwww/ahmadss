import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Phone, MessageSquare } from 'lucide-react-native';
import { sendOtpWithPhoneNumber, confirmOTP, formatPakistaniNumber } from '@/services/mockAuthService';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const sendOTP = async () => {
    const formattedNumber = formatPakistaniNumber(phoneNumber);
    
    if (!formattedNumber || formattedNumber.length !== 13) {
      Alert.alert('Error', 'Please enter a valid Pakistani phone number\nFormat: +92XXXXXXXXXX or 03XXXXXXXXX');
      return;
    }

    setLoading(true);
    try {
      const id = await sendOtpWithPhoneNumber(formattedNumber);
      setVerificationId(id);
      setPhoneNumber(formattedNumber);
      setStep(2);
      setCountdown(60); // 60 seconds countdown
      Alert.alert('OTP Sent', `Mock OTP sent to ${formattedNumber}\n\nFor demo: Use code "123456"`);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      const userData = await confirmOTP(verificationId, otp);
      await signIn(userData);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', error.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      const id = await sendOtpWithPhoneNumber(phoneNumber);
      setVerificationId(id);
      setCountdown(60);
      Alert.alert('OTP Sent', 'New verification code sent to your phone');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🇵🇰 Pakistani Loan App (Demo)</Text>
        <Text style={styles.subtitle}>
          {step === 1 
            ? 'Enter your Pakistani mobile number (Demo Mode)'
            : `Enter OTP: Use "123456" for demo`
          }
        </Text>

        {step === 1 ? (
          <>
            <View style={styles.inputContainer}>
              <Phone size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="+92 300 1234567 or 0300 1234567"
                value={phoneNumber}
                onChangeText={(text) => {
                  // Auto-format as user types
                  const formatted = formatPakistaniNumber(text);
                  setPhoneNumber(formatted);
                }}
                keyboardType="phone-pad"
                maxLength={13}
              />
            </View>

            <Text style={styles.helperText}>
              Demo Mode: Use any Pakistani number format
            </Text>

            <TouchableOpacity
              style={[styles.button, loading && styles.disabledButton]}
              onPress={sendOTP}
              disabled={loading}>
              <Text style={styles.buttonText}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.inputContainer}>
              <MessageSquare size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                maxLength={6}
                autoFocus
              />
            </View>

            <Text style={styles.helperText}>
              Demo Mode: Enter "123456" or any 6-digit code
            </Text>

            <TouchableOpacity
              style={[styles.button, loading && styles.disabledButton]}
              onPress={verifyOTP}
              disabled={loading}>
              <Text style={styles.buttonText}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.resendButton, countdown > 0 && styles.disabledButton]}
              onPress={resendOTP}
              disabled={countdown > 0 || loading}>
              <Text style={[styles.resendText, countdown > 0 && styles.disabledText]}>
                {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setStep(1);
                setOtp('');
                setCountdown(0);
              }}>
              <Text style={styles.backText}>← Change Number</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  helperText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 10,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 15,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  resendText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  backText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
});