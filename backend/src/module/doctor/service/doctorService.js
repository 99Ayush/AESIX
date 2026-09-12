import { formatPatientSummary, MOCK_PATIENT_LIST } from '../model/doctorModel.js';

/**
 * Doctor Service Layer
 */
export async function getPatientDetailsForDoctor(patientId = 'user-1') {
  // Mock consultation history records
  const consultationResults = [
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
  ];

  const patientBase = MOCK_PATIENT_LIST.find((p) => p.id === patientId) || MOCK_PATIENT_LIST[0];

  const profileData = formatPatientSummary(
    {
      id: patientBase.id,
      name: patientBase.fullName,
      dob: '1998-04-18',
      gender: patientBase.gender,
      bloodGroup: patientBase.bloodGroup,
      contact: {
        phone: patientBase.phone,
        email: patientBase.email,
        address: '402 Green Park, Sector 15, Gurgaon, Haryana',
        emergencyContactName: 'Sunita Sharma',
        emergencyContactRelation: 'Mother',
        emergencyContactPhone: '+91 98111 22334',
      },
    },
    [
      { id: 'doc-1', title: 'Chest X-Ray Report', type: 'disease', date: '2026-08-20', fileName: 'XRay_Aug2026.pdf' },
      { id: 'doc-2', title: 'Blood Count & Lipid Panel', type: 'prescription', date: '2026-05-14', fileName: 'LabReport_May2026.pdf' },
    ],
    []
  );

  return {
    patient: {
      ...profileData,
      photoUrl: patientBase.photoUrl,
    },
    consultationResults,
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
}

export async function searchPatientsForDoctor(query = '') {
  const q = query.toLowerCase().trim();
  if (!q) return MOCK_PATIENT_LIST;

  return MOCK_PATIENT_LIST.filter(
    (p) =>
      p.fullName.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.abhaId.includes(q)
  );
}
