import { useState, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { getUserApplication } from '@/services/loanService';

interface LoanData {
  id?: string;
  status: 'under_review' | 'approved' | 'rejected' | null;
  loanAmount?: number;
  interestRate?: number;
  repaymentDate?: Date;
  fullName?: string;
  monthlyIncome?: number;
  submittedAt?: Date;
}

export function useLoanStatus() {
  const { user } = useAuth();
  const [loanData, setLoanData] = useState<LoanData | null>(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);
  const [lastUserId, setLastUserId] = useState<string | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    if (user && user.uid !== lastUserId) {
      fetchLoanStatus();
      setLastUserId(user.uid);
    } else if (!user) {
      if (isMountedRef.current) {
        setLoanData(null);
        setLoading(false);
        setLastUserId(null);
      }
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [user, lastUserId]);

  const fetchLoanStatus = async () => {
    if (!user) return;
    
    try {
      const application = await getUserApplication(user.uid);
      
      if (isMountedRef.current) {
        if (application) {
          setLoanData({
            id: application.id,
            status: application.status,
            loanAmount: application.loanAmount,
            interestRate: application.interestRate,
            repaymentDate: application.repaymentDate,
            fullName: application.fullName,
            monthlyIncome: application.monthlyIncome,
            submittedAt: application.submittedAt,
          });
        } else {
          setLoanData(null);
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching loan status:', error);
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  return { loanData, loading, refetch: fetchLoanStatus };
}