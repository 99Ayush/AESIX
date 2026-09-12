import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../userPages.css';

// Mock database for Health Codes
const HEALTH_CODES_DB = {
  namaste: [
    {
      code: 'A-101',
      title: 'Jwara (Fever / Hyperpyrexia)',
      category: 'Ayurveda Morbidity Code',
      system: 'AYUSH - Ayurveda',
      description: 'Systemic thermal elevation characterized by disturbance in Agni and Dhatu metabolism.',
      mappedCode: 'ICD-11: MG26 (Pyrexia of unknown origin)',
      clinicalNotes: 'Classified under Nidan Sthan. Common presentations include Santata and Vishama Jwara.',
      status: 'Active AYUSH Standard'
    },
    {
      code: 'A-102',
      title: 'Kasa (Cough / Respiratory Disorder)',
      category: 'Ayurveda Morbidity Code',
      system: 'AYUSH - Ayurveda',
      description: 'Respiratory illness involving obstruction of Prana Vayu with coughing reflexes.',
      mappedCode: 'ICD-11: MD11 (Cough)',
      clinicalNotes: 'Subtypes include Vataja, Pittaja, Kaphaja, Kshataja and Kshayaja Kasa.',
      status: 'Active AYUSH Standard'
    },
    {
      code: 'U-201',
      title: 'Humma (Pyrexia / Fever)',
      category: 'Unani Medicine Code',
      system: 'AYUSH - Unani',
      description: 'Abnormal heat originating in the heart and vessels spreading through the humors.',
      mappedCode: 'ICD-11: MG26 (Pyrexia)',
      clinicalNotes: 'Managed according to Dam (blood) and Samra (yellow bile) equilibrium principles.',
      status: 'Active Unani Standard'
    },
    {
      code: 'S-301',
      title: 'Suram (Febrile Illness)',
      category: 'Siddha Medicine Code',
      system: 'AYUSH - Siddha',
      description: 'Elevated temperature condition attributed to Mukkuttram (Vatham, Pitham, Kapham) discord.',
      mappedCode: 'ICD-11: MG26',
      clinicalNotes: 'Siddha diagnostic criteria evaluate Naadi (pulse) and Kan (eye examination).',
      status: 'Active Siddha Standard'
    },
    {
      code: 'A-204',
      title: 'Madhumeha (Diabetes Mellitus)',
      category: 'Ayurveda Morbidity Code',
      system: 'AYUSH - Ayurveda',
      description: 'Metabolic disorder characterized by sweet urine, excessive thirst and tissue depletion.',
      mappedCode: 'ICD-11: 5A11 (Type 2 Diabetes Mellitus)',
      clinicalNotes: 'Categorized under Prameha morbidity spectrum in classical Ayurveda literature.',
      status: 'Active AYUSH Standard'
    }
  ],
  icd11: [
    {
      code: '1B10',
      title: 'Tuberculosis of respiratory system',
      category: 'Certain infectious or parasitic diseases',
      system: 'WHO ICD-11',
      description: 'Infection caused by Mycobacterium tuberculosis affecting lungs and bronchial structures.',
      mappedCode: 'NAMASTE: A-108 (Rajayakshma)',
      clinicalNotes: 'Includes pulmonary tuberculosis confirmed by sputum microscopy or NAAT testing.',
      status: 'WHO Official Standard'
    },
    {
      code: '5A11',
      title: 'Type 2 Diabetes Mellitus',
      category: 'Endocrine, nutritional or metabolic diseases',
      system: 'WHO ICD-11',
      description: 'Metabolic disorder characterized by hyperglycemia resulting from insulin resistance.',
      mappedCode: 'NAMASTE: A-204 (Madhumeha)',
      clinicalNotes: 'Requires regular HbA1c monitoring, glycemic control and metabolic evaluation.',
      status: 'WHO Official Standard'
    },
    {
      code: '1A00',
      title: 'Cholera',
      category: 'Infectious intestinal diseases',
      system: 'WHO ICD-11',
      description: 'Acute diarrhoeal infection caused by ingestion of food or water contaminated with Vibrio cholerae.',
      mappedCode: 'NAMASTE: A-112 (Visuchika)',
      clinicalNotes: 'Characterized by severe watery diarrhea, rapid dehydration and electrolyte imbalance.',
      status: 'WHO Official Standard'
    },
    {
      code: 'BA00',
      title: 'Essential Hypertension',
      category: 'Diseases of the circulatory system',
      system: 'WHO ICD-11',
      description: 'Persistent arterial blood pressure elevation without an identifiable secondary cause.',
      mappedCode: 'NAMASTE: A-305 (Rakta Gata Vata)',
      clinicalNotes: 'Defined as systolic BP ≥ 140 mmHg or diastolic BP ≥ 90 mmHg on repeated checks.',
      status: 'WHO Official Standard'
    },
    {
      code: 'MD11',
      title: 'Cough',
      category: 'Symptoms or clinical signs of respiratory system',
      system: 'WHO ICD-11',
      description: 'Sudden, repetitive reflex to clear the large breathing passages of fluids or irritants.',
      mappedCode: 'NAMASTE: A-102 (Kasa)',
      clinicalNotes: 'Evaluated as acute (< 3 weeks), subacute (3-8 weeks), or chronic (> 8 weeks).',
      status: 'WHO Official Standard'
    }
  ]
};

