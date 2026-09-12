import React from 'react';

export const DoctorSidebar = ({ activeTab = 'patient-data', onTabChange, selectedPatient }) => {
  return (
    <aside className="doc-sidebar">
      {/* Profile Section */}
      <div className="doc-sidebar-block doc-profile-block">
        <div className="doc-sidebar-label">Profile</div>
        <div className="doc-doctor-card">
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
          className={`doc-sidebar-item ${activeTab === 'consultations' ? 'active' : ''}`}
          onClick={() => onTabChange && onTabChange('consultations')}
        >
          <svg className="doc-sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          <span>Consultation Results</span>
        </button>

        <button
          className={`doc-sidebar-item ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => onTabChange && onTabChange('alerts')}
        >
          <svg className="doc-sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <span>Medical Alerts</span>
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
