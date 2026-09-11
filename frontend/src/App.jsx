import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { DashboardLanguageProvider } from './module/user/LanguageContext';

function App() {
  return <DashboardLanguageProvider><AppRoutes /></DashboardLanguageProvider>;
}

export default App;
