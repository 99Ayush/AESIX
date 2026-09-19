import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import PatientSidebar from '../module/user/components/asidebar';

/**
 * NavDrawer — the single navigation home for patient pages.
 * - Desktop (hover-capable): opens when hovering the hamburger.
 * - Touch: opens on tap. Backdrop tap, ✕, or Escape closes it.
 * Content (profile card + menu) is the shared PatientSidebar,
 * so the in-page sidebar rail is no longer rendered anywhere.
 */
export default function NavDrawer() {
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const location = useLocation();
  const isDoctor = location.pathname.startsWith('/doctor');

  const canHover = () =>
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(hover: hover)').matches;

  // Close on every navigation
  useEffect(() => {
    setPinned(false);
    setHovered(false);
  }, [location.pathname]);

  // Escape closes
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setPinned(false);
        setHovered(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Lock body scroll while tap-opened on touch layouts
  useEffect(() => {
    document.body.style.overflow = pinned ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [pinned]);

  if (isDoctor) return null;

  const visible = pinned || hovered;

  return (
    <div
      className="native-navdrawer"
      onMouseEnter={() => {
        if (canHover()) setHovered(true);
      }}
      onMouseLeave={() => {
        if (canHover()) setHovered(false);
      }}
    >
      <button
        type="button"
        className="sih-mobile-menu-btn"
        aria-label={visible ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={visible}
        onClick={(e) => {
          e.stopPropagation();
          setPinned((v) => !v);
          setHovered(false);
        }}
      >
        {visible ? <X size={20} strokeWidth={2.4} /> : <Menu size={20} strokeWidth={2.4} />}
      </button>

      <div
        className={`native-drawer-backdrop${visible ? ' open' : ''}`}
        onClick={() => {
          setPinned(false);
          setHovered(false);
        }}
        aria-hidden="true"
      />

      <aside
        className={`native-drawer-panel${visible ? ' open' : ''}`}
        aria-hidden={!visible}
        aria-label="Site navigation"
      >
        <PatientSidebar />
      </aside>
    </div>
  );
}
