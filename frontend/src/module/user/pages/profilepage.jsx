import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../userPages.css';
import { userApi } from '../services/userApi';
import { useDashboardLanguage } from '../LanguageContext';

export default function ProfilePage() {
  const navigate = useNavigate();

  const [patientProfile, setPatientProfile] = useState({
    name: 'Rajesh Kumar',
    abhaNumber: '91-8472-1029-4821',
    phrAddress: 'rajesh.kumar@abdm',
    dob: '1992-03-15',
    gender: 'Male',
    bloodGroup: 'O+',
    mobile: '+91 98765 43210',
    email: 'rajesh.kumar@example.com',
    emergencyContact: 'Sunita Kumar (+91 98765 43211)',
    address: 'House #104, Green Park Extension, New Delhi - 110016',
    abhaStatus: 'Verified (Aadhaar Seeded)',
    registeredHospital: 'AIIMS New Delhi',
    primaryDoctor: 'Dr. A. Verma (General Medicine)',
    insuranceProvider: 'Star Health Insurance (Pol #SH-829104)'
  });

  const { language, setLanguage } = useDashboardLanguage();
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    Promise.all([userApi.profile(), userApi.abha()]).then(([profile, abha]) => {
      setPatientProfile((current) => ({ ...current, ...profile, abhaNumber: abha.number, phrAddress: abha.phrAddress, abhaStatus: abha.verificationStatus, mobile: profile.contact?.phone || current.mobile, email: profile.contact?.email || current.email, address: profile.contact?.address || current.address, emergencyContact: profile.contact ? `${profile.contact.emergencyContactName} (${profile.contact.emergencyContactPhone})` : current.emergencyContact }));
    }).catch(() => {});
  }, []);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="sih-page-wrapper">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="sih-toast">
          <svg className="sih-toast-icon" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
          </svg>
          <span className="sih-toast-text">{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="sih-header">
        <div className="sih-header-inner">
          <div className="sih-brand">
            <div className="sih-logo-badge">
              SIH
            </div>
            <div>
              <h1 className="sih-brand-title">SIH 2026 | Patient Case-Taking</h1>
              <p className="sih-brand-subtitle">Doctor View • Clinical Documentation</p>
            </div>
          </div>

          <nav className="sih-nav-menu">
            <button onClick={() => navigate('/abha')} className="sih-nav-btn">
              ABHA ID
            </button>
            <button onClick={() => navigate('/uploadDoc')} className="sih-nav-btn">
              Docs
            </button>
            <button onClick={() => navigate('/basicInfo')} className="sih-nav-btn">
              Basic Info
            </button>
            <button onClick={() => navigate('/consent')} className="sih-nav-btn">
              Consent
            </button>
            <button onClick={() => navigate('/profile')} className="sih-nav-btn active">
              Profile
            </button>
          </nav>

          <div className="sih-header-controls">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="sih-lang-select"
            >
              <option value="English">🌐 English</option>
              <option value="Hindi">🌐 हिंदी (Hindi)</option>
              <option value="Bengali">🌐 বাংলা (Bengali)</option>
              <option value="Tamil">🌐 தமிழ் (Tamil)</option>
            </select>

            <div className="sih-doctor-profile">
              <div className="sih-doctor-avatar">
                DR
              </div>
              <div className="sih-doctor-info">
                <p className="sih-doctor-name">Dr. A. Verma</p>
                <p className="sih-doctor-role">General Medicine</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="sih-main-layout">
        
        {/* HERO BANNER */}
        <div className="profile-hero-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="profile-avatar-large">
              {patientProfile.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <span className="sih-badge sih-badge-teal" style={{ marginBottom: '0.4rem' }}>
                ABDM Verified Patient
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0.2rem 0' }}>{patientProfile.name}</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--mint-light)', opacity: 0.9, margin: 0 }}>
                {patientProfile.gender} • 32 Years • Blood Group: <strong style={{ color: 'white' }}>{patientProfile.bloodGroup}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => navigate('/basicInfo')}
              className="sih-btn sih-btn-primary"
            >
              Edit Information
            </button>
            <button
              onClick={() => showNotification('Exporting full EHR dossier...')}
              className="sih-btn sih-btn-outline"
              style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}
            >
              Export EHR
            </button>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="profile-details-grid-section">
          
          {/* MAIN PROFILE DETAILS */}
          <div className="profile-info-block" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--primary-navy)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', margin: 0 }}>
              Demographic & Registration Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div className="profile-field-row">
                <span className="profile-field-label">ABHA Health Number:</span>
                <span className="profile-field-val" style={{ fontFamily: 'monospace' }}>{patientProfile.abhaNumber}</span>
              </div>

              <div className="profile-field-row">
                <span className="profile-field-label">PHR / ABHA Address:</span>
                <span className="profile-field-val" style={{ color: 'var(--teal-primary)' }}>{patientProfile.phrAddress}</span>
              </div>

              <div className="profile-field-row">
                <span className="profile-field-label">Verification Status:</span>
                <span className="profile-field-val">{patientProfile.abhaStatus}</span>
              </div>

              <div className="profile-field-row">
                <span className="profile-field-label">Primary Email:</span>
                <span className="profile-field-val">{patientProfile.email}</span>
              </div>

              <div className="profile-field-row">
                <span className="profile-field-label">Mobile Number:</span>
                <span className="profile-field-val">{patientProfile.mobile}</span>
              </div>

              <div className="profile-field-row">
                <span className="profile-field-label">Residential Address:</span>
                <span className="profile-field-val">{patientProfile.address}</span>
              </div>

              <div className="profile-field-row">
                <span className="profile-field-label">Primary Care Hospital:</span>
                <span className="profile-field-val">{patientProfile.registeredHospital}</span>
              </div>

              <div className="profile-field-row">
                <span className="profile-field-label">Attending Doctor:</span>
                <span className="profile-field-val">{patientProfile.primaryDoctor}</span>
              </div>

              <div className="profile-field-row">
                <span className="profile-field-label">Health Insurance:</span>
                <span className="profile-field-val">{patientProfile.insuranceProvider}</span>
              </div>
            </div>
          </div>

          {/* QUICK LINKS & EMERGENCY CONTACT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div className="profile-info-block" style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 900, color: '#DC2626', textTransform: 'uppercase', margin: 0 }}>
                Emergency Contact
              </h3>
              <p style={{ fontWeight: 800, color: 'var(--primary-navy)', fontSize: '0.95rem', marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>
                {patientProfile.emergencyContact}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Designated immediate proxy for clinical emergency authorizations.
              </p>
            </div>

            <div className="profile-info-block" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--primary-navy)', textTransform: 'uppercase', margin: 0 }}>
                Quick Shortcuts
              </h3>

              <button onClick={() => navigate('/abha')} className="sih-btn sih-btn-outline" style={{ justifyContent: 'space-between' }}>
                <span>🪪 View Official ABHA Card</span>
                <span>→</span>
              </button>

              <button onClick={() => navigate('/uploadDoc')} className="sih-btn sih-btn-outline" style={{ justifyContent: 'space-between' }}>
                <span>📁 Upload Medical Reports</span>
                <span>→</span>
              </button>

              <button onClick={() => navigate('/consent')} className="sih-btn sih-btn-outline" style={{ justifyContent: 'space-between' }}>
                <span>🔒 Manage Consent Requests</span>
                <span>→</span>
              </button>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
