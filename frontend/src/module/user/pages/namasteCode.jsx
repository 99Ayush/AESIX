import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../userPages.css';
import { userApi } from '../services/userApi';
import PatientSidebar from '../components/asidebar';

export default function NamasteCode() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedCode, setSelectedCode] = useState(null);
  const [record, setRecord] = useState(null);
  const [isLoadingRecord, setIsLoadingRecord] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      setSearchError('');
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      setSearchError('');
      try {
        const res = await userApi.searchNamaste(trimmed);
        setSuggestions(res.results || []);
      } catch (err) {
        setSearchError(err.message || 'Search failed');
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSelectCode = async (code) => {
    setSelectedCode(code);
    setIsLoadingRecord(true);
    setRecord(null);
    try {
      const data = await userApi.getDiseaseRecord(code);
      setRecord(data);
    } catch (err) {
      setSearchError(err.message || 'Failed to fetch record');
    } finally {
      setIsLoadingRecord(false);
    }
  };

  return (
    <div className="sih-page-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--mint-bg)' }}>
      <header className="sih-header">
        <div className="sih-header-inner">
          <div className="sih-brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
            <div className="sih-logo-badge">🛡</div>
            <div>
              <h1 className="sih-brand-title">MedVault</h1>
              <p className="sih-brand-subtitle">Clinical Directory</p>
            </div>
          </div>
          <nav className="sih-nav-menu">
            <button onClick={() => navigate('/dashboard')} className="sih-nav-btn">
              <span className="sih-nav-icon">🏠</span> Dashboard
            </button>
            <button onClick={() => navigate('/kindle')} className="sih-nav-btn">
              <span className="sih-nav-icon">📖</span> Directory
            </button>
          </nav>
        </div>
      </header>

      <div className="patient-main-container">
        <PatientSidebar activePage="health-code" />
        <div className="patient-content-area">

      <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div className="sih-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary-navy)', marginBottom: '0.4rem' }}>
            🌿 NAMASTE Code Search
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            Search across the official AYUSH NAMASTE clinical terms catalog.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="sih-card" style={{ padding: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="sih-input"
                placeholder="Search Jvara, Madhumeha, Kasa, Atisara..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ paddingLeft: '2.5rem', height: '46px', fontSize: '0.9rem' }}
              />
              <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.75rem', marginBottom: '0.75rem' }}>
              {['Jvara', 'Madhumeha', 'Kasa', 'Atisara'].map((sample) => (
                <button key={sample} onClick={() => setQuery(sample)} className="sih-btn sih-btn-outline" style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}>
                  {sample}
                </button>
              ))}
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>
              {isSearching ? 'Searching…' : `${suggestions.length} entries found`}
            </div>

            {searchError && (
              <div style={{ backgroundColor: '#FEF2F2', color: '#991B1B', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                {searchError}
              </div>
            )}

            <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {suggestions.map((item, idx) => {
                const isSelected = selectedCode === item.code;
                return (
                  <button key={item.code + idx} onClick={() => handleSelectCode(item.code)}
                    style={{ textAlign: 'left', padding: '0.85rem 1rem', backgroundColor: isSelected ? 'var(--mint-light)' : '#F8FAFC', border: isSelected ? '1.5px solid var(--teal-primary)' : '1px solid var(--border-light)', borderRadius: '10px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: 'var(--primary-navy)', fontSize: '0.9rem' }}>{item.code}</strong>
                      {item.hasEnrichedClinicalProfile && <span className="sih-badge sih-badge-teal" style={{ fontSize: '0.62rem' }}>Enriched</span>}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--teal-primary)', marginTop: '0.2rem' }}>{item.ayurvedicTerm}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{item.englishEquivalent || item.transliteration}</div>
                  </button>
                );
              })}
              {!query && <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Type a term or code above to search.</div>}
              {!isSearching && query && suggestions.length === 0 && !searchError && <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No matching NAMASTE codes found.</div>}
            </div>
          </div>

          <div className="sih-card" style={{ padding: '2rem', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            {isLoadingRecord ? (
              <div style={{ margin: 'auto', textAlign: 'center' }}><div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div><h4 style={{ color: 'var(--primary-navy)' }}>Loading Clinical Profile…</h4></div>
            ) : record ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary-navy)', margin: '0.2rem 0' }}>{record.code} — {record.ayurvedicTerm}</h2>
                  <p style={{ fontSize: '0.95rem', color: 'var(--teal-primary)', fontWeight: 600, margin: 0 }}>{record.englishEquivalent || record.transliteration}</p>
                </div>
                {record.clinicalOverview && (
                  <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>📋 Clinical Overview</h4>
                    <p style={{ fontSize: '0.78rem', margin: '0.25rem 0' }}><strong>Definition:</strong> {record.clinicalOverview.definition}</p>
                    {record.clinicalOverview.cardinalSymptoms?.length > 0 && <p style={{ fontSize: '0.78rem', margin: '0.25rem 0' }}><strong>Symptoms:</strong> {record.clinicalOverview.cardinalSymptoms.join(', ')}</p>}
                    {record.clinicalOverview.redFlags?.length > 0 && <p style={{ fontSize: '0.78rem', margin: '0.25rem 0', color: '#991B1B' }}><strong>Red Flags:</strong> {record.clinicalOverview.redFlags.join(', ')}</p>}
                  </div>
                )}
                {record.pathomechanism && (
                  <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>🌿 Pathomechanism (Samprapti)</h4>
                    <p style={{ fontSize: '0.78rem', margin: '0.25rem 0' }}><strong>Dominant Dosha:</strong> {record.pathomechanism.dominantDosha?.join(', ')}</p>
                    <p style={{ fontSize: '0.78rem', margin: '0.25rem 0' }}><strong>Srotas Involved:</strong> {record.pathomechanism.srotasInvolved?.join(', ')}</p>
                  </div>
                )}
                {record.treatmentFramework && (
                  <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>💊 Treatment Framework (Chikitsa)</h4>
                    <p style={{ fontSize: '0.75rem', lineHeight: 1.4 }}>{record.treatmentFramework.chikitsaSutra}</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ margin: 'auto', textAlign: 'center', padding: '3rem 1rem', maxWidth: '420px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📖</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '0 0 0.4rem' }}>Select a NAMASTE Code</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>Select a code from the left to view full evidence-based clinical profiles.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  </div>

    </div>
  );
}
