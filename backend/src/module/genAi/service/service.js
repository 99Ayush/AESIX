import { logError } from '../../../shared/logger.js';

/**
 * Medical Gen AI Service using Groq API - Conversational Doctor Mode
 *
 * IMPORTANT: This file now enforces two rules at the CODE level, not just
 * via the system prompt, because relying on the LLM to always follow
 * instructions is not reliable enough for these two rules:
 *
 *   1. Language rule: English/Hindi input -> same language response.
 *      Any other language input -> ALWAYS English response.
 *   2. Medical-only rule: If the message has no medical/health concern,
 *      never let the model answer the unrelated request (code, jokes,
 *      math, general knowledge, etc.) even partially.
 */

// ────────────────────────────────────────────────────────────────
// 1. LANGUAGE DETECTION (heuristic, no external dependency)
// ────────────────────────────────────────────────────────────────

const HINDI_REGEX = /[\u0900-\u097F]/; // Devanagari unicode block

// Common greeting/filler words from other major languages. This is a
// heuristic safety net for short inputs like "hola" that are pure ASCII
// and would otherwise be misclassified as English.
const OTHER_LANGUAGE_MARKERS = [
  'hola', 'gracias', 'buenos dias', 'buenas', 'como estas', 'que tal',
  'bonjour', 'merci', 'salut', 'comment allez', 'ca va',
  'hallo', 'guten tag', 'danke', 'wie geht',
  'ciao', 'grazie', 'come stai',
  'ola', 'obrigado', 'tudo bem',
  'merhaba', 'salam', 'selamat',
  'konnichiwa', 'arigato', 'ni hao', 'xie xie',
];

/**
 * Returns 'hi' if the text contains Devanagari script,
 * 'other' if it looks like a non-English/non-Hindi language,
 * 'en' otherwise (default/fallback).
 */
export function detectInputLanguage(text = '') {
  if (!text || !text.trim()) return 'en';

  if (HINDI_REGEX.test(text)) return 'hi';

  const lower = text.toLowerCase();

  // Accented Latin characters common in Spanish/French/German/Portuguese/etc.
  const hasAccentedLatinChars = /[À-ÖØ-öø-ÿ]/.test(text);

  // Other non-ASCII scripts (Arabic, CJK, Cyrillic, etc.)
  const hasOtherNonAsciiScript = /[^\x00-\x7F]/.test(text) && !HINDI_REGEX.test(text);

  const matchesOtherMarker = OTHER_LANGUAGE_MARKERS.some((w) => lower.includes(w));

  if (hasAccentedLatinChars || hasOtherNonAsciiScript || matchesOtherMarker) {
    return 'other';
  }

  return 'en';
}

// ────────────────────────────────────────────────────────────────
// 2. MEDICAL-INTENT DETECTION
// ────────────────────────────────────────────────────────────────

