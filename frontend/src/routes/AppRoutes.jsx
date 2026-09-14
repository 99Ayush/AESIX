import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { GenAiBot } from '../module/genAi';
import BasicInfo from '../module/user/pages/basicInfo';
import UploadDoc from '../module/user/pages/uploadDoc';
import Consent from '../module/user/pages/concent';
import AbhaID from '../module/user/pages/AbhaID';
import ProfilePage from '../module/user/pages/profilepage';
import LandingPage from '../module/user/pages/landingpage';
import DoctorDashboard from '../module/doctor';
import Login from '../module/auth/login';
import Register from '../module/auth/register';

import KindleMain from '../module/user/pages/kindleMain';
import NamasteCode from '../module/user/pages/namasteCode';
import ICDCode from '../module/user/pages/ICD-Code';
import SocratesForm from '../module/user/pages/SocratesForm';

export const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Landing Page (shown after login) */}
        <Route path="/dashboard" element={<LandingPage />} />

        {/* User routes */}
        <Route path="/basicInfo" element={<BasicInfo />} />
        <Route path="/uploadDoc" element={<UploadDoc />} />
        <Route path="/docs" element={<UploadDoc />} />
        <Route path="/consent" element={<Consent />} />
        <Route path="/abha" element={<AbhaID />} />
        <Route path="/abhaId" element={<AbhaID />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/kindle" element={<KindleMain />} />
        <Route path="/kindlemain" element={<KindleMain />} />
        <Route path="/health-code" element={<KindleMain />} />

        {/* NAMASTE & ICD-11 Code Search Pages */}
        <Route path="/namaste-code" element={<NamasteCode />} />
        <Route path="/icd-code" element={<ICDCode />} />
        <Route path="/socrates" element={<SocratesForm />} />

        <Route path="/genai" element={<GenAiBot />} />


        {/* Doctor routes & segregated sub-pages */}
        <Route path="/doctor" element={<DoctorDashboard activeTabDefault="overview" />} />
        <Route path="/doctor/patient-data" element={<DoctorDashboard activeTabDefault="patient-data" />} />
        <Route path="/doctor/socrates-forms" element={<DoctorDashboard activeTabDefault="socrates-forms" />} />
        <Route path="/doctor/consultations" element={<DoctorDashboard activeTabDefault="consultations" />} />
        <Route path="/doctor/alerts" element={<DoctorDashboard activeTabDefault="alerts" />} />
        <Route path="/doctor/directory" element={<DoctorDashboard activeTabDefault="directory" />} />
        <Route path="/doctor/patient/:id?" element={<DoctorDashboard activeTabDefault="patient-data" />} />

        {/* Default: redirect to dashboard */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
