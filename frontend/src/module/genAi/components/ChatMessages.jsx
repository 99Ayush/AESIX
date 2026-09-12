import React from 'react';

export const ChatMessages = ({ messages, loading, chatEndRef, language = 'en' }) => {
  const isHindi = language === 'hi';

  // Render text with bullet point formatting
  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('•') || trimmed.startsWith('*') || trimmed.startsWith('-')) {
        return (
          <div key={idx} className="chat-bullet-item">
            <span className="bullet-dot">•</span>
            <span>{trimmed.replace(/^[•*-]\s*/, '')}</span>
          </div>
        );
      }
      if (/^\d+\.\s/.test(trimmed)) {
        return (
          <div key={idx} className="chat-bullet-item">
            <span className="bullet-num">{trimmed.match(/^\d+\./)[0]}</span>
            <span>{trimmed.replace(/^\d+\.\s*/, '')}</span>
          </div>
        );
      }
      return trimmed ? <p key={idx} className="chat-para">{trimmed}</p> : <div key={idx} className="chat-spacer" />;
    });
  };

  return (
    <div className="chat-messages-area">
      {messages.map((msg) => {
        if (msg.sender === 'system') {
          return (
            <div key={msg.id} className="system-notice-wrapper">
              <div className="system-notice-pill">
                {msg.text}
              </div>
            </div>
          );
        }

        return (
          <div key={msg.id} className={`message-row ${msg.sender}`}>
            <div className="message-avatar">
              {msg.sender === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-bubble">
              <div className="message-header-info">
                <span className="sender-name">
                  {msg.sender === 'user' ? (isHindi ? 'आप' : 'You') : (isHindi ? 'मेडिकल एआई' : 'Medical AI')}
                </span>
                <span className="timestamp">{msg.timestamp}</span>
              </div>
              <div className="message-content">
                {renderFormattedText(msg.text)}
              </div>
            </div>
          </div>
        );
      })}
      {loading && (
        <div className="message-row assistant">
          <div className="message-avatar">🤖</div>
          <div className="message-bubble loading-bubble">
            <div className="typing-dots">
              <span></span><span></span><span></span>
            </div>
            <span className="loading-text">
              {isHindi ? 'ग्रोक एआई से विश्लेषण किया जा रहा है...' : 'Analyzing query with Groq...'}
            </span>
          </div>
        </div>
      )}
      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatMessages;
