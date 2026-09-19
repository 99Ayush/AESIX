import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavDrawer from './NavDrawer';

const BrandLogo = ({ onClick, subtitle, showMenuBtn = true }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
      {/* Navigation drawer hamburger — opens on hover (desktop) or tap */}
      {showMenuBtn && <NavDrawer />}

      <div
        className="sih-brand"
        onClick={handleClick}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <img
          src="/mediksha.png"
          alt="MedIksha"
          style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            className="sih-brand-title"
            style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: 'var(--primary-navy, #12304A)',
              lineHeight: 1.1,
            }}
          >
            MedIksha
          </span>
          {subtitle && (
            <p
              className="sih-brand-subtitle"
              style={{
                margin: 0,
                fontSize: '0.65rem',
                color: 'var(--text-muted, #64748B)',
                fontWeight: 600,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandLogo;
