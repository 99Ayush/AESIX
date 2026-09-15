import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../userPages.css';
import { userApi } from '../services/userApi';
import { onDatabaseChange } from '../services/realtime';
import PatientSidebar from '../components/asidebar'
import ChatbotFAB from '../components/ChatbotFAB';
import { Pencil } from "lucide-react";
// Formatting Utilities
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  } catch (e) {
    return dateString;
  }
};

const formatPhone = (phone) => {
  if (!phone) return 'N/A';
  const cleaned = ('' + phone).replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

export default function BasicInfo() {
  const navigate = useNavigate();

  const emptyPatient = {
    id: '', abhaId: '', name: '', age: '', gender: '', dob: '', bloodGroup: '', maritalStatus: '', occupation: '', primaryLanguage: '', photo: null,
    contact: { phone: '', email: '', address: '', emergencyContactName: '', emergencyContactRelation: '', emergencyContactPhone: '' },
    medications: [], allergies: [], conditions: [], criticalAlerts: [], recentCheckups: [],
    vitalsSnapshot: { bp: '', heartRate: '', spo2: '', temp: '', glucose: '' },
  };
  const [patient, setPatient] = useState(emptyPatient);

  // UI State
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'medications' | 'checkups'
  const [language, setLanguage] = useState('English');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
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

  // Form State for Edit Mode
  const [formData, setFormData] = useState({ ...patient });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '', timing: '' });
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');


  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const normalizePatient = (data) => ({
    ...emptyPatient,
    ...data,
    contact: { ...emptyPatient.contact, ...(data?.contact || {}) },
    vitalsSnapshot: { ...emptyPatient.vitalsSnapshot, ...(data?.vitalsSnapshot || {}) },
    medications: Array.isArray(data?.medications) ? data.medications : [],
    allergies: Array.isArray(data?.allergies) ? data.allergies : [],
    conditions: Array.isArray(data?.conditions) ? data.conditions : [],
    criticalAlerts: Array.isArray(data?.criticalAlerts) ? data.criticalAlerts : [],
    recentCheckups: Array.isArray(data?.recentCheckups) ? data.recentCheckups : [],
  });

  useEffect(() => {
    const fetchProfile = () => {
      const storedProfile = JSON.parse(localStorage.getItem('user_profile') || '{}');
      const profilePromise = storedProfile.id ? userApi.getUserById(storedProfile.id) : userApi.profile();
      Promise.all([profilePromise, userApi.abha().catch(() => ({}))]).then(([profile, abha]) => {
        const mappedData = {
          id: profile.id || storedProfile.id || storedProfile.userId || 'N/A',
          abhaId: abha.number || profile.abhaNumber || profile.ABHANumber || storedProfile.abhaNumber || storedProfile.ABHANumber || 'N/A',
          name: profile.fullName || (profile.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : profile.name) || storedProfile.fullName || (storedProfile.firstName ? `${storedProfile.firstName} ${storedProfile.lastName || ''}`.trim() : '') || 'User',
          age: profile.dateOfBirth ? Math.floor((new Date() - new Date(profile.dateOfBirth)) / 31557600000) : (profile.dob ? Math.floor((new Date() - new Date(profile.dob)) / 31557600000) : (storedProfile.dob ? Math.floor((new Date() - new Date(storedProfile.dob)) / 31557600000) : 'N/A')),
          gender: profile.gender === 'M' ? 'Male' : (profile.gender === 'F' ? 'Female' : (profile.gender || storedProfile.gender || 'N/A')),
          dob: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : (profile.dob || storedProfile.dob || ''),
          bloodGroup: profile.bloodGroup || storedProfile.bloodGroup || 'N/A',
          maritalStatus: profile.maritalStatus || storedProfile.maritalStatus || 'N/A',
          occupation: profile.occupation || storedProfile.occupation || 'N/A',
          primaryLanguage: profile.primaryLanguage || storedProfile.primaryLanguage || 'English',
          photoUrl: profile.photoUrl || profile.photo || storedProfile.photoUrl || null,
          contact: {
            phone: profile.phone || profile.mobile || profile.contact?.phone || storedProfile.mobile || storedProfile.phone || '',
            email: profile.email || profile.contact?.email || storedProfile.email || '',
            address: profile.address || profile.contact?.address || storedProfile.city || storedProfile.address || 'N/A',
            emergencyContactName: profile.contact?.emergencyContactName || profile.emergencyContactName || storedProfile.emergencyContactName || '',
            emergencyContactRelation: profile.contact?.emergencyContactRelation || profile.emergencyContactRelation || storedProfile.emergencyContactRelation || '',
            emergencyContactPhone: profile.contact?.emergencyContactPhone || profile.emergencyContactPhone || storedProfile.emergencyContactPhone || '',
          },
          medications: Array.isArray(profile.medications) ? profile.medications : [],
          allergies: Array.isArray(profile.allergies) ? profile.allergies : [],
          conditions: Array.isArray(profile.conditions) ? profile.conditions : [],
          criticalAlerts: Array.isArray(profile.criticalAlerts) ? profile.criticalAlerts : [],
          recentCheckups: Array.isArray(profile.recentCheckups) ? profile.recentCheckups : [],
          vitalsSnapshot: profile.vitalsSnapshot || { bp: 'N/A', heartRate: 'N/A', spo2: 'N/A', temp: 'N/A', glucose: 'N/A' },
        };
        const normalized = normalizePatient(mappedData);
        setPatient(normalized);
        setFormData((prev) => (isEditing ? prev : normalized));
      }).catch((error) => showNotification(error.message));
    };

    fetchProfile();
    return onDatabaseChange(fetchProfile);
  }, [isEditing]);

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleContactChange = (field, val) => {
    setFormData(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: val }
    }));
  };

  const handleAddMedication = () => {
    if (!newMed.name.trim()) return;
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { ...newMed, id: Date.now() }]
    }));
    setNewMed({ name: '', dosage: '', frequency: '', timing: '' });
  };

  const handleRemoveMedication = (id) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter(m => m.id !== id)
    }));
  };

  const handleAddAllergy = () => {
    if (!newAllergy.trim()) return;
    setFormData(prev => ({
      ...prev,
      allergies: [...prev.allergies, newAllergy.trim()]
    }));
    setNewAllergy('');
  };

  const handleRemoveAllergy = (index) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const handleAddCondition = () => {
    if (!newCondition.trim()) return;
    setFormData(prev => ({
      ...prev,
      conditions: [...prev.conditions, newCondition.trim()]
    }));
    setNewCondition('');
  };

  const handleRemoveCondition = (index) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      let payload;
      if (photoFile) {
        payload = new FormData();
        payload.append('photo', photoFile);
        Object.keys(formData).forEach(key => {
          if (key === 'contact') {
            Object.keys(formData.contact).forEach(ckey => {
              payload.append(`contact[${ckey}]`, formData.contact[ckey]);
            });
          } else if (typeof formData[key] === 'object' && formData[key] !== null) {
            payload.append(key, JSON.stringify(formData[key]));
          } else if (formData[key] !== undefined && formData[key] !== null) {
            payload.append(key, formData[key]);
          }
        });
      } else {
        payload = formData;
      }

      const saved = await userApi.saveProfile(payload);
      const normalized = normalizePatient({ ...saved, photoUrl: saved.photoUrl || photoPreview || patient.photoUrl });
      setPatient(normalized);
      setFormData(normalized);
      setPhotoFile(null);
      setPhotoPreview(null);
      setIsEditing(false);

      const storedProfile = JSON.parse(localStorage.getItem('user_profile') || '{}');
      const updatedStored = {
        ...storedProfile,
        fullName: normalized.name,
        name: normalized.name,
        phone: normalized.contact.phone,
        mobile: normalized.contact.phone,
        email: normalized.contact.email,
        address: normalized.contact.address,
        city: normalized.contact.address,
        gender: normalized.gender,
        dateOfBirth: normalized.dob,
        dob: normalized.dob,
        bloodGroup: normalized.bloodGroup,
        emergencyContactName: normalized.contact.emergencyContactName,
        emergencyContactRelation: normalized.contact.emergencyContactRelation,
        emergencyContactPhone: normalized.contact.emergencyContactPhone,
        photoUrl: normalized.photoUrl,
      };
      localStorage.setItem('user_profile', JSON.stringify(updatedStored));

      showNotification('Patient basic information & profile picture saved successfully.');
    } catch (error) {
      showNotification(error.message);
    }
  };

  const handleCancel = () => {
    setFormData({ ...patient });
    setPhotoFile(null);
    setPhotoPreview(null);
    setIsEditing(false);
  };


  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="sih-page-wrapper">

      {/* Toast Alert */}
      {toastMessage && (
        <div className="sih-toast">
          <svg className="sih-toast-icon" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
          </svg>
          <span className="sih-toast-text">{toastMessage}</span>
        </div>
      )}

      {/* TOP NAVBAR */}
      <header className="sih-header">
        <div className="sih-header-inner">
          <div className="sih-brand" onClick={() => navigate('/dashboard')}>
            <div className="sih-logo-badge">🛡</div>
            <div>
              <h1 className="sih-brand-title">MedVault</h1>
              <p className="sih-brand-subtitle">Health Portal</p>
            </div>
          </div>


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
                <div className="sih-profile-avatar" style={{ overflow: 'hidden', padding: 0 }}>
                  {(photoPreview || patient.photoUrl) ? (
                    <img src={photoPreview || patient.photoUrl} alt="DP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (patient.name || 'RK').split(' ').filter(Boolean).map(n => n[0]).join('')
                  )}
                </div>
                <span className="sih-profile-name">{patient.name || 'Profile'}</span>
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

      <div className="patient-main-container">
        <PatientSidebar profile={patient} patientName={patient.name} activePage="basicInfo" />
        <div className="patient-content-area">
          <div style={{ backgroundColor: 'white', borderBottom: '1px solid var(--border-light)', padding: '0.75rem 1.5rem' }}>
            <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span className="sih-badge sih-badge-teal">
                  Patient Record # {patient.id}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  ABHA ID: <strong style={{ color: 'var(--primary-navy)' }}>{patient.abhaId}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="sih-btn sih-btn-primary"
                    >
                       <Pencil size={18} /> Edit Profile
                    </button>

                    <button
                      onClick={handlePrint}
                      className="sih-btn sih-btn-outline"
                    >
                      🖨️ Print Summary
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="sih-btn sih-btn-primary"
                    >
                      💾 Save Changes
                    </button>

                    <button
                      onClick={handleCancel}
                      className="sih-btn sih-btn-outline"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>

            </div>
          </div>

          {/* MAIN CONTAINER */}
          <main className="sih-main-layout">
            <div className="abha-grid" style={{ gridTemplateColumns: '4fr 5fr 3fr' }}>

              {/* LEFT COLUMN: Patient Photo & Card */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Profile Card */}
                <div className="sih-card">
                  <div style={{ background: 'linear-gradient(135deg, var(--primary-navy), var(--teal-primary))', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <span className="sih-badge sih-badge-teal">
                      Active Patient
                    </span>
                  </div>

                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ marginTop: '-2.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                      <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: 'var(--radius-md)', backgroundColor: '#EAF3FF', border: '3px solid white', boxShadow: 'var(--shadow-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900, color: 'var(--primary-navy)' }}>
                        {(photoPreview || patient.photoUrl) ? (
                          <img src={photoPreview || patient.photoUrl} alt="Profile DP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          (patient.name || 'RK').split(' ').filter(Boolean).map(n => n[0]).join('')
                        )}
                        {isEditing && (
                          <label htmlFor="avatar-file-input" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}>
                            📷 Change DP
                          </label>
                        )}
                      </div>
                      {isEditing && (
                        <input
                          id="avatar-file-input"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setPhotoFile(file);
                              setPhotoPreview(URL.createObjectURL(file));
                            }
                          }}
                          style={{ display: 'none' }}
                        />
                      )}

                      <div className="sih-badge sih-badge-teal">
                        Blood Group: {isEditing ? (
                          <select
                            value={formData.bloodGroup}
                            onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                            className="sih-select"
                            style={{ padding: '0.1rem', fontSize: '0.7rem', width: 'auto', marginLeft: '0.2rem' }}
                          >
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                          </select>
                        ) : patient.bloodGroup}
                      </div>
                    </div>

                    {!isEditing ? (
                      <div>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--primary-navy)', margin: 0 }}>{patient.name}</h2>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.25rem' }}>
                          {patient.age} Yrs • {patient.gender} • DOB: {formatDate(patient.dob)}
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <div>
                          <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Full Name</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="sih-input"
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
                          <div>
                            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>Age</label>
                            <input
                              type="number"
                              value={formData.age}
                              onChange={(e) => handleInputChange('age', e.target.value)}
                              className="sih-input"
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>Gender</label>
                            <select
                              value={formData.gender}
                              onChange={(e) => handleInputChange('gender', e.target.value)}
                              className="sih-select"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>DOB</label>
                            <input
                              type="date"
                              value={formData.dob}
                              onChange={(e) => handleInputChange('dob', e.target.value)}
                              className="sih-input"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div style={{ borderTop: '1px solid var(--border-light)', margin: '1rem 0' }}></div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Patient ID:</span>
                        <span style={{ fontWeight: 800, fontFamily: 'monospace', color: 'var(--primary-navy)' }}>{patient.id}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>ABHA Health ID:</span>
                        <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{patient.abhaId}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Marital Status:</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{patient.maritalStatus}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Occupation:</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{patient.occupation}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Language:</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{patient.primaryLanguage}</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
                      <a
                        href={`tel:${patient.contact.phone}`}
                        className="sih-btn sih-btn-outline"
                        style={{ fontSize: '0.75rem', padding: '0.5rem' }}
                      >
                        📞 Call Patient
                      </a>
                      <a
                        href={`mailto:${patient.contact.email}`}
                        className="sih-btn sih-btn-outline"
                        style={{ fontSize: '0.75rem', padding: '0.5rem' }}
                      >
                        ✉️ Email Patient
                      </a>
                    </div>

                  </div>
                </div>

                {/* Vitals Snapshot */}
                <div className="sih-card" style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary-navy)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    Current Vitals Summary
                  </h3>

                  <div className="vitals-cards-grid">
                    <div className="vital-card-box">
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>Blood Pressure</p>
                      <p style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary-navy)', margin: '0.2rem 0 0 0' }}>{patient.vitalsSnapshot.bp}</p>
                    </div>

                    <div className="vital-card-box" style={{ borderLeftColor: '#3B82F6' }}>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>Heart Rate</p>
                      <p style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary-navy)', margin: '0.2rem 0 0 0' }}>{patient.vitalsSnapshot.heartRate}</p>
                    </div>

                    <div className="vital-card-box" style={{ borderLeftColor: '#8B5CF6' }}>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>Blood Glucose</p>
                      <p style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary-navy)', margin: '0.2rem 0 0 0' }}>{patient.vitalsSnapshot.glucose}</p>
                    </div>

                    <div className="vital-card-box" style={{ borderLeftColor: '#EC4899' }}>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>Oxygen (SpO2)</p>
                      <p style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary-navy)', margin: '0.2rem 0 0 0' }}>{patient.vitalsSnapshot.spo2}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* CENTER COLUMN: Main Content & Tabs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Navigation Tabs */}
                <div className="sih-card" style={{ padding: '0.4rem', display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`tab-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    style={{ flex: 1, padding: '0.5rem', textAlign: 'center' }}
                  >
                    Personal & Contact
                  </button>

                  <button
                    onClick={() => setActiveTab('medications')}
                    className={`tab-nav-btn ${activeTab === 'medications' ? 'active' : ''}`}
                    style={{ flex: 1, padding: '0.5rem', textAlign: 'center' }}
                  >
                    Medications & Allergies
                  </button>

                  <button
                    onClick={() => setActiveTab('checkups')}
                    className={`tab-nav-btn ${activeTab === 'checkups' ? 'active' : ''}`}
                    style={{ flex: 1, padding: '0.5rem', textAlign: 'center' }}
                  >
                    Checkup History
                  </button>
                </div>

                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="sih-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Contact Section */}
                    <div>
                      <h3 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--primary-navy)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                        Contact Details
                      </h3>

                      {!isEditing ? (
                        <div style={{ backgroundColor: 'var(--mint-bg)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                              <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Phone Number</p>
                              <p style={{ fontWeight: 800, color: 'var(--primary-navy)', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>{formatPhone(patient.contact.phone)}</p>
                            </div>

                            <div>
                              <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Email Address</p>
                              <p style={{ fontWeight: 800, color: 'var(--primary-navy)', fontSize: '0.9rem', margin: '0.2rem 0 0 0', wordBreak: 'break-all' }}>{patient.contact.email}</p>
                            </div>
                          </div>

                          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Residential Address</p>
                            <p style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem', margin: 0 }}>{patient.contact.address}</p>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div>
                            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>Phone</label>
                            <input
                              type="text"
                              value={formData.contact.phone}
                              onChange={(e) => handleContactChange('phone', e.target.value)}
                              className="sih-input"
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>Email</label>
                            <input
                              type="email"
                              value={formData.contact.email}
                              onChange={(e) => handleContactChange('email', e.target.value)}
                              className="sih-input"
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>Address</label>
                            <textarea
                              rows={2}
                              value={formData.contact.address}
                              onChange={(e) => handleContactChange('address', e.target.value)}
                              className="sih-textarea"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Emergency Contact */}
                    <div>
                      <h3 style={{ fontSize: '0.8rem', fontWeight: 900, color: '#DC2626', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                        Emergency Contact
                      </h3>

                      {!isEditing ? (
                        <div style={{ backgroundColor: '#FEE2E2', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid #FCA5A5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <p style={{ fontWeight: 900, color: 'var(--primary-navy)', fontSize: '0.95rem', margin: 0 }}>
                              {patient.contact.emergencyContactName || 'Not Specified'}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#991B1B', fontWeight: 700, margin: '0.2rem 0 0 0' }}>
                              Relation: {patient.contact.emergencyContactRelation || 'N/A'}
                            </p>
                          </div>
                          {patient.contact.emergencyContactPhone && patient.contact.emergencyContactPhone !== 'N/A' && (
                            <a
                              href={`tel:${patient.contact.emergencyContactPhone}`}
                              className="sih-btn sih-btn-danger"
                              style={{ fontSize: '0.75rem' }}
                            >
                              📞 {formatPhone(patient.contact.emergencyContactPhone)}
                            </a>
                          )}
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                          <input
                            type="text"
                            placeholder="Contact Name"
                            value={formData.contact.emergencyContactName}
                            onChange={(e) => handleContactChange('emergencyContactName', e.target.value)}
                            className="sih-input"
                          />
                          <input
                            type="text"
                            placeholder="Relation"
                            value={formData.contact.emergencyContactRelation}
                            onChange={(e) => handleContactChange('emergencyContactRelation', e.target.value)}
                            className="sih-input"
                          />
                          <input
                            type="text"
                            placeholder="Phone"
                            value={formData.contact.emergencyContactPhone}
                            onChange={(e) => handleContactChange('emergencyContactPhone', e.target.value)}
                            className="sih-input"
                          />
                        </div>
                      )}
                    </div>

                    {/* Medical Conditions */}
                    <div>
                      <h3 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--primary-navy)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        Medical Conditions & Diagnoses
                      </h3>

                      <div className="scope-pills-wrap">
                        {(isEditing ? formData.conditions : patient.conditions).map((cond, idx) => (
                          <span key={idx} className="sih-badge sih-badge-teal" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
                            {cond}
                            {isEditing && (
                              <button onClick={() => handleRemoveCondition(idx)} style={{ color: '#EF4444', fontWeight: 900, marginLeft: '0.2rem' }}>×</button>
                            )}
                          </span>
                        ))}
                      </div>

                      {isEditing && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <input
                            type="text"
                            placeholder="Add condition..."
                            value={newCondition}
                            onChange={(e) => setNewCondition(e.target.value)}
                            className="sih-input"
                          />
                          <button onClick={handleAddCondition} className="sih-btn sih-btn-primary">Add</button>
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* TAB 2: MEDICATIONS */}
                {activeTab === 'medications' && (
                  <div className="sih-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    <div>
                      <h3 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--primary-navy)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                        Active Prescribed Medications
                      </h3>

                      <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                          <thead>
                            <tr style={{ backgroundColor: 'var(--primary-navy)', color: 'white', textAlign: 'left' }}>
                              <th style={{ padding: '0.65rem' }}>Medication</th>
                              <th style={{ padding: '0.65rem' }}>Dosage</th>
                              <th style={{ padding: '0.65rem' }}>Frequency</th>
                              <th style={{ padding: '0.65rem' }}>Timing</th>
                              {isEditing && <th style={{ padding: '0.65rem' }}>Action</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {(isEditing ? formData.medications : patient.medications).map((med) => (
                              <tr key={med.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                <td style={{ padding: '0.65rem', fontWeight: 800, color: 'var(--primary-navy)' }}>{med.name}</td>
                                <td style={{ padding: '0.65rem' }}>{med.dosage}</td>
                                <td style={{ padding: '0.65rem' }}>{med.frequency}</td>
                                <td style={{ padding: '0.65rem', color: 'var(--text-muted)' }}>{med.timing}</td>
                                {isEditing && (
                                  <td style={{ padding: '0.65rem' }}>
                                    <button onClick={() => handleRemoveMedication(med.id)} style={{ color: '#EF4444', fontWeight: 800 }}>Delete</button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {isEditing && (
                        <div style={{ backgroundColor: 'var(--mint-bg)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <p style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--primary-navy)', margin: 0 }}>Add New Medication</p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.4rem' }}>
                            <input type="text" placeholder="Name" value={newMed.name} onChange={(e) => setNewMed({ ...newMed, name: e.target.value })} className="sih-input" />
                            <input type="text" placeholder="Dosage" value={newMed.dosage} onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })} className="sih-input" />
                            <input type="text" placeholder="Frequency" value={newMed.frequency} onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })} className="sih-input" />
                            <input type="text" placeholder="Timing" value={newMed.timing} onChange={(e) => setNewMed({ ...newMed, timing: e.target.value })} className="sih-input" />
                          </div>
                          <button onClick={handleAddMedication} className="sih-btn sih-btn-primary" style={{ alignSelf: 'flex-start' }}>+ Add Medication</button>
                        </div>
                      )}
                    </div>

                    {/* Allergies */}
                    <div>
                      <h3 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--primary-navy)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        Known Allergies
                      </h3>

                      <div className="scope-pills-wrap">
                        {(isEditing ? formData.allergies : patient.allergies).map((allg, idx) => (
                          <span key={idx} className="sih-badge sih-badge-red" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
                            ⚠️ {allg}
                            {isEditing && (
                              <button onClick={() => handleRemoveAllergy(idx)} style={{ color: '#DC2626', fontWeight: 900, marginLeft: '0.3rem' }}>×</button>
                            )}
                          </span>
                        ))}
                      </div>

                      {isEditing && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <input
                            type="text"
                            placeholder="Add allergy..."
                            value={newAllergy}
                            onChange={(e) => setNewAllergy(e.target.value)}
                            className="sih-input"
                          />
                          <button onClick={handleAddAllergy} className="sih-btn sih-btn-danger">Add Allergy</button>
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* TAB 3: CHECKUP HISTORY */}
                {activeTab === 'checkups' && (
                  <div className="sih-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--primary-navy)', textTransform: 'uppercase', margin: 0 }}>
                      Recent Checkup Logs
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {patient.recentCheckups.map((ck) => (
                        <div key={ck.id} style={{ backgroundColor: 'var(--mint-bg)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 800, color: 'var(--primary-navy)', fontSize: '0.85rem' }}>{ck.type}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatDate(ck.date)}</span>
                          </div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-main)', marginTop: '0.3rem', margin: 0 }}>{ck.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* RIGHT COLUMN: Critical Alerts & Doctor Notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Critical Alerts */}
                <div className="sih-card" style={{ padding: '1.25rem', borderLeft: '4px solid #EF4444' }}>
                  <h3 style={{ fontSize: '0.75rem', fontWeight: 900, color: '#DC2626', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    Critical Clinical Alerts
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {patient.criticalAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`sih-badge ${alert.severity === 'high' ? 'sih-badge-red' : 'sih-badge-amber'}`}
                        style={{ padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-md)', display: 'block', textTransform: 'none' }}
                      >
                        <p style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', margin: 0 }}>
                          {alert.type} • {alert.severity} Severity
                        </p>
                        <p style={{ fontWeight: 700, fontSize: '0.75rem', marginTop: '0.2rem', margin: 0 }}>{alert.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Doctor Quick Actions */}
                <div className="sih-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary-navy)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Doctor Quick Actions
                  </h3>

                  <button
                    onClick={() => showNotification('Prescription generator opened.')}
                    className="sih-btn sih-btn-outline"
                    style={{ justifyContent: 'space-between', fontSize: '0.75rem' }}
                  >
                    <span>💊 Generate Rx / Order Meds</span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => showNotification('Lab test request form opened.')}
                    className="sih-btn sih-btn-outline"
                    style={{ justifyContent: 'space-between', fontSize: '0.75rem' }}
                  >
                    <span>🧪 Request Lab Investigation</span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => showNotification('Follow-up appointment scheduled.')}
                    className="sih-btn sih-btn-outline"
                    style={{ justifyContent: 'space-between', fontSize: '0.75rem' }}
                  >
                    <span>📅 Schedule Follow-up Visit</span>
                    <span>→</span>
                  </button>
                </div>

                {/* Doctor Note */}
                <div style={{ backgroundColor: 'var(--primary-navy)', color: 'white', borderRadius: 'var(--radius-xl)', padding: '1.25rem', fontSize: '0.75rem' }}>
                  <p style={{ fontWeight: 900, color: 'var(--mint-light)', fontSize: '0.85rem', margin: '0 0 0.5rem 0' }}>Doctor Note</p>
                  <p style={{ color: '#CBD5E1', lineHeight: '1.5', margin: 0 }}>
                    No clinical note has been recorded yet.
                  </p>
                </div>

                {/* Clinical Directory (Kindle) Button */}
                <button
                  onClick={() => navigate('/kindle')}
                  className="sih-btn sih-btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.25rem',
                    borderRadius: 'var(--radius-xl)',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    boxShadow: 'var(--shadow-sm)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>📖</span>
                    <span>Clinical Directory (NAMASTE / ICD-11)</span>
                  </div>
                  <span style={{ fontSize: '1rem' }}>→</span>
                </button>

              </div>

            </div>
          </main>
        </div>
      </div>

      <ChatbotFAB />
    </div>
  );
}
