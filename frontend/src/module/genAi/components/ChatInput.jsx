import React from 'react';

export const ChatInput = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  loading,
  isVoiceActive,
  toggleVoiceMode,
}) => {
  return (
    <form className="chat-input-form" onSubmit={handleSendMessage}>
      <div className="input-box-wrapper">
        <input
          type="text"
          className="chat-text-input"
          placeholder="Type your medical query or turn on voice chat..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />

        {/* Right Side Controls Container */}
        <div className="input-right-controls">
          {/* Single Unified Voice Chat Toggle Button */}
          <button
            type="button"
            className={`control-btn voice-chat-btn ${isVoiceActive ? 'active listening' : ''}`}
            onClick={toggleVoiceMode}
            title={isVoiceActive ? 'Turn Off Voice Chat (Mic & Speaker)' : 'Turn On Voice Chat (Mic & Speaker)'}
          >
            {isVoiceActive ? (
              <>
                <span className="btn-icon mic-pulse">🎙️</span>
                <span className="btn-label">Voice ON</span>
              </>
            ) : (
              <>
                <span className="btn-icon">🎙️</span>
                <span className="btn-label">Voice OFF</span>
              </>
            )}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            className="send-btn"
            disabled={!inputMessage.trim() || loading}
            title="Send Message"
          >
            <span>Send</span>
            <span className="send-icon">➤</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;
