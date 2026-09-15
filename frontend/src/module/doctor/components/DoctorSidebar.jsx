import React from 'react';

export const DoctorSidebar = ({ activeTab = 'patient-data', onTabChange, selectedPatient }) => {
  return (
    <aside className="doc-sidebar">
      {/* Profile Section */}
      <div className="doc-sidebar-block doc-profile-block">
        <div className="doc-sidebar-label">Profile</div>
        <div
          className="doc-doctor-card"
          onClick={() => onTabChange && onTabChange('overview')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') onTabChange && onTabChange('overview');
          }}
          role="button"
          tabIndex={0}
          title="Open Doctor Dashboard Overview"
        >
          <div className="doc-doctor-avatar">
            <span>A</span>
          </div>
          <div className="doc-doctor-info">
            <h4 className="doc-doctor-name">Dr. Anirudh Kanwat</h4>
            <p className="doc-doctor-spec">Senior Consultant</p>
            <span className="doc-status-online">● Online</span>
          </div>
        </div>
      </div>

      {/* Navigation / Search Area Section */}
      <div className="doc-sidebar-block doc-nav-block">
        <div className="doc-sidebar-label">Search Area</div>
        
        <button
          className={`doc-sidebar-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => onTabChange && onTabChange('overview')}
        >
          <svg className="doc-sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span>Dashboard Overview</span>
        </button>

        <button
          className={`doc-sidebar-item ${activeTab === 'patient-data' ? 'active' : ''}`}
          onClick={() => onTabChange && onTabChange('patient-data')}
        >
          <svg className="doc-sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Patient Data View</span>
        </button>

        <button
          className={`doc-sidebar-item ${activeTab === 'socrates-forms' ? 'active' : ''}`}
          onClick={() => onTabChange && onTabChange('socrates-forms')}
        >
          <svg className="doc-sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 2h6l3 7H6l3-7z"></path>
            <circle cx="12" cy="15" r="5"></circle>
            <line x1="12" y1="13" x2="12" y2="17"></line>
            <line x1="10" y1="15" x2="14" y2="15"></line>
          </svg>
          <span>SOCRATES Forms</span>
        </button>

        <button
          className={`doc-sidebar-item ${activeTab === 'directory' ? 'active' : ''}`}
          onClick={() => onTabChange && onTabChange('directory')}
        >
          <svg className="doc-sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>Patient Directory</span>
        </button>

        <button
          className="doc-sidebar-item"
          onClick={() => onTabChange && onTabChange('medical-directory')}
        >
          <svg className="doc-sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            <path d="M12 7v6"></path>
            <path d="M9 10h6"></path>
          </svg>
          <span>Medical Directory</span>
        </button>
      </div>

      {/* Selected Patient Quick Summary */}
      {selectedPatient && (
        <div className="doc-sidebar-block doc-active-patient-widget">
          <div className="doc-sidebar-label">Active Patient</div>
          <div className="doc-active-patient-card">
            <div className="doc-active-name">{selectedPatient.fullName}</div>
            <div className="doc-active-meta">
              <span>{selectedPatient.age} yrs • {selectedPatient.gender}</span>
              <span className="doc-blood-tag">{selectedPatient.bloodGroup}</span>
            </div>
            <div className="doc-active-abha">ABHA: {selectedPatient.abhaId}</div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default DoctorSidebar;
