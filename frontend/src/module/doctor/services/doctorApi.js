const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

async function request(path, options = {}) {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (response.status === 204) return null;
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Request failed');
    return body.data;
  } catch (err) {
    console.warn(`Doctor API request failed for ${path}, using fallback client data`, err);
    return null;
  }
}

// Fallback user data when server is disconnected
const FALLBACK_PATIENT_DATA = {
  patient: {
    id: 'user-1',
    fullName: 'Aarav Sharma',
    dob: '1998-04-18',
    age: 28,
    gender: 'Male',
    bloodGroup: 'O+',
    maritalStatus: 'Single',
    occupation: 'Software Engineer',
    primaryLanguage: 'English / Hindi',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    contact: {
      phone: '+91 98765 43210',
      email: 'aarav.sharma@example.com',
      address: '402 Green Park, Sector 15, Gurgaon, Haryana',
      emergencyContactName: 'Sunita Sharma',
      emergencyContactRelation: 'Mother',
      emergencyContactPhone: '+91 98111 22334',
    },
    abhaId: '91-4820-9182-3741',
    medications: ['Paracetamol 500mg (PRN)', 'Cetirizine 10mg (Bedtime)', 'Inhaler Budecort 200 (2 puffs BD)'],
    allergies: ['Penicillin (Severe)', 'Dust Mites', 'Peanuts'],
    conditions: ['Mild Asthma', 'Seasonal Rhinitis', 'Occasional Migraine'],
  },
  consultationResults: [
    {
      id: 'c-101',
      date: '2026-08-20',
      doctorName: 'Dr. Meera Iyer (General Physician)',
      chiefComplaint: 'Persistent dry cough and mild breathlessness during exercise.',
      diagnosis: 'Acute Bronchitis with Mild Allergic Asthma',
      vitalSigns: { bp: '120/80 mmHg', heartRate: '76 bpm', temp: '98.6°F', spo2: '98%' },
      prescriptions: [
        { medicine: 'Inhaler Budecort 200', dosage: '2 puffs twice daily', duration: '14 days' },
        { medicine: 'Tab Montair-LC', dosage: '1 tablet daily at night', duration: '10 days' },
      ],
      aiSummary: 'GenAI triage identified mild respiratory distress. Vital signs stable.',
      doctorNotes: 'Advised to avoid cold food, dust exposure, and track peak flow meter values daily.',
    },
    {
      id: 'c-100',
      date: '2026-05-14',
      doctorName: 'Dr. Kabir Singh (Cardiologist)',
      chiefComplaint: 'Routine annual cardiovascular screening.',
      diagnosis: 'Normal Cardiac Function',
      vitalSigns: { bp: '118/78 mmHg', heartRate: '72 bpm', temp: '98.4°F', spo2: '99%' },
      prescriptions: [
        { medicine: 'Multivitamin Supplements', dosage: '1 tablet daily post breakfast', duration: '30 days' },
      ],
      aiSummary: 'ECG and lipid profile within normal parameters.',
      doctorNotes: 'Continue 30-min daily moderate cardio exercise.',
    },
  ],
  alerts: [
    {
      id: 'alt-1',
      severity: 'CRITICAL',
      type: 'ALLERGY',
      title: 'Severe Anaphylactic Risk: Penicillin',
      description: 'Patient experiences severe hives and throat swelling with Beta-lactam antibiotics.',
      addedDate: '2026-01-10',
    },
    {
      id: 'alt-2',
      severity: 'WARNING',
      type: 'CONDITION',
      title: 'Asthma Trigger Alert: Cold Weather',
      description: 'Requires prophylactic inhaler use before outdoor activities in winter.',
      addedDate: '2026-02-15',
    },
    {
      id: 'alt-3',
      severity: 'INFO',
      type: 'LAB_DUE',
      title: 'Follow-up Spirometry Test Due',
      description: 'Scheduled lung function check due within 30 days.',
      addedDate: '2026-08-21',
    },
  ],
};

export const doctorApi = {
  getPatientData: async (patientId = 'user-1') => {
    // Try live user profile endpoint or doctor API
    const userProfile = await request('/users/profile');
    const doctorData = await request(`/doctor/patient/${patientId}`);

    if (doctorData) return doctorData;

    if (userProfile) {
      return {
        ...FALLBACK_PATIENT_DATA,
        patient: {
          ...FALLBACK_PATIENT_DATA.patient,
          fullName: userProfile.name || FALLBACK_PATIENT_DATA.patient.fullName,
          gender: userProfile.gender || FALLBACK_PATIENT_DATA.patient.gender,
          bloodGroup: userProfile.bloodGroup || FALLBACK_PATIENT_DATA.patient.bloodGroup,
          contact: {
            ...FALLBACK_PATIENT_DATA.patient.contact,
            ...(userProfile.contact || {}),
          },
          medications: userProfile.medications?.length ? userProfile.medications : FALLBACK_PATIENT_DATA.patient.medications,
          allergies: userProfile.allergies?.length ? userProfile.allergies : FALLBACK_PATIENT_DATA.patient.allergies,
          conditions: userProfile.conditions?.length ? userProfile.conditions : FALLBACK_PATIENT_DATA.patient.conditions,
        },
      };
    }

    return FALLBACK_PATIENT_DATA;
  },

  searchPatients: async (query = '') => {
    const remote = await request(`/doctor/patients?q=${encodeURIComponent(query)}`);
    if (remote) return remote;
    
    const mockList = [
      { id: 'user-1', fullName: 'Aarav Sharma', age: 28, gender: 'Male', bloodGroup: 'O+', phone: '+91 98765 43210', email: 'aarav.sharma@example.com', abhaId: '91-4820-9182-3741' },
      { id: 'user-2', fullName: 'Priya Patel', age: 34, gender: 'Female', bloodGroup: 'B+', phone: '+91 98123 45678', email: 'priya.patel@example.com', abhaId: '91-1122-3344-5566' },
      { id: 'user-3', fullName: 'Rohan Verma', age: 45, gender: 'Male', bloodGroup: 'A+', phone: '+91 97654 32109', email: 'rohan.verma@example.com', abhaId: '91-9988-7766-5544' },
    ];
    if (!query) return mockList;
    const q = query.toLowerCase();
    return mockList.filter((p) => p.fullName.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.abhaId.includes(q));
  },
};
