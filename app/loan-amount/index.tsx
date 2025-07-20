import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { DollarSign, ArrowRight, Info } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { selectLoanAmount } from '@/services/loanService';

export default function LoanAmountScreen() {
  const { user } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState(10000);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const predefinedAmounts = [5000, 10000, 20000, 30000, 50000];

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (text: string) => {
    const amount = parseInt(text);
    if (!isNaN(amount)) {
      setSelectedAmount(amount);
    }
    setCustomAmount(text);
  };

  const calculateMonthlyPayment = (amount: number) => {
    const interestRate = 12.5 / 100 / 12; // Monthly interest rate
    const months = 12; // 1 year
    const monthlyPayment = (amount * interestRate * Math.pow(1 + interestRate, months)) / 
                          (Math.pow(1 + interestRate, months) - 1);
    return Math.round(monthlyPayment);
  };

  const handleConfirmAmount = async () => {
    if (selectedAmount < 1000 || selectedAmount > 50000) {
      Alert.alert('Invalid Amount', 'Please select an amount between Rs. 1,000 and Rs. 50,000');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }

    setLoading(true);
    try {
      await selectLoanAmount(user.uid, selectedAmount);
      Alert.alert(
        'Loan Confirmed!',
        `Your loan of Rs. ${selectedAmount.toLocaleString()} has been confirmed.\n\nMonthly Payment: Rs. ${calculateMonthlyPayment(selectedAmount).toLocaleString()}`,
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to confirm loan amount');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <DollarSign size={60} color="#10B981" />
          <Text style={styles.title}>Select Loan Amount</Text>
          <Text style={styles.subtitle}>
            Choose how much you want to borrow (Rs. 1,000 - Rs. 50,000)
          </Text>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.sectionTitle}>Quick Select</Text>
          <View style={styles.predefinedAmounts}>
            {predefinedAmounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.amountButton,
                  selectedAmount === amount && styles.selectedAmountButton
                ]}
                onPress={() => handleAmountSelect(amount)}>
                <Text style={[
                  styles.amountButtonText,
                  selectedAmount === amount && styles.selectedAmountButtonText
                ]}>
                  Rs. {amount.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Custom Amount</Text>
          <View style={styles.customAmountContainer}>
            <Text style={styles.currencySymbol}>Rs.</Text>
            <TextInput
              style={styles.customAmountInput}
              placeholder="Enter amount"
              value={customAmount}
              onChangeText={handleCustomAmountChange}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>

          <View style={styles.selectedAmountDisplay}>
            <Text style={styles.selectedAmountLabel}>Selected Amount:</Text>
            <Text style={styles.selectedAmountValue}>
              Rs. {selectedAmount.toLocaleString()}
            </Text>
          </View>

          <View style={styles.loanDetails}>
            <View style={styles.detailRow}>
              <Info size={16} color="#6B7280" />
              <Text style={styles.detailText}>
                Interest Rate: 12.5% per year
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Info size={16} color="#6B7280" />
              <Text style={styles.detailText}>
                Loan Term: 12 months
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Info size={16} color="#6B7280" />
              <Text style={styles.detailText}>
                Monthly Payment: Rs. {calculateMonthlyPayment(selectedAmount).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.confirmButton, loading && styles.disabledButton]}
          onPress={handleConfirmAmount}
          disabled={loading}>
          <Text style={styles.confirmButtonText}>
            {loading ? 'Confirming...' : 'Confirm Loan Amount'}
          </Text>
          <ArrowRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 24,
  },
  amountContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 15,
    marginTop: 20,
  },
  predefinedAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  amountButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
    width: '48%',
    alignItems: 'center',
  },
  selectedAmountButton: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  amountButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedAmountButtonText: {
    color: '#10B981',
  },
  customAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 10,
  },
  customAmountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    paddingVertical: 15,
  },
  selectedAmountDisplay: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedAmountLabel: {
    fontSize: 16,
    color: '#3730A3',
    marginBottom: 5,
  },
  selectedAmountValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  loanDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 10,
  },
  confirmButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 'auto',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
});