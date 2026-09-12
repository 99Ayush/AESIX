import React, { useState, useEffect } from 'react';
import DoctorHeader from '../components/DoctorHeader';
import DoctorSidebar from '../components/DoctorSidebar';
import PatientSearchBar from '../components/PatientSearchBar';
import PatientProfileCard from '../components/PatientProfileCard';
import ConsultationResults from '../components/ConsultationResults';
import AlertsSection from '../components/AlertsSection';
import { doctorApi } from '../services/doctorApi';
import './DoctorDashboard.css';

export const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('patient-data');
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('user-1');

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

  const handleSearch = async (query) => {
    const results = await doctorApi.searchPatients(query);
    setSearchResults(results);
  };

  const handleSelectPatient = (id) => {
    setSelectedPatientId(id);
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
          onTabChange={setActiveTab}
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

          {/* MAIN DASHBOARD BOX (GRID LAYOUT MATCHING WIREFRAME) */}
          {loading ? (
            <div className="doc-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p className="doc-empty-text">Loading patient health records...</p>
            </div>
          ) : (
            <div className="doc-patient-view-grid">
              {/* LEFT CARD: PHOTO + BASIC DETAILS OF USER */}
              <PatientProfileCard patient={patientData?.patient} />

              {/* RIGHT COLUMN: CONSULTATION RESULTS + ALERTS */}
              <div className="doc-right-column">
                {/* RIGHT TOP CARD: CONSULTATION RESULTS */}
                <ConsultationResults consultations={patientData?.consultationResults} />

                {/* RIGHT BOTTOM CARD: ALERTS */}
                <AlertsSection alerts={patientData?.alerts} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
