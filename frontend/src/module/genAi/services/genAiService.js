/**
 * Service to communicate with backend GenAI server
 */

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/genai`
  : 'http://localhost:5000/api/genai';

export const sendChatMessageToBackend = async (message, history = [], language = 'en') => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, history, language }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error ${response.status}: Failed to reach backend.`);
    }

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error('Error sending message to GenAI backend:', error);
    throw error;
  }
};
