import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DoctorHeader from '../components/DoctorHeader';
import DoctorSidebar from '../components/DoctorSidebar';
import PatientSearchBar from '../components/PatientSearchBar';
import PatientProfileCard from '../components/PatientProfileCard';
import ConsultationResults from '../components/ConsultationResults';
import AlertsSection from '../components/AlertsSection';
import PatientDirectoryView from '../components/PatientDirectoryView';
import SocratesFormsList from '../components/SocratesFormsList';
import { doctorApi } from '../services/doctorApi';
import { onDatabaseChange } from '../../user/services/realtime';
import './DoctorDashboard.css';
import {
  BarChart3,
  UserRound,
  FileText,
  TriangleAlert,
  ClipboardList,
  Stethoscope
} from "lucide-react";

export const DoctorDashboard = ({ activeTabDefault }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine initial active tab from route path or prop
  const getTabFromPath = () => {
    if (activeTabDefault) return activeTabDefault;
    const path = location.pathname;
    if (path.includes('/patient-data')) return 'patient-data';
    if (path.includes('/socrates-forms')) return 'socrates-forms';
    if (path.includes('/consultations')) return 'consultations';
    if (path.includes('/alerts')) return 'alerts';
    if (path.includes('/directory')) return 'directory';
    return 'patient-data';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath());
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const searchAbortRef = React.useRef(null);
  const searchSeqRef = React.useRef(0);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientForms, setPatientForms] = useState([]);
  const [formsLoading, setFormsLoading] = useState(false);

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname, activeTabDefault]);

  // Fetch patient profile when a patient is selected
  useEffect(() => {
    if (!selectedPatientId) return;
    let isMounted = true;
    setLoading(true);

    doctorApi.getPatientData(selectedPatientId).then((data) => {
      if (isMounted && data) {
        setPatientData(data);
        setLoading(false);
      } else if (isMounted) {
        setPatientData(null);
        setLoading(false);
      }
    });

    return () => { isMounted = false; };
  }, [selectedPatientId]);

  // Fetch SOCRATES forms when patient changes.
  // No aggressive polling — refresh on realtime DB events + manual refresh.
  // This was hammering the API every 3s and making search feel hung.
  const fetchForms = React.useCallback(async (silent = false) => {
    if (!selectedPatientId) return;
    if (!silent) setFormsLoading(true);
    try {
      const data = await doctorApi.getPatientForms(selectedPatientId);
      setPatientForms(data || []);
    } catch {
      if (!silent) setPatientForms([]);
    } finally {
      if (!silent) setFormsLoading(false);
    }
  }, [selectedPatientId]);

  useEffect(() => {
    if (!selectedPatientId) {
      setPatientForms([]);
      return;
    }
    fetchForms();
    // Live refresh when a new SOCRATES form / consent lands in the DB.
    return onDatabaseChange(() => fetchForms(true));
  }, [selectedPatientId, fetchForms]);

  const handleTabSwitch = (tabKey) => {
    setActiveTab(tabKey);
    if (tabKey === 'overview') navigate('/doctor');
    else if (tabKey === 'patient-data') navigate('/doctor/patient-data');
    else if (tabKey === 'socrates-forms') navigate('/doctor/socrates-forms');
    else if (tabKey === 'consultations') navigate('/doctor/consultations');
    else if (tabKey === 'alerts') navigate('/doctor/alerts');
    else if (tabKey === 'directory') navigate('/doctor/directory');
  };

  const handleSearch = async (query) => {
    const q = (query || '').trim();
    // Cancel the previous in-flight search so slow responses can't
    // overwrite newer results ("still no response" / stale UI).
    if (searchAbortRef.current) searchAbortRef.current.abort();
    if (q.length < 2) {
      setSearchResults([]);
      setSearchError('');
      setSearching(false);
      return;
    }
    const seq = ++searchSeqRef.current;
    const controller = new AbortController();
    searchAbortRef.current = controller;
    setSearching(true);
    setSearchError('');
    try {
      const results = await doctorApi.searchByAbha(q, { signal: controller.signal });
      if (searchSeqRef.current !== seq) return; // stale — ignore
      setSearchResults(results || []);
    } catch (err) {
      if (searchSeqRef.current !== seq) return;
      if (err?.name === 'AbortError') return;
      setSearchResults([]);
      setSearchError(err?.message || 'Search failed — please retry');
    } finally {
      if (searchSeqRef.current === seq) setSearching(false);
    }
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
            searching={searching}
            searchError={searchError}
          />

          {/* VIEW SWITCHER SUB-HEADER PILLS */}
          <div className="doc-view-switcher-bar">
            <span className="doc-switcher-label">View Mode:</span>
            <button
              className={`doc-view-pill ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('overview')}
            >
              <BarChart3 size={17} /> Complete Overview
            </button>
            <button
              className={`doc-view-pill ${activeTab === 'patient-data' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('patient-data')}
            >
              <UserRound size={17} /> Patient Data View
            </button>
            <button
              className={`doc-view-pill ${activeTab === 'socrates-forms' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('socrates-forms')}
            >
              <Stethoscope size={17} /> SOCRATES Forms
              {patientForms.length > 0 && (
                <span className="doc-pill-badge">{patientForms.length}</span>
              )}
            </button>
            <button
              className={`doc-view-pill ${activeTab === 'consultations' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('consultations')}
            >
              <FileText size={17} /> Consultation Results
            </button>
            {/* <button
              className={`doc-view-pill ${activeTab === 'alerts' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('alerts')}
            >
              <TriangleAlert size={17} /> Medical Alerts ({patientData?.alerts?.length || 0})
            </button> */}
            <button
              className={`doc-view-pill ${activeTab === 'directory' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('directory')}
            >
              <ClipboardList size={17} /> Patient Directory
            </button>
          </div>

          {/* NO PATIENT SELECTED STATE */}
          {!selectedPatientId && activeTab !== 'directory' ? (
            <div className="doc-card doc-no-patient-card">
              <div className="doc-no-patient-icon">🔍</div>
              <h3 className="doc-no-patient-title">Search for a Patient</h3>
              <p className="doc-no-patient-text">
                Enter a patient's ABHA ID in the search bar above to view their profile and SOCRATES assessments.
              </p>
            </div>
          ) : loading ? (
            <div className="doc-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p className="doc-empty-text">Loading health records...</p>
            </div>
          ) : (
            /* DYNAMIC SEGREGATED DISPLAY AREA */
            <div className="doc-segregated-view-container">
              {/* VIEW 1: COMBINED OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="doc-patient-view-grid">
                  <PatientProfileCard patient={patientData?.patient} />
                  <div className="doc-right-column">
                    <SocratesFormsList
                      forms={patientForms}
                      patientId={selectedPatientId}
                      patientAbha={patientData?.patient?.abhaId}
                      onRefresh={fetchForms}
                    />
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

              {/* VIEW 3: SOCRATES FORMS */}
              {activeTab === 'socrates-forms' && (
                <div className="doc-single-view-full">
                  {formsLoading ? (
                    <div className="doc-card" style={{ textAlign: 'center', padding: '3rem' }}>
                      <p className="doc-empty-text">Loading SOCRATES forms...</p>
                    </div>
                  ) : (
                    <SocratesFormsList
                      forms={patientForms}
                      patientId={selectedPatientId}
                      patientAbha={patientData?.patient?.abhaId}
                      onRefresh={fetchForms}
                    />
                  )}
                </div>
              )}

              {/* VIEW 4: DEDICATED CONSULTATION RESULTS */}
              {activeTab === 'consultations' && (
                <div className="doc-single-view-full">
                  <ConsultationResults consultations={patientData?.consultationResults} />
                </div>
              )}

              {/* VIEW 5: DEDICATED MEDICAL ALERTS */}
              {activeTab === 'alerts' && (
                <div className="doc-single-view-full">
                  <AlertsSection alerts={patientData?.alerts} />
                </div>
              )}

              {/* VIEW 6: DEDICATED PATIENT DIRECTORY */}
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
