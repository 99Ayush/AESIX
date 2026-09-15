import React from 'react';

// Last-resort guard: a render crash anywhere below this boundary shows a
// friendly recovery screen instead of a blank white page. State is kept in
// sessionStorage (per-tab) so a reload loop can never brick the app.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Something went wrong.' };
  }

  componentDidCatch(error, info) {
    console.error('Page crashed:', error, info?.componentStack);
  }

  handleReload = () => {
    try { sessionStorage.removeItem('medvault-crash-count'); } catch { /* noop */ }
    window.location.reload();
  };

  handleGoLogin = () => {
    try {
      // Drop potentially poisoned client state, then go home.
      localStorage.removeItem('user_profile');
      sessionStorage.removeItem('medvault-crash-count');
    } catch { /* noop */ }
    window.location.href = '/login';
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5FAF8', padding: '2rem' }}>
        <div style={{ maxWidth: '440px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '2rem', textAlign: 'center', boxShadow: '0 8px 30px rgba(8,71,102,0.08)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🩺</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#084766', margin: '0 0 0.5rem' }}>
            This page ran into a problem
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
            {this.state.message} Your health records are safe — please reload the page.
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
            <button
              onClick={this.handleReload}
              style={{ padding: '0.6rem 1.2rem', backgroundColor: '#0C9A9A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Reload page
            </button>
            <button
              onClick={this.handleGoLogin}
              style={{ padding: '0.6rem 1.2rem', backgroundColor: '#fff', color: '#084766', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Go to login
            </button>
          </div>
        </div>
      </div>
    );
  }
}
