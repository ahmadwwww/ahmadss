import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Upload, User, MapPin, DollarSign, Briefcase } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/hooks/useAuth';
import { submitLoanApplication, canUserApply } from '@/services/loanService';
import { useLoanStatus } from '@/hooks/useLoanStatus';

interface ApplicationData {
  fullName: string;
  nationalId: string;
  address: string;
  employmentType: string;
  monthlyIncome: string;
  cnicImage: string | null;
  selfieImage: string | null;
}

export default function ApplicationScreen() {
  const { user } = useAuth();
  const { loanData, refetch } = useLoanStatus();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [canApply, setCanApply] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(true);
  const [formData, setFormData] = useState<ApplicationData>({
    fullName: '',
    nationalId: '',
    address: '',
    employmentType: '',
    monthlyIncome: '',
    cnicImage: null,
    selfieImage: null,
  });

  useEffect(() => {
    checkApplicationEligibility();
  }, [user]);

  const checkApplicationEligibility = async () => {
    if (!user) {
      setCheckingEligibility(false);
      return;
    }

    try {
      const eligible = await canUserApply(user.uid);
      setCanApply(eligible);
    } catch (error) {
      console.error('Error checking eligibility:', error);
      setCanApply(false);
    } finally {
      setCheckingEligibility(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const pickImage = async (type: 'cnic' | 'selfie') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'cnic' ? [4, 3] : [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const field = type === 'cnic' ? 'cnicImage' : 'selfieImage';
      updateFormData(field, result.assets[0].uri);
    }
  };

  const takeSelfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required for face verification');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      updateFormData('selfieImage', result.assets[0].uri);
    }
  };

  const validateStep1 = () => {
    if (!formData.fullName || !formData.nationalId || !formData.address) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.employmentType || !formData.monthlyIncome) {
      Alert.alert('Error', 'Please fill in employment details');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.cnicImage) {
      Alert.alert('Error', 'Please upload your CNIC/ID image');
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    if (!formData.selfieImage) {
      Alert.alert('Error', 'Please take a selfie for face verification');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    let isValid = false;
    
    switch (step) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
    }

    if (isValid) {
      if (step < 4) {
        setStep(step + 1);
      } else if (step === 4) {
        submitApplication();
      }
    }
  };

  const submitApplication = async () => {
    if (!user) {
      Alert.alert('Error', 'User not found. Please login again.');
      return;
    }

    setLoading(true);
    try {
      await submitLoanApplication(user!.uid, formData);
      await refetch(); // Refresh loan status
      Alert.alert(
        'Application Submitted',
        'Your loan application has been submitted successfully and is now under review.',
        [{ 
          text: 'OK', 
          onPress: () => {
            // Reset form and refresh status
            setStep(1);
            setFormData({
              fullName: '',
              nationalId: '',
              address: '',
              employmentType: '',
              monthlyIncome: '',
              cnicImage: null,
              selfieImage: null,
            });
            checkApplicationEligibility();
          }
        }]
      );
    } catch (error) {
      Alert.alert('Error', (error as any).message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((stepNumber) => (
        <View
          key={stepNumber}
          style={[
            styles.stepDot,
            stepNumber <= step ? styles.stepDotActive : styles.stepDotInactive,
          ]}>
          <Text
            style={[
              styles.stepNumber,
              stepNumber <= step ? styles.stepNumberActive : styles.stepNumberInactive,
            ]}>
            {stepNumber}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      
      <View style={styles.inputContainer}>
        <User size={20} color="#6B7280" />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={formData.fullName}
          onChangeText={(text) => updateFormData('fullName', text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputIcon}>ID</Text>
        <TextInput
          style={styles.input}
          placeholder="CNIC / National ID"
          value={formData.nationalId}
          onChangeText={(text) => updateFormData('nationalId', text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <MapPin size={20} color="#6B7280" />
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={formData.address}
          onChangeText={(text) => updateFormData('address', text)}
          multiline
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Employment Details</Text>
      
      <View style={styles.inputContainer}>
        <Briefcase size={20} color="#6B7280" />
        <TextInput
          style={styles.input}
          placeholder="Employment Type (e.g., Full-time, Self-employed)"
          value={formData.employmentType}
          onChangeText={(text) => updateFormData('employmentType', text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <DollarSign size={20} color="#6B7280" />
        <TextInput
          style={styles.input}
          placeholder="Monthly Income"
          value={formData.monthlyIncome}
          onChangeText={(text) => updateFormData('monthlyIncome', text)}
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Document Upload</Text>
      <Text style={styles.stepSubtitle}>Upload a clear photo of your CNIC/ID</Text>
      
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => pickImage('cnic')}>
        <Upload size={24} color="#3B82F6" />
        <Text style={styles.uploadButtonText}>
          {formData.cnicImage ? 'Change CNIC Image' : 'Upload CNIC Image'}
        </Text>
      </TouchableOpacity>

      {formData.cnicImage && (
        <Image source={{ uri: formData.cnicImage }} style={styles.previewImage} />
      )}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Face Verification</Text>
      <Text style={styles.stepSubtitle}>Take a selfie for identity verification</Text>
      
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={takeSelfie}>
        <Camera size={24} color="#3B82F6" />
        <Text style={styles.uploadButtonText}>
          {formData.selfieImage ? 'Retake Selfie' : 'Take Selfie'}
        </Text>
      </TouchableOpacity>

      {formData.selfieImage && (
        <Image source={{ uri: formData.selfieImage }} style={styles.previewImage} />
      )}
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notLoggedIn}>
          <Text style={styles.notLoggedInText}>Please log in to apply for a loan</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (checkingEligibility) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notLoggedIn}>
          <Text style={styles.notLoggedInText}>Checking application eligibility...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!canApply && loanData) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Application Status</Text>
          
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Current Application</Text>
            <Text style={styles.applicantName}>{loanData.fullName}</Text>
            <Text style={styles.statusText}>
              Status: <Text style={[styles.statusValue, { 
                color: loanData.status === 'approved' ? '#10B981' : 
                       loanData.status === 'rejected' ? '#EF4444' : '#F59E0B' 
              }]}>
                {loanData.status?.replace('_', ' ').toUpperCase()}
              </Text>
            </Text>
            
            {loanData.status === 'under_review' && (
              <View style={styles.reviewMessage}>
                <Text style={styles.reviewText}>
                  Your application is currently under review. You cannot submit a new application until this one is processed.
                </Text>
                <Text style={styles.reviewSubtext}>
                  Submitted on: {loanData.submittedAt?.toLocaleDateString()}
                </Text>
              </View>
            )}
            
            {loanData.status === 'approved' && (
              <View style={styles.approvedMessage}>
                <Text style={styles.approvedText}>
                  Congratulations! Your loan has been approved.
                </Text>
                <Text style={styles.loanDetails}>
                  Amount: ${loanData.loanAmount?.toLocaleString()}
                </Text>
                <Text style={styles.loanDetails}>
                  Interest Rate: {loanData.interestRate}%
                </Text>
              </View>
            )}
            
            {loanData.status === 'rejected' && (
              <View style={styles.rejectedMessage}>
                <Text style={styles.rejectedText}>
                  Your previous application was not approved. You can submit a new application with updated information.
                </Text>
                <TouchableOpacity
                  style={styles.reapplyButton}
                  onPress={() => {
                    setCanApply(true);
                    checkApplicationEligibility();
                  }}>
                  <Text style={styles.reapplyButtonText}>Apply Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Loan Application</Text>
        
        {renderStepIndicator()}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}

        <View style={styles.buttonContainer}>
          {step > 1 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep(step - 1)}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.nextButton, loading && styles.disabledButton]}
            onPress={nextStep}
            disabled={loading}>
            <Text style={styles.nextButtonText}>
              {step === 4 ? (loading ? 'Submitting...' : 'Submit') : 'Next'}
            </Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginVertical: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  stepDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  stepDotActive: {
    backgroundColor: '#3B82F6',
  },
  stepDotInactive: {
    backgroundColor: '#E5E7EB',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepNumberInactive: {
    color: '#6B7280',
  },
  stepContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 10,
  },
  inputIcon: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
    width: 20,
    textAlign: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    marginBottom: 15,
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    marginLeft: 10,
    fontWeight: '500',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 12,
    marginRight: 10,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    marginLeft: 10,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  notLoggedIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notLoggedInText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  applicantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 15,
  },
  statusValue: {
    fontWeight: 'bold',
  },
  reviewMessage: {
    backgroundColor: '#FEF3C7',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  reviewText: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 5,
  },
  reviewSubtext: {
    fontSize: 12,
    color: '#A16207',
  },
  approvedMessage: {
    backgroundColor: '#D1FAE5',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  approvedText: {
    fontSize: 14,
    color: '#065F46',
    marginBottom: 10,
    fontWeight: '600',
  },
  loanDetails: {
    fontSize: 14,
    color: '#047857',
    marginBottom: 5,
  },
  rejectedMessage: {
    backgroundColor: '#FEE2E2',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  rejectedText: {
    fontSize: 14,
    color: '#991B1B',
    marginBottom: 15,
  },
  reapplyButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  reapplyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});