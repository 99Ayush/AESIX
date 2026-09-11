import React from 'react';

export const ChatHeader = ({ onOpenVoiceToVoice, language = 'en', onToggleLanguage }) => {
  const isHindi = language === 'hi';

  return (
    <header className="medical-header">
      <div className="header-brand">
        <div className="header-icon">🩺</div>
        <div>
          <h2 className="header-title">
            {isHindi ? 'मेडिकल एआई चैटबॉट (Medical AI Doctor)' : 'Medical AI Chatbot'}
          </h2>
          <p className="header-subtitle">
            {isHindi
              ? 'ओलामा एआई संचालित | आपातकालीन • परामर्श • स्वास्थ्य देखभाल'
              : 'Powered by Ollama | Emergency • Consultation • Daily Med Talk'}
          </p>
        </div>
      </div>
      <div className="header-controls">
        {/* Dual Language Toggle Button */}
        {onToggleLanguage && (
          <button
            className="lang-toggle-btn"
            onClick={onToggleLanguage}
            title={isHindi ? 'Switch to English' : 'हिंदी में बदलें'}
          >
            <span className="lang-icon">🌐</span>
            <span className="lang-text">{isHindi ? 'हिंदी (HI)' : 'English (EN)'}</span>
            <span className="lang-switch-hint">{isHindi ? '→ EN' : '→ HI'}</span>
          </button>
        )}

        {onOpenVoiceToVoice && (
          <button
            className="v2v-header-btn"
            onClick={onOpenVoiceToVoice}
            title={isHindi ? 'वॉयस टू वॉयस बातचीत शुरू करें' : 'Start Voice to Voice Conversation'}
          >
            <span className="v2v-icon-pulse">🎙️</span>
            <span>{isHindi ? 'वॉयस चैट (Voice Convo)' : 'Voice to Voice Convo'}</span>
          </button>
        )}
        <div className="header-status">
          <span className="status-indicator"></span>
          <span>{isHindi ? 'ओलामा सक्रिय' : 'Ollama Active'}</span>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
