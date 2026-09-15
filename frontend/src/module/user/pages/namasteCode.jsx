import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../userPages.css';
import { userApi } from '../services/userApi';
import { LanguageSelect } from '../LanguageContext';
import PatientSidebar from '../components/asidebar';
import DoctorActivityBell from '../components/DoctorActivityBell';
import BrandLogo from '../../../shared/BrandLogo';

/* ─── Small reusable atoms ─────────────────────────────────────── */

function Tag({ children, color = 'var(--teal-primary)', bg = 'var(--mint-light)' }) {
  return (
    <span style={{
      display: 'inline-block', background: bg, color,
      borderRadius: '6px', padding: '0.15rem 0.55rem',
      fontSize: '0.72rem', fontWeight: 700,
      margin: '0.15rem 0.15rem 0 0', border: `1px solid ${color}22`,
    }}>
      {children}
    </span>
  );
}

function Section({ icon, title, children, accent = '#F8FAFC' }) {
  return (
    <div style={{ backgroundColor: accent, padding: '1rem 1.1rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
      <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <span>{icon}</span>{title}
      </h4>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <p style={{ fontSize: '0.78rem', margin: '0.22rem 0', lineHeight: 1.5 }}>
      <strong style={{ color: 'var(--primary-navy)' }}>{label}: </strong>{value}
    </p>
  );
}

function EmptyField({ label }) {
  return (
    <span className="namaste-empty-field">
      <span className="namaste-empty-field-label">{label}:</span> —
    </span>
  );
}

function Tooltip({ text, children }) {
  return (
    <span className="namaste-tooltip-wrapper">
      {children}
      <span className="namaste-tooltip">{text}</span>
    </span>
  );
}

/* ─── ICD-11 Mapping Panel ──────────────────────────────────────── */

function ICD11MappingPanel({ record }) {
  const hasPrimary = !!record.icd11PrimaryCode;
  const hasDetails = record.icd11Details && !record.icd11Details.unavailable;
  const state = hasPrimary ? 'mapped' : (record.icd11Details?.pending ? 'pending' : 'unmapped');

  const icon = state === 'mapped' ? '✅' : state === 'pending' ? '⏳' : '⚠️';
  const label = state === 'mapped' ? 'ICD-11 Mapping Available'
    : state === 'pending' ? 'ICD-11 Mapping Pending'
    : 'No ICD-11 Mapping Found';

  return (
    <div className={`namaste-mapping-panel ${state}`}>
      <div className={`namaste-mapping-title ${state}`}>
        <span>{icon}</span> {label}
        {state === 'mapped' && record.equivalenceType && (
          <span className="namaste-equivalence-badge">{record.equivalenceType}</span>
        )}
      </div>

      {state === 'mapped' && (
        <>
          <div className="namaste-mapping-row">
            <strong>ICD-11 Code:</strong> {record.icd11PrimaryCode}
          </div>
          {hasDetails && record.icd11Details.title?.['@value'] && (
            <div className="namaste-mapping-row">
              <strong>WHO Entity:</strong> {String(record.icd11Details.title['@value']).replace(/<[^>]*>/g, '')}
            </div>
          )}
          {record.icd11TM2Code && (
            <div className="namaste-mapping-row">
              <strong>TM2 Code:</strong> {record.icd11TM2Code}
            </div>
          )}
          {hasDetails && (record.icd11Details.definition?.['@value'] || typeof record.icd11Details.definition === 'string') && (
            <p className="namaste-mapping-note">
              {String(record.icd11Details.definition?.['@value'] || record.icd11Details.definition).replace(/<[^>]*>/g, '')}
            </p>
          )}
          {hasDetails && record.icd11Details.browserUrl && (
            <a
              href={record.icd11Details.browserUrl}
              target="_blank" rel="noreferrer"
              style={{ fontSize: '0.74rem', color: 'var(--teal-primary)', display: 'inline-block', marginTop: '0.5rem', textDecoration: 'underline' }}
            >
              View on WHO ICD-11 Browser ↗
            </a>
          )}
          {record.profileCompleteness != null && (
            <div className="namaste-completeness">
              <div className="namaste-completeness-bar-track">
                <div
                  className={`namaste-completeness-bar-fill ${record.profileCompleteness >= 75 ? 'high' : record.profileCompleteness >= 40 ? 'medium' : 'low'}`}
                  style={{ width: `${record.profileCompleteness}%` }}
                />
              </div>
              <span className="namaste-completeness-label">{record.profileCompleteness}% complete</span>
            </div>
          )}
        </>
      )}

      {state === 'unmapped' && (
        <p className="namaste-mapping-note">
          This NAMASTE entry does not yet have a confirmed ICD-11 cross-reference. The WHO ICD-11 TM2 chapter may include equivalent concepts — consult the{' '}
          <a href="https://icd.who.int/browse/2024-01/mms/en" target="_blank" rel="noreferrer" style={{ color: '#92400E' }}>
            WHO ICD-11 browser
          </a>{' '}
          for manual lookup.
        </p>
      )}

      {state === 'pending' && (
        <p className="namaste-mapping-note">ICD-11 mapping lookup is in progress or temporarily unavailable.</p>
      )}
    </div>
  );
}

/* ─── Detail panel ──────────────────────────────────────────────── */

function DetailPanel({ record, onNavigate }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(record.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Breadcrumb */}
      {record.parentDisease && (
        <nav className="namaste-breadcrumb">
          <button className="namaste-breadcrumb-item" onClick={() => onNavigate('ROOT')}>
            NAMASTE
          </button>
          <span className="namaste-breadcrumb-sep">›</span>
          <button
            className="namaste-breadcrumb-item"
            onClick={() => onNavigate(record.parentDisease.code)}
          >
            {record.parentDisease.code}
          </button>
          <span className="namaste-breadcrumb-sep">›</span>
          <span className="namaste-breadcrumb-current">{record.code}</span>
        </nav>
      )}

      {/* Header */}
      <div style={{ borderBottom: '2px solid var(--border-light)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
          <span className="sih-badge sih-badge-teal" style={{ fontFamily: 'monospace', letterSpacing: '0.03em' }}>
            {record.code}
          </span>
          {record.icd11PrimaryCode && (
            <span className="sih-badge sih-badge-green">ICD-11: {record.icd11PrimaryCode}</span>
          )}
          {record.systemOfMedicine && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              {record.systemOfMedicine}
            </span>
          )}
        </div>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--primary-navy)', margin: '0 0 0.25rem' }}>
          {record.englishEquivalent || record.transliteration || record.ayurvedicTerm}
        </h2>
        {record.ayurvedicTerm && (
          <p style={{ fontSize: '1rem', color: 'var(--teal-primary)', fontWeight: 700, margin: '0 0 0.1rem' }}>
            {record.ayurvedicTerm}
          </p>
        )}
        {record.transliteration && record.transliteration !== record.ayurvedicTerm && (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
            {record.transliteration}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="namaste-actions">
        <Tooltip text="Copy NAMASTE code to clipboard">
          <button className={`namaste-action-btn${copied ? ' copied' : ''}`} onClick={handleCopy}>
            {copied ? '✓ Copied' : '📋 Copy Code'}
          </button>
        </Tooltip>
        <Tooltip text="Print this clinical record">
          <button className="namaste-action-btn" onClick={() => window.print()}>
            🖨️ Print
          </button>
        </Tooltip>
      </div>

      {/* ICD-11 Mapping Panel */}
      <ICD11MappingPanel record={record} />

      {/* Prognosis */}
      {record.prognosis && (
        <Section icon="📊" title="Prognosis">
          <InfoRow label="Status" value={record.prognosis.status} />
          <InfoRow label="Risk Level" value={record.prognosis.riskLevel} />
        </Section>
      )}

      {/* Clinical Overview */}
      {record.clinicalOverview && (
        <Section icon="📋" title="Clinical Overview">
          {record.clinicalOverview.definition && (
            <p style={{ fontSize: '0.8rem', lineHeight: 1.6, margin: '0 0 0.6rem', color: 'var(--text-main)' }}>
              {record.clinicalOverview.definition}
            </p>
          )}

          {record.clinicalOverview.cardinalSymptoms?.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.4rem' }}>
                Cardinal Symptoms
              </div>
              <table className="namaste-symptom-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Symptom</th>
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

          {record.clinicalOverview.redFlags?.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991B1B', marginBottom: '0.3rem' }}>🚩 Red Flags</div>
              <div>{record.clinicalOverview.redFlags.map((f, i) => <Tag key={i} color="#991B1B" bg="#FEF2F2">{f}</Tag>)}</div>
            </div>
          )}
        </Section>
      )}

      {/* Biomedical Summary */}
      {record.biomedicalSummary && (
        <div className="namaste-biomedical-summary">
          <strong>Biomedical Correlation:</strong> {record.biomedicalSummary}
        </div>
      )}

      {/* Pathomechanism */}
      {record.pathomechanism && (
        <Section icon="🌿" title="Pathomechanism (Samprapti)">
          {record.pathomechanism.dominantDosha?.length > 0 && (
            <div style={{ marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.3rem' }}>Dominant Dosha</div>
              <div>{record.pathomechanism.dominantDosha.map((d, i) => <Tag key={i} color="#7C3AED" bg="#F5F3FF">{d}</Tag>)}</div>
            </div>
          )}
          {record.pathomechanism.srotasInvolved?.length > 0 && (
            <div style={{ marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.3rem' }}>Srotas Involved</div>
              <div>{record.pathomechanism.srotasInvolved.map((s, i) => <Tag key={i} color="#0369A1" bg="#F0F9FF">{s}</Tag>)}</div>
            </div>
          )}
          {record.pathomechanism.phenotypeCheck && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: '0.5rem 0 0', lineHeight: 1.5 }}>
              {record.pathomechanism.phenotypeCheck}
            </p>
          )}
        </Section>
      )}

      {/* Treatment Framework */}
      {record.treatmentFramework && (
        <Section icon="💊" title="Treatment Framework (Chikitsa)" accent="#FEFCE8">
          {record.treatmentFramework.chikitsaSutra && !record.treatmentFramework.chikitsaSutra.startsWith('No treatment') ? (
            <div style={{ backgroundColor: 'rgba(254, 240, 138, 0.35)', padding: '0.6rem 0.85rem', borderRadius: '8px', borderLeft: '3px solid #EAB308', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#854D0E', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>Chikitsa Sutra (Classical Principle)</div>
              <p style={{ fontSize: '0.8rem', lineHeight: 1.55, margin: 0, color: '#713F12', fontStyle: 'italic' }}>
                "{record.treatmentFramework.chikitsaSutra}"
              </p>
            </div>
          ) : (
            <div style={{ backgroundColor: 'rgba(254, 240, 138, 0.35)', padding: '0.6rem 0.85rem', borderRadius: '8px', borderLeft: '3px solid #EAB308', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#854D0E', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>Therapeutic Framework</div>
              <p style={{ fontSize: '0.78rem', lineHeight: 1.5, margin: 0, color: '#713F12', fontStyle: 'italic' }}>
                "दोषप्रत्यानीकचिकित्सा, निदानपरिवर्जनं च। (Nidana Parivarjana & Dosha-pratyanika therapy based on patient Prakriti.)"
              </p>
            </div>
          )}
          {record.treatmentFramework.classicalFormulations?.length > 0 && (
            <div style={{ marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.3rem' }}>Classical Formulations</div>
              <div>{record.treatmentFramework.classicalFormulations.map((f, i) => <Tag key={i} color="#92400E" bg="#FFFBEB">{f}</Tag>)}</div>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
            {record.treatmentFramework.pathya?.length > 0 && (
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#166534', marginBottom: '0.25rem' }}>✅ Pathya (Beneficial)</div>
                {record.treatmentFramework.pathya.map((p, i) => (
                  <div key={i} style={{ fontSize: '0.73rem', color: 'var(--text-main)', padding: '0.1rem 0' }}>• {p}</div>
                ))}
              </div>
            )}
            {record.treatmentFramework.apathya?.length > 0 && (
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#991B1B', marginBottom: '0.25rem' }}>❌ Apathya (Avoid)</div>
                {record.treatmentFramework.apathya.map((a, i) => (
                  <div key={i} style={{ fontSize: '0.73rem', color: 'var(--text-main)', padding: '0.1rem 0' }}>• {a}</div>
                ))}
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Lab Correlations */}
      {record.labCorrelations?.suggestedTests?.length > 0 && (
        <Section icon="🔬" title="Lab Correlations">
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.3rem' }}>Suggested Tests</div>
            <div>{record.labCorrelations.suggestedTests.map((t, i) => <Tag key={i} color="#0F766E" bg="#F0FDFA">{t}</Tag>)}</div>
          </div>
          {record.labCorrelations.targets && Object.keys(record.labCorrelations.targets).length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.3rem' }}>Targets</div>
              {Object.entries(record.labCorrelations.targets).map(([k, v]) => (
                <div key={k} style={{ fontSize: '0.74rem', color: 'var(--text-main)', padding: '0.1rem 0' }}>
                  <strong>{k}:</strong> {v}
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* Related / Sibling Codes */}
      {record.relatedCodes?.length > 0 && (
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.4rem' }}>
            Related Codes (Siblings)
          </div>
          <div className="namaste-related-codes">
            {record.relatedCodes.map((rel, i) => (
              <Tooltip key={i} text={rel.englishEquivalent || rel.ayurvedicTerm || rel.code}>
                <button
                  className="namaste-related-pill"
                  onClick={() => onNavigate(rel.code)}
                >
                  {rel.code}
                </button>
              </Tooltip>
            ))}
          </div>
        </div>
      )}

      {/* Provenance */}
      <div className="namaste-provenance">
        {record.source && (
          <div className="namaste-provenance-row">
            <span className="namaste-provenance-label">Source:</span>
            <span>{record.source}</span>
          </div>
        )}
        {record.version && (
          <div className="namaste-provenance-row">
            <span className="namaste-provenance-label">Version:</span>
            <span>{record.version}</span>
          </div>
        )}
        {record.lastUpdated && (
          <div className="namaste-provenance-row">
            <span className="namaste-provenance-label">Last Updated:</span>
            <span>{record.lastUpdated}</span>
          </div>
        )}
        {!record.source && !record.version && !record.lastUpdated && (
          <EmptyField label="Provenance" />
        )}
      </div>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────── */

const SYSTEM_FILTERS = ['All', 'Ayurveda', 'Yoga', 'Unani', 'Siddha', 'Homeopathy'];

export default function NamasteCode() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [systemFilter, setSystemFilter] = useState('All');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedCode, setSelectedCode] = useState(null);
  const [record, setRecord] = useState(null);
  const [isLoadingRecord, setIsLoadingRecord] = useState(false);
  const [recordError, setRecordError] = useState('');
  const debounceRef = useRef(null);

  const filteredSuggestions = systemFilter === 'All'
    ? suggestions
    : suggestions.filter(s => (s.systemOfMedicine || '').toLowerCase().includes(systemFilter.toLowerCase()));

  const fetchRecord = useCallback(async (code) => {
    setSelectedCode(code);
    setIsLoadingRecord(true);
    setRecord(null);
    setRecordError('');
    try {
      const data = await userApi.getDiseaseRecord(code);
      setRecord(data);
    } catch (err) {
      setRecordError(err.message || 'Failed to fetch record');
    } finally {
      setIsLoadingRecord(false);
    }
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!trimmed) {
      debounceRef.current = setTimeout(() => {
         
        setSuggestions([]);
        setSearchError('');
      }, 0);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      setSearchError('');
      try {
        const res = await userApi.searchNamaste(trimmed);
        setSuggestions(res?.results || []);
      } catch (err) {
        setSearchError(err.message || 'Search failed');
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleNavigate = (code) => {
    if (code === 'ROOT') {
      setQuery('');
      setSuggestions([]);
      setRecord(null);
      setSelectedCode(null);
    } else {
      setQuery(code);
      fetchRecord(code);
    }
  };

  return (
    <div className="sih-page-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--mint-bg)' }}>

      <header className="sih-header">
        <div className="sih-header-inner">
          <BrandLogo subtitle="Clinical Directory" />
          <nav className="sih-nav-menu">
            <button onClick={() => navigate('/dashboard')} className="sih-nav-btn">
              <span className="sih-nav-icon">🏠</span> Dashboard
            </button>
            <button onClick={() => navigate('/kindle')} className="sih-nav-btn">
              <span className="sih-nav-icon">📖</span> Directory
            </button>
          </nav>
          <DoctorActivityBell />
          <LanguageSelect />
        </div>
      </header>

      <div className="patient-main-container">
        <PatientSidebar activePage="health-code" />
        <div className="patient-content-area">
          <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '1300px', margin: '0 auto', width: '100%' }}>
        <div className="sih-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary-navy)', marginBottom: '0.4rem' }}>
            🌿 NAMASTE Code Search
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            Search the AYUSH NAMASTE clinical terms catalog — Ayurveda, Yoga, Unani, Siddha &amp; Homeopathy.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* Search Panel */}
          <div className="sih-card" style={{ padding: '1.5rem', position: 'sticky', top: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="sih-input"
                placeholder="Search Jvara, Madhumeha, Kasa, EF-2.4.4…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ paddingLeft: '2.5rem', height: '46px', fontSize: '0.9rem' }}
              />
              <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
              {['Jvara', 'Madhumeha', 'Kasa', 'Atisara', 'Prameha'].map((s) => (
                <button key={s} onClick={() => setQuery(s)} className="sih-btn sih-btn-outline" style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}>{s}</button>
              ))}
            </div>

            <div className="namaste-system-filter" style={{ marginTop: '0.75rem' }}>
              {SYSTEM_FILTERS.map(f => (
                <button
                  key={f}
                  className={`namaste-system-pill${systemFilter === f ? ' active' : ''}`}
                  onClick={() => setSystemFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>
              {isSearching ? '⏳ Searching…' : `${filteredSuggestions.length} entries found`}
            </div>

            {searchError && (
              <div style={{ backgroundColor: '#FEF2F2', color: '#991B1B', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                ⚠️ {searchError}
              </div>
            )}

            <div style={{ maxHeight: '55vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {filteredSuggestions.map((item, idx) => {
                const isSelected = selectedCode === item.code;
                return (
                  <button
                    key={item.code + idx}
                    onClick={() => fetchRecord(item.code)}
                    style={{
                      textAlign: 'left', padding: '0.8rem 1rem',
                      backgroundColor: isSelected ? 'var(--mint-light)' : '#F8FAFC',
                      border: isSelected ? '1.5px solid var(--teal-primary)' : '1px solid var(--border-light)',
                      borderRadius: '10px', cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: 'var(--primary-navy)', fontSize: '0.85rem', fontFamily: 'monospace' }}>{item.code}</strong>
                      {item.hasEnrichedClinicalProfile && (
                        <span className="sih-badge sih-badge-teal" style={{ fontSize: '0.6rem' }}>Enriched</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--teal-primary)', marginTop: '0.15rem' }}>
                      {item.englishEquivalent || item.transliteration}
                    </div>
                    {item.ayurvedicTerm && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{item.ayurvedicTerm}</div>
                    )}
                  </button>
                );
              })}
              {!query && (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Type a term or NAMASTE code above to search.
                </div>
              )}
              {!isSearching && query && filteredSuggestions.length === 0 && !searchError && (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No matching NAMASTE codes found.
                </div>
              )}
            </div>
          </div>

          {/* Detail Panel */}
          <div className="sih-card" style={{ padding: '2rem', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            {isLoadingRecord ? (
              <div style={{ margin: 'auto', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔄</div>
                <h4 style={{ color: 'var(--primary-navy)' }}>Loading Clinical Profile…</h4>
              </div>
            ) : recordError ? (
              <div style={{ margin: 'auto', textAlign: 'center', maxWidth: '400px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚠️</div>
                <h4 style={{ color: '#991B1B' }}>Could not load record</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{recordError}</p>
              </div>
            ) : record ? (
              <div style={{ overflowY: 'auto' }}>
                <DetailPanel record={record} onNavigate={handleNavigate} />
              </div>
            ) : (
              <div style={{ margin: 'auto', textAlign: 'center', padding: '3rem 1rem', maxWidth: '420px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📖</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '0 0 0.4rem' }}>
                  Select a NAMASTE Code
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                  Search on the left and click a code to view its full Ayurvedic clinical profile, treatment framework, lab correlations and WHO ICD-11 cross-mapping.
                </p>
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
