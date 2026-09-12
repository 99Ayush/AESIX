/**
 * Backend Doctor Module - Data Models & Formatting Helpers
 */

export const formatPatientSummary = (userProfile = {}, documents = [], consents = []) => {
  const birthYear = userProfile.dob ? new Date(userProfile.dob).getFullYear() : null;
  const currentYear = new Date().getFullYear();
  const calculatedAge = birthYear ? currentYear - birthYear : null;

  return {
    id: userProfile.id || 'user-1',
    fullName: userProfile.name || 'Aarav Sharma',
    dob: userProfile.dob || '1998-04-18',
    age: calculatedAge || 28,
    gender: userProfile.gender || 'Male',
    bloodGroup: userProfile.bloodGroup || 'O+',
    maritalStatus: userProfile.maritalStatus || 'Single',
    occupation: userProfile.occupation || 'Software Engineer',
    primaryLanguage: userProfile.primaryLanguage || 'English / Hindi',
    contact: {
      phone: userProfile.contact?.phone || '+91 98765 43210',
      email: userProfile.contact?.email || 'aarav.sharma@example.com',
      address: userProfile.contact?.address || '402 Green Park, Sector 15, Gurgaon, Haryana',
      emergencyContactName: userProfile.contact?.emergencyContactName || 'Sunita Sharma',
      emergencyContactRelation: userProfile.contact?.emergencyContactRelation || 'Mother',
      emergencyContactPhone: userProfile.contact?.emergencyContactPhone || '+91 98111 22334',
    },
    abhaId: '91-4820-9182-3741',
    medications: userProfile.medications?.length
      ? userProfile.medications
      : ['Paracetamol 500mg (PRN)', 'Cetirizine 10mg (Bedtime)'],
    allergies: userProfile.allergies?.length
      ? userProfile.allergies
      : ['Penicillin', 'Dust Mites', 'Peanuts'],
    conditions: userProfile.conditions?.length
      ? userProfile.conditions
      : ['Mild Asthma', 'Seasonal Rhinitis'],
    criticalAlerts: userProfile.criticalAlerts?.length
      ? userProfile.criticalAlerts
      : [
          { id: 'alt-1', level: 'HIGH', title: 'Severe Penicillin Allergy', date: '2026-01-10' },
          { id: 'alt-2', level: 'MEDIUM', title: 'Asthma Exacerbation Risk in Winter', date: '2026-02-15' },
        ],
    documents: documents || [],
    consents: consents || [],
  };
};

export const MOCK_PATIENT_LIST = [
  {
    id: 'user-1',
    fullName: 'Aarav Sharma',
    age: 28,
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '+91 98765 43210',
    email: 'aarav.sharma@example.com',
    abhaId: '91-4820-9182-3741',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    lastVisit: '2026-08-20',
  },
  {
    id: 'user-2',
    fullName: 'Priya Patel',
    age: 34,
    gender: 'Female',
    bloodGroup: 'B+',
    phone: '+91 98123 45678',
    email: 'priya.patel@example.com',
    abhaId: '91-1122-3344-5566',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    lastVisit: '2026-09-02',
  },
  {
    id: 'user-3',
    fullName: 'Rohan Verma',
    age: 45,
    gender: 'Male',
    bloodGroup: 'A+',
    phone: '+91 97654 32109',
    email: 'rohan.verma@example.com',
    abhaId: '91-9988-7766-5544',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    lastVisit: '2026-09-10',
  },
];