const MEDICAL_KEYWORDS_EN = [
  // Pain & symptoms
  'pain', 'ache', 'aches', 'aching', 'hurt', 'hurts', 'hurting', 'headache', 'migraine',
  'stomach', 'abdomen', 'belly', 'fever', 'temperature', 'cold', 'flu',
  'cough', 'coughing', 'vomit', 'vomiting', 'nausea', 'nauseous', 'dizzy', 'dizziness',
  'vertigo', 'rash', 'allergy', 'allergic', 'bleeding', 'blood', 'injury', 'injured',
  'wound', 'cut', 'bruise', 'swelling', 'swollen', 'symptom', 'symptoms', 'sick', 'illness', 'ill',
  'unwell', 'diarrhea', 'infection', 'burn', 'fracture', 'sprain', 'throat', 'chest', 'breathless',
  'breathing', 'breath', 'fatigue', 'tired', 'weakness', 'cramp', 'cramps', 'constipation', 'sore',
  'acid', 'acidity', 'gas', 'bloating', 'heartburn', 'stiff', 'stiffness', 'numb', 'numbness',
  'chills', 'sweat', 'sweating', 'sneezing', 'palpitations', 'insomnia', 'sleep', 'appetite',

  // Body parts & organs
  'head', 'eye', 'eyes', 'ear', 'ears', 'nose', 'mouth', 'tooth', 'teeth', 'tongue',
  'neck', 'shoulder', 'arm', 'hand', 'finger', 'back', 'spine', 'gut', 'bowel', 'hip',
  'leg', 'knee', 'foot', 'feet', 'toe', 'skin', 'heart', 'lung', 'lungs', 'liver',
  'kidney', 'kidneys', 'brain', 'muscle', 'muscles', 'joint', 'joints', 'bone', 'bones', 'vein',

  // Diseases, conditions & health topics
  'diabetes', 'diabetic', 'sugar', 'bp', 'hypertension', 'hypotension', 'pressure', 'asthma',
  'bronchitis', 'pneumonia', 'covid', 'corona', 'virus', 'viral', 'bacterial', 'cancer',
  'tumor', 'ulcer', 'stroke', 'seizure', 'epilepsy', 'thyroid', 'cholesterol', 'arthritis',
  'gout', 'stone', 'stones', 'jaundice', 'dengue', 'malaria', 'typhoid', 'anemia', 'pcos',
  'pcod', 'period', 'periods', 'menstruation', 'pregnant', 'pregnancy', 'health', 'healthy',
  'medical', 'wellness', 'lifestyle', 'diet', 'nutrition', 'exercise', 'habit', 'habits',

  // Healthcare, medication & triage
  'doctor', 'dr', 'doc', 'physician', 'nurse', 'hospital', 'clinic', 'medicine', 'medication',
  'med', 'meds', 'drug', 'pill', 'tablet', 'capsule', 'syrup', 'injection', 'vaccine', 'dose',
  'prescription', 'diagnos', 'diagnosis', 'treatment', 'remedy', 'cure', 'therapy', 'test',
  'report', 'scan', 'xray', 'mri', 'ultrasound', 'lab', 'patient', 'triage', 'first aid',
  'self-care', 'paracetamol', 'crocin', 'dolo', 'ibuprofen', 'aspirin', 'antacid', 'antibiotic'
];

const MEDICAL_KEYWORDS_HI = [
  'दर्द', 'सिरदर्द', 'पेट', 'बुखार', 'खांसी', 'उल्टी', 'जी मिचलाना', 'मिचली',
  'चक्कर', 'एलर्जी', 'खून', 'चोट', 'सूजन', 'बीमार', 'तबियत', 'डॉक्टर',
  'दवा', 'दवाई', 'दस्त', 'संक्रमण', 'जलन', 'फ्रैक्चर', 'मोच', 'माइग्रेन', 'फ्लू',
  'गला', 'सांस', 'थकान', 'कमजोर', 'ऐंठन', 'कब्ज', 'त्वचा', 'लक्षण',
  'आंख', 'कान', 'नाक', 'दांत', 'पीठ', 'सीना', 'छाती', 'हाथ', 'पैर', 'घुटना',
  'दिल', 'शुगर', 'डायबिटीज', 'बीपी', 'ब्लड प्रेशर', 'इन्फेक्शन', 'इलाज', 'उपचार',
  'अस्पताल', 'जांच', 'रिपोर्ट', 'स्वास्थ्य', 'सेहत', 'आहार', 'व्यायाम'
];

const MEDICAL_KEYWORDS_EN_REGEX = new RegExp(
  '\\b(' + MEDICAL_KEYWORDS_EN.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b',
  'i'
);

export function hasMedicalIntent(text = '') {
  if (!text || !text.trim()) return false;
  const lower = text.toLowerCase();
  const matchesHindi = MEDICAL_KEYWORDS_HI.some((k) => text.includes(k));
  if (matchesHindi) return true;
  return MEDICAL_KEYWORDS_EN_REGEX.test(lower);
}

const GREETING_REGEX = /^(hi|hello|hey|namaste|greetings|good\s*(morning|afternoon|evening)|howdy|hola|hi\s*doc|hello\s*doc|can\s*you\s*help\s*me|i\s*need\s*help|help\s*me|नमस्ते|प्रणाम|हेलो)\b/i;

export function isGreeting(text = '') {
  if (!text) return false;
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  return (
    ['नमस्ते', 'प्रणाम', 'हेलो', 'hi', 'hello', 'hey', 'namaste', 'help'].includes(trimmed) ||
    ['नमस्ते', 'प्रणाम', 'हेलो', 'hi', 'hello', 'hey', 'namaste', 'help'].includes(lower) ||
    GREETING_REGEX.test(trimmed)
  );
}

export function hasActiveMedicalHistory(history = []) {
  if (!Array.isArray(history) || history.length === 0) return false;
  return history.some((msg) => {
    if (!msg || !msg.content) return false;
    // Check user turns for prior medical intent
    return msg.role === 'user' && hasMedicalIntent(msg.content);
  });
}

