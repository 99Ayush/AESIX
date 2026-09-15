import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageSelect } from '../../user/LanguageContext';
import BrandLogo from '../../../shared/BrandLogo';

export const DoctorHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="doc-header">
      <div className="doc-header-inner">
        {/* Left navigation returns doctors to their portal overview. */}
        <button
          className="doc-home-btn"
          onClick={() => navigate('/doctor')}
          title="Go to Doctor Dashboard Overview"
          aria-label="Doctor dashboard overview"
        >
          <svg className="doc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </button>

        {/* Middle Header Title */}
        <div className="doc-header-title">
          <BrandLogo subtitle="Doctor Portal" onClick={() => navigate('/doctor')} />
        </div>

        {/* Right Doctor Profile Avatar */}
        <div className="doc-header-right">
          <LanguageSelect className="doc-lang-select" />
          <div className="doc-avatar-badge" title="Dr. Anirudh Kanwat (MD)">
            <span>A</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DoctorHeader;
