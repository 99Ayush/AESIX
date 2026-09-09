/**
 * Data Model / Schema definitions and categorizers for GenAI Chat Messages
 */

export const MEDICAL_CATEGORIES = {
  EMERGENCY: 'emergency',
  CONSULTATION: 'consultation',
  DAILY_TALK: 'daily_med_talk',
  GENERAL: 'general',
};

/**
 * Helper to detect medical category of a message query
 */
export const detectMessageCategory = (query = '') => {
  const lower = query.toLowerCase();
  const emergencyKeywords = ['chest pain', 'bleeding', 'unconscious', 'breathing', 'stroke', 'seizure', 'heart attack', 'poison', 'emergency', 'fracture'];
  const dailyTalkKeywords = ['diet', 'exercise', 'sleep', 'water', 'vitamin', 'daily', 'routine', 'headache', 'fever', 'cough'];

  if (emergencyKeywords.some((kw) => lower.includes(kw))) {
    return MEDICAL_CATEGORIES.EMERGENCY;
  }
  if (dailyTalkKeywords.some((kw) => lower.includes(kw))) {
    return MEDICAL_CATEGORIES.DAILY_TALK;
  }
  return MEDICAL_CATEGORIES.CONSULTATION;
};

/**
 * Chat Message Model Factory
 */
export const createChatMessage = ({ sender, text, category = MEDICAL_CATEGORIES.GENERAL }) => {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    sender, // 'user' | 'assistant'
    text,
    category,
    timestamp: new Date().toISOString(),
  };
};