export function hasMedicalContext(userMessage = '', history = []) {
  if (hasMedicalIntent(userMessage)) return true;
  if (isGreeting(userMessage)) return true;
  if (hasActiveMedicalHistory(history) && !hasOffTopicRequest(userMessage)) return true;
  return false;
}

// ────────────────────────────────────────────────────────────────
// 3. OFF-TOPIC / NON-MEDICAL REQUEST DETECTION
// ────────────────────────────────────────────────────────────────

const OFF_TOPIC_PATTERNS = [
  /\bjava\b/i, /\bpython\b/i, /\bc\+\+\b/i, /\bc\s*code\b/i, /\bc#\b/i,
  /\bjavascript\b/i, /\btypescript\b/i, /\bhtml\b/i, /\bcss\b/i, /\bsql\b/i,
  /\bcode\b/i, /\bcoding\b/i, /\bprogram(ming)?\b/i, /\balgorithm\b/i,
  /\bscript\b/i, /\bfunction\b/i, /\bapi\b/i,
  /\bjoke\b/i, /\bpoem\b/i, /\bsong\b/i, /\bstory\b/i, /\bessay\b/i,
  /\bmath\b/i, /\bequation\b/i, /\bsolve\s.*=/i, /\bhomework\b/i,
  /\bfootball\b/i, /\bcricket\b/i, /\bmatch\s*score\b/i, /\bmovie\b/i,
  /\bpolitic/i, /\bpresident\b/i, /\belection\b/i, /\btranslate\b/i,
  /\brecipe\b/i, /\bwrite\s+(me\s+)?(a|an)\s+(poem|story|essay|song|code)\b/i,
];

export function hasOffTopicRequest(text = '') {
  if (!text) return false;
  return OFF_TOPIC_PATTERNS.some((re) => re.test(text));
}

// ────────────────────────────────────────────────────────────────
// 4. CANNED REDIRECT MESSAGE (used when there's no medical concern at all)
// ────────────────────────────────────────────────────────────────

function getRedirectMessage(language) {
  if (language === 'hi') {
    return 'मैं इस बातचीत में medical और health-related concerns पर सहायता करने के लिए हूँ। कृपया अपनी medical समस्या या symptoms बताएं, ताकि मैं आपकी मदद कर सकूँ।';
  }
  return "I'm here to help with medical and health-related concerns. Please tell me about any symptoms or medical concern you'd like help with.";
}

// ────────────────────────────────────────────────────────────────
// 5. RESPONSE POST-PROCESSING SAFETY NET
// ────────────────────────────────────────────────────────────────

/**
 * Strips code blocks from a model response. This is a last-resort net in
 * case the model leaks code/programming content even when a medical
 * concern was mixed in with an off-topic request.
 */
