import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessageToBackend } from '../services/bot';
import { ChatHeader } from '../components/ChatHeader';
import { QuickActions } from '../components/QuickActions';
import { ChatMessages } from '../components/ChatMessages';
import { ChatInput } from '../components/ChatInput';
import '../components/GenAiChat.css';

export const GenAiBot = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome_1',
      sender: 'assistant',
      text: 'Hello! I am your AI Medical Assistant. How can I help you today?\n\n• Medical Emergency Advice\n• Health Consultation & Symptoms\n• Daily Med Talk & Self-Care Guidance',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Setup Web Speech API for Mic Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

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
  }, []);

  // Single Voice Mode Toggle (Turn On / Turn Off both Mic Recognition & Text-To-Speech)
  const toggleVoiceMode = () => {
    if (!speechSupported && !('speechSynthesis' in window)) {
      alert('Speech Recognition / Voice Output is not supported in your browser.');
      return;
    }

    if (isVoiceActive) {
      // Turn OFF Voice Mode
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
      // Turn ON Voice Mode
      isListeningRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.warn('Error starting mic:', err);
        }
      }
      setIsVoiceActive(true);
    }
  };

  // Speak AI reply aloud if Voice Mode is active
  const speakText = (text) => {
    if (!isVoiceActive || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[*#\-_]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Send message
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

      const replyText = await sendChatMessageToBackend(query, historyPayload);
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
        text: `⚠️ Could not get AI response from Ollama API: ${err.message}\n\nPlease make sure Ollama is running locally and backend server is started on port 5000.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuickAction = (actionText) => {
    setInputMessage(actionText);
  };

  return (
    <div className="medical-genai-container">
      <ChatHeader />
      <QuickActions onSelectAction={handleSelectQuickAction} />
      <ChatMessages messages={messages} loading={loading} chatEndRef={chatEndRef} />
      <ChatInput
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        handleSendMessage={handleSendMessage}
        loading={loading}
        isVoiceActive={isVoiceActive}
        toggleVoiceMode={toggleVoiceMode}
      />
    </div>
  );
};

export default GenAiBot;
