import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DoctorHeader from '../components/DoctorHeader';
import DoctorSidebar from '../components/DoctorSidebar';
import PatientSearchBar from '../components/PatientSearchBar';
import PatientProfileCard from '../components/PatientProfileCard';
import ConsultationResults from '../components/ConsultationResults';
import AlertsSection from '../components/AlertsSection';
import PatientDirectoryView from '../components/PatientDirectoryView';
import { doctorApi } from '../services/doctorApi';
import './DoctorDashboard.css';

export const DoctorDashboard = ({ activeTabDefault }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine initial active tab from route path or prop
  const getTabFromPath = () => {
    if (activeTabDefault) return activeTabDefault;
    const path = location.pathname;
    if (path.includes('/patient-data')) return 'patient-data';
    if (path.includes('/consultations')) return 'consultations';
    if (path.includes('/alerts')) return 'alerts';
    if (path.includes('/directory')) return 'directory';
    return 'patient-data';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath());
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('user-1');

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname, activeTabDefault]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    doctorApi.getPatientData(selectedPatientId).then((data) => {
      if (isMounted && data) {
        setPatientData(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedPatientId]);

  const handleTabSwitch = (tabKey) => {
    setActiveTab(tabKey);
    // Optionally update URL for dedicated sub-pages
    if (tabKey === 'overview') navigate('/doctor');
    else if (tabKey === 'patient-data') navigate('/doctor/patient-data');
    else if (tabKey === 'consultations') navigate('/doctor/consultations');
    else if (tabKey === 'alerts') navigate('/doctor/alerts');
    else if (tabKey === 'directory') navigate('/doctor/directory');
  };

  const handleSearch = async (query) => {
    const results = await doctorApi.searchPatients(query);
    setSearchResults(results);
  };

  const handleSelectPatient = (id, targetTab) => {
    setSelectedPatientId(id);
    if (targetTab) {
      handleTabSwitch(targetTab);
    }
  };

  return (
    <div className="doc-dashboard-page">
      {/* 1. TOP HEADER NAVIGATION */}
      <DoctorHeader />

      {/* 2. MAIN CONTAINER */}
      <div className="doc-main-container">
        {/* LEFT SIDEBAR */}
        <DoctorSidebar
          activeTab={activeTab}
          onTabChange={handleTabSwitch}
          selectedPatient={patientData?.patient}
        />

        {/* CONTENT AREA */}
        <main className="doc-content-area">
          {/* SEARCH BAR (TOP OF CONTENT AREA) */}
          <PatientSearchBar
            onSearch={handleSearch}
            searchResults={searchResults}
            onSelectPatient={handleSelectPatient}
          />

          {/* VIEW SWITCHER SUB-HEADER PILLS */}
          <div className="doc-view-switcher-bar">
            <span className="doc-switcher-label">View Mode:</span>
            <button
              className={`doc-view-pill ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('overview')}
            >
              📊 Complete Overview
            </button>
            <button
              className={`doc-view-pill ${activeTab === 'patient-data' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('patient-data')}
            >
              👤 Patient Data View
            </button>
            <button
              className={`doc-view-pill ${activeTab === 'consultations' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('consultations')}
            >
              📄 Consultation Results
            </button>
            <button
              className={`doc-view-pill ${activeTab === 'alerts' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('alerts')}
            >
              ⚠️ Medical Alerts ({patientData?.alerts?.length || 0})
            </button>
            <button
              className={`doc-view-pill ${activeTab === 'directory' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('directory')}
            >
              📋 Patient Directory
            </button>
          </div>

          {/* DYNAMIC SEGREGATED DISPLAY AREA */}
          {loading ? (
            <div className="doc-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p className="doc-empty-text">Loading health records...</p>
            </div>
          ) : (
            <div className="doc-segregated-view-container">
              {/* VIEW 1: COMBINED OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="doc-patient-view-grid">
                  <PatientProfileCard patient={patientData?.patient} />
                  <div className="doc-right-column">
                    <ConsultationResults consultations={patientData?.consultationResults} />
                    <AlertsSection alerts={patientData?.alerts} />
                  </div>
                </div>
              )}

              {/* VIEW 2: DEDICATED PATIENT DATA VIEW */}
              {activeTab === 'patient-data' && (
                <div className="doc-single-view-full">
                  <PatientProfileCard patient={patientData?.patient} />
                </div>
              )}

              {/* VIEW 3: DEDICATED CONSULTATION RESULTS */}
              {activeTab === 'consultations' && (
                <div className="doc-single-view-full">
                  <ConsultationResults consultations={patientData?.consultationResults} />
                </div>
              )}

              {/* VIEW 4: DEDICATED MEDICAL ALERTS */}
              {activeTab === 'alerts' && (
                <div className="doc-single-view-full">
                  <AlertsSection alerts={patientData?.alerts} />
                </div>
              )}

              {/* VIEW 5: DEDICATED PATIENT DIRECTORY */}
              {activeTab === 'directory' && (
                <div className="doc-single-view-full">
                  <PatientDirectoryView
                    searchResults={searchResults}
                    onSelectPatient={handleSelectPatient}
                  />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
