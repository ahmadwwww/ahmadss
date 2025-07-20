import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CircleCheck as CheckCircle, Circle as XCircle, Clock, Eye, LogOut, Users, FileText, TrendingUp } from 'lucide-react-native';
import { getLoanApplications, updateLoanStatus } from '@/services/adminService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoanApplication {
  id: string;
  userId: string;
  fullName: string;
  nationalId: string;
  address: string;
  employmentType: string;
  monthlyIncome: number;
  status: 'under_review' | 'approved' | 'rejected';
  submittedAt: Date;
  cnicImageUrl?: string;
  selfieImageUrl?: string;
}

export default function AdminDashboard() {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    checkAdminAuth();
    loadApplications();
  }, []);

  const checkAdminAuth = async () => {
    const isLoggedIn = await AsyncStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      router.replace('/admin/login');
    }
  };

  const loadApplications = async () => {
    try {
      const apps = await getLoanApplications();
      setApplications(apps);
      
      // Calculate stats
      const stats = {
        total: apps.length,
        pending: apps.filter(app => app.status === 'under_review').length,
        approved: apps.filter(app => app.status === 'approved').length,
        rejected: apps.filter(app => app.status === 'rejected').length,
      };
      setStats(stats);
    } catch (error) {
      Alert.alert('Error', 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, status: 'approved' | 'rejected') => {
    try {
      await updateLoanStatus(applicationId, status);
      await loadApplications();
      setSelectedApp(null);
      Alert.alert('Success', `Application ${status} successfully`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('adminLoggedIn');
            router.replace('/admin/login');
          },
        },
      ]
    );
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={20} color="#10B981" />;
      case 'rejected':
        return <XCircle size={20} color="#EF4444" />;
      case 'under_review':
        return <Clock size={20} color="#F59E0B" />;
      default:
        return <Clock size={20} color="#6B7280" />;
    }
  };

  if (selectedApp) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedApp(null)}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Application Details</Text>
          </View>

          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>{selectedApp.fullName}</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>National ID:</Text>
              <Text style={styles.detailValue}>{selectedApp.nationalId}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Address:</Text>
              <Text style={styles.detailValue}>{selectedApp.address}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Employment:</Text>
              <Text style={styles.detailValue}>{selectedApp.employmentType}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Monthly Income:</Text>
              <Text style={styles.detailValue}>${(selectedApp.monthlyIncome || 0).toLocaleString()}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <View style={styles.statusContainer}>
                {getStatusIcon(selectedApp.status)}
                <Text style={[styles.statusText, { color: getStatusColor(selectedApp.status) }]}>
                  {selectedApp.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          {selectedApp.cnicImageUrl && (
            <View style={styles.imageCard}>
              <Text style={styles.imageTitle}>CNIC Image</Text>
              <Image source={{ uri: selectedApp.cnicImageUrl }} style={styles.documentImage} />
            </View>
          )}

          {selectedApp.selfieImageUrl && (
            <View style={styles.imageCard}>
              <Text style={styles.imageTitle}>Selfie</Text>
              <Image source={{ uri: selectedApp.selfieImageUrl }} style={styles.selfieImage} />
            </View>
          )}

          {selectedApp.status === 'under_review' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => handleStatusUpdate(selectedApp.id, 'approved')}>
                <CheckCircle size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Approve</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleStatusUpdate(selectedApp.id, 'rejected')}>
                <XCircle size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.dashboardHeader}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { borderLeftColor: '#3B82F6' }]}>
          <Users size={24} color="#3B82F6" />
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Applications</Text>
        </View>
        
        <View style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}>
          <Clock size={24} color="#F59E0B" />
          <Text style={styles.statNumber}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending Review</Text>
        </View>
        
        <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
          <CheckCircle size={24} color="#10B981" />
          <Text style={styles.statNumber}>{stats.approved}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        
        <View style={[styles.statCard, { borderLeftColor: '#EF4444' }]}>
          <XCircle size={24} color="#EF4444" />
          <Text style={styles.statNumber}>{stats.rejected}</Text>
          <Text style={styles.statLabel}>Rejected</Text>
        </View>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Text style={styles.loadingText}>Loading applications...</Text>
        ) : applications.length === 0 ? (
          <Text style={styles.emptyText}>No applications found</Text>
        ) : (
          applications.map((app) => (
            <TouchableOpacity
              key={app.id}
              style={styles.applicationCard}
              onPress={() => setSelectedApp(app)}>
              <View style={styles.cardHeader}>
                <Text style={styles.applicantName}>{app.fullName}</Text>
                <View style={styles.statusContainer}>
                  {getStatusIcon(app.status)}
                  <Text style={[styles.statusText, { color: getStatusColor(app.status) }]}>
                    {app.status.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.incomeText}>
                Income: ${(app.monthlyIncome || 0).toLocaleString()}
              </Text>
              
              <View style={styles.cardFooter}>
                <Text style={styles.dateText}>
                  {app.submittedAt.toLocaleDateString()}
                </Text>
                <View style={styles.viewButton}>
                  <Eye size={16} color="#3B82F6" />
                  <Text style={styles.viewText}>View Details</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  logoutButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  applicantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  incomeText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
    marginLeft: 5,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  imageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  imageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  documentImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  selfieImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: 'center',
    resizeMode: 'cover',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 50,
  },
});