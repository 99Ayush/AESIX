import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../userPages.css';
import { userApi } from '../services/userApi';

// Formatting Utilities
export const formatDate = (dateString) => {
  if (!dateString || dateString === 'N/A') return 'N/A';
  try {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  } catch (e) {
    return dateString;
  }
};

export default function Consent() {
  const navigate = useNavigate();

  const [consents, setConsents] = useState([
    {
      id: 1,
      title: "Medical History & EHR Access",
      status: "accepted",
      date: "2026-09-10",
      expiry: "2027-09-10",
      requester: "Dr. A. Verma (General Medicine)",
      purpose: "Allows viewing patient past diagnoses, vitals logs, and clinical notes for active treatment.",
      scope: ["Medical History", "Vitals", "Diagnoses"]
    },
    {
      id: 2,
      title: "Diagnostic Document Processing",
      status: "pending",
      date: "2026-09-09",
      expiry: "2026-10-09",
      requester: "Apex Diagnostics Lab",
      purpose: "Permission to process and store uploaded blood test reports and radiologic scans.",
      scope: ["Lab Reports", "Scans & Images"]
    },
    {
      id: 3,
      title: "Third-Party Research Data Sharing",
      status: "rejected",
      date: "2026-09-08",
      expiry: "N/A",
      requester: "BioMed Research Institute",
      purpose: "Anonymized case data sharing for epidemiological research studies.",
      scope: ["Anonymized Records"]
    },
    {
      id: 4,
      title: "Emergency Tele-Consultation Consent",
      status: "accepted",
      date: "2026-08-25",
      expiry: "2027-08-25",
      requester: "SIH Emergency Telehealth Network",
      purpose: "Consent for video consultation and instant digital prescription generation during emergency care.",
      scope: ["Video Call", "Digital Rx"]
    },
    {
      id: 5,
      title: "Pharmacy Medication Dispensing Access",
      status: "accepted",
      date: "2026-08-15",
      expiry: "2026-11-15",
      requester: "Jan Aushadhi Pharmacy",
      purpose: "Permission for pharmacy to verify active electronic prescriptions for medication fulfillment.",
      scope: ["Prescriptions Only"]
    },
    {
      id: 6,
      title: "Genomic Sequencing Data Access",
      status: "pending",
      date: "2026-09-11",
      expiry: "2026-12-11",
      requester: "Genomics India Lab",
      purpose: "Access request for DNA variant analysis data to customize pharmacological dosage.",
      scope: ["Genomic Data"]
    }
  ]);

  // State Management
  const [activeStatus, setActiveStatus] = useState('accepted');
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('English');
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedConsent, setSelectedConsent] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toast Notification Helper
  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    userApi.consents().then((items) => setConsents(items.map((item) => ({
      ...item,
      title: item.purpose,
      date: item.requestedAt,
      expiry: item.respondedAt || 'N/A',
      scope: [item.purpose],
    })))).catch((error) => showNotification(error.message));
  }, []);

  // Status Action Handlers
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const saved = await userApi.setConsentStatus(id, newStatus);
      setConsents((previous) => previous.map((consent) => consent.id === id ? { ...consent, ...saved } : consent));
      setSelectedConsent(null);
      showNotification(`Consent status saved as ${newStatus.toUpperCase()}.`);
    } catch (error) {
      showNotification(error.message);
    }
  };

  // Filtering Logic
  const filteredConsents = consents.filter(consent => {
    const matchesStatus = activeStatus === 'all' || consent.status === activeStatus;
    const matchesSearch = consent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          consent.requester.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Category counts
  const countAccepted = consents.filter(c => c.status === 'accepted').length;
  const countPending = consents.filter(c => c.status === 'pending').length;
  const countRejected = consents.filter(c => c.status === 'rejected').length;

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

      {/* TOP NAVIGATION BAR */}
      <header className="sih-header">
        <div className="sih-header-inner">
          <div className="sih-brand" onClick={() => navigate('/dashboard')}>
            <div className="sih-logo-badge">🛡</div>
            <div>
              <h1 className="sih-brand-title">MedVault</h1>
              <p className="sih-brand-subtitle">Health Portal</p>
            </div>
          </div>

          <nav className="sih-nav-menu">
            <button onClick={() => navigate('/dashboard')} className="sih-nav-btn">
              <span className="sih-nav-icon">🏠</span> Dashboard
            </button>
            <button onClick={() => navigate('/abha')} className="sih-nav-btn">
              <span className="sih-nav-icon">🛡</span> ABHA
            </button>
            <button onClick={() => navigate('/uploadDoc')} className="sih-nav-btn">
              <span className="sih-nav-icon">📄</span> Documents
            </button>
            <button onClick={() => navigate('/basicInfo')} className="sih-nav-btn">
              <span className="sih-nav-icon">🔍</span> Basic Info
            </button>
          </nav>

          <div className="sih-header-controls">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="sih-lang-select">
              <option value="English">🌐 English</option>
              <option value="Hindi">🌐 हिंदी</option>
              <option value="Bengali">🌐 বাংলা</option>
              <option value="Tamil">🌐 தமிழ்</option>
            </select>
            <button className="sih-notif-bell">🔔<span className="sih-notif-badge">3</span></button>
            <div className="sih-profile-wrapper" ref={profileRef}>
              <button className="sih-profile-trigger" onClick={() => setProfileOpen(!profileOpen)}>
                <div className="sih-profile-avatar">RK</div>
                <span className="sih-profile-name">Rajesh Kumar</span>
                <span className={`sih-profile-chevron ${profileOpen ? 'open' : ''}`}>▾</span>
              </button>
              {profileOpen && (
                <div className="sih-profile-dropdown">
                  <button className="sih-profile-dropdown-item" onClick={() => { navigate('/profile'); setProfileOpen(false); }}>
                    <span className="dd-icon">👤</span> Profile
                  </button>
                  <button className="sih-profile-dropdown-item danger" onClick={() => setProfileOpen(false)}>
                    <span className="dd-icon">🚪</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="sih-main-layout">

        {/* CONSENTS MAIN HEADING CONTAINER */}
        <div className="sih-card" style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary-navy)', letterSpacing: '-0.02em', margin: 0 }}>Consents</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.25rem' }}>
              Manage patient data access permissions, consent requests, and authorization records.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="sih-badge sih-badge-teal">
              Active: {countAccepted}
            </span>
            <span className="sih-badge sih-badge-amber">
              Pending: {countPending}
            </span>
            <span className="sih-badge sih-badge-red">
              Rejected: {countRejected}
            </span>
          </div>
        </div>

        {/* TWO-COLUMN LAYOUT */}
        <div className="abha-grid">

          {/* LEFT PANEL: STATUS FILTERS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div className="sih-card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary-navy)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Consent Status
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                
                {/* Accepted Filter */}
                <button
                  onClick={() => setActiveStatus('accepted')}
                  className={`sih-btn ${activeStatus === 'accepted' ? 'sih-btn-primary' : 'sih-btn-outline'}`}
                  style={{ justifyContent: 'space-between', width: '100%', padding: '0.65rem 0.85rem' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                    Accepted
                  </span>
                  <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.3)', fontWeight: 900 }}>
                    {countAccepted}
                  </span>
                </button>

                {/* Rejected Filter */}
                <button
                  onClick={() => setActiveStatus('rejected')}
                  className={`sih-btn ${activeStatus === 'rejected' ? 'sih-btn-navy' : 'sih-btn-outline'}`}
                  style={{ justifyContent: 'space-between', width: '100%', padding: '0.65rem 0.85rem' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }}></span>
                    Rejected
                  </span>
                  <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.3)', fontWeight: 900 }}>
                    {countRejected}
                  </span>
                </button>

                {/* Pending Filter */}
                <button
                  onClick={() => setActiveStatus('pending')}
                  className={`sih-btn ${activeStatus === 'pending' ? 'sih-btn-primary' : 'sih-btn-outline'}`}
                  style={{ justifyContent: 'space-between', width: '100%', padding: '0.65rem 0.85rem' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }}></span>
                    Pending
                  </span>
                  <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.3)', fontWeight: 900 }}>
                    {countPending}
                  </span>
                </button>

                {/* All Consents Filter */}
                <button
                  onClick={() => setActiveStatus('all')}
                  className={`sih-btn ${activeStatus === 'all' ? 'sih-btn-navy' : 'sih-btn-outline'}`}
                  style={{ justifyContent: 'space-between', width: '100%', padding: '0.65rem 0.85rem' }}
                >
                  <span>All Records</span>
                  <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.3)', fontWeight: 900 }}>
                    {consents.length}
                  </span>
                </button>

              </div>
            </div>

            {/* Quick Info Box */}
            <div style={{ backgroundColor: '#EAF3FF', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(18, 48, 74, 0.1)', fontSize: '0.75rem', color: 'var(--primary-navy)' }}>
              <p style={{ fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>🔒</span> ABDM Consent Architecture
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem', lineHeight: '1.4' }}>
                Patient consent records are signed and verified according to Ayushman Bharat Digital Mission (ABDM) data privacy guidelines.
              </p>
            </div>

          </div>

          {/* RIGHT PANEL: CONSENT RECORDS */}
          <div className="sih-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Panel Sub-header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--primary-navy)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--teal-primary)' }}></span>
                Consent Records ({filteredConsents.length})
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Showing: <strong style={{ color: 'var(--primary-navy)', textTransform: 'uppercase' }}>{activeStatus}</strong>
              </span>
            </div>

            {/* CONSENT RECORDS LIST */}
            {filteredConsents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredConsents.map((consent) => (
                  <div
                    key={consent.id}
                    style={{ backgroundColor: 'var(--mint-bg)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                            {consent.title}
                          </h4>

                          <span className={`sih-badge ${
                            consent.status === 'accepted'
                              ? 'sih-badge-teal'
                              : consent.status === 'pending'
                              ? 'sih-badge-amber'
                              : 'sih-badge-red'
                          }`}>
                            ● {consent.status}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem', margin: 0 }}>
                          Requested by: <strong style={{ color: 'var(--primary-navy)' }}>{consent.requester}</strong>
                        </p>
                      </div>

                      <div style={{ textAlign: 'right', fontSize: '0.7rem' }}>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Requested: {formatDate(consent.date)}</p>
                        <p style={{ color: 'var(--primary-navy)', fontWeight: 700, margin: 0 }}>Expiry: {formatDate(consent.expiry)}</p>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.75rem', color: 'var(--text-main)', backgroundColor: 'white', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', margin: 0 }}>
                      {consent.purpose}
                    </p>

                    {/* Scope & Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.25rem' }}>
                      <div className="scope-pills-wrap">
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', alignSelf: 'center' }}>Scope:</span>
                        {consent.scope.map((scp, idx) => (
                          <span key={idx} className="scope-pill-tag">
                            {scp}
                          </span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={() => setSelectedConsent(consent)}
                          className="sih-btn sih-btn-navy"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                        >
                          Details
                        </button>

                        {consent.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(consent.id, 'accepted')}
                              className="sih-btn sih-btn-primary"
                              style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(consent.id, 'rejected')}
                              className="sih-btn sih-btn-danger"
                              style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {consent.status === 'accepted' && (
                          <button
                            onClick={() => handleUpdateStatus(consent.id, 'rejected')}
                            className="sih-btn sih-btn-outline"
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', color: '#EF4444' }}
                          >
                            Revoke Access
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              /* EMPTY STATE */
              <div style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: 'var(--mint-bg)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '2.5rem' }}>🔐</div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.5rem' }}>No Consent Records Found</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  No patient consent entries match the selected status <strong style={{ textTransform: 'uppercase' }}>"{activeStatus}"</strong>.
                </p>
                <button
                  onClick={() => { setActiveStatus('all'); setSearchQuery(''); }}
                  className="sih-btn sih-btn-primary"
                  style={{ marginTop: '1rem', padding: '0.4rem 1rem', fontSize: '0.75rem' }}
                >
                  View All Consents
                </button>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* CONSENT DETAILS MODAL */}
      {selectedConsent && (
        <div className="sih-modal-backdrop">
          <div className="sih-modal-card">
            
            <div className="sih-modal-header">
              <div>
                <span className="sih-badge sih-badge-teal">
                  {selectedConsent.status}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0.25rem 0 0 0' }}>{selectedConsent.title}</h3>
              </div>
              <button
                onClick={() => setSelectedConsent(null)}
                style={{ color: 'white', fontWeight: 900, fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div className="sih-modal-body">
              <div style={{ backgroundColor: 'var(--mint-bg)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                <div>
                  <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Requester / Organization</p>
                  <p style={{ fontWeight: 800, color: 'var(--primary-navy)', fontSize: '0.9rem', margin: '0.1rem 0 0 0' }}>{selectedConsent.requester}</p>
                </div>

                <div>
                  <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Detailed Purpose</p>
                  <p style={{ color: 'var(--text-main)', marginTop: '0.1rem', margin: 0 }}>{selectedConsent.purpose}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)' }}>
                  <div>
                    <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Granted Date</p>
                    <p style={{ fontWeight: 700, color: 'var(--primary-navy)', margin: 0 }}>{formatDate(selectedConsent.date)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Expiration Date</p>
                    <p style={{ fontWeight: 700, color: 'var(--primary-navy)', margin: 0 }}>{formatDate(selectedConsent.expiry)}</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.5rem' }}>
                {selectedConsent.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(selectedConsent.id, 'accepted')}
                      className="sih-btn sih-btn-primary"
                    >
                      Grant Consent
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedConsent.id, 'rejected')}
                      className="sih-btn sih-btn-danger"
                    >
                      Reject Consent
                    </button>
                  </>
                )}
                {selectedConsent.status === 'accepted' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedConsent.id, 'rejected')}
                    className="sih-btn sih-btn-danger"
                  >
                    Revoke Consent
                  </button>
                )}
                <button
                  onClick={() => setSelectedConsent(null)}
                  className="sih-btn sih-btn-outline"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
