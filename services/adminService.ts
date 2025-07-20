// Mock admin service with proper application management
// Replace with actual Firebase Firestore implementation

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
  loanAmount?: number;
  interestRate?: number;
  repaymentDate?: Date;
}

export const getLoanApplications = async (): Promise<LoanApplication[]> => {
  try {
    const stored = await AsyncStorage.getItem('allApplications');
    if (stored) {
      const applications = JSON.parse(stored);
      return applications.map((app: any) => ({
        ...app,
        submittedAt: new Date(app.submittedAt),
        repaymentDate: app.repaymentDate ? new Date(app.repaymentDate) : undefined,
      }));
    }
    
    // Return mock data if no stored applications
    const mockApplications: LoanApplication[] = [
      {
        id: 'mock_1',
        userId: 'user1',
        fullName: 'Ahmed Khan',
        nationalId: '42101-1234567-1',
        address: 'House 123, Street 5, Lahore',
        employmentType: 'Full-time',
        monthlyIncome: 60000,
        status: 'under_review',
        submittedAt: new Date('2024-01-15'),
        cnicImageUrl: 'https://images.pexels.com/photos/7876538/pexels-photo-7876538.jpeg',
        selfieImageUrl: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg',
      },
      {
        id: 'mock_2',
        userId: 'user2',
        fullName: 'Fatima Ali',
        nationalId: '42201-9876543-2',
        address: 'Flat 45, Block B, Karachi',
        employmentType: 'Self-employed',
        monthlyIncome: 45000,
        status: 'approved',
        submittedAt: new Date('2024-01-10'),
        cnicImageUrl: 'https://images.pexels.com/photos/7876538/pexels-photo-7876538.jpeg',
        selfieImageUrl: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
        loanAmount: 36000,
        interestRate: 12.5,
        repaymentDate: new Date('2024-12-31'),
      },
    ];
    
    return mockApplications;
  } catch (error) {
    console.error('Error getting applications:', error);
    return [];
  }
};

export const updateLoanStatus = async (
  applicationId: string,
  status: 'approved' | 'rejected'
): Promise<void> => {
  try {
    // Get all applications
    const applications = await getLoanApplications();
    
    // Find and update the specific application
    const updatedApplications = applications.map(app => {
      if (app.id === applicationId) {
        const updatedApp = { ...app, status };
        
        // If approved, calculate loan details
        if (status === 'approved') {
          updatedApp.loanAmount = app.monthlyIncome * 0.8;
          updatedApp.interestRate = 12.5;
          updatedApp.repaymentDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        }
        
        // Update user's individual application record
        AsyncStorage.setItem(`userApplication_${app.userId}`, JSON.stringify(updatedApp));
        
        return updatedApp;
      }
      return app;
    });
    
    // Save updated applications
    await AsyncStorage.setItem('allApplications', JSON.stringify(updatedApplications));
    
    console.log('Status updated:', { applicationId, status });
  } catch (error) {
    console.error('Error updating status:', error);
    throw new Error('Failed to update application status');
  }
};