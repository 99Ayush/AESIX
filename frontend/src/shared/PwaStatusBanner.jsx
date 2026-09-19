import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, Download, X } from 'lucide-react';

export default function PwaStatusBanner() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineToast(true);
      setTimeout(() => setShowOnlineToast(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineToast(false);
    };

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Check if user previously dismissed it in this session
      if (!sessionStorage.getItem('pwa_install_dismissed')) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setInstallPrompt(null);
  };

  const handleDismissInstall = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem('pwa_install_dismissed', 'true');
  };

  return (
    <>
      {/* Offline Alert */}
      {!isOnline && (
        <div className="pwa-network-banner pwa-network-offline" role="alert">
          <WifiOff size={16} />
          <span>You are currently offline. Viewing cached health records.</span>
        </div>
      )}

      {/* Back Online Toast */}
      {showOnlineToast && (
        <div className="pwa-network-banner pwa-network-online" role="status">
          <Wifi size={16} />
          <span>Internet connection restored. Live sync active.</span>
        </div>
      )}

      {/* Install PWA Prompt Bar (non-intrusive) */}
      {showInstallBanner && installPrompt && (
        <div
          style={{
            position: 'fixed',
            bottom: 'calc(var(--tabbar-h, 64px) + var(--sab, 0px) + 12px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9990,
            background: 'linear-gradient(135deg, #12304A 0%, #1a4163 100%)',
            color: '#FFFFFF',
            padding: '0.65rem 1rem',
            borderRadius: '999px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 8px 24px rgba(18, 48, 74, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            maxWidth: '92vw',
            animation: 'native-enter 0.25s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1rem' }}>📱</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Install MedIksha App for instant offline access</span>
          </div>
          <button
            onClick={handleInstallClick}
            style={{
              background: '#2F8F83',
              color: '#FFFFFF',
              padding: '0.35rem 0.75rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: '0 2px 6px rgba(47, 143, 131, 0.3)',
            }}
          >
            <Download size={14} /> Install
          </button>
          <button
            onClick={handleDismissInstall}
            style={{ color: '#94A3B8', padding: '0.2rem', display: 'flex', alignItems: 'center' }}
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
