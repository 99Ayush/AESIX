import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { DashboardLanguageProvider } from './module/user/LanguageContext';
import { ProfileCompletionProvider } from './module/user/components/ProfileCompletionContext';
import ErrorBoundary from './module/user/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <DashboardLanguageProvider>
        <ProfileCompletionProvider>
          <AppRoutes />
        </ProfileCompletionProvider>
      </DashboardLanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
