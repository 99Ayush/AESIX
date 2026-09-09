import { logError } from '../../../shared/logger.js';

/**
 * Medical Gen AI Service using Ollama API - Conversational Doctor Mode
 */

export const buildSystemPrompt = () => {
  return `
You are an empathetic, expert Medical AI Assistant holding a natural conversation with a patient.

STRICT CONVERSATIONAL RULES:
1. KEEP RESPONSES VERY SHORT, WARM, AND CONVERSATIONAL (2 to 4 brief sentences max per turn).
2. DO NOT output long exhaustive lists, long essays, or huge templates.
3. STEP-BY-STEP CONVERSATIONAL ASSESSMENT:
   - When the user first mentions a symptom or problem (e.g. "I have a headache", "my stomach hurts"), do NOT give a big medical essay right away.
   - Instead, acknowledge their issue empathetically and ask 1 to 2 targeted clarifying questions (e.g., location of pain, how long it has lasted, severity from 1-10, or accompanying symptoms).
   - Once the user answers your questions in subsequent messages, provide a concise, reviewed summary & practical self-care advice.
4. EMERGENCY PROTOCOL:
   - If the user describes life-threatening symptoms (e.g. sudden chest pain, severe difficulty breathing, sudden face drooping/stroke signs), immediately tell them to contact local emergency services (911/112).
5. Always maintain a caring, human-like doctor tone.
`;
};

export const getAvailableOllamaModel = async (ollamaBaseUrl) => {
  try {
    const tagsUrl = `${ollamaBaseUrl.replace(/\/api\/(chat|generate)\/?$/, '')}/api/tags`;
    const res = await fetch(tagsUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.models && data.models.length > 0) {
        return data.models[0].name;
      }
    }
  } catch (e) {
    console.warn('Could not fetch Ollama tags:', e.message);
  }
  return 'llama3.2:latest';
};

export const analyzeWithAi = async (userMessage, history = []) => {
  const ollamaEndpoint = process.env.OLLAMA_ENDPOINT || 'http://localhost:11434/api/chat';
  const apiKey = process.env.OLLAMA_API_KEY || '';
  let model = process.env.OLLAMA_MODEL || 'llama3.2:latest';

  const headers = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  // Format system prompt + history + current user message for full conversational context
  const systemMessage = { role: 'system', content: buildSystemPrompt() };
  const formattedHistory = (history || []).map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }));

  const allMessages = [systemMessage, ...formattedHistory, { role: 'user', content: userMessage }];

  const makeRequest = async (targetModel) => {
    return await fetch(ollamaEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: targetModel,
        messages: allMessages,
        stream: false,
      }),
    });
  };

  try {
    let response = await makeRequest(model);

    if (!response.ok) {
      const errorText = await response.text();

      // If model not found, auto-fallback to available local model
      if (response.status === 404 && errorText.includes('not found')) {
        console.warn(`Model '${model}' not found in Ollama. Attempting auto-fallback...`);
        const fallbackModel = await getAvailableOllamaModel(ollamaEndpoint);
        console.log(`Using fallback Ollama model: ${fallbackModel}`);
        response = await makeRequest(fallbackModel);

        if (!response.ok) {
          const secondError = await response.text();
          throw new Error(`Ollama API error (${response.status}): ${secondError || response.statusText}`);
        }
      } else {
        throw new Error(`Ollama API error (${response.status}): ${errorText || response.statusText}`);
      }
    }

    const data = await response.json();

    const aiReply =
      data.message?.content ||
      data.response ||
      data.choices?.[0]?.message?.content ||
      (typeof data === 'string' ? data : JSON.stringify(data));

    return aiReply;
  } catch (error) {
    console.error('Error connecting to Ollama API:', error.message);
    logError(error, { service: 'analyzeWithAi', ollamaEndpoint, model });
    throw error;
  }
};
