import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../userPages.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('English');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const patientName = 'Rajesh Kumar';
  const initials = patientName.split(' ').map(n => n[0]).join('');

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Quick stats data
  const stats = [
    { icon: '📅', number: '3', label: 'Upcoming Appointments', colorClass: 'teal' },
    { icon: '🔒', number: '2', label: 'Pending Consents', colorClass: 'amber' },
    { icon: '📁', number: '8', label: 'Active Documents', colorClass: 'navy' },
    { icon: '💊', number: '2', label: 'Active Medications', colorClass: 'rose' }
  ];

  // Quick action cards
  const actions = [
    {
      icon: '📋',
      title: 'Basic Information',
      desc: 'View and edit your demographics, medical history, vitals, and current medications.',
      route: '/basicInfo',
      accent: 'accent-teal',
      iconBg: 'bg-teal'
    },
    {
      icon: '📁',
      title: 'Upload Documents',
      desc: 'Upload medical records, lab reports, prescriptions, and imaging documents securely.',
      route: '/uploadDoc',
      accent: 'accent-navy',
      iconBg: 'bg-navy'
    },
    {
      icon: '🔒',
      title: 'Consent Management',
      desc: 'Manage your data sharing consent requests from hospitals and healthcare providers.',
      route: '/consent',
      accent: 'accent-amber',
      iconBg: 'bg-amber'
    },
    {
      icon: '🪪',
      title: 'ABHA Health ID',
      desc: 'View your official ABHA card, QR code, and health ID verification status.',
      route: '/abha',
      accent: 'accent-rose',
      iconBg: 'bg-rose'
    },
    {
      icon: '👤',
      title: 'Patient Profile',
      desc: 'Access your complete profile, emergency contacts, insurance, and registration details.',
      route: '/profile',
      accent: 'accent-violet',
      iconBg: 'bg-violet'
    },
    {
      icon: '🤖',
      title: 'AI Health Assistant',
      desc: 'Chat with our GenAI assistant for health queries, symptom checks, and medical guidance.',
      route: '/genai',
      accent: 'accent-emerald',
      iconBg: 'bg-emerald'
    }
  ];

  // Recent activity
  const recentActivity = [
    { title: 'General Checkup Completed', meta: 'Dr. A. Verma • 5 Sep 2024', active: true },
    { title: 'Lab Report Uploaded', meta: 'HbA1c Report • 12 Aug 2024', active: false },
    { title: 'Consent Granted to AIIMS Delhi', meta: 'Clinical Records • 1 Aug 2024', active: false },
    { title: 'ABHA ID Verified via Aadhaar', meta: 'NHA Verification • 15 Jul 2024', active: false }
  ];

  // Vitals snapshot
  const vitals = [
    { label: 'Blood Pressure', value: '130/85', unit: 'mmHg', accent: 'accent-red' },
    { label: 'Heart Rate', value: '72', unit: 'bpm', accent: 'accent-blue' },
    { label: 'SpO2', value: '98', unit: '%', accent: 'accent-green' },
    { label: 'Temperature', value: '98.4', unit: '°F', accent: 'accent-amber' },
    { label: 'Glucose', value: '118', unit: 'mg/dL', accent: 'accent-purple' }
  ];

  // Notifications
  const notifications = [
    { icon: '⚠️', type: 'warn', text: 'Consent request from Max Hospital pending your approval.', time: '2 hours ago' },
    { icon: '🔴', type: 'danger', text: 'Penicillin Allergy Alert — Ensure all providers are notified.', time: '1 day ago' },
    { icon: 'ℹ️', type: 'info', text: 'Appointment with Dr. Verma scheduled for 20 Sep 2024.', time: '3 days ago' },
    { icon: '✅', type: 'success', text: 'Annual Health Assessment report is now available for download.', time: '1 week ago' }
  ];

  return (
    <div className="sih-page-wrapper">

      {/* ===== HEADER ===== */}
      <header className="sih-header">
        <div className="sih-header-inner">

          {/* Logo — click to go to dashboard */}
          <div className="sih-brand" onClick={() => navigate('/dashboard')}>
            <div className="sih-logo-badge">🛡</div>
            <div>
              <h1 className="sih-brand-title">MedVault</h1>
              <p className="sih-brand-subtitle">Health Portal</p>
            </div>
          </div>

          {/* Nav Pills */}
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

          {/* Right Controls */}
          <div className="sih-header-controls">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="sih-lang-select"
            >
              <option value="English">🌐 English</option>
              <option value="Hindi">🌐 हिंदी</option>
              <option value="Bengali">🌐 বাংলা</option>
              <option value="Tamil">🌐 தமிழ்</option>
            </select>

            {/* Notification Bell */}
            <button className="sih-notif-bell">
              🔔
              <span className="sih-notif-badge">3</span>
            </button>

            {/* Profile Dropdown */}
            <div className="sih-profile-wrapper" ref={profileRef}>
              <button
                className="sih-profile-trigger"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="sih-profile-avatar">{initials}</div>
                <span className="sih-profile-name">{patientName}</span>
                <span className={`sih-profile-chevron ${profileOpen ? 'open' : ''}`}>▾</span>
              </button>

              {profileOpen && (
                <div className="sih-profile-dropdown">
                  <button className="sih-profile-dropdown-item" onClick={() => { navigate('/profile'); setProfileOpen(false); }}>
                    <span className="dd-icon">👤</span> Profile
                  </button>
                  <button className="sih-profile-dropdown-item danger" onClick={() => { setProfileOpen(false); }}>
                    <span className="dd-icon">🚪</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="sih-main-layout">

        {/* --- HERO SECTION --- */}
        <section className="landing-hero landing-animate">
          <div className="landing-hero-content">
            <div className="landing-hero-left">
              <div className="landing-hero-avatar">{initials}</div>
              <div>
                <p className="landing-hero-greeting" style={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em', fontWeight: 700 }}>My Health Dashboard</p>
                <h2 className="landing-hero-name">{getGreeting()}, {patientName} 👋</h2>
                <p className="landing-hero-subtitle">
                  ABHA: 91-8472-1029-4821 • Male • 32 Years • Blood Group: O+
                </p>
              </div>
            </div>
            <div className="landing-hero-date-badge">
              <span>📅</span>
              <span>{formatDate()} • Last synced 3 min ago</span>
            </div>
          </div>
        </section>

        {/* --- STATS ROW (Glassmorphism) --- */}
        <div className="landing-stats-row">
          {stats.map((stat, i) => (
            <div key={i} className={`landing-stat-card landing-animate landing-animate-delay-${i + 1}`}>
              <div className={`landing-stat-icon ${stat.colorClass}`}>
                {stat.icon}
              </div>
              <div>
                <div className="landing-stat-number">{stat.number}</div>
                <div className="landing-stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* --- QUICK ACTIONS --- */}
        <div style={{ marginTop: '2.5rem' }}>
          <h2 className="landing-section-title">
            <span>⚡</span> Quick Actions
          </h2>
          <div className="landing-actions-grid">
            {actions.map((action, i) => (
              <div
                key={i}
                className={`landing-action-card ${action.accent} landing-animate landing-animate-delay-${i + 1}`}
                onClick={() => navigate(action.route)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(action.route)}
                id={`action-card-${action.route.replace('/', '')}`}
              >
                <div className={`landing-action-icon ${action.iconBg}`}>
                  {action.icon}
                </div>
                <h3 className="landing-action-title">{action.title}</h3>
                <p className="landing-action-desc">{action.desc}</p>
                <span className="landing-action-arrow">
                  Open Module <span>→</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* --- HEALTH OVERVIEW ROW --- */}
        <div style={{ marginTop: '2.5rem' }}>
          <h2 className="landing-section-title">
            <span>🏥</span> Health Overview
          </h2>
          <div className="landing-health-row">

            {/* Recent Activity */}
            <div className="landing-health-card landing-animate landing-animate-delay-1">
              <div className="landing-health-card-header">
                <h3>📊 Recent Activity</h3>
                <button
                  className="sih-btn sih-btn-outline"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem' }}
                  onClick={() => navigate('/profile')}
                >
                  View All
                </button>
              </div>
              <div className="landing-health-card-body">
                <div className="landing-timeline">
                  {recentActivity.map((item, i) => (
                    <div key={i} className="landing-timeline-item">
                      <div className={`landing-timeline-dot ${item.active ? 'active' : ''}`} />
                      <div className="landing-timeline-content">
                        <p className="landing-timeline-title">{item.title}</p>
                        <p className="landing-timeline-meta">{item.meta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Vitals Snapshot */}
            <div className="landing-health-card landing-animate landing-animate-delay-2">
              <div className="landing-health-card-header">
                <h3>💓 Vitals Snapshot</h3>
                <button
                  className="sih-btn sih-btn-outline"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem' }}
                  onClick={() => navigate('/basicInfo')}
                >
                  Full Details
                </button>
              </div>
              <div className="landing-health-card-body">
                <div className="landing-vitals-grid">
                  {vitals.map((vital, i) => (
                    <div key={i} className={`landing-vital-item ${vital.accent}`}>
                      <p className="landing-vital-label">{vital.label}</p>
                      <p className="landing-vital-value">
                        {vital.value}
                        <span className="landing-vital-unit">{vital.unit}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* --- NOTIFICATIONS PANEL --- */}
        <div style={{ marginTop: '2.5rem' }}>
          <div className="landing-notifications landing-animate landing-animate-delay-3">
            <div className="landing-notifications-header">
              <h3>
                <span>🔔</span> Alerts & Notifications
                <span className="landing-notif-count">{notifications.length}</span>
              </h3>
              <button
                className="sih-btn sih-btn-outline"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem', borderColor: '#FECDD3' }}
              >
                Mark All Read
              </button>
            </div>
            <div className="landing-notif-list">
              {notifications.map((notif, i) => (
                <div key={i} className="landing-notif-item">
                  <div className={`landing-notif-icon ${notif.type}`}>
                    {notif.icon}
                  </div>
                  <div>
                    <p className="landing-notif-text">{notif.text}</p>
                    <p className="landing-notif-time">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div style={{ marginTop: '2.5rem' }}>
          <div className="landing-footer landing-animate landing-animate-delay-4">
            <p className="landing-footer-text">
              © 2026 MedVault Health Portal • ABDM Compliant • Powered by NHA
            </p>
            <div className="landing-footer-links">
              <button className="landing-footer-link" onClick={() => navigate('/profile')}>My Profile</button>
              <button className="landing-footer-link" onClick={() => navigate('/consent')}>Privacy & Consent</button>
              <button className="landing-footer-link" onClick={() => navigate('/genai')}>AI Assistant</button>
              <button className="landing-footer-link" onClick={() => navigate('/abha')}>ABHA Portal</button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
