import React from 'react';


export const VoiceToVoiceView = ({
  voiceState, // 'idle' | 'listening' | 'thinking' | 'speaking'
  userTranscript,
  aiResponseText,
  onClose,
  toggleMic,
  isMicMuted,
  language = 'en',
  onToggleLanguage,
}) => {
  const isHindi = language === 'hi';
  const isBengali = language === 'bn';
  const isTamil = language === 'ta';

  const getHeaderBadge = () => {
    if (isHindi) return 'वॉयस टू वॉयस मोड • सुगम परामर्श';
    if (isBengali) return 'ভয়েস টু ভয়েস মোড • সহজ মূল্যায়ন';
    if (isTamil) return 'குரல்-க்கு-குரல் முறை • இதமான மதிப்பீடு';
    return 'Voice-to-Voice Mode • Soothing Assessment';
  };

  const getListeningText = () => {
    if (isHindi) return 'सुन रहा हूँ... आराम से बोलें';
    if (isBengali) return 'শুনছি... স্বাচ্ছন্দ্যে বলুন';
    if (isTamil) return 'கேட்கிறேன்... இயல்பாகப் பேசுங்கள்';
    return 'Listening... Speak naturally';
  };

  const getThinkingText = () => {
    if (isHindi) return 'विश्लेषण और विचार कर रहा हूँ...';
    if (isBengali) return 'বিশ্লেষণ ও চিন্তাভাবনা করা হচ্ছে...';
    if (isTamil) return 'சிந்தித்து பகுப்பாய்வு செய்கிறது...';
    return 'Thinking & Analyzing with AI...';
  };

  const getSpeakingText = () => {
    if (isHindi) return 'मेडिकल एआई बोल रहा है...';
    if (isBengali) return 'মেডিকেল এআই কথা বলছে...';
    if (isTamil) return 'மருத்துவ AI பேசுகிறது...';
    return 'Medical AI Speaking...';
  };

  const getIdleText = () => {
    if (isHindi) return 'वॉयस बातचीत के लिए तैयार। बोलिए या माइक दबाएँ।';
    if (isBengali) return 'ভয়েস কথপোকথনের জন্য প্রস্তুত। বলুন বা মাইক টিপুন।';
    if (isTamil) return 'குரல் உரையாடலுக்கு தயார். பேசுங்கள் அல்லது மைக்கை அழுத்தவும்.';
    return 'Ready for Voice Conversation. Tap mic below or start speaking.';
  };

  const getUserTag = () => {
    if (isHindi) return 'आप:';
    if (isBengali) return 'আপনি:';
    if (isTamil) return 'நீங்கள்:';
    return 'You:';
  };

  const getAiTag = () => {
    if (isHindi) return 'मेडिकल एआई:';
    if (isBengali) return 'মেডিকেল এআই:';
    if (isTamil) return 'மருத்துவ AI:';
    return 'Medical AI:';
  };

  const getPlaceholderText = () => {
    if (isHindi) return 'अपने लक्षण, समस्या या सवाल बोलें...';
    if (isBengali) return 'আপনার লক্ষণ, সমস্যা বা প্রশ্ন বলুন...';
    if (isTamil) return 'உங்கள் அறிகுறிகள் அல்லது கேள்விகளைக் கூறுங்கள்...';
    return 'Say your symptoms, medical query, or question...';
  };

  return (
    <div className="voice-convo-container">
      <div className="voice-convo-header">
        <div className="voice-badge">
          <span className="badge-pulse"></span>
          <span>{getHeaderBadge()}</span>
        </div>

        {/* Live Language Switcher inside Voice-to-Voice Convo */}
        <div className="voice-lang-picker" style={{ display: 'flex', gap: '4px', background: '#E1ECE8', borderRadius: '16px', padding: '2px 4px' }}>
          <button
            type="button"
            className={`lang-segment-btn ${language === 'en' ? 'active' : ''}`}
            onClick={() => onToggleLanguage && onToggleLanguage('en')}
            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
          >
            EN
          </button>
          <button
            type="button"
            className={`lang-segment-btn ${language === 'hi' ? 'active' : ''}`}
            onClick={() => onToggleLanguage && onToggleLanguage('hi')}
            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
          >
            हिन्दी
          </button>
          <button
            type="button"
            className={`lang-segment-btn ${language === 'bn' ? 'active' : ''}`}
            onClick={() => onToggleLanguage && onToggleLanguage('bn')}
            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
          >
            বাংলা
          </button>
          <button
            type="button"
            className={`lang-segment-btn ${language === 'ta' ? 'active' : ''}`}
            onClick={() => onToggleLanguage && onToggleLanguage('ta')}
            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
          >
            தமிழ்
          </button>
        </div>

        <button className="close-voice-btn" onClick={onClose} title="Exit Voice Mode">
          ✕ {isHindi ? 'बाहर निकलें' : isBengali ? 'বেরিয়ে যান' : isTamil ? 'வெளியேறு' : 'Exit Voice Chat'}
        </button>
      </div>

      <div className="voice-convo-body">
        {/* Main Centered Dynamic Orb */}
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
              <span className="recording-dot"></span> {getListeningText()}
            </p>
          )}
          {voiceState === 'thinking' && (
            <p className="status-title active-thinking">{getThinkingText()}</p>
          )}
          {voiceState === 'speaking' && (
            <p className="status-title active-speaking">{getSpeakingText()}</p>
          )}
          {voiceState === 'idle' && (
            <p className="status-title active-idle">{getIdleText()}</p>
          )}
        </div>

        {/* Real-time Subtitles / Transcript Box */}
        <div className="voice-transcript-card">
          {userTranscript && (
            <div className="transcript-line user">
              <span className="speaker-tag">{getUserTag()}</span>
              <span className="speech-text">"{userTranscript}"</span>
            </div>
          )}
          {aiResponseText && (
            <div className="transcript-line ai">
              <span className="speaker-tag">{getAiTag()}</span>
              <span className="speech-text">{aiResponseText}</span>
            </div>
          )}
          {!userTranscript && !aiResponseText && (
            <div className="transcript-placeholder">{getPlaceholderText()}</div>
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
              ? isHindi ? 'माइक बंद' : isBengali ? 'মাইক বন্ধ' : isTamil ? 'மைக் முடக்கப்பட்டுள்ளது' : 'Mic Off'
              : isHindi ? 'माइक सक्रिय' : isBengali ? 'মাইক চালু' : isTamil ? 'மைக் இயங்குகிறது' : 'Mic Active'}
          </span>
        </button>

        <button className="voice-control-btn stop-btn" onClick={onClose}>
          <span>🛑 {isHindi ? 'बातचीत समाप्त' : isBengali ? 'কথপোকথন শেষ' : isTamil ? 'உரையாடல் முடிவு' : 'End Convo'}</span>
        </button>
      </div>
    </div>
  );
};

export default VoiceToVoiceView;
