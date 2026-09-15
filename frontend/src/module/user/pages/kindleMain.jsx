import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../userPages.css';
import { userApi } from '../services/userApi';
import PatientSidebar from '../components/asidebar';
import ChatbotFAB from '../components/ChatbotFAB';
import {
  FileText,
   CircleUser,
    LogOut,
  RefreshCw,
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
  Folder,
  Leaf,
  Globe
} from "lucide-react";

export default function KindleMain() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('namaste'); // 'namaste' or 'icd11'

  // Search queries & suggestions
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Selected disease record
  const [selectedCode, setSelectedCode] = useState(null);
  const [record, setRecord] = useState(null);
  const [isLoadingRecord, setIsLoadingRecord] = useState(false);

  // Header state
  const [language, setLanguage] = useState('English');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Dynamic profile
  const [patientName, setPatientName] = useState('Profile');
  const [initials, setInitials] = useState('PT');

  useEffect(() => {
    userApi.dashboard().then((dash) => {
      const p = dash?.profile;
      const storedUser = (() => {
        try { return JSON.parse(localStorage.getItem('user_profile') || '{}'); } catch { return {}; }
      })();
      const name = p?.name?.trim()
        || (storedUser?.firstName ? `${storedUser.firstName} ${storedUser.lastName || ''}`.trim() : '')
        || dash?.abha?.name?.trim()
        || 'Patient';
      setPatientName(name);
      setInitials((name.replace(/[^a-zA-Z\s]/g, '').trim() || 'PT').split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase());
    }).catch(() => { });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live suggestions / search debounce
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      setSearchError('');
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError('');
      try {
        if (activeTab === 'namaste') {
          const res = await userApi.searchNamaste(trimmed);
          setSuggestions(res.results || []);
        } else {
          const res = await userApi.searchICD11(trimmed);
          const items = res.destinationEntities || res.entities || res.items || [];
          setSuggestions(items);
        }
      } catch (err) {
        setSearchError(err.message || 'Search failed');
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, activeTab]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setQuery('');
    setSuggestions([]);
    setSearchError('');
  };

  const handleSelectCode = async (code, entityUri) => {
    setSelectedCode(code);
    setIsLoadingRecord(true);
    setRecord(null);
    try {
      const data = await userApi.getDiseaseRecord(code, entityUri);
      setRecord(data);
    } catch (err) {
      setSearchError(err.message || 'Failed to fetch clinical record');
    } finally {
      setIsLoadingRecord(false);
    }
  };

  const parseItemLabel = (item) => {
    const val = item.title || item.theCodeAndTitle?.title || item.matchingPhrases?.[0]?.label || item.id || 'WHO ICD-11 Entity';
    return String(val).replace(/<[^>]*>/g, '');
  };

  const parseItemCode = (item) => {
    return item.theCode || item.theCodeAndTitle?.code || item.code || item.id || item.entityId || parseItemLabel(item);
  };

  return (
    <div className="sih-page-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--mint-bg)' }}>
      {/* ===== HEADER ===== */}
      <header className="sih-header">
        <div className="sih-header-inner">
          {/* Brand */}
          <div className="sih-brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
            <div className="sih-logo-badge">🛡</div>
            <div>
              <h1 className="sih-brand-title">MedVault</h1>
              <p className="sih-brand-subtitle">Clinical Directory</p>
            </div>
          </div>



          {/* Header Controls */}
          <div className="sih-header-controls">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="sih-lang-select">
              <option value="English">🌐 English</option>
              <option value="Hindi">🌐 हिंदी</option>
              <option value="Bengali">🌐 বাংলা</option>
              <option value="Tamil">🌐 தமிழ்</option>
            </select>

            <div className="sih-profile-wrapper" ref={profileRef}>
              <button className="sih-profile-trigger" onClick={() => setProfileOpen(!profileOpen)}>
                <div className="sih-profile-avatar">{initials}</div>
                <span className="sih-profile-name">{patientName}</span>
                <span className={`sih-profile-chevron ${profileOpen ? 'open' : ''}`}>▾</span>
              </button>
              {profileOpen && (
                <div className="sih-profile-dropdown">
                  <button className="sih-profile-dropdown-item" onClick={() => { navigate('/profile'); setProfileOpen(false); }}>
                    <span className="dd-icon"><CircleUser /> </span> Profile
                  </button>
                  <button className="sih-profile-dropdown-item danger" onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user_profile');
                    setProfileOpen(false);
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
        <PatientSidebar patientName={patientName} initials={initials} activePage="health-code" />
        <div className="patient-content-area">

          {/* ===== MAIN CONTENT ===== */}
          <main className="sih-main-layout" style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>

            {/* Top Banner */}
            <div className="sih-card" style={{ padding: '1.5rem 2rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="sih-badge sih-badge-teal">CDSS & Terminology Service</span>
                  <span className="sih-badge sih-badge-green">WHO ICD-11 Live</span>
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary-navy)', margin: '0.4rem 0 0.2rem' }}>
                  NAMASTE ↔ WHO ICD-11 Directory
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  Search across 4,500+ official AYUSH NAMASTE clinical terms and live WHO ICD-11 international disease classifications.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleTabSwitch('namaste')}
                  className={`sih-btn ${activeTab === 'namaste' ? 'sih-btn-primary' : 'sih-btn-outline'}`}
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
                >
                  
<Leaf size={20} /> NAMASTE (Ayurveda)
                </button>
                <button
                  onClick={() => handleTabSwitch('icd11')}
                  className={`sih-btn ${activeTab === 'icd11' ? 'sih-btn-primary' : 'sih-btn-outline'}`}
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
                >
                  <Globe size={20} /> WHO ICD-11 (Global)
                </button>
              </div>
            </div>

            {/* Two-Column Explorer Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1fr) minmax(0, 1.8fr)', gap: '1.5rem', alignItems: 'start' }}>

              {/* Left Column: Search & Results List */}
              <div className="sih-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="sih-input"
                    placeholder={activeTab === 'namaste' ? 'Search Jvara, Madhumeha, A-101...' : 'Search Diabetes, 5A11, Fever, 1B10...'}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ paddingLeft: '2.5rem', height: '46px', fontSize: '0.9rem' }}
                  />
                  <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <Search size={20} />
                  </span>
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Quick Sample Prompts */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Samples:</span>
                  {(activeTab === 'namaste' ? ['Jvara', 'Madhumeha', 'Kasa', 'Atisara'] : ['Diabetes', '5A11', 'Fever', '1B10']).map((sample) => (
                    <button
                      key={sample}
                      onClick={() => setQuery(sample)}
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--teal-primary)',
                        backgroundColor: 'var(--mint-light)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        border: '1px solid rgba(47, 143, 131, 0.2)',
                        cursor: 'pointer'
                      }}
                    >
                      {sample}
                    </button>
                  ))}
                </div>

                {/* Results Count / Loading */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  <span>{isSearching ? 'Searching database & WHO API…' : `${suggestions.length} entries found`}</span>
                  {isSearching && <span style={{ color: 'var(--teal-primary)' }}>Loading…</span>}
                </div>

                {searchError && (
                  <div style={{ backgroundColor: '#FEF2F2', color: '#991B1B', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                    {searchError}
                  </div>
                )}

                {/* Results Scroll List */}
                <div style={{ maxHeight: '540px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.25rem' }}>
                  {suggestions.map((item, idx) => {
                    if (activeTab === 'namaste') {
                      const isSelected = selectedCode === item.code;
                      return (
                        <button
                          key={item.code + idx}
                          onClick={() => handleSelectCode(item.code)}
                          style={{
                            textAlign: 'left',
                            padding: '0.85rem 1rem',
                            backgroundColor: isSelected ? 'var(--mint-light)' : '#F8FAFC',
                            border: isSelected ? '1.5px solid var(--teal-primary)' : '1px solid var(--border-light)',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ color: 'var(--primary-navy)', fontSize: '0.9rem' }}>{item.code}</strong>
                            {item.hasEnrichedClinicalProfile && (
                              <span className="sih-badge sih-badge-teal" style={{ fontSize: '0.62rem' }}>Enriched</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--teal-primary)', marginTop: '0.2rem' }}>
                            {item.ayurvedicTerm}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            {item.englishEquivalent || item.transliteration}
                          </div>
                        </button>
                      );
                    } else {
                      const code = parseItemCode(item);
                      const label = parseItemLabel(item);
                      const isSelected = selectedCode === code;
                      return (
                        <button
                          key={(item.id || code) + idx}
                          onClick={() => handleSelectCode(code, item.id || item.entityId)}
                          style={{
                            textAlign: 'left',
                            padding: '0.85rem 1rem',
                            backgroundColor: isSelected ? 'var(--mint-light)' : '#F8FAFC',
                            border: isSelected ? '1.5px solid var(--teal-primary)' : '1px solid var(--border-light)',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ color: 'var(--primary-navy)', fontSize: '0.9rem' }}>{code}</strong>
                            <span className="sih-badge sih-badge-green" style={{ fontSize: '0.62rem' }}>ICD-11</span>
                          </div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                            {label}
                          </div>
                        </button>
                      );
                    }
                  })}

                  {!isSearching && query && suggestions.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No matching classification codes found for "{query}".
                    </div>
                  )}

                  {!query && (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Type a term or code above to search through the standardized medical library.
                    </div>
                  )}
                </div>
              </div>

          {/* Right Column: Comprehensive Clinical Decision Card */}
          <div className="sih-card" style={{ padding: '2rem', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
            {isLoadingRecord ? (
              <div style={{ margin: 'auto', textAlign: 'center', padding: '3rem 0' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
                <h4 style={{ color: 'var(--primary-navy)', margin: 0 }}>Loading Clinical Profile & WHO Entities…</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                  Resolving classification cross-mappings and evidence-based guidance.
                </p>
              </div>
            ) : record ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Header Profile */}
                <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    <span className="sih-badge sih-badge-teal">{record.systemOfMedicine}</span>
                    {record.icd11PrimaryCode && (
                      <span className="sih-badge sih-badge-green">ICD-11: {record.icd11PrimaryCode}</span>
                    )}
                  </div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary-navy)', margin: '0.2rem 0' }}>
                    {record.code} — {record.ayurvedicTerm}
                  </h2>
                  <p style={{ fontSize: '0.95rem', color: 'var(--teal-primary)', fontWeight: 600, margin: 0 }}>
                    {record.englishEquivalent || record.transliteration}
                  </p>
                </div>

                {/* Triage / Red Flags Alert */}
                {record.prognosis && (
                  <div style={{ backgroundColor: '#FFFBEB', borderLeft: '4px solid #F59E0B', padding: '1rem', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400E' }}>
                        Triage Status: {record.prognosis.status}
                      </span>
                      <span className="sih-badge sih-badge-amber" style={{ fontSize: '0.7rem' }}>
                        Risk: {record.prognosis.riskLevel}
                      </span>
                    </div>
                    {record.clinicalOverview?.redFlags?.length > 0 && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#78350F' }}>
                        <strong>Critical Red Flags:</strong> {record.clinicalOverview.redFlags.join(', ')}
                      </div>
                    )}
                  </div>
                )}

                {/* Grid Details */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  {/* Ayurvedic Pathomechanism */}
                  {record.pathomechanism && (
                    <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
                        <Leaf size={20} />          Pathomechanism (Samprapti)
                      </h4>
                      <p style={{ fontSize: '0.78rem', margin: '0.25rem 0' }}>
                        <strong>Dominant Dosha:</strong> {record.pathomechanism.dominantDosha?.join(', ')}
                      </p>
                      <p style={{ fontSize: '0.78rem', margin: '0.25rem 0' }}>
                        <strong>Srotas Involved:</strong> {record.pathomechanism.srotasInvolved?.join(', ')}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem', lineHeight: '1.4' }}>
                        {record.pathomechanism.phenotypeCheck}
                      </p>
                    </div>
                  )}

                  {/* Treatment Framework */}
                  {record.treatmentFramework && (
                    <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
                        💊 Treatment Framework (Chikitsa)
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-main)', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                        {record.treatmentFramework.chikitsaSutra}
                      </p>
                      {record.treatmentFramework.classicalFormulations?.length > 0 && (
                        <div style={{ fontSize: '0.75rem', margin: '0.25rem 0' }}>
                          <strong>Formulations:</strong> {record.treatmentFramework.classicalFormulations.join(', ')}
                        </div>
                      )}
                      {record.treatmentFramework.pathya?.length > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#15803D', margin: '0.25rem 0' }}>
                          <strong>Pathya (Dietary Do\'s):</strong> {record.treatmentFramework.pathya.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* WHO ICD-11 Live Metadata Card */}
                {record.icd11Details && (
                  <div style={{ backgroundColor: 'var(--mint-bg)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                        <Globe  size={20} /> WHO ICD-11 Global Disease Record
                      </h4>
                      {record.icd11EntityUri && (
                        <a
                          href={record.icd11EntityUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '0.75rem', color: 'var(--teal-primary)', fontWeight: 700, textDecoration: 'none' }}
                        >
                          Official WHO Portal ↗
                        </a>
                      )}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: '1.5', margin: 0 }}>
                      {record.icd11Details.definition?.['@value'] || record.icd11Details.definition || record.clinicalOverview?.definition || 'Classification record active in WHO registry.'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ margin: 'auto', textAlign: 'center', padding: '3rem 1rem', maxWidth: '420px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}><BookOpen size={40} /></div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '0 0 0.4rem' }}>
                  Select a Medical Code
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                  Select any NAMASTE Ayurveda term or WHO ICD-11 global disease entity from the left list to view full evidence-based clinical profiles, dosages, pathomechanisms, and cross-references.
                </p>
              </div>
            )}
          </div>

            </div>
          </main>
        </div>
      </div>

      <ChatbotFAB />
    </div>
  );
}
