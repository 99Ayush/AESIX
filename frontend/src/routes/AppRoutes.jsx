import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { GenAiBot } from '../module/genAi';
import BasicInfo from '../module/user/pages/basicInfo';
import UploadDoc from '../module/user/pages/uploadDoc';
import Consent from '../module/user/pages/concent';
import AbhaID from '../module/user/pages/AbhaID';
import ProfilePage from '../module/user/pages/profilepage';

export const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/basicInfo" element={<BasicInfo />} />
        <Route path="/uploadDoc" element={<UploadDoc />} />
        <Route path="/docs" element={<UploadDoc />} />
        <Route path="/consent" element={<Consent />} />
        <Route path="/abha" element={<AbhaID />} />
        <Route path="/abhaId" element={<AbhaID />} />
        <Route path="/profile" element={<ProfilePage />} />

        <Route path="/" element={<Navigate to="/profile" replace />} />
        <Route path="/genai" element={<GenAiBot />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
