import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * ChatbotFAB — Floating Action Button that shows the chatbot.png
 * in the bottom-right corner of every page.
 * Clicking it navigates to /genai.
 */
const ChatbotFAB = () => {
  const navigate = useNavigate();

  return (
    <img
      src="/chatbot.png"
      alt="AI Health Assistant"
      className="lp-chatbot-fab"
      title="Chat with AI Assistant"
      onClick={() => navigate("/genai")}
    />
  );
};

export default ChatbotFAB;
