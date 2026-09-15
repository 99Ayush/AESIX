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

// ────────────────────────────────────────────────────────────────
// 2.5 DIRECTION & NAVIGATION INTENT DETECTION (AppRoutes Directory)
// ────────────────────────────────────────────────────────────────

const DIRECTION_KEYWORDS = [
  'navigate', 'navigation', 'direction', 'directions', 'where', 'where is', 'where can i',
  'how to go', 'how to reach', 'how to access', 'how do i find', 'find page', 'show me',
  'open page', 'rasta', 'kahan', 'kaha', 'kaise jaye', 'kaise khoje', 'kaise khojen',
  'location of', 'take me to', 'link for', 'url for', 'go to', 'route', 'routes', 'page', 'pages', 'section'
];

const APP_FEATURE_KEYWORDS = [
  'upload', 'document', 'documents', 'docs', 'lab report', 'prescription',
  'basic info', 'basicinfo', 'profile', 'abha', 'abha id', 'consent',
  'socrates', 'symptom form', 'namaste', 'namaste code', 'ayush',
  'icd', 'icd code', 'icd-11', 'kindle', 'health code', 'doctor', 'doctor dashboard',
  'patient data', 'consultation', 'consultations', 'alerts', 'directory', 'dashboard',
  'login', 'register', 'app', 'platform'
];

export function hasDirectionIntent(text = '') {
  if (!text || !text.trim()) return false;
  const lower = text.toLowerCase();

  // Direct URL path mention like /socrates, /uploadDoc, /namaste-code, /profile, /abha, etc.
  if (/\/(dashboard|uploadDoc|docs|basicInfo|profile|abha|abhaId|consent|socrates|namaste-code|icd-code|kindle|kindlemain|health-code|doctor|login|register)/i.test(lower)) {
    return true;
  }

  // Core app feature keywords
  const FEATURE_REGEX = /\b(profile|account|upload|document|documents|docs|lab report|report|reports|prescription|file|basic info|basicinfo|personal info|abha|abha id|abha card|consent|privacy|permission|socrates|symptom form|symptom log|namaste|namaste code|ayush|ayurveda|icd|icd code|icd-11|kindle|health code|doctor|doctor dashboard|patient data|consultation|consultations|alerts|directory|dashboard|login|register)\b/i;

  // Direction & navigation intent words
  const DIRECTION_REGEX = /\b(navigate|navigation|direction|directions|guide|where|how|find|show|open|view|see|reach|access|location|link|url|route|routes|page|pages|section|tab|screen|rasta|kahan|kaha|kaise)\b/i;

  if (FEATURE_REGEX.test(lower)) return true;
  if (DIRECTION_REGEX.test(lower)) return true;

  return false;
}

export function hasMedicalContext(userMessage = '', history = []) {
  if (hasDirectionIntent(userMessage)) return true;
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
  /\bcoding\b/i, /\bprogram(ming)?\b/i, /\balgorithm\b/i,
  /\bscript\b/i, /\bfunction\b/i,
  /\bjoke\b/i, /\bpoem\b/i, /\bsong\b/i, /\bstory\b/i, /\bessay\b/i,
  /\bmath\b/i, /\bequation\b/i, /\bsolve\s.*=/i, /\bhomework\b/i,
  /\bfootball\b/i, /\bcricket\b/i, /\bmatch\s*score\b/i, /\bmovie\b/i,
  /\bpolitic/i, /\bpresident\b/i, /\belection\b/i, /\btranslate\b/i,
  /\brecipe\b/i, /\bwrite\s+(me\s+)?(a|an)\s+(poem|story|essay|song|code)\b/i,
];

export function hasOffTopicRequest(text = '') {
  if (!text) return false;
  // If it's a valid direction query within the app, don't flag as off-topic
  if (hasDirectionIntent(text)) return false;
  return OFF_TOPIC_PATTERNS.some((re) => re.test(text));
}

// ────────────────────────────────────────────────────────────────
// 4. CANNED REDIRECT MESSAGE (used when there's no medical concern or direction query)
// ────────────────────────────────────────────────────────────────

