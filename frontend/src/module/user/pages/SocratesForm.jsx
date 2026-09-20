import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../userPages.css';
import { userApi, readLocalJSON } from '../services/userApi';
import { useDashboardLanguage } from '../LanguageContext';
import PatientSidebar from '../components/asidebar';
import ChatbotFAB from '../components/ChatbotFAB';
import DoctorActivityBell from '../components/DoctorActivityBell';
import BrandLogo from '../../../shared/BrandLogo';
import SocratesVoiceControl from '../components/SocratesVoiceControl';
import {
  FileText,
  RefreshCw,
   CircleUser,
    LogOut,
  ClipboardClock,
  ClipboardList,
FilePenLine,
 Landmark, 
  Phone,
  Pencil,Bell,BookOpen,Mail,
  Pill,
  TestTube,
  Calendar,
  Search,
  Download,
  Share2,
  Eye,
 Trash2,
  Lock,
  Cloud,
  Contact,
  Files, Folder
} from "lucide-react";
const CHARACTER_OPTIONS = [
  'Sharp / Stabbing',
  'Dull / Aching',
  'Burning',
  'Throbbing / Pulsating',
  'Tightness / Pressure',
  'Cramping / Spasmodic',
  'Numbness / Tingling',
  'Other'
];

const ONSET_TYPES = [
  'Sudden (Instantaneous)',
  'Gradual (Over hours/days)',
  'Insidious (Over weeks/months)',
  'Intermittent (Occasional episodes)'
];

const COMMON_ASSOCIATIONS = [
  'Nausea / Vomiting',
  'Shortness of breath',
  'Sweating / Cold clammy skin',
  'Dizziness / Lightheadedness',
  'Fever / Chills',
  'Fatigue / Weakness',
  'Loss of appetite',
  'Heart palpitations'
];

