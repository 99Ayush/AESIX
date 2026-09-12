import React, { useState } from 'react';

export const PatientSearchBar = ({ onSearch, searchResults = [], onSelectPatient }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
    setIsOpen(true);
  };

  const handleSelect = (patient) => {
    setQuery(patient.fullName);
    onSelectPatient(patient.id);
    setIsOpen(false);
  };

  return (
    <div className="doc-search-container">
      <div className="doc-search-input-wrapper">
        <input
          type="text"
          className="doc-search-input"
          placeholder="Search bar (Search patient by name, ABHA ID, email, or phone)..."
          value={query}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
        />
        <div className="doc-search-icon-btn">
          <svg className="doc-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </div>

      {isOpen && searchResults.length > 0 && (
        <div className="doc-search-dropdown">
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
                  <span>{patient.fullName.charAt(0)}</span>
                )}
              </div>
              <div className="doc-search-item-details">
                <div className="doc-search-item-name">{patient.fullName}</div>
                <div className="doc-search-item-sub">
                  {patient.age} yrs • {patient.gender} • Blood: {patient.bloodGroup} • ABHA: {patient.abhaId}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientSearchBar;
