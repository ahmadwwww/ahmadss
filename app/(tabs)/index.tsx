import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { CreditCard, Clock, CircleCheck as CheckCircle, Circle as XCircle, Bell } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useLoanStatus } from '@/hooks/useLoanStatus';

export default function HomeScreen() {
  const { user } = useAuth();
  const { loanData, loading, refetch } = useLoanStatus();

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        refetch();
      }
    }, [user, refetch])
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={24} color="#10B981" />;
      case 'rejected':
        return <XCircle size={24} color="#EF4444" />;
      case 'under_review':
        return <Clock size={24} color="#F59E0B" />;
      default:
        return <CreditCard size={24} color="#6B7280" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'under_review':
        return 'Under Review';
      default:
        return 'Not Applied';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      case 'under_review':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.welcomeContainer}>
          <CreditCard size={80} color="#3B82F6" />
          <Text style={styles.welcomeTitle}>Welcome to LoanApp</Text>
          <Text style={styles.welcomeSubtitle}>
            Get instant loans with quick approval
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/auth')}>
            <Text style={styles.loginButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user.displayName || 'User'}</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            {getStatusIcon(loanData?.status)}
            <Text style={styles.statusTitle}>Loan Status</Text>
          </View>
          <Text style={[styles.statusText, { color: getStatusColor(loanData?.status) }]}>
            {getStatusText(loanData?.status)}
          </Text>
          
          {loanData?.status === 'approved' && (
            <View style={styles.loanDetails}>
              {!loanData.loanAmount && (
                <TouchableOpacity
                  style={styles.selectAmountButton}
                  onPress={() => router.push('/loan-amount')}>
                  <Text style={styles.selectAmountButtonText}>
                    Select Loan Amount
                  </Text>
                </TouchableOpacity>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Loan Amount:</Text>
                <Text style={styles.detailValue}>
                  {loanData.loanAmount ? `Rs. ${loanData.loanAmount.toLocaleString()}` : 'Not selected'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Interest Rate:</Text>
                <Text style={styles.detailValue}>{loanData.interestRate}%</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Repayment Date:</Text>
                <Text style={styles.detailValue}>
                  {loanData.repaymentDate?.toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}
        </View>

        {!loanData && (
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => router.push('/(tabs)/application')}>
            <CreditCard size={24} color="#FFFFFF" />
            <Text style={styles.applyButtonText}>Apply for Loan</Text>
          </TouchableOpacity>
        )}

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Why Choose LoanApp?</Text>
          
          <View style={styles.featureCard}>
            <CheckCircle size={20} color="#10B981" />
            <Text style={styles.featureText}>Quick approval in minutes</Text>
          </View>
          
          <View style={styles.featureCard}>
            <CheckCircle size={20} color="#10B981" />
            <Text style={styles.featureText}>Competitive interest rates</Text>
          </View>
          
          <View style={styles.featureCard}>
            <CheckCircle size={20} color="#10B981" />
            <Text style={styles.featureText}>Secure and encrypted</Text>
          </View>
          
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => router.push('/admin')}>
            <Text style={styles.adminButtonText}>Admin Panel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 20,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 40,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  notificationButton: {
    padding: 8,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 15,
  },
  loanDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  applyButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  selectAmountButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  selectAmountButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  adminButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
  },
  adminButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});