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
    let isTranslating = false;
    const runTranslation = () => {
      if (isTranslating) return;
      isTranslating = true;
      observer.disconnect();
      try {
        translateTree(language);
      } catch (err) {
        console.warn('Translation error:', err);
      } finally {
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
        isTranslating = false;
      }
    };
    const observer = new MutationObserver(runTranslation);
    runTranslation();
    return () => observer.disconnect();
  }, [language]);
  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useDashboardLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useDashboardLanguage must be used inside DashboardLanguageProvider');
  return context;
}
