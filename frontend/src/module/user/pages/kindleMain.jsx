import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../userPages.css';
import { userApi } from '../services/userApi';
import { useDashboardLanguage } from '../LanguageContext';

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

  // Header state (shared global language — only clicked language is shown)
  const { language, setLanguage } = useDashboardLanguage();
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
    }).catch(() => {});
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

          {/* Nav Menu */}
          <nav className="sih-nav-menu">
            <button onClick={() => navigate('/abha')} className="sih-nav-btn">
              <span className="sih-nav-icon">🛡</span> ABHA
            </button>
            <button onClick={() => navigate('/uploadDoc')} className="sih-nav-btn">
              <span className="sih-nav-icon">📄</span> Docs
            </button>
            <button onClick={() => navigate('/basicInfo')} className="sih-nav-btn">
              <span className="sih-nav-icon">🔍</span> Basic Info
            </button>
            <button onClick={() => navigate('/kindle')} className="sih-nav-btn active">
              <span className="sih-nav-icon">📖</span> Directory
            </button>
          </nav>

          {/* Header Controls */}
          <div className="sih-header-controls">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="sih-lang-select" data-no-translate translate="no">
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
                    <span className="dd-icon">👤</span> Profile
                  </button>
                  <button className="sih-profile-dropdown-item danger" onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user_profile');
                    setProfileOpen(false);
                    navigate('/login');
                  }}>
                    <span className="dd-icon">🚪</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

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
              🌿 NAMASTE (Ayurveda)
            </button>
            <button
              onClick={() => handleTabSwitch('icd11')}
              className={`sih-btn ${activeTab === 'icd11' ? 'sih-btn-primary' : 'sih-btn-outline'}`}
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
            >
              🌐 WHO ICD-11 (Global)
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
                🔍
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
                <h4 style={{ color: 'var(--primary-navy)', margin: 0 }}>Loading Clinical Profile &amp; WHO Entities…</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                  Resolving classification cross-mappings and evidence-based guidance.
                </p>
              </div>
            ) : record ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>

                {/* ── Breadcrumb ── */}
                {record.parentDisease && (
                  <nav className="namaste-breadcrumb">
                    <button className="namaste-breadcrumb-item" onClick={() => { setQuery(''); setSuggestions([]); setRecord(null); setSelectedCode(null); }}>
                      NAMASTE
                    </button>
                    <span className="namaste-breadcrumb-sep">›</span>
                    <button className="namaste-breadcrumb-item" onClick={() => handleSelectCode(record.parentDisease.code)}>
                      {record.parentDisease.code}
                    </button>
                    <span className="namaste-breadcrumb-sep">›</span>
                    <span className="namaste-breadcrumb-current">{record.code}</span>
                  </nav>
                )}

                {/* ── Header ── */}
                <div style={{ borderBottom: '2px solid var(--border-light)', paddingBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                    <span className="sih-badge sih-badge-teal">{record.systemOfMedicine}</span>
                    {record.icd11PrimaryCode && (
                      <span className="sih-badge sih-badge-green">ICD-11: {record.icd11PrimaryCode}</span>
                    )}
                  </div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary-navy)', margin: '0.2rem 0' }}>
                    {record.code} — {record.ayurvedicTerm}
                  </h2>
                  <p style={{ fontSize: '0.95rem', color: 'var(--teal-primary)', fontWeight: 600, margin: '0 0 0.15rem' }}>
                    {record.englishEquivalent || record.transliteration}
                  </p>
                  {record.transliteration && record.transliteration !== record.ayurvedicTerm && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
                      {record.transliteration}
                    </p>
                  )}
                </div>

                {/* ── Actions ── */}
                <div className="namaste-actions">
                  <button className="namaste-action-btn" onClick={() => navigator.clipboard.writeText(record.code).catch(() => {})}>
                    📋 Copy Code
                  </button>
                  <button className="namaste-action-btn" onClick={() => window.print()}>
                    🖨️ Print
                  </button>
                </div>

                {/* ── ICD-11 Mapping Panel ── */}
                {(() => {
                  const hasPrimary = !!record.icd11PrimaryCode;
                  const hasDetails = record.icd11Details && !record.icd11Details.unavailable;
                  const state = hasPrimary ? 'mapped' : 'unmapped';
                  const icon = hasPrimary ? '✅' : '⚠️';
                  const label = hasPrimary ? 'ICD-11 Mapping Available' : 'No ICD-11 Mapping Found';
                  return (
                    <div className={`namaste-mapping-panel ${state}`}>
                      <div className={`namaste-mapping-title ${state}`}>
                        <span>{icon}</span> {label}
                        {hasPrimary && record.icd11EquivalenceType && (
                          <span className="namaste-equivalence-badge">{record.icd11EquivalenceType}</span>
                        )}
                      </div>
                      {hasPrimary && (
                        <>
                          <div className="namaste-mapping-row"><strong>ICD-11 Code:</strong> {record.icd11PrimaryCode}</div>
                          {hasDetails && record.icd11Details.title?.['@value'] && (
                            <div className="namaste-mapping-row">
                              <strong>WHO Entity:</strong> {String(record.icd11Details.title['@value']).replace(/<[^>]*>/g, '')}
                            </div>
                          )}
                          {hasDetails && (record.icd11Details.definition?.['@value'] || typeof record.icd11Details.definition === 'string') && (
                            <p className="namaste-mapping-note">
                              {String(record.icd11Details.definition?.['@value'] || record.icd11Details.definition).replace(/<[^>]*>/g, '')}
                            </p>
                          )}
                          {hasDetails && record.icd11Details.browserUrl && (
                            <a href={record.icd11Details.browserUrl} target="_blank" rel="noreferrer"
                              style={{ fontSize: '0.74rem', color: 'var(--teal-primary)', display: 'inline-block', marginTop: '0.5rem', textDecoration: 'underline' }}>
                              View on WHO ICD-11 Browser ↗
                            </a>
                          )}
                          {record.completeness?.percentage != null && (
                            <div className="namaste-completeness" style={{ marginTop: '0.5rem' }}>
                              <div className="namaste-completeness-bar-track">
                                <div
                                  className={`namaste-completeness-bar-fill ${record.completeness.percentage >= 75 ? 'high' : record.completeness.percentage >= 40 ? 'medium' : 'low'}`}
                                  style={{ width: `${record.completeness.percentage}%` }}
                                />
                              </div>
                              <span className="namaste-completeness-label">{record.completeness.percentage}% profile complete</span>
                            </div>
                          )}
                        </>
                      )}
                      {!hasPrimary && (
                        <p className="namaste-mapping-note">
                          This NAMASTE entry does not yet have a confirmed ICD-11 cross-reference. Consult the{' '}
                          <a href="https://icd.who.int/browse/2024-01/mms/en" target="_blank" rel="noreferrer" style={{ color: '#92400E' }}>WHO ICD-11 browser</a>{' '}
                          for manual lookup in TM2 chapter (Traditional Medicine).
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* ── Triage / Prognosis ── */}
                {record.prognosis && (
                  <div style={{ backgroundColor: '#FFFBEB', borderLeft: '4px solid #F59E0B', padding: '1rem', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400E' }}>
                        Triage: {record.prognosis.status}
                      </span>
                      <span className="sih-badge sih-badge-amber" style={{ fontSize: '0.7rem' }}>
                        Risk: {record.prognosis.riskLevel}
                      </span>
                    </div>
                    {record.clinicalOverview?.redFlags?.length > 0 && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#78350F' }}>
                        <strong>🚩 Red Flags:</strong> {record.clinicalOverview.redFlags.join(' · ')}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Clinical Overview ── */}
                {record.clinicalOverview && (
                  <div style={{ backgroundColor: '#F8FAFC', padding: '1rem 1.1rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      📋 Clinical Overview
                    </h4>
                    {record.clinicalOverview.definition &&
                      !record.clinicalOverview.definition.startsWith('No definition') &&
                      record.clinicalOverview.definition !== 'Dynamically fetched from WHO ICD-11 search.' && (
                      <p style={{ fontSize: '0.8rem', lineHeight: 1.65, margin: '0 0 0.75rem', color: 'var(--text-main)' }}>
                        {record.clinicalOverview.definition}
                      </p>
                    )}

                    {/* Cardinal Symptoms Table */}
                    {record.clinicalOverview.cardinalSymptoms?.length > 0 && (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Cardinal Symptoms
                        </div>
                        <table className="namaste-symptom-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Symptom (NAMASTE / IAST)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {record.clinicalOverview.cardinalSymptoms.map((s, i) => (
                              <tr key={i}>
                                <td style={{ color: 'var(--text-muted)', width: '2rem' }}>{i + 1}</td>
                                <td className="namaste-symptom-iast">{s}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Parsed Symptom Glossary */}
                    {record.parsedSymptoms?.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Symptom Glossary (IAST ↔ English)
                        </div>
                        <table className="namaste-symptom-table">
                          <thead>
                            <tr>
                              <th>IAST Term</th>
                              <th>English Meaning</th>
                            </tr>
                          </thead>
                          <tbody>
                            {record.parsedSymptoms.map((s, i) => (
                              <tr key={i}>
                                <td className="namaste-symptom-iast">{s.term}</td>
                                <td style={{ color: 'var(--text-main)', fontSize: '0.75rem' }}>{s.gloss}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Biomedical Summary ── */}
                {record.biomedicalSummary && (
                  <div className="namaste-biomedical-summary">
                    <strong>Biomedical Correlate:</strong> {record.biomedicalSummary}
                  </div>
                )}

                {/* ── Pathomechanism + Treatment (2-col grid) ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>

                  {/* Pathomechanism */}
                  {record.pathomechanism && (
                    <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.6rem' }}>
                        🌿 Pathomechanism (Samprapti)
                      </h4>
                      {record.pathomechanism.dominantDosha?.filter(d => d !== 'Not catalogued' && d !== 'Not classified').length > 0 ? (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.3rem' }}>Dominant Dosha</div>
                          <div>
                            {record.pathomechanism.dominantDosha.map((d, i) => (
                              <span key={i} style={{ display: 'inline-block', background: '#F5F3FF', color: '#7C3AED', borderRadius: '6px', padding: '0.15rem 0.55rem', fontSize: '0.72rem', fontWeight: 700, margin: '0.15rem 0.15rem 0 0', border: '1px solid #7C3AED22' }}>{d}</span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.3rem' }}>Dominant Dosha</div>
                          <span style={{ display: 'inline-block', background: '#F5F3FF', color: '#7C3AED', borderRadius: '6px', padding: '0.15rem 0.55rem', fontSize: '0.72rem', fontWeight: 700, border: '1px solid #7C3AED22' }}>Tridosha Assessment Required</span>
                        </div>
                      )}
                      {record.pathomechanism.srotasInvolved?.filter(s => s !== 'Not catalogued' && s !== 'Not classified').length > 0 ? (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.3rem' }}>Srotas Involved</div>
                          <div>
                            {record.pathomechanism.srotasInvolved.map((s, i) => (
                              <span key={i} style={{ display: 'inline-block', background: '#F0F9FF', color: '#0369A1', borderRadius: '6px', padding: '0.15rem 0.55rem', fontSize: '0.72rem', fontWeight: 700, margin: '0.15rem 0.15rem 0 0', border: '1px solid #0369A122' }}>{s}</span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.3rem' }}>Srotas Involved</div>
                          <span style={{ display: 'inline-block', background: '#F0F9FF', color: '#0369A1', borderRadius: '6px', padding: '0.15rem 0.55rem', fontSize: '0.72rem', fontWeight: 700, border: '1px solid #0369A122' }}>Rasavaha / Annavaha</span>
                        </div>
                      )}
                      {record.pathomechanism.phenotypeCheck && (
                        <div style={{ marginTop: '0.5rem', paddingTop: '0.4rem', borderTop: '1px dashed var(--border-light)' }}>
                          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.15rem' }}>Samprapti & Clinical Phenotype</div>
                          <p style={{ fontSize: '0.73rem', color: 'var(--text-main)', fontStyle: 'italic', margin: 0, lineHeight: 1.45 }}>
                            {record.pathomechanism.phenotypeCheck}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Treatment Framework */}
                  {record.treatmentFramework && (
                    <div style={{ backgroundColor: '#FEFCE8', padding: '1rem', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.6rem' }}>
                        💊 Treatment Framework (Chikitsa)
                      </h4>
                      {record.treatmentFramework.chikitsaSutra && !record.treatmentFramework.chikitsaSutra.startsWith('No treatment') ? (
                        <div style={{ backgroundColor: 'rgba(254, 240, 138, 0.35)', padding: '0.5rem 0.75rem', borderRadius: '6px', borderLeft: '3px solid #EAB308', marginBottom: '0.6rem' }}>
                          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#854D0E', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.15rem' }}>Chikitsa Sutra (Guiding Principle)</div>
                          <p style={{ fontSize: '0.78rem', color: '#713F12', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
                            "{record.treatmentFramework.chikitsaSutra}"
                          </p>
                        </div>
                      ) : (
                        <div style={{ backgroundColor: 'rgba(254, 240, 138, 0.35)', padding: '0.5rem 0.75rem', borderRadius: '6px', borderLeft: '3px solid #EAB308', marginBottom: '0.6rem' }}>
                          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#854D0E', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.15rem' }}>Therapeutic Framework</div>
                          <p style={{ fontSize: '0.76rem', color: '#713F12', fontStyle: 'italic', margin: 0, lineHeight: 1.45 }}>
                            "दोषप्रत्यानीकचिकित्सा, निदानपरिवर्जनं च। (Nidana Parivarjana, Dosha-pratyanika therapy & Agni restoration based on individual Prakriti.)"
                          </p>
                        </div>
                      )}
                      {record.treatmentFramework.classicalFormulations?.length > 0 ? (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.3rem' }}>Classical Formulations</div>
                          <div>
                            {record.treatmentFramework.classicalFormulations.map((f, i) => (
                              <span key={i} style={{ display: 'inline-block', background: '#FFFBEB', color: '#92400E', borderRadius: '6px', padding: '0.15rem 0.55rem', fontSize: '0.72rem', fontWeight: 700, margin: '0.15rem 0.15rem 0 0', border: '1px solid #92400E22' }}>{f}</span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.3rem' }}>Classical Formulations</div>
                          <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Individualized Shamana & Deepana-Pachana Formulations</span>
                        </div>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.4rem' }}>
                        {record.treatmentFramework.pathya?.length > 0 && (
                          <div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#166534', marginBottom: '0.2rem' }}>✅ Pathya (Do's)</div>
                            {record.treatmentFramework.pathya.map((p, i) => (
                              <div key={i} style={{ fontSize: '0.72rem', color: 'var(--text-main)', padding: '0.08rem 0' }}>• {p}</div>
                            ))}
                          </div>
                        )}
                        {record.treatmentFramework.apathya?.length > 0 && (
                          <div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#991B1B', marginBottom: '0.2rem' }}>❌ Apathya (Avoid)</div>
                            {record.treatmentFramework.apathya.map((a, i) => (
                              <div key={i} style={{ fontSize: '0.72rem', color: 'var(--text-main)', padding: '0.08rem 0' }}>• {a}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Lab Correlations ── */}
                {record.labCorrelations?.suggestedTests?.filter(t => t !== 'Select tests based on clinical presentation and guideline.').length > 0 && (
                  <div style={{ backgroundColor: '#F0FDFA', padding: '1rem 1.1rem', borderRadius: '10px', border: '1px solid #99F6E4' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
                      🔬 Lab Correlations
                    </h4>
                    <div style={{ marginBottom: '0.4rem' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.3rem' }}>Suggested Tests</div>
                      <div>
                        {record.labCorrelations.suggestedTests.map((t, i) => (
                          <span key={i} style={{ display: 'inline-block', background: 'white', color: '#0F766E', borderRadius: '6px', padding: '0.15rem 0.55rem', fontSize: '0.72rem', fontWeight: 700, margin: '0.15rem 0.15rem 0 0', border: '1px solid #0F766E33' }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    {record.labCorrelations.targets && Object.keys(record.labCorrelations.targets).length > 0 && (
                      <div>
                        {Object.entries(record.labCorrelations.targets).map(([k, v]) => (
                          <div key={k} style={{ fontSize: '0.75rem', color: 'var(--text-main)', padding: '0.1rem 0' }}>
                            <strong>{k}:</strong> {v}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── WHO ICD-11 Live Metadata ── */}
                {record.icd11Details && !record.icd11Details.unavailable && (
                  <div style={{ backgroundColor: 'var(--mint-bg)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                        🌐 WHO ICD-11 Global Record
                      </h4>
                      {record.icd11EntityUri && (
                        <a href={record.icd11EntityUri} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: '0.75rem', color: 'var(--teal-primary)', fontWeight: 700, textDecoration: 'none' }}>
                          Official WHO Portal ↗
                        </a>
                      )}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.55, margin: 0 }}>
                      {String(record.icd11Details.definition?.['@value'] || record.icd11Details.definition || '').replace(/<[^>]*>/g, '') || record.clinicalOverview?.definition || 'Classification record active in WHO registry.'}
                    </p>
                  </div>
                )}

                {/* ── Related Sibling Codes ── */}
                {record.relatedCodes?.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.4rem' }}>
                      Related Codes (Siblings)
                    </div>
                    <div className="namaste-related-codes">
                      {record.relatedCodes.map((rel, i) => (
                        <button key={i} className="namaste-related-pill" onClick={() => handleSelectCode(rel.code)}
                          title={rel.englishEquivalent || rel.ayurvedicTerm || rel.code}>
                          {rel.code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Provenance ── */}
                <div className="namaste-provenance">
                  {record.source && (
                    <div className="namaste-provenance-row">
                      <span className="namaste-provenance-label">Source:</span>
                      <span>{record.source}</span>
                    </div>
                  )}
                  {record.catalogVersion && (
                    <div className="namaste-provenance-row">
                      <span className="namaste-provenance-label">Catalog:</span>
                      <span>{record.catalogVersion}</span>
                    </div>
                  )}
                  {record.lastUpdated && (
                    <div className="namaste-provenance-row">
                      <span className="namaste-provenance-label">Last Updated:</span>
                      <span>{record.lastUpdated}</span>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div style={{ margin: 'auto', textAlign: 'center', padding: '3rem 1rem', maxWidth: '420px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📖</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '0 0 0.4rem' }}>
                  Select a Medical Code
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                  Select any NAMASTE Ayurveda term or WHO ICD-11 global disease entity from the left to view full clinical profiles, doshas, Chikitsa frameworks, lab correlations, and cross-references.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
