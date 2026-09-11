import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GenAiBot } from '../module/genAi';
import ProfilePage from '../module/user/pages/profilepage';

export const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<GenAiBot />} /> */}
        <Route path="/genai" element={<GenAiBot />} />
         <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>


    </Router>
  );
};

export default AppRoutes;
