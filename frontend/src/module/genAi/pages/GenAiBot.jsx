import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessageToBackend } from '../services/bot';
import { ChatHeader } from '../components/ChatHeader';
import { QuickActions } from '../components/QuickActions';
import { ChatMessages } from '../components/ChatMessages';
import { ChatInput } from '../components/ChatInput';
import { VoiceToVoiceView } from '../components/VoiceToVoiceView';
import '../components/GenAiChat.css';

export const GenAiBot = () => {
  const [language, setLanguage] = useState('en'); // 'en' | 'hi'

  const getWelcomeMessage = (lang) => ({
    id: 'welcome_1',
    sender: 'assistant',
    text:
      lang === 'hi'
        ? 'नमस्ते! मैं आपका आत्मीय एआई मेडिकल असिस्टेंट हूँ। आपकी सेहत और चिंताओं को समझने के लिए मैं यहाँ हूँ।\n\n• यदि आपकी समस्या गंभीर है, तो मैं तुरंत डॉक्टर परामर्श (Doctor Consultation) की सलाह दूंगा।\n• यदि समस्या सामान्य है, तो आपको उपयुक्त भोजन, पेय, आराम और हल्के व्यायाम का मार्गदर्शन दूंगा।\n\nकृपया बेझिझक अपनी समस्या बताएं।'
        : 'Hello! I am your compassionate AI Medical Assistant. I am here to listen to your health concerns with soothing care.\n\n• If your symptoms indicate a major issue, I will gently direct you to consult a qualified doctor.\n• If minor, I will prescribe comforting self-care recommendations including food, rest, and gentle exercise.\n\nPlease feel free to describe your symptoms.',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  const [messages, setMessages] = useState([getWelcomeMessage('en')]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Voice to Voice Mode States
  const [isVoiceToVoiceOpen, setIsVoiceToVoiceOpen] = useState(false);
  const [v2vState, setV2vState] = useState('idle'); // 'idle' | 'listening' | 'thinking' | 'speaking'
  const [v2vUserTranscript, setV2vUserTranscript] = useState('');
  const [v2vAiResponse, setV2vAiResponse] = useState('');
  const [isMicMuted, setIsMicMuted] = useState(false);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const v2vRecognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const v2vSilenceTimerRef = useRef(null);
  const isProcessingSpeechRef = useRef(false);

  // Auto-scroll to bottom of text chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Setup standard Web Speech API for single mic button input
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputMessage(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          isListeningRef.current = false;
          setIsVoiceActive(false);
        }
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch (err) {
            console.warn('Failed to restart mic:', err);
            isListeningRef.current = false;
            setIsVoiceActive(false);
          }
        }
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [language]);

  // Toggle Language Handler (English <-> Hindi)
  const handleToggleLanguage = () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);

    // If chat only contains initial welcome message, update it to new language
    if (messages.length === 1 && messages[0].id === 'welcome_1') {
      setMessages([getWelcomeMessage(newLang)]);
    }
  };

  // Standard Voice Mode Toggle (Single-turn Mic Recognition & TTS)
  const toggleVoiceMode = () => {
    if (!speechSupported && !('speechSynthesis' in window)) {
      alert(
        language === 'hi'
          ? 'आपके ब्राउज़र में वॉयस रिकग्निशन / स्पीच सपोर्ट उपलब्ध नहीं है।'
          : 'Speech Recognition / Voice Output is not supported in your browser.'
      );
      return;
    }

    if (isVoiceActive) {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (err) {
          console.warn('Error stopping mic:', err);
        }
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsVoiceActive(false);
    } else {
      isListeningRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';
          recognitionRef.current.start();
        } catch (err) {
          console.warn('Error starting mic:', err);
        }
      }
      setIsVoiceActive(true);
    }
  };

  // Speak AI reply aloud in standard chat
  const speakText = (text) => {
    if (!isVoiceActive || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[*#\-_]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95; // Slightly calmer, soothing rate
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Send message from standard text chat box
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();

    const query = inputMessage.trim();
    if (!query || loading) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const replyText = await sendChatMessageToBackend(query, historyPayload, language);
      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      speakText(replyText);
    } catch (err) {
      const errorMsg = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text:
          language === 'hi'
            ? `⚠️ ओलामा एआई उत्तर प्राप्त नहीं हो सका: ${err.message}\n\nकृपया सुनिश्चित करें कि लोकल ओलामा और बैकएंड सर्वर (पोर्ट 5001) चालू हैं।`
            : `⚠️ Could not get AI response from Ollama API: ${err.message}\n\nPlease make sure Ollama is running locally and backend server is started on port 5001.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Quick Action Handler
  const handleSelectQuickAction = (actionText) => {
    setInputMessage(actionText);
  };

  /* -------------------------------------------------------------
     VOICE TO VOICE CONVERSATION MODE LOGIC
  ---------------------------------------------------------------- */

  const processVoiceInput = async (spokenText) => {
    if (!spokenText || isProcessingSpeechRef.current) return;
    isProcessingSpeechRef.current = true;

    if (v2vRecognitionRef.current) {
      try {
        v2vRecognitionRef.current.stop();
      } catch (e) {}
    }

    setV2vState('thinking');

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: spokenText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const historyPayload = messages.concat(userMsg).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const replyText = await sendChatMessageToBackend(spokenText, historyPayload, language);

      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setV2vAiResponse(replyText);

      // Speak AI response aloud in Voice-to-Voice mode
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        const cleanText = replyText.replace(/[*#\-_]/g, '').trim();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
          setV2vState('speaking');
        };

        utterance.onend = () => {
          setV2vState('listening');
          isProcessingSpeechRef.current = false;
          setV2vUserTranscript('');
          restartV2vListening();
        };

        utterance.onerror = (err) => {
          console.warn('Speech synthesis error:', err);
          setV2vState('listening');
          isProcessingSpeechRef.current = false;
          restartV2vListening();
        };

        window.speechSynthesis.speak(utterance);
      } else {
        setV2vState('listening');
        isProcessingSpeechRef.current = false;
        restartV2vListening();
      }
    } catch (err) {
      console.error('V2V Backend call failed:', err);
      setV2vAiResponse(`Error: ${err.message}`);
      setV2vState('listening');
      isProcessingSpeechRef.current = false;
      restartV2vListening();
    }
  };

  const restartV2vListening = () => {
    if (v2vRecognitionRef.current && !isMicMuted) {
      try {
        v2vRecognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        v2vRecognitionRef.current.start();
      } catch (e) {}
    }
  };

  // Launch Voice to Voice Convo Mode
  const handleOpenVoiceToVoice = () => {
    setIsVoiceToVoiceOpen(true);
    setV2vState('listening');
    setV2vUserTranscript('');
    setV2vAiResponse('');
    setIsMicMuted(false);
    isProcessingSpeechRef.current = false;

    if (isVoiceActive) {
      toggleVoiceMode();
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = language === 'hi' ? 'hi-IN' : 'en-US';

      rec.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        if (transcript.trim()) {
          setV2vUserTranscript(transcript);
          setV2vState('listening');

          if (v2vSilenceTimerRef.current) clearTimeout(v2vSilenceTimerRef.current);
          v2vSilenceTimerRef.current = setTimeout(() => {
            processVoiceInput(transcript.trim());
          }, 1600);
        }
      };

      rec.onerror = (e) => {
        console.warn('V2V speech rec error:', e.error);
      };

      rec.onend = () => {
        if (!isProcessingSpeechRef.current && !isMicMuted && isVoiceToVoiceOpen) {
          try {
            rec.start();
          } catch (err) {}
        }
      };

      try {
        rec.start();
      } catch (e) {}
      v2vRecognitionRef.current = rec;
    } else {
      alert(
        language === 'hi'
          ? 'आपका ब्राउज़र वॉयस बातचीत के लिए वेब स्पीच सपोर्ट नहीं करता है।'
          : 'Browser does not support Web Speech API for voice conversation.'
      );
    }
  };

  // Close Voice to Voice Convo Mode
  const handleCloseVoiceToVoice = () => {
    setIsVoiceToVoiceOpen(false);
    setV2vState('idle');

    if (v2vSilenceTimerRef.current) {
      clearTimeout(v2vSilenceTimerRef.current);
    }

    if (v2vRecognitionRef.current) {
      try {
        v2vRecognitionRef.current.abort();
      } catch (e) {}
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Toggle Mic Mute inside Voice-to-Voice mode
  const handleToggleV2vMic = () => {
    if (isMicMuted) {
      setIsMicMuted(false);
      restartV2vListening();
    } else {
      setIsMicMuted(true);
      if (v2vRecognitionRef.current) {
        try {
          v2vRecognitionRef.current.stop();
        } catch (e) {}
      }
    }
  };

  return (
    <div className="medical-genai-container">
      <ChatHeader
        onOpenVoiceToVoice={handleOpenVoiceToVoice}
        language={language}
        onToggleLanguage={handleToggleLanguage}
      />

      {isVoiceToVoiceOpen ? (
        <VoiceToVoiceView
          voiceState={v2vState}
          userTranscript={v2vUserTranscript}
          aiResponseText={v2vAiResponse}
          onClose={handleCloseVoiceToVoice}
          toggleMic={handleToggleV2vMic}
          isMicMuted={isMicMuted}
          language={language}
        />
      ) : (
        <>
          <QuickActions onSelectAction={handleSelectQuickAction} language={language} />
          <ChatMessages messages={messages} loading={loading} chatEndRef={chatEndRef} />
          <ChatInput
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSendMessage={handleSendMessage}
            loading={loading}
            isVoiceActive={isVoiceActive}
            toggleVoiceMode={toggleVoiceMode}
            onOpenVoiceToVoice={handleOpenVoiceToVoice}
            language={language}
          />
        </>
      )}
    </div>
  );
};

export default GenAiBot;
