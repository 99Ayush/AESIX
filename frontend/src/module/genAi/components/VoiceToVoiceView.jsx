import React from 'react';


export const VoiceToVoiceView = ({
  voiceState, // 'idle' | 'listening' | 'thinking' | 'speaking'
  userTranscript,
  aiResponseText,
  onClose,
  toggleMic,
  isMicMuted,
  language = 'en',
}) => {
  const isHindi = language === 'hi';

  return (
    <div className="voice-convo-container">
      <div className="voice-convo-header">
        <div className="voice-badge">
          <span className="badge-pulse"></span>
          <span>
            {isHindi
              ? 'वॉयस टू वॉयस मोड • सुगम परामर्श'
              : 'Voice-to-Voice Mode • Soothing Assessment'}
          </span>
        </div>
        <button className="close-voice-btn" onClick={onClose} title={isHindi ? 'वॉयस मोड से बाहर निकलें' : 'Exit Voice Mode'}>
          ✕ {isHindi ? 'बाहर निकलें' : 'Exit Voice Chat'}
        </button>
      </div>

      <div className="voice-convo-body">
        {/* Main Centered Dynamic Orb / Circle that morphs shape while speaking/listening/thinking */}
        <div className={`voice-orb-wrapper ${voiceState}`}>
          <div className="voice-wave-ring wave-1"></div>
          <div className="voice-wave-ring wave-2"></div>
          <div className="voice-wave-ring wave-3"></div>

          <div className="centered-morph-circle">
            <div className="inner-orb-core">
              {voiceState === 'listening' && <span className="orb-icon">🎙️</span>}
              {voiceState === 'thinking' && <span className="orb-icon spinner">⚡</span>}
              {voiceState === 'speaking' && <span className="orb-icon equalizer">🔊</span>}
              {voiceState === 'idle' && <span className="orb-icon">🩺</span>}
            </div>
          </div>
        </div>

        {/* State Label */}
        <div className="voice-status-text">
          {voiceState === 'listening' && (
            <p className="status-title active-listening">
              <span className="recording-dot"></span>{' '}
              {isHindi ? 'सुन रहा हूँ... आराम से बोलें' : 'Listening... Speak naturally'}
            </p>
          )}
          {voiceState === 'thinking' && (
            <p className="status-title active-thinking">
              {isHindi ? 'विश्लेषण और विचार कर रहा हूँ...' : 'Thinking & Analyzing with AI...'}
            </p>
          )}
          {voiceState === 'speaking' && (
            <p className="status-title active-speaking">
              {isHindi ? 'मेडिकल एआई बोल रहा है...' : 'Medical AI Speaking...'}
            </p>
          )}
          {voiceState === 'idle' && (
            <p className="status-title active-idle">
              {isHindi
                ? 'वॉयस बातचीत के लिए तैयार। बोलिए या माइक दबाएँ।'
                : 'Ready for Voice Conversation. Tap mic below or start speaking.'}
            </p>
          )}
        </div>

        {/* Real-time Subtitles / Transcript Box */}
        <div className="voice-transcript-card">
          {userTranscript && (
            <div className="transcript-line user">
              <span className="speaker-tag">{isHindi ? 'आप:' : 'You:'}</span>
              <span className="speech-text">"{userTranscript}"</span>
            </div>
          )}
          {aiResponseText && (
            <div className="transcript-line ai">
              <span className="speaker-tag">{isHindi ? 'मेडिकल एआई:' : 'Medical AI:'}</span>
              <span className="speech-text">{aiResponseText}</span>
            </div>
          )}
          {!userTranscript && !aiResponseText && (
            <div className="transcript-placeholder">
              {isHindi
                ? 'अपने लक्षण, समस्या या सवाल बोलें...'
                : 'Say your symptoms, medical query, or question...'}
            </div>
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="voice-convo-footer">
        <button
          className={`voice-control-btn mic-btn ${isMicMuted ? 'muted' : 'active'}`}
          onClick={toggleMic}
          title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          <span className="btn-ic">{isMicMuted ? '🎙️❌' : '🎙️'}</span>
          <span>
            {isMicMuted
              ? isHindi ? 'माइक बंद' : 'Mic Off'
              : isHindi ? 'माइक सक्रिय' : 'Mic Active'}
          </span>
        </button>

        <button className="voice-control-btn stop-btn" onClick={onClose}>
          <span>🛑 {isHindi ? 'बातचीत समाप्त' : 'End Convo'}</span>
        </button>
      </div>
    </div>
  );
};

export default VoiceToVoiceView;
