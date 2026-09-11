import React from 'react';

export const ChatInput = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  loading,
  isVoiceActive,
  toggleVoiceMode,
  onOpenVoiceToVoice,
  language = 'en',
}) => {
  const isHindi = language === 'hi';

  return (
    <form className="chat-input-form" onSubmit={handleSendMessage}>
      <div className="input-box-wrapper">
        <input
          type="text"
          className="chat-text-input"
          placeholder={
            isHindi
              ? 'अपनी स्वास्थ्य संबंधी समस्या लिखें या वॉयस चैट शुरू करें...'
              : 'Type your medical query or start voice conversation...'
          }
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />

        {/* Right Side Controls Container */}
        <div className="input-right-controls">
          {/* Voice-to-Voice Convo Mode Button */}
          {onOpenVoiceToVoice && (
            <button
              type="button"
              className="control-btn voice-to-voice-btn"
              onClick={onOpenVoiceToVoice}
              title={isHindi ? 'वॉयस टू वॉयस बातचीत शुरू करें' : 'Launch Voice to Voice Conversation Mode'}
            >
              <span className="btn-icon">🎙️⚡</span>
              <span className="btn-label">{isHindi ? 'वॉयस मोड' : 'Voice Convo'}</span>
            </button>
          )}

          {/* Quick Mic Speech-to-text Toggle */}
          <button
            type="button"
            className={`control-btn voice-chat-btn ${isVoiceActive ? 'active listening' : ''}`}
            onClick={toggleVoiceMode}
            title={isVoiceActive ? 'माइक बंद करें' : 'माइक चालू करें'}
          >
            {isVoiceActive ? (
              <>
                <span className="btn-icon mic-pulse">🎙️</span>
                <span className="btn-label">{isHindi ? 'माइक चालू' : 'Mic ON'}</span>
              </>
            ) : (
              <>
                <span className="btn-icon">🎙️</span>
                <span className="btn-label">{isHindi ? 'माइक बंद' : 'Mic OFF'}</span>
              </>
            )}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            className="send-btn"
            disabled={!inputMessage.trim() || loading}
            title={isHindi ? 'संदेश भेजें' : 'Send Message'}
          >
            <span>{isHindi ? 'भेजें' : 'Send'}</span>
            <span className="send-icon">➤</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;
