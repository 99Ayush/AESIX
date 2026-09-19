import React from 'react';
import { Link } from 'react-router-dom';

export const ChatMessages = ({ messages, loading, chatEndRef, language = 'en' }) => {
  const isHindi = language === 'hi';
  const isBengali = language === 'bn';
  const isTamil = language === 'ta';

  const getUserName = () => {
    if (isHindi) return 'आप';
    if (isBengali) return 'আপনি';
    if (isTamil) return 'நீங்கள்';
    return 'You';
  };

  const getAiName = () => {
    if (isHindi) return 'मेडिकल एआई';
    if (isBengali) return 'মেডিকেল এআই';
    if (isTamil) return 'மருத்துவ AI';
    return 'Medical AI';
  };

  const getLoadingText = () => {
    if (isHindi) return 'ग्रोक एआई से विश्लेषण किया जा रहा है...';
    if (isBengali) return 'গ্রোক এআই দিয়ে বিশ্লেষণ করা হচ্ছে...';
    if (isTamil) return 'Groq AI மூலம் பகுப்பாய்வு செய்யப்படுகிறது...';
    return 'Analyzing query with Groq...';
  };

  // Helper to parse markdown links [Text](/route) inside string content
  const renderInlineContent = (contentStr) => {
    if (!contentStr) return null;

    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIdx = 0;
    let match;

    while ((match = linkRegex.exec(contentStr)) !== null) {
      if (match.index > lastIdx) {
        parts.push(contentStr.substring(lastIdx, match.index));
      }
      const linkText = match[1];
      const linkUrl = match[2];

      const isRelative = linkUrl.startsWith('/');

      if (isRelative) {
        parts.push(
          <Link key={`link_${match.index}`} to={linkUrl} className="chat-inline-link">
            📍 {linkText}
          </Link>
        );
      } else {
        parts.push(
          <a
            key={`link_${match.index}`}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="chat-inline-link"
          >
            🔗 {linkText}
          </a>
        );
      }
      lastIdx = linkRegex.lastIndex;
    }

    if (lastIdx < contentStr.length) {
      parts.push(contentStr.substring(lastIdx));
    }

    return parts.length > 0 ? parts : contentStr;
  };

  // Render text with bullet point formatting & direction link parsing
  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('•') || trimmed.startsWith('*') || trimmed.startsWith('-')) {
        return (
          <div key={idx} className="chat-bullet-item">
            <span className="bullet-dot">•</span>
            <span>{renderInlineContent(trimmed.replace(/^[•*-]\s*/, ''))}</span>
          </div>
        );
      }
      if (/^\d+\.\s/.test(trimmed)) {
        return (
          <div key={idx} className="chat-bullet-item">
            <span className="bullet-num">{trimmed.match(/^\d+\./)[0]}</span>
            <span>{renderInlineContent(trimmed.replace(/^\d+\.\s*/, ''))}</span>
          </div>
        );
      }
      return trimmed ? (
        <p key={idx} className="chat-para">{renderInlineContent(trimmed)}</p>
      ) : (
        <div key={idx} className="chat-spacer" />
      );
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
                  {msg.sender === 'user' ? getUserName() : getAiName()}
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
              {getLoadingText()}
            </span>
          </div>
        </div>
      )}
      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatMessages;
