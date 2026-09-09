import React from 'react';

export const ChatHeader = () => {
  return (
    <header className="medical-header">
      <div className="header-brand">
        <div className="header-icon">🩺</div>
        <div>
          <h2 className="header-title">Medical AI Chatbot</h2>
          <p className="header-subtitle">Powered by Ollama | Emergency • Consultation • Daily Med Talk</p>
        </div>
      </div>
      <div className="header-status">
        <span className="status-indicator"></span>
        <span>Ollama API Active</span>
      </div>
    </header>
  );
};

export default ChatHeader;
