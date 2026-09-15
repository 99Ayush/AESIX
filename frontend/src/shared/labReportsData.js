/**
 * Standard Shared Dummy Lab Reports Data
 * Represents lab reports updated directly via labs/hospitals for patients
 */
export const DUMMY_LAB_REPORTS = [
  {
    id: 'lab-rep-001',
    testTitle: 'Complete Blood Count (CBC) & Differential',
    category: 'Hematology',
    labName: 'Apollo Diagnostics Laboratory',
    labBadge: 'NABL Accredited',
    sampleId: 'SMP-2026-9921',
    reportDate: '2026-09-10T09:30:00Z',
    technician: 'Dr. R. K. Sharma (MD Pathologist)',
    referredBy: 'Dr. Anirudh Kanwat',
    status: 'Verified',
    badgeColor: 'sih-badge-green',
    summaryMetrics: [
      { name: 'Hemoglobin', value: '14.2 g/dL', status: 'Normal', range: '13.5 - 17.5' },
      { name: 'WBC Count', value: '7,400 /mcL', status: 'Normal', range: '4,500 - 11,000' },
      { name: 'Platelets', value: '250,000 /mcL', status: 'Normal', range: '150k - 450k' }
    ],
    summaryNote: 'All hematological parameters within normal reference ranges. No abnormal cells observed.',
    fileSize: '1.4 MB',
    fileName: 'CBC_Report_Apollo_Sep2026.pdf',
    downloadUrl: '#'
  },
  {
    id: 'lab-rep-002',
    testTitle: 'Comprehensive Lipid Profile & Cholesterol Panel',
    category: 'Biochemistry',
    labName: 'Max Healthcare Labs & Diagnostics',
    labBadge: 'CAP Certified',
    sampleId: 'SMP-2026-8812',
    reportDate: '2026-09-02T11:15:00Z',
    technician: 'Dr. Sunita Patel (Clinical Biochemist)',
    referredBy: 'Dr. Anirudh Kanwat',
    status: 'Borderline High',
    badgeColor: 'sih-badge-amber',
    summaryMetrics: [
      { name: 'Total Cholesterol', value: '215 mg/dL', status: 'High', range: '< 200 mg/dL' },
      { name: 'HDL (Good)', value: '48 mg/dL', status: 'Normal', range: '> 40 mg/dL' },
      { name: 'LDL (Bad)', value: '138 mg/dL', status: 'Elevated', range: '< 100 mg/dL' },
      { name: 'Triglycerides', value: '145 mg/dL', status: 'Normal', range: '< 150 mg/dL' }
    ],
    summaryNote: 'Mild elevation in total cholesterol and LDL. Dietary modification & lifestyle exercise recommended.',
    fileSize: '2.1 MB',
    fileName: 'Lipid_Panel_MaxLabs_Sep2026.pdf',
    downloadUrl: '#'
  },
  {
    id: 'lab-rep-003',
    testTitle: 'HbA1c & Fasting Blood Glucose Panel',
    category: 'Endocrinology',
    labName: 'Dr. Lal PathLabs',
    labBadge: 'ISO 15189 Certified',
    sampleId: 'SMP-2026-7430',
    reportDate: '2026-08-25T08:00:00Z',
    technician: 'Dr. A. V. Deshmukh',
    referredBy: 'Dr. Anirudh Kanwat',
    status: 'Verified',
    badgeColor: 'sih-badge-green',
    summaryMetrics: [
      { name: 'HbA1c', value: '5.6 %', status: 'Normal', range: '< 5.7%' },
      { name: 'Fasting Plasma Glucose', value: '94 mg/dL', status: 'Normal', range: '70 - 99 mg/dL' }
    ],
    summaryNote: 'Glycemic control is satisfactory. No diabetic indicators.',
    fileSize: '0.9 MB',
    fileName: 'HbA1c_LalPath_Aug2026.pdf',
    downloadUrl: '#'
  },
  {
    id: 'lab-rep-004',
    testTitle: 'Thyroid Function Test (T3, T4, TSH)',
    category: 'Endocrinology',
    labName: 'Thyrocare Technologies',
    labBadge: 'NABL Accredited',
    sampleId: 'SMP-2026-6109',
    reportDate: '2026-08-10T14:20:00Z',
    technician: 'Dr. P. N. Rao',
    referredBy: 'Dr. Anirudh Kanwat',
    status: 'Verified',
    badgeColor: 'sih-badge-green',
    summaryMetrics: [
      { name: 'TSH', value: '2.45 µIU/mL', status: 'Normal', range: '0.4 - 4.0' },
      { name: 'Free T3', value: '3.1 pg/mL', status: 'Normal', range: '2.0 - 4.4' },
      { name: 'Free T4', value: '1.2 ng/dL', status: 'Normal', range: '0.8 - 1.8' }
    ],
    summaryNote: 'Euthyroid status confirmed. Thyroid hormone levels within reference limits.',
    fileSize: '1.1 MB',
    fileName: 'Thyroid_Thyrocare_Aug2026.pdf',
    downloadUrl: '#'
  },
  {
    id: 'lab-rep-005',
    testTitle: 'Digital Chest X-Ray (PA View)',
    category: 'Radiology & Imaging',
    labName: 'SRL Diagnostic Imaging Center',
    labBadge: 'AERB Approved',
    sampleId: 'RAD-2026-3021',
    reportDate: '2026-07-19T16:00:00Z',
    technician: 'Dr. S. K. Verma (Radiologist)',
    referredBy: 'Dr. Anirudh Kanwat',
    status: 'Normal',
    badgeColor: 'sih-badge-teal',
    summaryMetrics: [
      { name: 'Lung Fields', value: 'Clear', status: 'Normal', range: '-' },
      { name: 'Cardiac Size', value: 'Normal', status: 'Normal', range: '-' },
      { name: 'Bony Thorax', value: 'Intact', status: 'Normal', range: '-' }
    ],
    summaryNote: 'No active lung parenchymal lesion seen. Cardiac shadow within normal limits.',
    fileSize: '4.8 MB',
    fileName: 'Chest_XRay_SRL_Jul2026.pdf',
    downloadUrl: '#'
  }
];