export default function SocratesForm() {
  const navigate = useNavigate();
  const { language, setLanguage } = useDashboardLanguage();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);
  const profileRef = useRef(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'history'

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Form State
  const [site, setSite] = useState('');
  const [onset, setOnset] = useState('');
  const [onsetType, setOnsetType] = useState('');
  const [character, setCharacter] = useState([]);
  const [customCharacter, setCustomCharacter] = useState('');
  const [radiation, setRadiation] = useState('');
  const [associations, setAssociations] = useState([]);
  const [customAssociation, setCustomAssociation] = useState('');
  const [timeCourse, setTimeCourse] = useState('');
  const [exacerbatingFactors, setExacerbatingFactors] = useState('');
  const [severity, setSeverity] = useState(0);
  const [priorHistory, setPriorHistory] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // File upload state
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // History state
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Card refs & Voice state for SocratesVoiceControl
  const q1Ref = useRef(null);
  const q2Ref = useRef(null);
  const q3Ref = useRef(null);
  const q4Ref = useRef(null);
  const q5Ref = useRef(null);
  const q6Ref = useRef(null);
  const q7Ref = useRef(null);
  const q8Ref = useRef(null);
  const q9Ref = useRef(null);
  const q10Ref = useRef(null);

  const [activeVoiceId, setActiveVoiceId] = useState(null);

  const getCardText = (ref) => () => {
    if (!ref.current) return '';
    const label = ref.current.querySelector('label')?.innerText || '';
    const p = ref.current.querySelector('p')?.innerText || '';
    const optionButtons = Array.from(ref.current.querySelectorAll('button:not(.socrates-voice-btn)'))
      .map(b => b.innerText.replace(/^[✓+]\s*/, '').trim())
      .filter(Boolean);

    let text = `${label}. ${p}`;
    if (optionButtons.length > 0) {
      text += `. Available options: ${optionButtons.join(', ')}.`;
    }
    return text;
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  async function fetchHistory() {
    setIsLoadingHistory(true);
    try {
      const res = await userApi.getSocratesHistory();
      if (res.success) {
        setHistory(res.assessments || []);
      }
    } catch (err) {
      console.error('Error fetching SOCRATES history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleCharacterToggle = (opt) => {
    if (character.includes(opt)) {
      setCharacter(character.filter(item => item !== opt));
    } else {
      setCharacter([...character, opt]);
    }
  };

  const handleOnsetSelect = (type) => {
    const isSelecting = onsetType !== type;
    const newType = isSelecting ? type : '';
    setOnsetType(newType);

    setOnset(prev => {
      let rest = prev || '';
      for (const ot of ONSET_TYPES) {
        if (rest.startsWith(`${ot}: `)) {
          rest = rest.replace(`${ot}: `, '');
          break;
        } else if (rest.startsWith(`${ot}:`)) {
          rest = rest.replace(`${ot}:`, '').trim();
          break;
        }
      }
      return newType ? (rest ? `${newType}: ${rest}` : `${newType}: `) : rest;
    });
  };

  const handleAssociationToggle = (opt) => {
    if (associations.includes(opt)) {
      setAssociations(associations.filter(item => item !== opt));
    } else {
      setAssociations([...associations, opt]);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 5) {
      alert('You can upload a maximum of 5 documents.');
      return;
    }
    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!site.trim()) {
      setSubmitError('Please specify the location (Site) of your symptom.');
      return;
    }
    if (!onset.trim()) {
      setSubmitError('Please describe when and how the symptom started (Onset).');
      return;
    }
    if (character.length === 0 && !customCharacter.trim()) {
      setSubmitError('Please select or specify at least one Character description.');
      return;
    }
    if (!timeCourse.trim()) {
      setSubmitError('Please describe the Time Course / duration of your symptom.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      const storedUser = readLocalJSON('user_profile', {});
      if (storedUser?.userId || storedUser?.id || storedUser?._id) {
        formData.append('userId', storedUser.userId || storedUser.id || storedUser._id);
      }
      if (storedUser?.abhaNumber || storedUser?.abhaId) {
        formData.append('patientAbha', storedUser.abhaNumber || storedUser.abhaId);
      }
      formData.append('site', site.trim());
      formData.append('onset', `${onsetType}: ${onset.trim()}`);
      
      const charStr = [...character, customCharacter.trim()].filter(Boolean).join(', ');
      formData.append('character', charStr);
      
      formData.append('radiation', radiation.trim());
      
      const assocStr = [...associations, customAssociation.trim()].filter(Boolean).join(', ');
      formData.append('associations', assocStr);
      
      formData.append('timeCourse', timeCourse.trim());
      formData.append('exacerbatingFactors', exacerbatingFactors.trim());
      formData.append('severity', severity);
      formData.append('priorHistory', priorHistory.trim());
      formData.append('additionalNotes', additionalNotes.trim());

      files.forEach(file => {
        formData.append('documents', file);
      });

      const res = await userApi.submitSocratesForm(formData);
      if (res.success) {
        setSubmitSuccess('✅ Your SOCRATES assessment & medical documents have been submitted to Cloudinary & saved for doctor review!');
        // Reset form
        setSite('');
        setOnset('');
        setOnsetType('');
        setCharacter([]);
        setCustomCharacter('');
        setRadiation('');
        setAssociations([]);
        setCustomAssociation('');
        setTimeCourse('');
        setExacerbatingFactors('');
        setSeverity(0);
        setPriorHistory('');
        setAdditionalNotes('');
        setFiles([]);
        
        setTimeout(() => {
          setActiveTab('history');
          fetchHistory();
        }, 1500);
      } else {
        setSubmitError(res.error || 'Failed to submit form');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitError(err.message || 'An unexpected error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityColor = (val) => {
    if (val === 0) return '#94A3B8'; // Slate gray for 0/None
    if (val <= 3) return '#10B981'; // Green
    if (val <= 6) return '#F59E0B'; // Amber
    if (val <= 8) return '#EF4444'; // Red
    return '#8B5CF6'; // Purple / Severe
  };

  return (
    <div className="sih-page-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--mint-bg)' }}>
      {/* Header Bar */}
      <header className="sih-header">
        <div className="sih-header-inner">
          <BrandLogo subtitle="SOCRATES Symptom Engine" />

          <div className="sih-header-controls">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="sih-lang-select" data-no-translate translate="no">
              <option value="English">🌐 English</option>
              <option value="Hindi">🌐 हिंदी</option>
              <option value="Bengali">🌐 বাংলা</option>
              <option value="Tamil">🌐 தமிழ்</option>
            </select>
            <DoctorActivityBell />
            <div className="sih-profile-wrapper" ref={profileRef}>
              <button className="sih-profile-trigger" onClick={() => setProfileOpen(!profileOpen)}>
                <div className="sih-profile-avatar">
                  {(() => {
                    const storedUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
                    const pName = storedUser.fullName || (storedUser.firstName ? `${storedUser.firstName} ${storedUser.lastName || ''}`.trim() : '');
                    return (pName && pName !== "Patient" ? pName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "PT");
                  })()}
                </div>
                <span className="sih-profile-name">
                  {(() => {
                    const storedUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
                    const fullName = storedUser.fullName || (storedUser.firstName ? `${storedUser.firstName} ${storedUser.lastName || ''}`.trim() : '');
                    return fullName ? fullName.split(' ')[0] : 'Profile';
                  })()}
                </span>
                <span className={`sih-profile-chevron ${profileOpen ? 'open' : ''}`}>▾</span>
              </button>
              {profileOpen && (
                <div className="sih-profile-dropdown">
                  <button className="sih-profile-dropdown-item" onClick={() => { navigate('/profile'); setProfileOpen(false); }}>
                    <span className="dd-icon"><CircleUser /></span> Profile
                  </button>
                  <button className="sih-profile-dropdown-item danger" onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user_profile');
                    navigate('/login');
                  }}>
                    <span className="dd-icon"><LogOut /></span> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="patient-main-container">
        <PatientSidebar activePage="socrates" />
        <div className="patient-content-area">

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        
        {activeTab === 'new' ? (
          <div>
            {/* Banner Header */}
            <div className="sih-card" style={{ padding: '1.8rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #0C9A9A 0%, #086F6F 100%)', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
                  <span>⚕</span>
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#fff' }}>SOCRATES Clinical Intake Form</h2>
                  <p style={{ margin: '0.4rem 0 0 0', opacity: 0.9, fontSize: '0.9rem', lineHeight: '1.4' }}>
                    Provide structured details about your symptoms using the 10-point SOCRATES framework so your doctor can perform an accurate clinical evaluation.
                  </p>
                </div>
              </div>
            </div>

            {submitSuccess && (
              <div className="sih-card" style={{ padding: '1.2rem', marginBottom: '1.5rem', background: '#D1FAE5', borderLeft: '5px solid #10B981', color: '#065F46', fontWeight: 600 }}>
                {submitSuccess}
              </div>
            )}

            {submitError && (
              <div className="sih-card" style={{ padding: '1.2rem', marginBottom: '1.5rem', background: '#FEE2E2', borderLeft: '5px solid #EF4444', color: '#991B1B', fontWeight: 600 }}>
                ⚠️ {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Question 1: SITE */}
              <div className="sih-card" ref={q1Ref} style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.4rem' }}>
                  <label style={{ fontWeight: 800, color: 'var(--primary-navy)', fontSize: '1.05rem', margin: 0, flex: 1 }}>
                    1. Site (S) — Where is the pain / symptom located? <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <SocratesVoiceControl
                    questionId="q1"
                    getQuestionText={getCardText(q1Ref)}
                    value={site}
                    onValueChange={(val) => setSite(val)}
                    activeVoiceId={activeVoiceId}
                    setActiveVoiceId={setActiveVoiceId}
                  />
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '0.8rem' }}>
                  Specify the exact body location where you feel the discomfort (e.g. Center of chest, Upper right abdomen, Left forehead).
                </p>
                <input
                  type="text"
                  placeholder="e.g., Lower right abdomen radiating downwards"
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                  required
                />
              </div>

              {/* Question 2: ONSET */}
              <div className="sih-card" ref={q2Ref} style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.4rem' }}>
                  <label style={{ fontWeight: 800, color: 'var(--primary-navy)', fontSize: '1.05rem', margin: 0, flex: 1 }}>
                    2. Onset (O) — When and how did it start? <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <SocratesVoiceControl
                    questionId="q2"
                    getQuestionText={getCardText(q2Ref)}
                    value={onset}
                    onValueChange={(val) => setOnset(val)}
                    options={ONSET_TYPES}
                    onOptionToggle={handleOnsetSelect}
                    activeVoiceId={activeVoiceId}
                    setActiveVoiceId={setActiveVoiceId}
                  />
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '0.8rem' }}>
                  Select the onset type and describe what you were doing when it started.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem', marginBottom: '0.8rem' }}>
                  {ONSET_TYPES.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleOnsetSelect(type)}
                      style={{
                        padding: '0.6rem 0.8rem',
                        borderRadius: '8px',
                        border: onsetType === type ? '2px solid #0C9A9A' : '1px solid #E2E8F0',
                        background: onsetType === type ? '#E8F7F4' : '#F8FAFC',
                        color: onsetType === type ? '#0C9A9A' : '#334155',
                        fontWeight: onsetType === type ? 700 : 500,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <textarea
                  rows="2"
                  placeholder="e.g., Started suddenly 3 hours ago after eating lunch..."
                  value={onset}
                  onChange={(e) => setOnset(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.95rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                  required
                />
              </div>

              {/* Question 3: CHARACTER */}
              <div className="sih-card" ref={q3Ref} style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.4rem' }}>
                  <label style={{ fontWeight: 800, color: 'var(--primary-navy)', fontSize: '1.05rem', margin: 0, flex: 1 }}>
                    3. Character (C) — What is the pain / symptom like? <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <SocratesVoiceControl
                    questionId="q3"
                    getQuestionText={getCardText(q3Ref)}
                    value={customCharacter}
                    onValueChange={(val) => {
                      setCustomCharacter(val);
                      if (!character.includes('Other')) setCharacter([...character, 'Other']);
                    }}
                    options={CHARACTER_OPTIONS}
                    onOptionToggle={handleCharacterToggle}
                    activeVoiceId={activeVoiceId}
                    setActiveVoiceId={setActiveVoiceId}
                  />
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '0.8rem' }}>
                  Select all descriptor terms that match what you are feeling.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.8rem' }}>
                  {CHARACTER_OPTIONS.map(opt => {
                    const isSelected = character.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleCharacterToggle(opt)}
                        style={{
                          padding: '0.5rem 0.9rem',
                          borderRadius: '20px',
                          border: isSelected ? '2px solid #0C9A9A' : '1px solid #CBD5E1',
                          background: isSelected ? '#0C9A9A' : '#fff',
                          color: isSelected ? '#fff' : '#475569',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        {isSelected ? '✓ ' : '+ '}{opt}
                      </button>
                    );
                  })}
                </div>
                {character.includes('Other') && (
                  <input
                    type="text"
                    placeholder="Describe custom character..."
                    value={customCharacter}
                    onChange={(e) => setCustomCharacter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem'
                    }}
                  />
                )}
              </div>

              {/* Question 4: RADIATION */}
              <div className="sih-card" ref={q4Ref} style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.4rem' }}>
                  <label style={{ fontWeight: 800, color: 'var(--primary-navy)', fontSize: '1.05rem', margin: 0, flex: 1 }}>
                    4. Radiation (R) — Does the pain spread anywhere else?
                  </label>
                  <SocratesVoiceControl
                    questionId="q4"
                    getQuestionText={getCardText(q4Ref)}
                    value={radiation}
                    onValueChange={(val) => setRadiation(val)}
                    activeVoiceId={activeVoiceId}
                    setActiveVoiceId={setActiveVoiceId}
                  />
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '0.8rem' }}>
                  Does the sensation travel to other areas? (e.g., Radiates to left arm, neck, upper back, or stays in one place).
                </p>
                <input
                  type="text"
                  placeholder="e.g., Radiates to left jaw and left shoulder, or No radiation"
                  value={radiation}
                  onChange={(e) => setRadiation(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              {/* Question 5: ASSOCIATIONS */}
              <div className="sih-card" ref={q5Ref} style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.4rem' }}>
                  <label style={{ fontWeight: 800, color: 'var(--primary-navy)', fontSize: '1.05rem', margin: 0, flex: 1 }}>
                    5. Associations (A) — Are there any associated symptoms?
                  </label>
                  <SocratesVoiceControl
                    questionId="q5"
                    getQuestionText={getCardText(q5Ref)}
                    value={customAssociation}
                    onValueChange={(val) => setCustomAssociation(val)}
                    options={COMMON_ASSOCIATIONS}
                    onOptionToggle={handleAssociationToggle}
                    activeVoiceId={activeVoiceId}
                    setActiveVoiceId={setActiveVoiceId}
                  />
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '0.8rem' }}>
                  Select any additional symptoms occurring alongside the main issue.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.8rem' }}>
                  {COMMON_ASSOCIATIONS.map(opt => {
                    const isSelected = associations.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleAssociationToggle(opt)}
                        style={{
                          padding: '0.5rem 0.9rem',
                          borderRadius: '20px',
                          border: isSelected ? '2px solid #086F6F' : '1px solid #CBD5E1',
                          background: isSelected ? '#E8F7F4' : '#fff',
                          color: isSelected ? '#086F6F' : '#475569',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        {isSelected ? '✓ ' : '+ '}{opt}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  placeholder="Any other associated symptoms..."
                  value={customAssociation}
                  onChange={(e) => setCustomAssociation(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              {/* Question 6: TIME COURSE */}
              <div className="sih-card" ref={q6Ref} style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.4rem' }}>
                  <label style={{ fontWeight: 800, color: 'var(--primary-navy)', fontSize: '1.05rem', margin: 0, flex: 1 }}>
                    6. Time Course (T) — How does the symptom behave over time? <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <SocratesVoiceControl
                    questionId="q6"
                    getQuestionText={getCardText(q6Ref)}
                    value={timeCourse}
                    onValueChange={(val) => setTimeCourse(val)}
                    activeVoiceId={activeVoiceId}
                    setActiveVoiceId={setActiveVoiceId}
                  />
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '0.8rem' }}>
                  Is it continuous, constant, or coming in waves? How long does each episode last?
                </p>
                <input
                  type="text"
                  placeholder="e.g., Constant pain that gets progressively worse over 2 hours"
                  value={timeCourse}
                  onChange={(e) => setTimeCourse(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.95rem'
                  }}
                  required
                />
              </div>

              {/* Question 7: EXACERBATING & RELIEVING FACTORS */}
              <div className="sih-card" ref={q7Ref} style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.4rem' }}>
                  <label style={{ fontWeight: 800, color: 'var(--primary-navy)', fontSize: '1.05rem', margin: 0, flex: 1 }}>
                    7. Exacerbating & Relieving Factors (E) — What makes it better or worse?
                  </label>
                  <SocratesVoiceControl
                    questionId="q7"
                    getQuestionText={getCardText(q7Ref)}
                    value={exacerbatingFactors}
                    onValueChange={(val) => setExacerbatingFactors(val)}
                    activeVoiceId={activeVoiceId}
                    setActiveVoiceId={setActiveVoiceId}
                  />
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '0.8rem' }}>
                  e.g., Worsened by deep inspiration or bending over; Relieved by antacids or lying flat.
                </p>
                <textarea
                  rows="2"
                  placeholder="e.g., Worse with exertion and walking uphill; Better when sitting still."
                  value={exacerbatingFactors}
                  onChange={(e) => setExacerbatingFactors(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.95rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Question 8: SEVERITY */}
              <div className="sih-card" ref={q8Ref} style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.4rem' }}>
                  <label style={{ fontWeight: 800, color: 'var(--primary-navy)', fontSize: '1.05rem', margin: 0, flex: 1 }}>
                    8. Severity (S) — Pain / Discomfort Rating (0 to 10) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <SocratesVoiceControl
                      questionId="q8"
                      getQuestionText={getCardText(q8Ref)}
                      value={severity}
                      onValueChange={(val) => setSeverity(val)}
                      isNumberField={true}
                      activeVoiceId={activeVoiceId}
                      setActiveVoiceId={setActiveVoiceId}
                    />
                    <div 
                      style={{ 
                        padding: '0.4rem 1rem', 
                        borderRadius: '20px', 
                        background: getSeverityColor(severity), 
                        color: '#fff', 
                        fontWeight: 900, 
                        fontSize: '1.1rem' 
                      }}
                    >
                      {severity} / 10
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '1.2rem' }}>
                  Slide to indicate severity (0 = None, 1 = Mild noticeable discomfort, 10 = Worst unbearable emergency pain).
                </p>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
                  style={{ width: '100%', accentColor: getSeverityColor(severity), cursor: 'pointer', height: '8px' }}
                />
               
              </div>

              {/* Question 9: PRIOR HISTORY */}
              <div className="sih-card" ref={q9Ref} style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.4rem' }}>
                  <label style={{ fontWeight: 800, color: 'var(--primary-navy)', fontSize: '1.05rem', margin: 0, flex: 1 }}>
                    9. Previous History — Have you experienced similar symptoms before?
                  </label>
                  <SocratesVoiceControl
                    questionId="q9"
                    getQuestionText={getCardText(q9Ref)}
                    value={priorHistory}
                    onValueChange={(val) => setPriorHistory(val)}
                    activeVoiceId={activeVoiceId}
                    setActiveVoiceId={setActiveVoiceId}
                  />
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '0.8rem' }}>
                  Mention previous episodes, diagnosed conditions, or relevant family history.
                </p>
                <textarea
                  rows="2"
                  placeholder="e.g., Had similar mild episodes 6 months ago, diagnosed with acid reflux."
                  value={priorHistory}
                  onChange={(e) => setPriorHistory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.95rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Question 10: ADDITIONAL NOTES & DOCUMENT UPLOAD */}
              <div className="sih-card" ref={q10Ref} style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.4rem' }}>
                  <label style={{ fontWeight: 800, color: 'var(--primary-navy)', fontSize: '1.05rem', margin: 0, flex: 1 }}>
                    10. Doctor Notes & Medical Document Upload
                  </label>
                  <SocratesVoiceControl
                    questionId="q10"
                    getQuestionText={getCardText(q10Ref)}
                    value={additionalNotes}
                    onValueChange={(val) => setAdditionalNotes(val)}
                    activeVoiceId={activeVoiceId}
                    setActiveVoiceId={setActiveVoiceId}
                  />
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '0.8rem' }}>
                  Add any extra details for the doctor and attach medical reports, lab results, or scans (stored securely on Cloudinary).
                </p>

                <textarea
                  rows="2"
                  placeholder="Additional context or notes for the reviewing physician..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.95rem',
                    marginBottom: '1rem',
                    resize: 'vertical'
                  }}
                />

                {/* Cloudinary Document Dropzone */}
                <div 
                  style={{
                    border: '2px dashed #0C9A9A',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    textAlign: 'center',
                    background: '#F0FDF4',
                    cursor: 'pointer'
                  }}
                  onClick={() => document.getElementById('socrates-file-input').click()}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}><Cloud size={22} /></div>
                  <h4 style={{ margin: '0 0 0.2rem 0', color: '#0C9A9A', fontWeight: 700 }}>Upload Supporting Documents to Cloudinary</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                    Click to select lab reports, prescriptions, or images (PDF, JPG, PNG up to 10MB each)
                  </p>
                  <input
                    id="socrates-file-input"
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Selected File List */}
                {files.length > 0 && (
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary-navy)' }}>
                      Selected Files ({files.length}/5):
                    </div>
                    {files.map((f, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.8rem', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 600, color: '#334155' }}><Files size={20} /> {f.name} ({(f.size / 1024).toFixed(1)} KB)</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                          style={{ background: 'transparent', border: 'none', color: '#EF4444', fontWeight: 700, cursor: 'pointer' }}
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  style={{
                    padding: '0.8rem 1.6rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#fff',
                    color: '#475569',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '0.8rem 2.2rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: isSubmitting ? '#94A3B8' : '#0C9A9A',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(12, 154, 154, 0.25)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isSubmitting ? 'Uploading to Cloudinary...' : 'Submit Assessment '}
                </button>
              </div>

            </form>
          </div>
        ) : (
          /* History View */
          <div>
            <div className="sih-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                    <ClipboardList size={20} /> Past SOCRATES Submissions
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
                    Review your previous symptom assessments and Cloudinary-stored medical files.
                  </p>
                </div>
                <button
                  onClick={fetchHistory}
                  className="sih-nav-btn"
                  style={{ border: '1px solid #CBD5E1' }}
                >
                  <RefreshCw size={20} /> Refresh
                </button>
              </div>
            </div>

            {isLoadingHistory ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                Loading assessment history...
              </div>
            ) : history.length === 0 ? (
              <div className="sih-card" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No SOCRATES assessments recorded yet.</p>
                <button
                  onClick={() => setActiveTab('new')}
                  style={{
                    marginTop: '1rem',
                    padding: '0.6rem 1.4rem',
                    borderRadius: '8px',
                    background: '#0C9A9A',
                    color: '#fff',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Fill New Assessment
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {history.map((item, idx) => (
                  <div key={item._id || idx} className="sih-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem', borderBottom: '1px solid #F1F5F9', pb: '0.8rem', marginBottom: '1rem' }}>
                      <div>
                        <span style={{ display: 'inline-block', padding: '0.25rem 0.6rem', borderRadius: '4px', background: '#E8F7F4', color: '#0C9A9A', fontWeight: 700, fontSize: '0.78rem', marginRight: '0.5rem' }}>
                          Assessment #{history.length - idx}
                        </span>
                        <h3 style={{ margin: '0.4rem 0 0 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                          Site: {item.site}
                        </h3>
                        <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                          Submitted on {new Date(item.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Severity:</span>
                        <div style={{ padding: '0.3rem 0.8rem', borderRadius: '12px', background: getSeverityColor(item.severity), color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>
                          {item.severity} / 10
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', fontSize: '0.88rem', color: '#334155' }}>
                      <div><strong>Onset:</strong> {item.onset}</div>
                      <div><strong>Character:</strong> {item.character}</div>
                      <div><strong>Radiation:</strong> {item.radiation || 'None'}</div>
                      <div><strong>Associations:</strong> {item.associations || 'None'}</div>
                      <div><strong>Time Course:</strong> {item.timeCourse}</div>
                      <div><strong>Factors:</strong> {item.exacerbatingFactors || 'None'}</div>
                      {item.priorHistory && <div style={{ gridColumn: '1 / -1' }}><strong>Prior History:</strong> {item.priorHistory}</div>}
                      {item.additionalNotes && <div style={{ gridColumn: '1 / -1' }}><strong>Notes:</strong> {item.additionalNotes}</div>}
                    </div>

                    {item.documents && item.documents.length > 0 && (
                      <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px dashed #E2E8F0' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0C9A9A', marginBottom: '0.5rem' }}>
                          ☁️ Cloudinary Uploaded Documents ({item.documents.length}):
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                          {item.documents.map((doc, dIdx) => (
                            <a
                              key={dIdx}
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '6px',
                                background: '#F0FDF4',
                                border: '1px solid #A7F3D0',
                                color: '#065F46',
                                textDecoration: 'none',
                                fontSize: '0.8rem',
                                fontWeight: 600
                              }}
                            >
                              📎 {doc.name || 'View Document'} ↗
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
        </div>
      </div>

      <ChatbotFAB />
    </div>
  );
}
