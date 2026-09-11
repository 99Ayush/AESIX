import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../userPages.css';
import { userApi } from '../services/userApi';
import { useDashboardLanguage } from '../LanguageContext';

// Utility for formatting dates
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  } catch (e) {
    return dateString;
  }
};

export default function AbhaID() {
  const navigate = useNavigate();

  // Local Mock Data inside AbhaID.jsx
  const [abhaDetails, setAbhaDetails] = useState({
    name: 'Rajesh Kumar',
    abhaNumber: '91-8472-1029-4821',
    phrAddress: 'rajesh.kumar@abdm',
    dob: '1992-03-15',
    gender: 'Male',
    mobile: '+91 98765 43210',
    bloodGroup: 'O+',
    address: 'House #104, Green Park Extension, New Delhi - 110016',
    emergencyContact: 'Sunita Kumar (+91 98765 43211)',
    verificationStatus: 'Verified (Aadhaar Seeded)',
    issuedDate: '2023-01-12'
  });

  const [pendingConsents, setPendingConsents] = useState([
    {
      id: 1,
      requester: "Apex Diagnostics Lab",
      purpose: "Lab Report & Scan Access",
      date: "2026-09-09"
    },
    {
      id: 2,
      requester: "Genomics India Lab",
      purpose: "DNA Variant Data Access",
      date: "2026-09-11"
    },
    {
      id: 3,
      requester: "Apollo Specialty Hospital",
      purpose: "EHR Transfer Request",
      date: "2026-09-08"
    }
  ]);

  const { language, setLanguage } = useDashboardLanguage();
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    Promise.all([userApi.abha(), userApi.consents()]).then(([abha, consents]) => {
      setAbhaDetails((current) => ({ ...current, ...abha, abhaNumber: abha.number, mobile: abha.contact?.phone || current.mobile, address: abha.contact?.address || current.address, emergencyContact: abha.contact ? `${abha.contact.emergencyContactName} (${abha.contact.emergencyContactPhone})` : current.emergencyContact }));
      setPendingConsents(consents.filter((item) => item.status === 'pending').map((item) => ({ ...item, date: item.requestedAt })));
    }).catch(() => {});
  }, []);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownload = () => {
    showNotification('Downloading official ABHA Health Card (PDF)...');
  };

  return (
    <div className="sih-page-wrapper">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="sih-toast">
          <svg className="sih-toast-icon" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
          </svg>
          <span className="sih-toast-text">{toastMessage}</span>
        </div>
      )}

      {/* TOP NAVBAR */}
      <header className="sih-header">
        <div className="sih-header-inner">
          
          {/* Logo & Branding */}
          <div className="sih-brand">
            <div className="sih-logo-badge">
              SIH
            </div>
            <div>
              <h1 className="sih-brand-title">SIH 2026 | Patient Case-Taking</h1>
              <p className="sih-brand-subtitle">Doctor View • Clinical Documentation</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="sih-nav-menu">
            <button
              onClick={() => navigate('/abha')}
              className="sih-nav-btn active"
            >
              ABHA ID
            </button>

            <button
              onClick={() => navigate('/uploadDoc')}
              className="sih-nav-btn"
            >
              Docs
            </button>

            <button
              onClick={() => navigate('/basicInfo')}
              className="sih-nav-btn"
            >
              Basic Info
            </button>

            <button
              onClick={() => navigate('/consent')}
              className="sih-nav-btn"
            >
              Consent
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="sih-nav-btn"
            >
              Profile
            </button>
          </nav>

          {/* Right Controls: Language & Doctor Profile */}
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

      {/* MAIN CONTAINER */}
      <main className="sih-main-layout">

        {/* TWO-COLUMN RESPONSIVE LAYOUT */}
        <div className="abha-grid">

          {/* LEFT COLUMN: ABHA ID CARD */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* OFFICIAL ABHA ID CARD */}
            <div className="sih-card">
              
              {/* Official NHA Header Strip */}
              <div className="abha-nha-banner">
                <div className="abha-nha-left">
                  <div className="abha-nha-icon">
                    🏛️
                  </div>
                  <div>
                    <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', opacity: 0.8 }}>
                      National Health Authority • Govt. of India
                    </p>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Ayushman Bharat Health Account (ABHA)</h2>
                  </div>
                </div>

                <span className="sih-badge sih-badge-teal">
                  {abhaDetails.verificationStatus}
                </span>
              </div>

              {/* Card Body */}
              <div className="abha-card-body">
                
                <div className="abha-card-main-row">
                  
                  {/* Photo & Main Demographics */}
                  <div className="abha-user-profile">
                    <div className="abha-avatar-box">
                      {abhaDetails.name.split(' ').map(n => n[0]).join('')}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary-navy)', margin: 0 }}>{abhaDetails.name}</h3>
                      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', margin: 0 }}>
                        {abhaDetails.gender} • DOB: {formatDate(abhaDetails.dob)}
                      </p>
                      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', margin: 0 }}>
                        Blood Group: <span style={{ color: 'var(--teal-primary)', fontWeight: 900 }}>{abhaDetails.bloodGroup}</span>
                      </p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>
                        Mobile: <strong style={{ color: 'var(--primary-navy)' }}>{abhaDetails.mobile}</strong>
                      </p>
                    </div>
                  </div>

                  {/* QR Code Box */}
                  <div className="abha-qr-wrapper">
                    <div className="abha-qr-inner">
                      <div className="abha-qr-cell" style={{ backgroundColor: '#12304A' }}></div>
                      <div className="abha-qr-cell" style={{ backgroundColor: '#2F8F83' }}></div>
                      <div className="abha-qr-cell" style={{ backgroundColor: '#12304A' }}></div>
                      <div className="abha-qr-cell" style={{ backgroundColor: '#2F8F83' }}></div>
                      <div className="abha-qr-cell" style={{ backgroundColor: '#12304A' }}></div>
                      <div className="abha-qr-cell" style={{ backgroundColor: '#2F8F83' }}></div>
                      <div className="abha-qr-cell" style={{ backgroundColor: '#12304A' }}></div>
                      <div className="abha-qr-cell" style={{ backgroundColor: '#12304A' }}></div>
                      <div className="abha-qr-cell" style={{ backgroundColor: '#2F8F83' }}></div>
                      <div className="abha-qr-cell" style={{ backgroundColor: '#12304A' }}></div>
                      <div className="abha-qr-cell" style={{ backgroundColor: '#12304A' }}></div>
                      <div className="abha-qr-cell" style={{ backgroundColor: '#2F8F83' }}></div>
                      <div className="abha-qr-cell" style={{ backgroundColor: '#12304A' }}></div>
                      <div className="abha-qr-cell" style={{ backgroundColor: '#12304A' }}></div>
                      <div className="abha-qr-cell" style={{ backgroundColor: '#2F8F83' }}></div>
                      <div className="abha-qr-cell" style={{ backgroundColor: '#2F8F83' }}></div>
                      <div className="abha-qr-cell" style={{ backgroundColor: '#12304A' }}></div>
                      <div className="abha-qr-cell" style={{ backgroundColor: '#12304A' }}></div>
                      <div className="abha-qr-cell" style={{ backgroundColor: '#2F8F83' }}></div>
                      <div className="abha-qr-cell" style={{ backgroundColor: '#12304A' }}></div>
                      <div className="abha-qr-cell" style={{ backgroundColor: '#12304A' }}></div>
                      <div className="abha-qr-cell" style={{ backgroundColor: '#2F8F83' }}></div>
                      <div className="abha-qr-cell" style={{ backgroundColor: '#12304A' }}></div>
                      <div className="abha-qr-cell" style={{ backgroundColor: '#2F8F83' }}></div>
                      <div className="abha-qr-cell" style={{ backgroundColor: '#12304A' }}></div>
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary-navy)', display: 'block', marginTop: '0.4rem' }}>
                      Scan QR Code
                    </span>
                  </div>

                </div>

                <div className="abha-key-details-grid">
                  <div className="abha-number-box">
                    <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>ABHA Health Number</p>
                    <p style={{ fontSize: '1.05rem', fontWeight: 900, fontFamily: 'monospace', color: 'var(--primary-navy)', marginTop: '0.2rem', margin: 0 }}>{abhaDetails.abhaNumber}</p>
                  </div>

                  <div className="abha-phr-box">
                    <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>PHR / ABHA Address</p>
                    <p style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--teal-primary)', marginTop: '0.2rem', margin: 0 }}>{abhaDetails.phrAddress}</p>
                  </div>
                </div>

                {/* Additional Info Footer */}
                <div className="abha-card-footer">
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--mint-light)', margin: 0, fontSize: '0.8rem' }}>Emergency Contact:</p>
                    <p style={{ color: '#CBD5E1', fontWeight: 600, fontSize: '0.75rem', margin: 0 }}>{abhaDetails.emergencyContact}</p>
                  </div>
                  <span className="sih-badge sih-badge-teal">
                    ABDM Compliant Card
                  </span>
                </div>

              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: PENDING CONSENTS & DOWNLOAD */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* PENDING CONSENTS CARD */}
            <div className="sih-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--primary-navy)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }}></span>
                  Pending Consents ({pendingConsents.length})
                </h3>
                <span className="sih-badge sih-badge-amber">
                  Action Needed
                </span>
              </div>

              {/* Pending Consents List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {pendingConsents.map((consent) => (
                  <div key={consent.id} style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', margin: 0 }}>{consent.requester}</h4>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>{formatDate(consent.date)}</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, margin: '0.2rem 0 0 0' }}>{consent.purpose}</p>
                  </div>
                ))}
              </div>

              {/* View All Consents Button */}
              <div>
                <button
                  onClick={() => navigate('/consent')}
                  className="sih-btn sih-btn-navy"
                  style={{ width: '100%' }}
                >
                  View All Consents →
                </button>
              </div>

            </div>

            {/* DOWNLOAD BUTTON BELOW PENDING CONSENTS */}
            <div>
              <button
                onClick={handleDownload}
                className="sih-btn sih-btn-primary"
                style={{ width: '100%', padding: '1rem 1.5rem', fontSize: '0.95rem', borderRadius: 'var(--radius-xl)' }}
              >
                <span>📥</span> Download Official ABHA Card (PDF)
              </button>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
