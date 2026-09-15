import React from 'react';
import {
  BarChart3,
  UserRound,
  FileText,
  TriangleAlert,
  ClipboardList
} from "lucide-react";

export const PatientDirectoryView = ({ searchResults = [], onSelectPatient }) => {
  const defaultPatients = [
    {
      id: 'user-1',
      fullName: 'Aarav Sharma',
      age: 28,
      gender: 'Male',
      bloodGroup: 'O+',
      phone: '+91 98765 43210',
      email: 'aarav.sharma@example.com',
      abhaId: '91-4820-9182-3741',
      lastVisit: '2026-08-20',
      status: 'Active Care',
      risk: 'Low',
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
      lastVisit: '2026-07-15',
      status: 'Follow-up Due',
      risk: 'Moderate',
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
      lastVisit: '2026-09-02',
      status: 'Critical Alert',
      risk: 'High Risk',
    },
    {
      id: 'user-4',
      fullName: 'Ananya Roy',
      age: 29,
      gender: 'Female',
      bloodGroup: 'AB+',
      phone: '+91 98989 12345',
      email: 'ananya.roy@example.com',
      abhaId: '91-5544-3322-1100',
      lastVisit: '2026-06-11',
      status: 'Routine Review',
      risk: 'Low',
    },
  ];

  const patientsList = searchResults.length > 0 ? searchResults : defaultPatients;

  return (
    <div className="doc-card doc-directory-card">
      <div className="doc-card-header">
        <div>
          <h3 className="doc-card-title">Patient Records Directory</h3>
          <p className="doc-card-subtitle" style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0' }}>
            Comprehensive list of registered clinic patients & ABHA health records
          </p>
        </div>
        <span className="doc-count-badge">{patientsList.length} Registered Patients</span>
      </div>

      <div className="doc-directory-grid">
        {patientsList.map((pt) => (
          <div key={pt.id} className="doc-directory-item-card">
            <div className="doc-dir-card-header">
              <div className="doc-dir-avatar">
                {pt.fullName.charAt(0)}
              </div>
              <div className="doc-dir-main">
                <h4 className="doc-dir-name">{pt.fullName}</h4>
                <span className="doc-dir-meta">{pt.age} yrs • {pt.gender} • <strong style={{ color: '#DC2626' }}>{pt.bloodGroup}</strong></span>
              </div>
              <span className={`doc-risk-badge risk-${(pt.risk || 'low').toLowerCase().replace(' ', '-')}`}>
                {pt.risk || 'Low Risk'}
              </span>
            </div>

            <div className="doc-dir-details">
              <div className="doc-dir-detail-row">
                <span>ABHA ID:</span>
                <strong>{pt.abhaId || '91-4820-9182-3741'}</strong>
              </div>
              <div className="doc-dir-detail-row">
                <span>Contact:</span>
                <span>{pt.phone}</span>
              </div>
              <div className="doc-dir-detail-row">
                <span>Last Visit:</span>
                <span>{pt.lastVisit || 'Recent'}</span>
              </div>
            </div>

            <div className="doc-dir-card-actions">
              <button
                className="doc-dir-action-btn primary"
                onClick={() => onSelectPatient && onSelectPatient(pt.id, 'patient-data')}
              >
                <UserRound size={17} /> View Patient Data
              </button>
              <button
                className="doc-dir-action-btn secondary"
                onClick={() => onSelectPatient && onSelectPatient(pt.id, 'consultations')}
              >
                <FileText size={17} />Previous Records
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientDirectoryView;