function getRedirectMessage(language) {
  if (language === 'hi') {
    return 'मैं आपकी चिकित्सा (Medical Concerns) और प्लेटफ़ॉर्म नेविगेशन / दिशा सहायता (App Direction & Navigation) के लिए यहाँ हूँ। कृपया अपने लक्षण बताएं या प्लेटफ़ॉर्म के किसी पेज के बारे में पूछें (जैसे: /uploadDoc, /socrates, /namaste-code, /abha)।';
  }
  return "I'm here to help with medical concerns and platform direction assistance. Please describe your health symptoms or ask about finding pages/features on the platform (e.g., Upload Documents /uploadDoc, Socrates Form /socrates, NAMASTE Codes /namaste-code, ABHA ID /abha).";
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
// 6. SYSTEM PROMPT (with AppRoutes Platform Directory Knowledge)
// ────────────────────────────────────────────────────────────────

export const buildSystemPrompt = (language = 'en') => {
  const isHindi = language === 'hi';

  if (isHindi) {
    return `आप एक अत्यधिक सहानुभूतिपूर्ण, शांत और विशेषज्ञ मेडिकल एवं प्लेटफ़ॉर्म नेविगेशन एआई असिस्टेंट हैं। आपका उद्देश्य मरीज की समस्या समझना और प्लेटफ़ॉर्म पर दिशा सहायता (Direction Assistance) प्रदान करना है।

प्लेटफ़ॉर्म नेविगेशन डायरेक्टरी (PLATFORM ROUTES DIRECTORY - FROM AppRoutes.jsx):
1. **मुख्य डैशबोर्ड (User Dashboard)**: \`/dashboard\` -> मुख्य लैंडिंग पेज, स्वास्थ्य समरी और अलर्ट।
2. **दस्तावेज़ अपलोड (Upload Documents)**: \`/uploadDoc\` (या \`/docs\`) -> लेब रिपोर्ट, डॉक्टर पर्चे और मेडिकल फाइलें अपलोड करें।
3. **बुनियादी जानकारी (Basic Info)**: \`/basicInfo\` -> व्यक्तिगत स्वास्थ्य जानकारी दर्ज करें।
4. **यूजर प्रोफाइल (User Profile)**: \`/profile\` -> प्रोफाइल विवरण एवं खाता सेटिंग्स।
5. **आभा आईडी (ABHA ID Management)**: \`/abha\` (या \`/abhaId\`) -> ABHA कार्ड निर्माण, सत्यापन और स्थिति।
6. **डेटा सहमति (Consent Management)**: \`/consent\` -> मेडिकल डेटा साझा करने की अनुमति प्रबंधित करें।
7. **सुकरात लक्षण फॉर्म (Socrates Symptom Form)**: \`/socrates\` -> विस्तृत लक्षण (SOCRATES framework) दर्ज करने का क्लिनिकल फॉर्म।
8. **नमस्ते कोड खोज (NAMASTE Code Search)**: \`/namaste-code\` -> आयुष (आयुर्वेद, सिद्ध, यूनानी) स्वास्थ्य शब्दावली एवं कोड खोज।
9. **ICD-11 कोड खोज (ICD-11 Code Search)**: \`/icd-code\` -> अंतरराष्ट्रीय बीमारी वर्गीकरण कोड खोज।
10. **हेल्थ कोड / किंडल (Health Code Portal)**: \`/kindle\` (या \`/kindlemain\`, \`/health-code\`) -> एकीकृत मेडिकल कोड पोर्टल।
11. **एआई असिस्टेंट (AI Assistant)**: \`/genai\` -> यह एआई चैटबॉट।
12. **डॉक्टर पोर्टल और डैशबोर्ड (Doctor Portal)**: \`/doctor\`
    - रोगी विवरण: \`/doctor/patient-data\`
    - सुकरात फॉर्म: \`/doctor/socrates-forms\`
    - परामर्श: \`/doctor/consultations\`
    - आपातकालीन अलर्ट: \`/doctor/alerts\`
    - डॉक्टर निर्देशिका: \`/doctor/directory\`

दिशा सहायता (DIRECTION ASSISTANCE) के नियम:
- यदि उपयोगकर्ता पूछे कि किसी पेज या सुविधा तक कैसे पहुँचें या कहाँ जाएँ:
  1. स्पष्ट और सरल हिंदी में कदम-दर-कदम रास्ता बताएं।
  2. exact URL / Route path जैसे \`/uploadDoc\`, \`/socrates\`, \`/namaste-code\` का उल्लेख करें।
  3. क्लिक करने योग्य लिंक दें: \`[पेज का नाम](/route)\` (उदाहरण: \`[Upload Documents Page](/uploadDoc)\`)।

चिकित्सा परामर्श (MEDICAL TRIAGE) के नियम:
1. लक्षण पूछने पर एक समय में केवल 1 प्रश्न ही पूछें।
2. हिंदी भाषा में उत्तर दें।
3. दर्द की जगह (location) न पूछें।`;
  }

  return `You are an empathetic, calm, and knowledgeable Medical & Platform Navigation AI Assistant. Your goal is to provide symptom guidance and directional navigation assistance for the platform based on AppRoutes.

PLATFORM NAVIGATION DIRECTORY (EXACT ROUTES FROM AppRoutes.jsx):
1. **User Dashboard / Home**: \`/dashboard\` -> Main landing page showing user health summary, quick stats, active alerts, and recent records.
2. **Upload Medical Documents**: \`/uploadDoc\` (or \`/docs\`) -> Page to upload lab reports, prescriptions, and medical scans.
3. **Basic Information**: \`/basicInfo\` -> Form to record and update personal, demographic, and baseline health details.
4. **User Profile**: \`/profile\` -> View and edit account information, user settings, and profile details.
5. **ABHA ID Management**: \`/abha\` (or \`/abhaId\`) -> Create, link, verify, and view ABHA (Ayushman Bharat Health Account) card & ID status.
6. **Consent Management**: \`/consent\` -> Manage data access permissions for sharing health records with doctors.
7. **Socrates Symptom Form**: \`/socrates\` -> Detailed clinical symptom assessment form following the SOCRATES framework.
8. **NAMASTE Code Search**: \`/namaste-code\` -> Ayush (Ayurveda, Siddha, Unani) terminology and standardized health code lookup.
9. **ICD-11 Code Search**: \`/icd-code\` -> International Classification of Diseases (ICD-11) search & dual coding tool.
10. **Kindle / Health Code Portal**: \`/kindle\` (or \`/kindlemain\`, \`/health-code\`) -> Unified medical coding search interface.
11. **AI Assistant Chatbot**: \`/genai\` -> Interactive AI health assistant (current page).
12. **Doctor Portal & Dashboard**: \`/doctor\`
    - Patient Data: \`/doctor/patient-data\`
    - Socrates Forms: \`/doctor/socrates-forms\`
    - Consultations: \`/doctor/consultations\`
    - Emergency Alerts: \`/doctor/alerts\`
    - Doctor Directory: \`/doctor/directory\`

DIRECTION ASSISTANCE RULES:
- When the user asks how to find, navigate to, or open any feature or page on the platform:
  1. Provide clear step-by-step navigation instructions.
  2. Always state the exact URL route path (e.g., \`/uploadDoc\`, \`/socrates\`, \`/namaste-code\`, \`/abha\`).
  3. Include clickable markdown links in the format \`[Page Name](/route)\` (e.g. \`[Upload Documents Page](/uploadDoc)\`).
  4. Briefly describe what features are available on that page.

MEDICAL SYMPTOM RULES:
1. ASK FOR DETAILS ONE BY ONE (STRICT SINGLE QUESTION RULE per response turn).
2. Empathetic, short, and clear guidance.
3. Never ask for pain location/position.`;
};

// ────────────────────────────────────────────────────────────────
// 7. MAIN ENTRY POINT — now with direction assistance & guardrails
// ────────────────────────────────────────────────────────────────

export const analyzeWithAi = async (userMessage, history = [], language = 'en') => {
  // ---- GUARDRAIL 1: detect input language, greetings, history, direction intent & medical context
  const detectedLang = detectInputLanguage(userMessage);
  const medicalIntent = hasMedicalIntent(userMessage);
  const directionIntent = hasDirectionIntent(userMessage);
  const greeting = isGreeting(userMessage);
  const activeHistory = hasActiveMedicalHistory(history);
  const medicalContext = hasMedicalContext(userMessage, history);
  const offTopic = hasOffTopicRequest(userMessage);

  console.log('[medicalGenAiService] guardrail check', {
    userMessage,
    detectedLang,
    medicalIntent,
    directionIntent,
    greeting,
    activeHistory,
    medicalContext,
    offTopic,
  });

  // ---- GUARDRAIL 2: hard block — if there is NO medical context or direction intent at all,
  // never call the LLM for purely off-topic requests (e.g. "give me java code").
  if (!medicalContext && !directionIntent) {
    console.log('[medicalGenAiService] BLOCKED — no medical context or direction intent, LLM not called');
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

  if (directionIntent) {
    reminderParts.push(
      'REMINDER: The user is asking for platform navigation or direction assistance. Provide exact route names (e.g., /uploadDoc, /socrates, /namaste-code, /abha, /doctor), clear step-by-step navigation instructions, and clickable markdown links like [Page Name](/route).'
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