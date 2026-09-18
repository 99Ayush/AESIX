import React from 'react';
import { useNavigate } from 'react-router-dom';

const BrandLogo = ({ onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="sih-brand" onClick={handleClick} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <img src="/mediksha.png" alt="MedIksha" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
        <p className="sih-brand-subtitle" style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>MedIksha</p>
    </div>
  );
};

export default BrandLogo;
