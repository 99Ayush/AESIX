import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from "lucide-react";
import { Mic } from "lucide-react";

export const ChatHeader = ({ onOpenVoiceToVoice, language = 'en', onToggleLanguage, showBrand = false }) => {
  const navigate = useNavigate();
  const isHindi = language === 'hi';

  const handleSelectLang = (targetLang) => {
    if (onToggleLanguage) {
      onToggleLanguage(targetLang);
    }
  };

  return (
    <header className="medical-header" style={!showBrand ? { justifyContent: 'flex-end' } : {}}>
      {showBrand && (
        <div className="header-brand">
          <button
            className="doc-home-nav-btn"
            onClick={() => navigate('/dashboard')}
            title="Go to Home Dashboard"
          >
            <svg style={{ width: 20, height: 20 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </button>

          <div className="header-icon">🩺</div>
          <div>
            <h2 className="header-title">Medical AI Chatbot</h2>
            <p className="header-subtitle">
              Powered by Groq | Emergency • Consultation • Daily Med Talk
            </p>
          </div>
        </div>
      )}
      <div className="header-controls">
        {/* Prominent Segmented Language Selector */}
        <div className="convo-lang-selector" title="Active AI Conversation Language">
          <span className="lang-label-sm flex items-center gap-1">
            <MessageCircle size={16} />
            Convo:
          </span>
          <div className="lang-segmented-control">
            <button
              type="button"
              className={`lang-segment-btn ${!isHindi ? 'active' : ''}`}
              onClick={() => handleSelectLang('en')}
            >
              EN English
            </button>
            <button
              type="button"
              className={`lang-segment-btn ${isHindi ? 'active' : ''}`}
              onClick={() => handleSelectLang('hi')}
            >
              IN हिन्दी
            </button>
          </div>
        </div>

        {onOpenVoiceToVoice && (
          <button
            className="v2v-header-btn"
            onClick={onOpenVoiceToVoice}
            title="Start Voice to Voice Conversation"
          >
            <span className="v2v-icon-pulse">
              <Mic size={18} />
            </span>
            <span>Voice to Voice Convo</span>
          </button>
        )}
        <div className="header-status">
          <span className="status-indicator"></span>
          <span>Groq Active</span>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
