# LoanApp - Mobile Loan Application

A comprehensive React Native loan application built with Expo, featuring user authentication, loan application processing, face verification, and admin dashboard.

## Features

### User Features
- **Phone Authentication**: OTP-based login using phone number
- **Loan Application**: Multi-step form for personal and employment information
- **Document Upload**: CNIC/ID and selfie upload for verification
- **Real-time Status**: Track loan application status
- **Push Notifications**: Reminders for repayment dates

### Admin Features
- **Dashboard**: View all loan applications
- **Review System**: Approve or reject applications
- **Document Viewer**: View uploaded CNIC and selfie images
- **Auto-approval**: Automatic approval for high-income applicants

### Technical Features
- **Firebase Integration**: Authentication, Firestore, and Storage
- **Cross-platform**: Works on iOS, Android, and Web
- **Modern UI**: Clean, mobile-friendly design
- **Secure**: Face verification and document validation

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- Firebase project

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Firebase Setup**:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Phone provider)
   - Create Firestore database
   - Enable Storage
   - Download configuration files

3. **Environment Configuration**:
   Create a `.env` file with your Firebase configuration:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the application**:
   ```bash
   npm run dev
   ```

### Firebase Configuration

1. **Authentication**:
   - Enable Phone authentication in Firebase Console
   - Add your domain to authorized domains

2. **Firestore Rules**:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /loanApplications/{document} {
         allow read, write: if request.auth != null;
       }
       match /users/{userId} {
         allow read, write: if request.auth.uid == userId;
       }
     }
   }
   ```

3. **Storage Rules**:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /uploads/{userId}/{allPaths=**} {
         allow read, write: if request.auth.uid == userId;
       }
       match /admin/{allPaths=**} {
         allow read: if request.auth != null;
       }
     }
   }
   ```

## Production Deployment

### Mobile App (Android)
1. **Build AAB**:
   ```bash
   npx expo build:android --type app-bundle
   ```

2. **Google Play Store**:
   - Upload AAB to Google Play Console
   - Configure app listing and pricing
   - Submit for review

### Web Admin Panel
1. **Build for web**:
   ```bash
   npm run build:web
   ```

2. **Deploy to hosting**:
   - Firebase Hosting
   - Netlify
   - Vercel

## Architecture

### App Structure
```
app/
├── (tabs)/              # Main app tabs
│   ├── index.tsx        # Home/Dashboard
│   ├── application.tsx  # Loan application form
│   ├── profile.tsx      # User profile
│   └── settings.tsx     # App settings
├── auth/                # Authentication screens
└── admin/               # Admin dashboard

hooks/                   # Custom React hooks
services/               # API and business logic
```

### Data Models

**User Application**:
```typescript
{
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
```

## Testing

### Test Users
- Phone: +1234567890
- OTP: 123456 (for demo purposes)

### Test Scenarios
1. **High Income Approval**: Enter monthly income ≥ $50,000 for auto-approval
2. **Manual Review**: Enter monthly income < $50,000 for manual review
3. **Document Upload**: Test camera and gallery image selection
4. **Admin Dashboard**: Review and approve/reject applications

## Security Features

- **Phone Authentication**: OTP verification for secure login
- **Face Verification**: Selfie capture for identity confirmation
- **Document Validation**: CNIC/ID upload requirement
- **Data Encryption**: All data encrypted in transit and at rest
- **Role-based Access**: Separate admin and user permissions

## Future Enhancements

- **Advanced Face Recognition**: Integration with FaceIO or AWS Rekognition
- **Credit Score Integration**: External credit bureau API
- **Payment Gateway**: Loan disbursement and repayment processing
- **Multi-language Support**: Localization for different regions
- **Offline Mode**: Limited functionality without internet

## Support

For technical support or questions:
- Email: support@loanapp.com
- Documentation: https://docs.loanapp.com
- Issues: GitHub Issues

## License

This project is licensed under the MIT License.