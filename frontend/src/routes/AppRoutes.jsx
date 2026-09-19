import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import BottomTabBar from '../shared/BottomTabBar';
import PwaStatusBanner from '../shared/PwaStatusBanner';

/* Native-style route transition: every navigation slides the new screen in. */
const RouteScreen = ({ children }) => {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="native-route">
      {children}
    </div>
  );
};

export const AppRoutes = () => {
  return (
    <Router>
      <BottomTabBar />
      <RouteScreen>
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
        <Route path="/doctor/directory" element={<DoctorDashboard activeTabDefault="directory" />} />
        <Route path="/doctor/medical-directory" element={<DoctorDashboard activeTabDefault="medical-directory" />} />
        <Route path="/doctor/patient/:id?" element={<DoctorDashboard activeTabDefault="patient-data" />} />

        {/* Default: redirect to dashboard */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      </RouteScreen>
    </Router>
  );
};

export default AppRoutes;
