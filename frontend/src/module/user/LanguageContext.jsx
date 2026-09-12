import { createContext, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext(null);
const languages = { English: 'en', Hindi: 'hi', Bengali: 'bn', Tamil: 'ta' };

const words = {
  'ABHA ID': ['एबीएचए आईडी', 'এবিএইচএ আইডি', 'ABHA அடையாளம்'],
  'Docs': ['दस्तावेज़', 'নথি', 'ஆவணங்கள்'],
  'Basic Info': ['मूल जानकारी', 'মৌলিক তথ্য', 'அடிப்படை தகவல்'],
  'Consent': ['सहमति', 'সম্মতি', 'ஒப்புதல்'],
  'Profile': ['प्रोफ़ाइल', 'প্রোফাইল', 'சுயவிவரம்'],
  'Edit Information': ['जानकारी संपादित करें', 'তথ্য সম্পাদনা করুন', 'தகவலைத் திருத்து'],
  'Export EHR': ['ईएचआर निर्यात करें', 'EHR রপ্তানি করুন', 'EHR ஏற்றுமதி'],
  'DEMO GRAPHIC & REGISTRATION DETAILS': ['जनसांख्यिकीय और पंजीकरण विवरण', 'জনসংখ্যা ও নিবন্ধনের বিবরণ', 'மக்கள்தொகை மற்றும் பதிவுத் தகவல்கள்'],
  'DEMOGRAPHIC & REGISTRATION DETAILS': ['जनसांख्यिकीय और पंजीकरण विवरण', 'জনসংখ্যা ও নিবন্ধনের বিবরণ', 'மக்கள்தொகை மற்றும் பதிவுத் தகவல்கள்'],
  'EMERGENCY CONTACT': ['आपातकालीन संपर्क', 'জরুরি যোগাযোগ', 'அவசர தொடர்பு'],
  'QUICK SHORTCUTS': ['त्वरित विकल्प', 'দ্রুত বিকল্প', 'விரைவு குறுக்குவழிகள்'],
  'View Official ABHA Card': ['आधिकारिक एबीएचए कार्ड देखें', 'অফিসিয়াল ABHA কার্ড দেখুন', 'அதிகாரப்பூர்வ ABHA அட்டையைப் பார்க்கவும்'],
  'Upload Medical Reports': ['मेडिकल रिपोर्ट अपलोड करें', 'চিকিৎসা প্রতিবেদন আপলোড করুন', 'மருத்துவ அறிக்கைகளைப் பதிவேற்றவும்'],
  'Manage Consent Requests': ['सहमति अनुरोध प्रबंधित करें', 'সম্মতির অনুরোধ পরিচালনা করুন', 'ஒப்புதல் கோரிக்கைகளை நிர்வகி'],
  'ABHA Health Number': ['एबीएचए स्वास्थ्य नंबर', 'ABHA স্বাস্থ্য নম্বর', 'ABHA சுகாதார எண்'],
  'PHR / ABHA Address': ['पीएचआर / एबीएचए पता', 'PHR / ABHA ঠিকানা', 'PHR / ABHA முகவரி'],
  'Verification Status': ['सत्यापन स्थिति', 'যাচাই অবস্থা', 'சரிபார்ப்பு நிலை'],
  'Primary Email': ['मुख्य ईमेल', 'প্রধান ইমেল', 'முதன்மை மின்னஞ்சல்'],
  'Mobile Number': ['मोबाइल नंबर', 'মোবাইল নম্বর', 'மொபைல் எண்'],
  'Residential Address': ['आवासीय पता', 'আবাসিক ঠিকানা', 'வீட்டு முகவரி'],
  'Primary Care Hospital': ['प्राथमिक देखभाल अस्पताल', 'প্রাথমিক পরিচর্যা হাসপাতাল', 'முதன்மை பராமரிப்பு மருத்துவமனை'],
  'Attending Doctor': ['उपस्थित चिकित्सक', 'চিকিৎসারত ডাক্তার', 'சிகிச்சை மருத்துவர்'],
  'Health Insurance': ['स्वास्थ्य बीमा', 'স্বাস্থ্য বীমা', 'சுகாதார காப்பீடு'],
  'Demographic & Registration Details': ['जनसांख्यिकीय और पंजीकरण विवरण', 'জনসংখ্যা ও নিবন্ধনের বিবরণ', 'மக்கள்தொகை மற்றும் பதிவுத் தகவல்கள்'],
  'Emergency Contact': ['आपातकालीन संपर्क', 'জরুরি যোগাযোগ', 'அவசர தொடர்பு'],
  'ABDM Consent Architecture': ['एबीडीएम सहमति संरचना', 'ABDM সম্মতি কাঠামো', 'ABDM ஒப்புதல் அமைப்பு'],
  'NEWEST 1ST': ['नवीनतम पहले', 'নতুনতম আগে', 'புதியது முதலில்'],
  'OLDEST 1ST': ['पुराने पहले', 'পুরোনো আগে', 'பழையது முதலில்'],
  'Drag & drop your files here, or': ['अपनी फ़ाइलें यहां खींचें और छोड़ें, या', 'আপনার ফাইল এখানে টেনে আনুন, অথবা', 'உங்கள் கோப்புகளை இங்கே இழுத்து விடுங்கள் அல்லது'],
  'browse files': ['फ़ाइलें ब्राउज़ करें', 'ফাইল ব্রাউজ করুন', 'கோப்புகளை உலாவுக'],
  'e.g. Lab Report Sep 2026': ['जैसे लैब रिपोर्ट सितम्बर 2026', 'যেমন ল্যাব রিপোর্ট সেপ্টেম্বর 2026', 'எ.கா. ஆய்வக அறிக்கை செப் 2026'],
  'View Document': ['दस्तावेज़ देखें', 'নথি দেখুন', 'ஆவணத்தைப் பார்க்கவும்'],
  'Search patient record...': ['रोगी रिकॉर्ड खोजें...', 'রোগীর নথি খুঁজুন...', 'நோயாளி பதிவைத் தேடுக...'],
  'Name': ['नाम', 'নাম', 'பெயர்'],
  'Generate Rx / Order Meds': ['पर्चा बनाएं / दवाएं ऑर्डर करें', 'প্রেসক্রিপশন তৈরি / ওষুধ অর্ডার করুন', 'மருந்துச்சீட்டு உருவாக்கு / மருந்துகளை ஆர்டர் செய்'],
  'Request Lab Investigation': ['लैब जांच का अनुरोध करें', 'ল্যাব পরীক্ষার অনুরোধ করুন', 'ஆய்வக பரிசோதனையை கோருக'],
  'Schedule Follow-up Visit': ['फॉलो-अप विज़िट तय करें', 'ফলো-আপ ভিজিট নির্ধারণ করুন', 'தொடர்பரிசோதனை சந்திப்பை திட்டமிடுக'],
  'Quick Shortcuts': ['त्वरित विकल्प', 'দ্রুত বিকল্প', 'விரைவு குறுக்குவழிகள்'],
  'Designated immediate proxy for clinical emergency authorizations.': ['नैदानिक आपातकालीन अनुमतियों के लिए नामित तत्काल प्रतिनिधि।', 'ক্লিনিক্যাল জরুরি অনুমোদনের জন্য মনোনীত তাৎক্ষণিক প্রতিনিধি।', 'மருத்துவ அவசர அனுமதிகளுக்கான நியமிக்கப்பட்ட உடனடி பிரதிநிதி.'],
  'Download Official ABHA Card (PDF)': ['आधिकारिक एबीएचए कार्ड डाउनलोड करें (पीडीएफ)', 'অফিসিয়াল ABHA কার্ড ডাউনলোড করুন (PDF)', 'அதிகாரப்பூர்வ ABHA அட்டையைப் பதிவிறக்கவும் (PDF)'],
  'Pending Consents': ['लंबित सहमति', 'মুলতুবি সম্মতি', 'நிலுவையிலுள்ள ஒப்புதல்கள்'],
  'Action Needed': ['कार्रवाई आवश्यक', 'পদক্ষেপ প্রয়োজন', 'நடவடிக்கை தேவை'],
  'View All Consents': ['सभी सहमतियां देखें', 'সব সম্মতি দেখুন', 'அனைத்து ஒப்புதல்களையும் பார்க்கவும்'],
  'Patient Medical Records': ['रोगी के मेडिकल रिकॉर्ड', 'রোগীর চিকিৎসা নথি', 'நோயாளியின் மருத்துவ பதிவுகள்'],
  'Upload Medical Document': ['मेडिकल दस्तावेज़ अपलोड करें', 'চিকিৎসা নথি আপলোড করুন', 'மருத்துவ ஆவணத்தைப் பதிவேற்றவும்'],
  'Confirm Upload & Save Record': ['अपलोड की पुष्टि करें और रिकॉर्ड सहेजें', 'আপলোড নিশ্চিত করুন এবং নথি সংরক্ষণ করুন', 'பதிவேற்றத்தை உறுதிசெய்து பதிவைச் சேமிக்கவும்'],
  'Download Document': ['दस्तावेज़ डाउनलोड करें', 'নথি ডাউনলোড করুন', 'ஆவணத்தைப் பதிவிறக்கவும்'],
  'Close': ['बंद करें', 'বন্ধ করুন', 'மூடு'],
  'Save Changes': ['परिवर्तन सहेजें', 'পরিবর্তন সংরক্ষণ করুন', 'மாற்றங்களைச் சேமி'],
  'Cancel': ['रद्द करें', 'বাতিল করুন', 'ரத்துசெய்'],
  'Print': ['प्रिंट करें', 'মুদ্রণ করুন', 'அச்சிடு'],
  'All Records': ['सभी रिकॉर्ड', 'সব নথি', 'அனைத்து பதிவுகள்'],
  'Disease': ['बीमारी', 'রোগ', 'நோய்'],
  'Prescription': ['पर्चा', 'প্রেসক্রিপশন', 'மருந்துச்சீட்டு'],
  'Discharge Summary': ['डिस्चार्ज सारांश', 'ছাড়পত্রের সারাংশ', 'வெளியேற்ற சுருக்கம்'],
  'Accepted': ['स्वीकृत', 'গৃহীত', 'ஏற்கப்பட்டது'],
  'Rejected': ['अस्वीकृत', 'প্রত্যাখ্যাত', 'நிராகரிக்கப்பட்டது'],
  'Pending': ['लंबित', 'মুলতুবি', 'நிலுவையில்'],
  'Search records...': ['रिकॉर्ड खोजें...', 'নথি খুঁজুন...', 'பதிவுகளைத் தேடுக...'],
  'SIH 2026 | Patient Case-Taking': ['एसआईएच 2026 | रोगी केस-टेकिंग', 'SIH 2026 | রোগীর কেস গ্রহণ', 'SIH 2026 | நோயாளி வழக்கு பதிவு'],
  'Doctor View • Clinical Documentation': ['डॉक्टर दृश्य • क्लिनिकल दस्तावेज़ीकरण', 'ডাক্তার দৃশ্য • ক্লিনিক্যাল ডকুমেন্টেশন', 'மருத்துவர் பார்வை • மருத்துவ ஆவணமாக்கல்'],
  'General Medicine': ['सामान्य चिकित्सा', 'সাধারণ চিকিৎসা', 'பொது மருத்துவம்'],
  'Consents': ['सहमतियां', 'সম্মতিসমূহ', 'ஒப்புதல்கள்'],
  'All Records': ['सभी रिकॉर्ड', 'সব নথি', 'அனைத்து பதிவுகள்'],
  'Scope': ['दायरा', 'পরিধি', 'வரம்பு'],
  'No Consent Records Found': ['कोई सहमति रिकॉर्ड नहीं मिला', 'কোনো সম্মতি নথি পাওয়া যায়নি', 'ஒப்புதல் பதிவுகள் எதுவும் இல்லை'],
  'Requester / Organization': ['अनुरोधकर्ता / संगठन', 'অনুরোধকারী / সংস্থা', 'கோருபவர் / நிறுவனம்'],
  'Detailed Purpose': ['विस्तृत उद्देश्य', 'বিস্তারিত উদ্দেশ্য', 'விரிவான நோக்கம்'],
  'Granted Date': ['स्वीकृति तिथि', 'অনুমোদনের তারিখ', 'வழங்கிய தேதி'],
  'Expiration Date': ['समाप्ति तिथि', 'মেয়াদ শেষের তারিখ', 'காலாவதி தேதி'],
  'Search consent...': ['सहमति खोजें...', 'সম্মতি খুঁজুন...', 'ஒப்புதலைத் தேடுக...'],
  'Full Name': ['पूरा नाम', 'পুরো নাম', 'முழுப் பெயர்'],
  'Age': ['आयु', 'বয়স', 'வயது'],
  'Gender': ['लिंग', 'লিঙ্গ', 'பாலினம்'],
  'Male': ['पुरुष', 'পুরুষ', 'ஆண்'],
  'Female': ['महिला', 'মহিলা', 'பெண்'],
  'Other': ['अन्य', 'অন্যান্য', 'மற்றவை'],
  'Years': ['वर्ष', 'বছর', 'வயது'],
  'Blood Group': ['रक्त समूह', 'রক্তের গ্রুপ', 'இரத்த வகை'],
  'Verified (Aadhaar Seeded)': ['सत्यापित (आधार से जुड़ा)', 'যাচাইকৃত (আধার সংযুক্ত)', 'சரிபார்க்கப்பட்டது (ஆதாருடன் இணைக்கப்பட்டது)'],
  'DOB': ['जन्म तिथि', 'জন্ম তারিখ', 'பிறந்த தேதி'],
  'Patient ID': ['रोगी आईडी', 'রোগী আইডি', 'நோயாளி அடையாளம்'],
  'ABHA Health ID': ['एबीएचए स्वास्थ्य आईडी', 'ABHA স্বাস্থ্য আইডি', 'ABHA சுகாதார அடையாளம்'],
  'Marital Status': ['वैवाहिक स्थिति', 'বৈবাহিক অবস্থা', 'திருமண நிலை'],
  'Occupation': ['व्यवसाय', 'পেশা', 'தொழில்'],
  'Language': ['भाषा', 'ভাষা', 'மொழி'],
  'Blood Pressure': ['रक्तचाप', 'রক্তচাপ', 'இரத்த அழுத்தம்'],
  'Heart Rate': ['हृदय गति', 'হৃদস্পন্দন', 'இதய துடிப்பு'],
  'Blood Glucose': ['रक्त ग्लूकोज', 'রক্তের গ্লুকোজ', 'இரத்த சர்க்கரை'],
  'Oxygen (SpO2)': ['ऑक्सीजन (SpO2)', 'অক্সিজেন (SpO2)', 'ஆக்சிஜன் (SpO2)'],
  'Phone Number': ['फोन नंबर', 'ফোন নম্বর', 'தொலைபேசி எண்'],
  'Email Address': ['ईमेल पता', 'ইমেল ঠিকানা', 'மின்னஞ்சல் முகவரி'],
  'Phone': ['फोन', 'ফোন', 'தொலைபேசி'],
  'Email': ['ईमेल', 'ইমেল', 'மின்னஞ்சல்'],
  'Address': ['पता', 'ঠিকানা', 'முகவரி'],
  'Contact Name': ['संपर्क नाम', 'যোগাযোগের নাম', 'தொடர்பு பெயர்'],
  'Relation': ['रिश्ता', 'সম্পর্ক', 'உறவு'],
  'Add condition...': ['स्थिति जोड़ें...', 'অবস্থা যোগ করুন...', 'நிலையைச் சேர்க்கவும்...'],
  'Add allergy...': ['एलर्जी जोड़ें...', 'অ্যালার্জি যোগ করুন...', 'ஒவ்வாமையைச் சேர்க்கவும்...'],
  'Add': ['जोड़ें', 'যোগ করুন', 'சேர்'],
  'Medication': ['दवा', 'ওষুধ', 'மருந்து'],
  'Dosage': ['खुराक', 'ডোজ', 'அளவு'],
  'Frequency': ['आवृत्ति', 'বারম্বারতা', 'அடிக்கடி'],
  'Timing': ['समय', 'সময়', 'நேரம்'],
  'Action': ['कार्रवाई', 'পদক্ষেপ', 'செயல்'],
  'Delete': ['हटाएं', 'মুছুন', 'நீக்கு'],
  'Add New Medication': ['नई दवा जोड़ें', 'নতুন ওষুধ যোগ করুন', 'புதிய மருந்தைச் சேர்க்கவும்'],
  'Add Allergy': ['एलर्जी जोड़ें', 'অ্যালার্জি যোগ করুন', 'ஒவ்வாமையைச் சேர்க்கவும்'],
  'Doctor Note': ['डॉक्टर नोट', 'ডাক্তারের নোট', 'மருத்துவர் குறிப்பு'],
  'Document Title': ['दस्तावेज़ शीर्षक', 'নথির শিরোনাম', 'ஆவணத் தலைப்பு'],
  'Category': ['श्रेणी', 'বিভাগ', 'வகை'],
  'Disease / Scan Report': ['बीमारी / स्कैन रिपोर्ट', 'রোগ / স্ক্যান প্রতিবেদন', 'நோய் / ஸ்கேன் அறிக்கை'],
  'Delete Record': ['रिकॉर्ड हटाएं', 'নথি মুছুন', 'பதிவை நீக்கு'],
  'No Documents Found': ['कोई दस्तावेज़ नहीं मिला', 'কোনো নথি পাওয়া যায়নি', 'ஆவணங்கள் எதுவும் இல்லை'],
  'Ayushman Bharat Health Account (ABHA)': ['आयुष्मान भारत स्वास्थ्य खाता (एबीएचए)', 'আয়ুষ্মান ভারত হেলথ অ্যাকাউন্ট (ABHA)', 'ஆயுஷ்மான் பாரத் சுகாதார கணக்கு (ABHA)'],
  'Emergency Contact': ['आपातकालीन संपर्क', 'জরুরি যোগাযোগ', 'அவசர தொடர்பு'],
};

function translated(text, language) {
  if (language === 'English') return text;
  const value = text.trim();
  const emoji = value.match(/^(\p{Extended_Pictographic}\s*)/u)?.[0] || '';
  const suffix = value.endsWith(':') ? ':' : '';
  const key = value.slice(emoji.length, suffix ? -1 : undefined).trim();
  const entry = Object.entries(words).find(([english]) => english.toLowerCase() === key.toLowerCase());
  const translation = entry?.[1][['Hindi', 'Bengali', 'Tamil'].indexOf(language)];
  if (translation) return text.replace(value, `${emoji}${translation}${suffix}`);
  const index = ['Hindi', 'Bengali', 'Tamil'].indexOf(language);
  return Object.entries(words)
    .filter(([english]) => english.length > 2)
    .sort(([a], [b]) => b.length - a.length)
    .reduce((result, [english, values]) => result.replaceAll(english, values[index]), text);
}

function translateTree(language) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    const source = node.__dashboardSource ?? node.nodeValue;
    node.__dashboardSource = source;
    const next = translated(source, language);
    if (node.nodeValue !== next) node.nodeValue = next;
  });
  document.querySelectorAll('[placeholder], [title]').forEach((element) => {
    ['placeholder', 'title'].forEach((attribute) => {
      if (!element.hasAttribute(attribute)) return;
      const key = `dashboard${attribute}`;
      const source = element.dataset[key] ?? element.getAttribute(attribute);
      element.dataset[key] = source;
      element.setAttribute(attribute, translated(source, language));
    });
  });
}

export function DashboardLanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('dashboard-language') || 'English');
  useEffect(() => {
    localStorage.setItem('dashboard-language', language);
    document.documentElement.lang = languages[language] || 'en';
    let isTranslating = false;
    const runTranslation = () => {
      if (isTranslating) return;
      isTranslating = true;
      observer.disconnect();
      try {
        translateTree(language);
      } catch (err) {
        console.warn('Translation error:', err);
      } finally {
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
        isTranslating = false;
      }
    };
    const observer = new MutationObserver(runTranslation);
    runTranslation();
    return () => observer.disconnect();
  }, [language]);
  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useDashboardLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useDashboardLanguage must be used inside DashboardLanguageProvider');
  return context;
}
