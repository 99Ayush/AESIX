import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { GenAiBot } from '../module/genAi';
import BasicInfo from '../module/user/pages/basicInfo';
import UploadDoc from '../module/user/pages/uploadDoc';
import Consent from '../module/user/pages/concent';
import AbhaID from '../module/user/pages/AbhaID';
import ProfilePage from '../module/user/pages/profilepage';
import LandingPage from '../module/user/pages/landingpage';

export const AppRoutes = () => {
  return (
    <Router>
      <Routes>
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

        <Route path="/genai" element={<GenAiBot />} />

        {/* Default: redirect to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
