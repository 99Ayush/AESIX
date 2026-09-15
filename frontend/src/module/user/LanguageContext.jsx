import { createContext, useContext, useEffect, useState } from 'react';
import { languages, translateTree } from './translations';

const LanguageContext = createContext(null);

// Shared 4-language selector. Uses the global dashboard language by default,
// so one click drives every page (user + doctor + chatbot + auth).
// Never translated itself (data-no-translate) to avoid self-mangling.
export function LanguageSelect({ value, onChange, className = 'sih-lang-select', style }) {
  const ctx = useContext(LanguageContext);
  const current = value ?? ctx?.language ?? 'English';
  const handle = (e) => {
    if (onChange) onChange(e.target.value);
    else ctx?.setLanguage(e.target.value);
  };
  return (
    <select
      value={current}
      onChange={handle}
      className={className}
      style={style}
      data-no-translate
      translate="no"
      aria-label="Language"
    >
      <option value="English">🌐 English</option>
      <option value="Hindi">🌐 हिंदी</option>
      <option value="Bengali">🌐 বাংলা</option>
      <option value="Tamil">🌐 தமிழ்</option>
    </select>
  );
}

export function DashboardLanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('dashboard-language') || 'English');
  useEffect(() => {
    localStorage.setItem('dashboard-language', language);
    document.documentElement.lang = languages[language] || 'en';
    let disposed = false;
    let scheduled = null;
    let isTranslating = false;
    const runTranslation = () => {
      if (disposed || isTranslating) return;
      isTranslating = true;
      try { observer.disconnect(); } catch { /* noop */ }
      try {
        translateTree(language);
      } catch (err) {
        console.warn('Translation error:', err);
      } finally {
        try {
          observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ['placeholder', 'title', 'aria-label', 'alt', 'value'],
          });
        } catch { /* noop */ }
        isTranslating = false;
      }
    };
    // Debounce rapid React commits into a single pass + a follow-up pass
    // so async-rendered words (search results, disease records, route
    // transitions) are all caught even when they arrive in batches.
    const schedule = () => {
      if (disposed) return;
      if (scheduled) cancelAnimationFrame(scheduled);
      scheduled = requestAnimationFrame(() => {
        scheduled = null;
        runTranslation();
        // Second pass catches nodes React commits right after the first sweep.
        setTimeout(() => { if (!disposed) runTranslation(); }, 120);
      });
    };
    const observer = new MutationObserver(schedule);
    // Initial double-pass: first render + late async content.
    runTranslation();
    const t1 = setTimeout(runTranslation, 150);
    // SPA route changes don't reload the page — re-translate on navigation.
    const onRouteChange = () => setTimeout(() => { if (!disposed) runTranslation(); }, 60);
    window.addEventListener('popstate', onRouteChange);
    window.addEventListener('hashchange', onRouteChange);
    const pushState = history.pushState;
    const replaceState = history.replaceState;
    history.pushState = function (...args) {
      const ret = pushState.apply(this, args);
      onRouteChange();
      return ret;
    };
    history.replaceState = function (...args) {
      const ret = replaceState.apply(this, args);
      onRouteChange();
      return ret;
    };
    // Safety net: while a non-English language is active, re-sweep
    // periodically so no word stays English (cheap: skips clean nodes).
    const interval = language === 'English' ? null : setInterval(runTranslation, 1500);
    document.addEventListener('visibilitychange', onRouteChange);
    window.addEventListener('focus', onRouteChange);
    return () => {
      disposed = true;
      if (scheduled) cancelAnimationFrame(scheduled);
      clearTimeout(t1);
      if (interval) clearInterval(interval);
      window.removeEventListener('popstate', onRouteChange);
      window.removeEventListener('hashchange', onRouteChange);
      document.removeEventListener('visibilitychange', onRouteChange);
      window.removeEventListener('focus', onRouteChange);
      history.pushState = pushState;
      history.replaceState = replaceState;
      observer.disconnect();
    };
  }, [language]);
  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useDashboardLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useDashboardLanguage must be used inside DashboardLanguageProvider');
  return context;
}
