import React from 'react';
import { useNavigate } from 'react-router-dom';

export const DoctorHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="doc-header">
      <div className="doc-header-inner">
        {/* Left Home Icon Button */}
        <button
          className="doc-home-btn"
          onClick={() => navigate('/dashboard')}
          title="Go to Home Dashboard"
          aria-label="Home"
        >
          <svg className="doc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </button>

        {/* Middle Header Title */}
        <div className="doc-header-title">
          <span className="doc-badge">DOCTOR PORTAL</span>
          <span className="doc-title-text">AESIX Patient Health Records</span>
        </div>

        {/* Right Doctor Profile Avatar */}
        <div className="doc-header-right">
          <div className="doc-avatar-badge" title="Dr. Anirudh Kanwat (MD)">
            <span>A</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DoctorHeader;