function stripCodeBlocks(reply = '') {
  if (!reply) return reply;
  return reply.replace(/```[\s\S]*?```/g, '').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * If the expected reply language is English (or Hindi) but the model's
 * reply looks like it drifted into a third language (accented Latin
 * chars, or a non-Devanagari non-ASCII script), we don't trust it —
 * return a safe fallback instead of a possibly-wrong-language answer.
 */
function looksLikeWrongLanguage(reply, expectedLanguage) {
  if (!reply) return false;
  if (expectedLanguage === 'hi') return false; // Hindi (Devanagari) is expected/allowed

  // Strip all general punctuation (U+2000-U+206F), math operators, bullets, symbols, and zero-width spaces
  const sanitized = reply
    .replace(/[\u2000-\u206F\u2200-\u22FF\u25A0-\u25FF\uFEFF]/g, '')
    .replace(/[°™®©]/g, '');

  const hasAccentedLatinChars = /[À-ÖØ-öø-ÿ]/.test(sanitized);
  const hasForeignScript = /[^\x00-\x7F]/.test(sanitized) && !HINDI_REGEX.test(sanitized);

  return hasAccentedLatinChars || hasForeignScript;
}

// ────────────────────────────────────────────────────────────────
// 6. SYSTEM PROMPT (kept largely as-is, still the first line of defense)
// ────────────────────────────────────────────────────────────────

export const buildSystemPrompt = (language = 'en') => {
  const isHindi = language === 'hi';

  if (isHindi) {
    return `आप एक अत्यधिक सहानुभूतिपूर्ण, शांत और विशेषज्ञ मेडिकल एआई असिस्टेंट हैं। आपका उद्देश्य मरीज की समस्या को ध्यान से समझना और चरणबद्ध (एक-एक करके) सवाल पूछना है। आप डॉक्टर का विकल्प नहीं हैं।

सख्त नियम (CRITICAL RULES):
1. **एक बार में केवल एक ही सवाल पूछें (ASK DETAILS ONE BY ONE)**:
   - मरीज से एक ही संदेश में कभी भी कई सवाल न पूछें।
   - एक बार में केवल एक (1) स्पष्ट प्रश्न ही पूछें। जब मरीज जवाब दे, तब अगला सवाल पूछें।
   - एक ही उत्तर में बहुत सारे सवाल, सलाह और Triage checklist एक साथ न दें।

2. **चरणबद्ध बातचीत (STEP-BY-STEP FLOW)**:
   - कदम 1 (शुरुआती लक्षण): मरीज की बात स्वाभाविक रूप से acknowledge करें और केवल पहला सवाल पूछें: "यह समस्या कब शुरू हुई?"
   - कदम 2 (समय बताने पर): केवल अगला सवाल पूछें: "1 से 10 के पैमाने पर दर्द की तीव्रता कितनी है?"
   - कदम 3 (दर्द का स्तर बताने पर): केवल अगला सवाल पूछें: "क्या इसके साथ बुखार, उल्टी या चक्कर जैसे अन्य लक्षण भी हैं?"
   - कदम 4 (जानकारी मिलने के बाद): अब संक्षेप में उचित सलाह, self-care और आवश्यक हो तो डॉक्टर परामर्श की सलाह दें।

3. **अन्य सीमाएँ**:
   - हिंदी संदेश का उत्तर हिंदी में दें। अंग्रेजी/अन्य का उत्तर अंग्रेजी में दें।
   - दर्द की जगह (location/position) कभी न पूछें।
   - केवल मेडिकल प्रश्नों का उत्तर दें।
   - उत्तर संक्षेप में (1-2 वाक्य) रखें।`;
  }

  return `You are an empathetic, calm, and knowledgeable Medical AI Assistant. Your goal is to gather symptom details progressively BY ASKING ONLY ONE QUESTION AT A TIME in a step-by-step conversation. You are NOT a replacement for a doctor.

CRITICAL RULES:
1. **ASK FOR DETAILS ONE BY ONE (STRICT SINGLE QUESTION RULE)**:
   - NEVER ask multiple questions in a single response.
   - NEVER dump a long checklist of questions (onset, pain scale, fever, nausea, vision changes, self-care advice, triage) all at once.
   - Ask exactly ONE clear question per response turn. Wait for the user's answer before asking the next question.

2. **STEP-BY-STEP CONVERSATIONAL FLOW**:
   - Step 1 (Initial Symptom): Empathetically acknowledge the symptom and ask ONLY the first question: "When did your [symptom] start?" (Do NOT ask for pain scale, fever, nausea, or give medical advice yet).
   - Step 2 (User gives duration): Acknowledge and ask ONLY the next question: "On a scale of 1 to 10, how severe is the pain?"
   - Step 3 (User gives pain scale): Acknowledge and ask ONLY the next question: "Are you experiencing any other symptoms, such as fever, nausea, dizziness, or vision changes?"
   - Step 4 (Complete Details Received): Provide a concise, comforting summary with tailored self-care guidance and doctor triage based on their answers.

3. **OTHER MANDATORY CONSTRAINTS**:
   - Response Language: English for English/other inputs; Hindi ONLY for Hindi inputs.
   - Never Ask for Location/Position: Do NOT ask where the pain is located or which side hurts.
   - Medical-Only Focus: Answer only medical/health queries. Refuse coding, math, jokes, or non-medical tasks.
   - Response Style: Keep each question turn extremely short (1-2 sentences), warm, and focused.`;
};

// ────────────────────────────────────────────────────────────────
// 7. MAIN ENTRY POINT — now with code-level guardrails
// ────────────────────────────────────────────────────────────────

export const analyzeWithAi = async (userMessage, history = [], language = 'en') => {
  // ---- GUARDRAIL 1: detect input language, greetings, history & medical context
  const detectedLang = detectInputLanguage(userMessage);
  const medicalIntent = hasMedicalIntent(userMessage);
  const greeting = isGreeting(userMessage);
  const activeHistory = hasActiveMedicalHistory(history);
  const medicalContext = hasMedicalContext(userMessage, history);
  const offTopic = hasOffTopicRequest(userMessage);

  console.log('[medicalGenAiService] guardrail check', {
    userMessage,
    detectedLang,
    medicalIntent,
    greeting,
    activeHistory,
    medicalContext,
    offTopic,
  });

  // ---- GUARDRAIL 2: hard block — if there is NO medical context at all,
  // never call the LLM for purely off-topic requests (e.g. "give me java code").
  if (!medicalContext) {
    console.log('[medicalGenAiService] BLOCKED — no medical context or intent, LLM not called');
    const replyLanguage = language === 'hi' && detectedLang === 'hi' ? 'hi' : 'en';
    return getRedirectMessage(replyLanguage);
  }

  // Determine effective language for AI response
  const effectiveLanguage =
    detectedLang === 'other' ? 'en' : language === 'hi' && detectedLang === 'hi' ? 'hi' : 'en';

  const groqEndpoint = process.env.GROQ_ENDPOINT || 'https://api.groq.com/openai/v1/chat/completions';
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured.');
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  const reminderParts = [];
  if (detectedLang === 'other') {
    reminderParts.push(
      'REMINDER: The user wrote in a language other than English or Hindi. You MUST respond ONLY in English, no matter what language the input used.'
    );
  } else if (effectiveLanguage === 'hi') {
    reminderParts.push('REMINDER: Respond in Hindi.');
  } else {
    reminderParts.push('REMINDER: Respond in English.');
  }

  if (greeting && !medicalIntent && !activeHistory) {
    reminderParts.push(
      'REMINDER: The user greeted you. Respond warmly as an empathetic Medical AI Assistant, briefly state your role, and ask how you can help with their health or medical symptoms today.'
    );
  } else if (activeHistory && !medicalIntent && !offTopic) {
    reminderParts.push(
      'REMINDER: The user is answering your previous question about their symptoms. Continue the ongoing medical consultation and triage naturally.'
    );
  }

  if (offTopic) {
    reminderParts.push(
      'REMINDER: This message mixes a medical concern with an unrelated request (code/programming/math/jokes/general knowledge/etc). You MUST answer ONLY the medical part. Do NOT output any code, code blocks, jokes, or answers to the unrelated request in any form.'
    );
  }

  const reminderText = reminderParts.length ? '\n\n' + reminderParts.join('\n') : '';
  const systemPromptContent = buildSystemPrompt(effectiveLanguage) + reminderText;

  const systemMessage = { role: 'system', content: systemPromptContent };

  const formattedHistory = (history || []).map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }));

  const allMessages = [
    systemMessage,
    ...formattedHistory,
    { role: 'user', content: userMessage },
  ];

  console.log('[medicalGenAiService] CALLING LLM (medical context detected)', {
    effectiveLanguage,
    greeting,
    activeHistory,
    offTopic,
  });

  try {
    const response = await fetch(groqEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: allMessages,
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetail = response.statusText;
      try {
        const parsed = JSON.parse(errorText);
        errorDetail = parsed.error?.message || errorText;
      } catch (e) {
        errorDetail = errorText;
      }
      throw new Error(`Groq API error (${response.status}): ${errorDetail}`);
    }

    const data = await response.json();

    let aiReply =
      data.choices?.[0]?.message?.content ||
      data.message?.content ||
      data.response ||
      (typeof data === 'string' ? data : JSON.stringify(data));

    // ---- GUARDRAIL 3: post-process the response as a last-resort safety net
    if (offTopic) {
      aiReply = stripCodeBlocks(aiReply);
    }

    if (looksLikeWrongLanguage(aiReply, effectiveLanguage)) {
      // The model drifted into a third language despite instructions —
      // don't forward a wrong-language reply, use a safe fallback instead.
      aiReply = getRedirectMessage(effectiveLanguage) +
        (effectiveLanguage === 'hi'
          ? ' कृपया अपने लक्षण दोबारा बताएं।'
          : ' Could you tell me more about your symptoms?');
    }

    return aiReply;
  } catch (error) {
    console.error('Error connecting to Groq API:', error.message);
    logError(error, { service: 'analyzeWithAi', groqEndpoint, model });
    throw error;
  }
};