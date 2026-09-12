import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../userPages.css';
import { userApi } from '../services/userApi';
import { onDatabaseChange } from '../services/realtime';

export default function LandingPage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('English');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadDashboard = () => userApi.dashboard().then(setDashboard).catch(() => setDashboard(null));
    loadDashboard();
    return onDatabaseChange(loadDashboard);
  }, []);

  const profile = dashboard?.profile;
  const patientName = profile?.name || 'Loading profile…';
  const initials = patientName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  // Patient information data
  const patientInfo = [
    { title: 'Patient ID', value: profile?.id || '—' },
    { title: 'Date of Birth', value: profile?.dob || '—' },
    { title: 'Gender', value: profile?.gender || '—' },
    { title: 'Blood Type', value: profile?.bloodGroup || '—' },
    { title: 'Contact', value: profile?.contact?.phone || '—', icon: '📞' },
    { title: 'Email', value: profile?.contact?.email || '—', icon: '✉️' },
    { title: 'Address', value: profile?.contact?.address || '—', icon: '📍' },
    { title: 'Emergency', value: profile?.contact?.emergencyContactName || '—' },
    { title: 'ABHA number', value: dashboard?.abha?.number || '—' },
    { title: 'Status', value: dashboard?.abha?.verificationStatus || '—' },
  ];

  // Known allergies
  const allergies = (profile?.allergies || []).map((text, index) => ({
    text, icon: '✦', bg: ['#FDE8EC', '#EFEAFF', '#FFF4D5'][index % 3], color: '#5278D0',
  }));

  const dictTerms = [
    { title: 'Metformin', category: 'Prescription Medication', desc: 'An oral anti-diabetic medication used to control high blood sugar levels in Type 2 Diabetes.', bg: '#F8FAFC', iconBg: '#E2E8F0', iconColor: '#0F172A', catBg: '#E2E8F0', catColor: '#1E293B' },
    { title: 'HbA1c', category: 'Lab Marker', desc: 'Measures average blood sugar levels over the past 2 to 3 months.', bg: '#F0FDF4', iconBg: '#DCFCE7', iconColor: '#166534', catBg: '#DCFCE7', catColor: '#15803D' },
    { title: 'Type 2 Diabetes', category: 'Chronic Condition', desc: 'A metabolic condition where the body does not use insulin properly.', bg: '#EFF6FF', iconBg: '#DBEAFE', iconColor: '#1E40AF', catBg: '#DBEAFE', catColor: '#1D4ED8' },
    { title: 'SpO2', category: 'Vital Measurement', desc: 'Peripheral capillary oxygen saturation level, indicating blood oxygen levels.', bg: '#FAF5FF', iconBg: '#F3E8FF', iconColor: '#6B21A8', catBg: '#F3E8FF', catColor: '#7E22CE' },
    { title: 'ABDM PHR', category: 'Health Account', desc: 'Personal Health Record address assigned under the Ayushman Bharat Digital Mission.', bg: '#FFFBEB', iconBg: '#FEF3C7', iconColor: '#92400E', catBg: '#FEF3C7', catColor: '#B45309' },
  ];

  return (
    <div className="sih-page-wrapper">

      {/* ===== HEADER ===== */}
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
            <button onClick={() => navigate('/dashboard')} className="sih-nav-btn active">
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
            <button className="sih-notif-bell">
              🔔
              <span className="sih-notif-badge">3</span>
            </button>
            <div className="sih-profile-wrapper" ref={profileRef}>
              <button className="sih-profile-trigger" onClick={() => setProfileOpen(!profileOpen)}>
                <div className="sih-profile-avatar">{initials}</div>
                <span className="sih-profile-name">{patientName}</span>
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

      {/* ===== MAIN ===== */}
      <main className="lp-main">

        {/* Heading */}
        <div className="lp-heading-row">
          <div>
            <p className="lp-label">My Health Dashboard</p>
            <h2 className="lp-welcome">Welcome back, {patientName} <span>👋</span></h2>
          </div>
          <div className="lp-date-badge">
            <span>📅</span>
            <div>
              <span style={{ fontWeight: 700 }}>Thursday, 11 September 2026</span>
              <span style={{ color: '#82999B', marginLeft: '0.5rem' }}>• Last synced 3 min ago</span>
            </div>
          </div>
        </div>

        {/* Grid: Profile + Dictionary */}
        <div className="lp-grid">

          {/* ===== PROFILE CARD ===== */}
          <section className="lp-profile-card">

            {/* Card Header */}
            <div className="lp-profile-header">
              <div>
                <p className="lp-profile-label">Patient Profile</p>
                <h3 className="lp-profile-name">{patientName}</h3>
              </div>
              <div className="lp-profile-actions">
                <span className="lp-active-badge">
                  <span className="lp-active-dot" />
                  Active Patient
                </span>
                <button className="lp-edit-btn">
                  ✏️ Edit Profile
                </button>
              </div>
            </div>

            {/* Card Body — 3 columns */}
            <div className="lp-profile-body">

              {/* Left — Photo + Allergies */}
              <div className="lp-profile-left">
                <div className="lp-photo-wrapper">
                  <div className="lp-photo-bg">
                    <div className="lp-photo-circle">{initials}</div>
                  </div>
                  <button className="lp-camera-btn">📷</button>
                </div>

                <div className="lp-allergies">
                  <h4 className="lp-allergies-title">⭐ KNOWN ALLERGIES</h4>
                  <div className="lp-allergy-tags">
                    {allergies.map((a, i) => (
                      <span key={i} className="lp-tag" style={{ backgroundColor: a.bg, color: a.color }}>
                        <span>{a.icon}</span> {a.text}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Middle — Patient Information */}
              <div className="lp-info-panel">
                <p className="lp-info-title">Patient Information</p>
                <div className="lp-info-grid">
                  {patientInfo.map((item, i) => (
                    <div key={i} className="lp-info-item">
                      <p className="lp-info-label">{item.title}</p>
                      <div className="lp-info-value">
                        {item.icon && <span className="lp-info-icon">{item.icon}</span>}
                        <span>{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Chatbot FAB */}
            <div className="lp-chatbot-fab" onClick={() => navigate('/genai')}>
              <img src="/chatbot.png" alt="AI Chatbot" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>

          </section>

          {/* ===== MEDICAL DICTIONARY ===== */}
          <aside className="lp-dictionary">
            <div className="lp-dict-header">
              <div className="lp-dict-icon-box">📖</div>
              <div>
                <h3 className="lp-dict-title">Medical Dictionary</h3>
                <p className="lp-dict-subtitle">Understand your health terms</p>
              </div>
            </div>

            <div className="lp-dict-search-wrap">
              <span className="lp-dict-search-icon">🔍</span>
              <input type="text" placeholder="Search terms..." className="lp-dict-search" />
            </div>

            <div className="lp-dict-list">
              {dictTerms.map((term, i) => (
                <div key={i} className="lp-dict-card" style={{ backgroundColor: term.bg }}>
                  <div className="lp-dict-card-icon" style={{ backgroundColor: term.iconBg, color: term.iconColor }}>
                    💊
                  </div>
                  <div className="lp-dict-card-body">
                    <div className="lp-dict-card-top">
                      <h4 className="lp-dict-card-title">{term.title}</h4>
                      <span className="lp-dict-card-arrow">›</span>
                    </div>
                    <span className="lp-dict-card-cat" style={{ backgroundColor: term.catBg, color: term.catColor }}>
                      {term.category}
                    </span>
                    <p className="lp-dict-card-desc">{term.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}
