import { analyzeWithAi } from '../service/service.js';
import { logError } from '../../../shared/logger.js';

/**
 * Controller to handle GenAI conversational chat requests
 */
export const handleGenAiChat = async (req, res, next) => {
  try {
    const { message, history, language = 'en' } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      const err = new Error('A valid message string is required in the request body.');
      logError(err, { body: req.body });
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }

    const reply = await analyzeWithAi(message.trim(), Array.isArray(history) ? history : [], language);

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error('Controller error in handleGenAiChat:', error);
    logError(error, {
      endpoint: '/api/genai/chat',
      message: req.body?.message,
    });
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while connecting to Ollama AI service.',
    });
  }
};
