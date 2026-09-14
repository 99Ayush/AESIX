import React, { useState, useRef, useEffect } from 'react';

export const PatientSearchBar = ({ onSearch, searchResults = [], onSelectPatient }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Debounce search for DB queries
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => {
      onSearch(value);
      if (value.trim().length >= 2) {
        setIsOpen(true);
      }
    }, 400);
    setDebounceTimer(timer);
  };

  const handleSelect = (patient) => {
    setQuery(`${patient.fullName} (${patient.abhaId})`);
    onSelectPatient(patient.id);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (debounceTimer) clearTimeout(debounceTimer);
      onSearch(query);
      setIsOpen(true);
    }
  };

  return (
    <div className="doc-search-container" ref={containerRef}>
      <div className="doc-search-input-wrapper">
        <input
          type="text"
          className="doc-search-input"
          placeholder="🔍 Search patient by ABHA ID (e.g., 91-1234-5678-9012)..."
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (searchResults.length > 0) setIsOpen(true); }}
        />
        <div className="doc-search-icon-btn" onClick={() => { onSearch(query); setIsOpen(true); }}>
          <svg className="doc-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </div>

      {isOpen && searchResults.length > 0 && (
        <div className="doc-search-dropdown">
          <div className="doc-search-dropdown-header">
            <span className="doc-search-result-count">{searchResults.length} patient{searchResults.length !== 1 ? 's' : ''} found</span>
          </div>
          {searchResults.map((patient) => (
            <div
              key={patient.id}
              className="doc-search-item"
              onClick={() => handleSelect(patient)}
            >
              <div className="doc-search-item-avatar">
                {patient.photoUrl ? (
                  <img src={patient.photoUrl} alt={patient.fullName} />
                ) : (
                  <span>{(patient.fullName || '?').charAt(0)}</span>
                )}
              </div>
              <div className="doc-search-item-details">
                <div className="doc-search-item-name">{patient.fullName}</div>
                <div className="doc-search-item-sub">
                  {patient.gender} • Blood: {patient.bloodGroup || 'N/A'} • ABHA: <strong>{patient.abhaId}</strong>
                </div>
                {patient.phone && (
                  <div className="doc-search-item-sub">📱 {patient.phone}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && query.trim().length >= 2 && searchResults.length === 0 && (
        <div className="doc-search-dropdown">
          <div className="doc-search-empty">
            <span className="doc-search-empty-icon">🔍</span>
            <span>No patients found for "{query}"</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientSearchBar;
