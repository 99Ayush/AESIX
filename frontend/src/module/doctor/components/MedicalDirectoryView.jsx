import React, { useEffect, useState } from 'react';
import { userApi } from '../../user/services/userApi';

const itemLabel = (item) => String(
  item.title || item.theCodeAndTitle?.title || item.matchingPhrases?.[0]?.label || item.englishEquivalent || item.id || item.code || 'Clinical record',
).replace(/<[^>]*>/g, '');

const itemCode = (item) => item.code || item.theCode || item.theCodeAndTitle?.code || item.id || item.entityId || itemLabel(item);

export const MedicalDirectoryView = () => {
  const [source, setSource] = useState('namaste');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [record, setRecord] = useState(null);
  const [recordLoading, setRecordLoading] = useState(false);

  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setResults([]);
      setError('');
      return undefined;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const response = source === 'namaste'
          ? await userApi.searchNamaste(term)
          : await userApi.searchICD11(term);
        setResults(source === 'namaste'
          ? (response.results || [])
          : (response.destinationEntities || response.entities || response.items || []));
      } catch (requestError) {
        setResults([]);
        setError(requestError.message || 'Search failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query, source]);

  const selectRecord = async (item) => {
    const code = itemCode(item);
    setRecordLoading(true);
    setRecord(null);
    setError('');
    try {
      setRecord(await userApi.getDiseaseRecord(code, item.entityUri || item.id));
    } catch (requestError) {
      setError(requestError.message || 'Unable to load this clinical record.');
    } finally {
      setRecordLoading(false);
    }
  };

  const switchSource = (nextSource) => {
    setSource(nextSource);
    setQuery('');
    setResults([]);
    setRecord(null);
    setError('');
  };

  return (
    <section className="doc-card doc-medical-directory">
      <div className="doc-directory-heading">
        <div>
          <p className="doc-directory-eyebrow">Clinical reference</p>
          <h3 className="doc-card-title">Medical Directory</h3>
          <p className="doc-directory-description">Search NAMASTE clinical terms and WHO ICD-11 disease classifications without leaving the doctor portal.</p>
        </div>
      </div>

      <div className="doc-directory-tabs" role="tablist" aria-label="Directory source">
        <button className={source === 'namaste' ? 'active' : ''} onClick={() => switchSource('namaste')} role="tab" aria-selected={source === 'namaste'}>NAMASTE / AYUSH</button>
        <button className={source === 'icd11' ? 'active' : ''} onClick={() => switchSource('icd11')} role="tab" aria-selected={source === 'icd11'}>WHO ICD-11</button>
      </div>

      <label className="doc-directory-search-label" htmlFor="doctor-directory-search">
        Search {source === 'namaste' ? 'clinical terms or codes' : 'diseases or ICD-11 codes'}
      </label>
      <input
        id="doctor-directory-search"
        className="doc-directory-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={source === 'namaste' ? 'e.g. Jwara or NAMASTE code' : 'e.g. Diabetes, Fever, 5A11'}
      />

      {error && <p className="doc-directory-error">{error}</p>}
      {loading && <p className="doc-empty-text">Searching directory…</p>}
      {!loading && query.trim() && !error && results.length === 0 && <p className="doc-empty-text">No matching records found.</p>}

      {results.length > 0 && (
        <div className="doc-medical-results">
          {results.slice(0, 12).map((item, index) => (
            <button key={`${itemCode(item)}-${index}`} className="doc-medical-result" onClick={() => selectRecord(item)}>
              <strong>{itemLabel(item)}</strong>
              <span>{itemCode(item)}</span>
            </button>
          ))}
        </div>
      )}

      {recordLoading && <p className="doc-empty-text">Loading clinical record…</p>}
      {record && (
        <article className="doc-medical-record">
          <h4>{record.englishEquivalent || record.title || record.code}</h4>
          <p className="doc-medical-code">{record.icd11PrimaryCode || record.code || record.namasteCode}</p>
          <p>{record.definition || record.description || record.englishDefinition || 'No clinical summary is available for this record.'}</p>
        </article>
      )}
    </section>
  );
};

export default MedicalDirectoryView;