export default function KindleMain() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('namaste'); // 'namaste' or 'icd11'
  
  // Search inputs
  const [namasteQuery, setNamasteQuery] = useState('');
  const [icdQuery, setIcdQuery] = useState('');
  
  // Active search state & results
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchedTerm, setSearchedTerm] = useState('');

  // Header state
  const [language, setLanguage] = useState('English');
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

  // Perform search logic
  const handleSearch = (type, queryText) => {
    const query = (queryText !== undefined ? queryText : (type === 'namaste' ? namasteQuery : icdQuery)).trim();
    
    if (!query) {
      setHasSearched(false);
      setSearchResult(null);
      setSearchedTerm('');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    setSearchedTerm(query);

    // Simulate search delay for realistic response state
    setTimeout(() => {
      const dbList = HEALTH_CODES_DB[type] || [];
      const lowerQ = query.toLowerCase();

      // Find match by code, title, or mapped code
      const match = dbList.find(
        (item) =>
          item.code.toLowerCase() === lowerQ ||
          item.code.toLowerCase().replace('-', '') === lowerQ.replace('-', '') ||
          item.title.toLowerCase().includes(lowerQ) ||
          item.category.toLowerCase().includes(lowerQ)
      );

      setSearchResult(match || null);
      setIsSearching(false);
    }, 400);
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setHasSearched(false);
    setSearchResult(null);
    setSearchedTerm('');
    if (tab === 'namaste' && namasteQuery) {
      handleSearch('namaste', namasteQuery);
    } else if (tab === 'icd11' && icdQuery) {
      handleSearch('icd11', icdQuery);
    }
  };

  const handleClear = (type) => {
    if (type === 'namaste') setNamasteQuery('');
    else setIcdQuery('');
    setHasSearched(false);
    setSearchResult(null);
    setSearchedTerm('');
  };

  return (
    <div className="sih-page-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--mint-bg)' }}>
      
      {/* ===== HEADER ===== */}
      <header className="sih-header">
        <div className="sih-header-inner">
          
          {/* Left Navigation */}
          <nav className="sih-nav-menu" style={{ gap: '0.75rem' }}>
            <button onClick={() => navigate('/abha')} className="sih-nav-btn">
              <span className="sih-nav-icon">🛡</span> ABHA
            </button>
            <button onClick={() => navigate('/uploadDoc')} className="sih-nav-btn">
              <span className="sih-nav-icon">📄</span> Docs
            </button>
            <button onClick={() => navigate('/basicInfo')} className="sih-nav-btn">
              <span className="sih-nav-icon">🔍</span> Basic Info
            </button>
          </nav>

          {/* Right Controls */}
          <div className="sih-header-controls" style={{ gap: '1rem' }}>
            {/* Language Selector */}
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

            {/* Profile Element */}
            <div className="sih-profile-wrapper" ref={profileRef}>
              <button
                className="sih-profile-trigger"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-label="User Profile"
              >
                <div className="sih-profile-avatar">RK</div>
                <span className="sih-profile-name">Profile</span>
                <span className={`sih-profile-chevron ${profileOpen ? 'open' : ''}`}>▾</span>
              </button>
              {profileOpen && (
                <div className="sih-profile-dropdown">
                  <button
                    className="sih-profile-dropdown-item"
                    onClick={() => { navigate('/profile'); setProfileOpen(false); }}
                  >
                    <span className="dd-icon">👤</span> Profile
                  </button>
                  <button
                    className="sih-profile-dropdown-item danger"
                    onClick={() => setProfileOpen(false)}
                  >
                    <span className="dd-icon">🚪</span> Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* AESIX Logo */}
            <div
              className="sih-brand"
              onClick={() => navigate('/dashboard')}
              style={{ cursor: 'pointer' }}
            >
              <div className="sih-logo-badge" style={{ fontWeight: 900, letterSpacing: '-0.05em' }}>
                🛡
              </div>
              <div>
                <h1 className="sih-brand-title" style={{ fontSize: '1rem', fontWeight: 800 }}>
                  AESIX
                </h1>
                <p className="sih-brand-subtitle" style={{ fontSize: '0.6rem' }}>
                  Health System
                </p>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="sih-main-layout" style={{ flex: 1, padding: '2.5rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'start',
            width: '100%',
            maxWidth: '1150px',
            margin: '0 auto'
          }}
        >
          {/* LEFT COLUMN: HEALTH CODE SEARCH CARD */}
          <div
            className="sih-card"
            style={{
              padding: '2.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              boxShadow: 'var(--shadow-md)',
              borderRadius: 'var(--radius-xl)'
            }}
          >
            {/* Header */}
            <div>
              <span
                className="sih-badge sih-badge-teal"
                style={{ marginBottom: '0.6rem', fontSize: '0.7rem' }}
              >
                Classification Portal
              </span>
              <h2
                style={{
                  fontSize: '1.6rem',
                  fontWeight: 900,
                  color: 'var(--primary-navy)',
                  letterSpacing: '0.02em',
                  margin: 0
                }}
              >
                SELECT HEALTH CODE
              </h2>
              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.35rem',
                  lineHeight: '1.4'
                }}
              >
                Search and verify standard medical classification codes across NAMASTE and ICD-11 systems.
              </p>
            </div>

            {/* TAB SELECTOR: NAMASTE vs ICD-11 */}
            <div
              style={{
                display: 'flex',
                backgroundColor: 'var(--mint-bg)',
                padding: '0.3rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                gap: '0.3rem'
              }}
            >
              <button
                type="button"
                onClick={() => handleTabSwitch('namaste')}
                style={{
                  flex: 1,
                  padding: '0.65rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  transition: 'all 0.2s',
                  backgroundColor: activeTab === 'namaste' ? 'var(--white)' : 'transparent',
                  color: activeTab === 'namaste' ? 'var(--teal-primary)' : 'var(--text-muted)',
                  boxShadow: activeTab === 'namaste' ? 'var(--shadow-sm)' : 'none',
                  border: activeTab === 'namaste' ? '1px solid var(--navbar-border)' : '1px solid transparent',
                  cursor: 'pointer'
                }}
              >
                🌿 NAMASTE CODE
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch('icd11')}
                style={{
                  flex: 1,
                  padding: '0.65rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  transition: 'all 0.2s',
                  backgroundColor: activeTab === 'icd11' ? 'var(--white)' : 'transparent',
                  color: activeTab === 'icd11' ? 'var(--teal-primary)' : 'var(--text-muted)',
                  boxShadow: activeTab === 'icd11' ? 'var(--shadow-sm)' : 'none',
                  border: activeTab === 'icd11' ? '1px solid var(--navbar-border)' : '1px solid transparent',
                  cursor: 'pointer'
                }}
              >
                🌐 ICD-11 CODE
              </button>
            </div>

            {/* SEARCH INPUT AREA */}
            <div>
              {activeTab === 'namaste' ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch('namaste');
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                >
                  <label
                    htmlFor="namaste-search-input"
                    style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-navy)', textTransform: 'uppercase', letterSpacing: '0.04em' }}
                  >
                    Enter NAMASTE Health Code
                  </label>
                  
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '1rem',
                        fontSize: '1rem',
                        color: 'var(--text-muted)',
                        pointerEvents: 'none'
                      }}
                    >
                      🔍
                    </span>
                    
                    <input
                      id="namaste-search-input"
                      type="text"
                      value={namasteQuery}
                      onChange={(e) => setNamasteQuery(e.target.value)}
                      placeholder="e.g. A-101, A-102, U-201, S-301..."
                      className="sih-input"
                      style={{
                        paddingLeft: '2.75rem',
                        paddingRight: namasteQuery ? '5.5rem' : '4.5rem',
                        height: '48px',
                        borderRadius: 'var(--radius-lg)',
                        fontSize: '0.9rem',
                        fontWeight: 600
                      }}
                    />

                    {namasteQuery && (
                      <button
                        type="button"
                        onClick={() => handleClear('namaste')}
                        style={{
                          position: 'absolute',
                          right: '4rem',
                          color: 'var(--text-muted)',
                          fontSize: '0.85rem',
                          padding: '0.2rem 0.4rem',
                          cursor: 'pointer'
                        }}
                      >
                        ✕
                      </button>
                    )}

                    <button
                      type="submit"
                      className="sih-btn sih-btn-primary"
                      style={{
                        position: 'absolute',
                        right: '6px',
                        padding: '0.45rem 0.9rem',
                        height: '36px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.8rem'
                      }}
                    >
                      Search
                    </button>
                  </div>

                  {/* Sample suggestions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Try samples:</span>
                    {['A-101', 'A-102', 'U-201', 'A-204'].map((sample) => (
                      <button
                        key={sample}
                        type="button"
                        onClick={() => {
                          setNamasteQuery(sample);
                          handleSearch('namaste', sample);
                        }}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: 'var(--teal-primary)',
                          backgroundColor: 'var(--mint-light)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '999px',
                          border: '1px solid rgba(47, 143, 131, 0.2)',
                          cursor: 'pointer'
                        }}
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </form>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch('icd11');
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                >
                  <label
                    htmlFor="icd-search-input"
                    style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-navy)', textTransform: 'uppercase', letterSpacing: '0.04em' }}
                  >
                    Enter ICD-11 Health Code
                  </label>
                  
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '1rem',
                        fontSize: '1rem',
                        color: 'var(--text-muted)',
                        pointerEvents: 'none'
                      }}
                    >
                      🔍
                    </span>

                    <input
                      id="icd-search-input"
                      type="text"
                      value={icdQuery}
                      onChange={(e) => setIcdQuery(e.target.value)}
                      placeholder="e.g. 1B10, 5A11, 1A00, BA00..."
                      className="sih-input"
                      style={{
                        paddingLeft: '2.75rem',
                        paddingRight: icdQuery ? '5.5rem' : '4.5rem',
                        height: '48px',
                        borderRadius: 'var(--radius-lg)',
                        fontSize: '0.9rem',
                        fontWeight: 600
                      }}
                    />

                    {icdQuery && (
                      <button
                        type="button"
                        onClick={() => handleClear('icd11')}
                        style={{
                          position: 'absolute',
                          right: '4rem',
                          color: 'var(--text-muted)',
                          fontSize: '0.85rem',
                          padding: '0.2rem 0.4rem',
                          cursor: 'pointer'
                        }}
                      >
                        ✕
                      </button>
                    )}

                    <button
                      type="submit"
                      className="sih-btn sih-btn-primary"
                      style={{
                        position: 'absolute',
                        right: '6px',
                        padding: '0.45rem 0.9rem',
                        height: '36px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.8rem'
                      }}
                    >
                      Search
                    </button>
                  </div>

                  {/* Sample suggestions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Try samples:</span>
                    {['1B10', '5A11', '1A00', 'BA00'].map((sample) => (
                      <button
                        key={sample}
                        type="button"
                        onClick={() => {
                          setIcdQuery(sample);
                          handleSearch('icd11', sample);
                        }}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: 'var(--teal-primary)',
                          backgroundColor: 'var(--mint-light)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '999px',
                          border: '1px solid rgba(47, 143, 131, 0.2)',
                          cursor: 'pointer'
                        }}
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </form>
              )}
            </div>

            {/* SEARCH RESULT DISPLAY AREA */}
            <div
              style={{
                borderTop: '1px solid var(--border-light)',
                paddingTop: '1.25rem',
                minHeight: '180px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              {/* STATE 1: SEARCHING (SPINNER) */}
              {isSearching ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: '3px solid var(--mint-light)',
                      borderTopColor: 'var(--teal-primary)',
                      animation: 'spin 0.8s linear infinite'
                    }}
                  />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-navy)', margin: 0 }}>
                    Searching health classification system...
                  </p>
                </div>
              ) : !hasSearched ? (
                /* STATE 2: EMPTY / INSTRUCTIONAL STATE */
                <div
                  style={{
                    textAlign: 'center',
                    padding: '1.75rem 1rem',
                    backgroundColor: 'var(--mint-bg)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px dashed var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ fontSize: '1.8rem' }}>📋</div>
                  <p style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                    No Code Searched Yet
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, maxWidth: '300px' }}>
                    Enter a health code above or select a sample code to verify classification details and cross-references.
                  </p>
                </div>
              ) : searchResult ? (
                /* STATE 3: CODE FOUND STATE */
                <div
                  style={{
                    backgroundColor: 'var(--mint-bg)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1.5px solid var(--teal-primary)',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                    animation: 'fadeIn 0.2s ease-out'
                  }}
                >
                  {/* Top Bar: Code Pill & Status Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span
                        style={{
                          backgroundColor: 'var(--primary-navy)',
                          color: 'var(--white)',
                          fontFamily: 'monospace',
                          fontWeight: 900,
                          fontSize: '1rem',
                          padding: '0.3rem 0.75rem',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        {searchResult.code}
                      </span>
                      <span className="sih-badge sih-badge-teal" style={{ fontSize: '0.68rem' }}>
                        ✓ {searchResult.system}
                      </span>
                    </div>

                    <span className="sih-badge sih-badge-green" style={{ fontSize: '0.65rem' }}>
                      {searchResult.status}
                    </span>
                  </div>

                  {/* Title & Category */}
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary-navy)', margin: 0 }}>
                      {searchResult.title}
                    </h3>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--teal-primary)', margin: '0.15rem 0 0 0' }}>
                      Category: {searchResult.category}
                    </p>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', margin: 0, lineHeight: '1.4' }}>
                    {searchResult.description}
                  </p>

                  {/* Cross-map / Clinical Info Box */}
                  <div
                    style={{
                      backgroundColor: 'var(--white)',
                      padding: '0.75rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                        🔄 Mapped Cross-Reference:
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--teal-primary)' }}>
                        {searchResult.mappedCode}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                      <strong>Clinical Notes:</strong> {searchResult.clinicalNotes}
                    </p>
                  </div>
                </div>
              ) : (
                /* STATE 4: CODE NOT FOUND STATE */
                <div
                  style={{
                    backgroundColor: '#FEF2F2',
                    borderRadius: 'var(--radius-lg)',
                    border: '1.5px solid #FCA5A5',
                    padding: '1.25rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.6rem'
                  }}
                >
                  <div style={{ fontSize: '1.6rem' }}>⚠️</div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#991B1B', margin: 0 }}>
                      No Code Found for "{searchedTerm}"
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: '#B91C1C', marginTop: '0.25rem', margin: 0 }}>
                      Check for typos or try searching sample codes like{' '}
                      <strong>{activeTab === 'namaste' ? 'A-101, A-102, U-201' : '1B10, 5A11, 1A00'}</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: BOOK / MEDICAL RECORD ILLUSTRATION */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '1rem'
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '400px',
                aspectRatio: '1 / 1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Background Glow */}
              <div
                style={{
                  position: 'absolute',
                  width: '80%',
                  height: '80%',
                  borderRadius: '50%',
                  backgroundColor: 'var(--mint-light)',
                  filter: 'blur(20px)',
                  opacity: 0.7,
                  zIndex: 0
                }}
              />

              {/* Medical Record Book Vector Illustration */}
              <svg
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}
              >
                {/* Shadow */}
                <ellipse cx="200" cy="340" rx="130" ry="18" fill="#12304A" opacity="0.12" />

                {/* Stacked Pages */}
                <rect x="110" y="75" width="200" height="250" rx="16" fill="#CBD5E1" opacity="0.5" />
                <rect x="105" y="70" width="200" height="250" rx="16" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />

                {/* Main Book Cover */}
                <rect x="95" y="60" width="195" height="255" rx="16" fill="#12304A" />
                
                {/* Book Spine Accent */}
                <rect x="95" y="60" width="24" height="255" rx="4" fill="#2F8F83" />

                {/* Spine stitches */}
                <line x1="107" y1="80" x2="107" y2="295" stroke="#E4F5EF" strokeWidth="2" strokeDasharray="6 6" opacity="0.6" />

                {/* Cover Inner Border */}
                <rect x="132" y="80" width="145" height="215" rx="10" stroke="#2F8F83" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />

                {/* Central Emblem */}
                <circle cx="204" cy="150" r="36" fill="#2F8F83" />
                <circle cx="204" cy="150" r="30" fill="#E4F5EF" />

                {/* Medical Cross */}
                <rect x="198" y="132" width="12" height="36" rx="3" fill="#2F8F83" />
                <rect x="186" y="144" width="36" height="12" rx="3" fill="#2F8F83" />

                {/* Bookmark ribbon */}
                <path d="M235 60 V120 L245 110 L255 120 V60 Z" fill="#3BA99B" />

                {/* Health Code Lines on Cover */}
                <rect x="150" y="210" width="110" height="8" rx="4" fill="#E4F5EF" />
                <rect x="165" y="228" width="80" height="6" rx="3" fill="#2F8F83" opacity="0.8" />
                <rect x="175" y="242" width="60" height="6" rx="3" fill="#E4F5EF" opacity="0.6" />

                {/* Stethoscope */}
                <path
                  d="M75 180 C 60 210, 60 270, 110 290 C 140 300, 175 285, 175 285"
                  stroke="#2F8F83"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <circle cx="75" cy="180" r="7" fill="#12304A" />

                {/* Decorative Sparkles */}
                <g opacity="0.8">
                  <path d="M310 110 L314 122 L326 126 L314 130 L310 142 L306 130 L294 126 L306 122 Z" fill="#2F8F83" />
                  <path d="M80 100 L82 108 L90 110 L82 112 L80 120 L78 112 L70 110 L78 108 Z" fill="#3BA99B" />
                  <circle cx="320" cy="240" r="6" fill="#E4F5EF" stroke="#2F8F83" strokeWidth="2" />
                </g>
              </svg>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}