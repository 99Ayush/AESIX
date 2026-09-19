import React from 'react';
import { Pill, FilePlus2, Cross, MapPin } from "lucide-react";

export const QuickActions = ({ onSelectAction, language = 'en' }) => {
  const isHindi = language === 'hi';
  const isBengali = language === 'bn';
  const isTamil = language === 'ta';

  const getDirText = () => {
    if (isHindi) return 'दिशा सहायता (Directions)';
    if (isBengali) return 'দিকনির্দেশ সাহায্য';
    if (isTamil) return 'வழிசெலுத்தல் உதவி';
    return 'App Direction Help';
  };

  const getDirQuery = () => {
    if (isHindi) return 'मुझे प्लेटफ़ॉर्म नेविगेशन और दिशा सहायता चाहिए: दस्तावेज़ अपलोड, सुकरात फॉर्म, आभा आईडी और कोड सर्च कहाँ मिलेंगे?';
    if (isBengali) return 'আমার প্ল্যাটফর্ম নেভিগেশন ও দিকনির্দেশ সাহায্য প্রয়োজন: ডকুমেন্ট আপলোড, সাক্রেটিস ফর্ম, আভা আইডি এবং কোড সার্চ কোথায় পাব?';
    if (isTamil) return 'எனக்கு பிளாட்ஃபார்ம் வழிசெலுத்தல் உதவி தேவை: ஆவணப் பதிவேற்றம், சாக்ரடீஸ் படிவம், ஆபா ஐடி மற்றும் குறியீடு தேடல் எங்கே கிடைக்கும்?';
    return 'Where can I find Document Upload, Socrates Form, ABHA ID, and Code Search pages on this platform?';
  };

  const getEmergText = () => {
    if (isHindi) return 'आपातकालीन (Emergency)';
    if (isBengali) return 'জরুরি (Emergency)';
    if (isTamil) return 'அவசரம் (Emergency)';
    return 'Medical Emergency';
  };

  const getEmergQuery = () => {
    if (isHindi) return 'मुझे आपातकालीन समस्या है: बहुत तेज़ सीने में दर्द और चक्कर आ रहे हैं। मुझे क्या करना चाहिए?';
    if (isBengali) return 'আমার জরুরি চিকিৎসা সমস্যা: তীব্র বুকে ব্যথা এবং মাথা ঘোরাচ্ছে। আমার কী করা উচিত?';
    if (isTamil) return 'எனக்கு அவசர மருத்துவப் பிரச்சனை: கடுமையான நெஞ்சு வலி மற்றும் தலைச்சுற்றல் உள்ளது. நான் என்ன செய்ய வேண்டும்?';
    return 'I have a medical emergency: severe chest pain and dizziness. What should I do?';
  };

  const getConsultText = () => {
    if (isHindi) return 'लक्षण परामर्श';
    if (isBengali) return 'লক্ষণ পরামর্শ';
    if (isTamil) return 'அறிகுறி ஆலோசனை';
    return 'Symptom Consultation';
  };

  const getConsultQuery = () => {
    if (isHindi) return 'मुझे पिछले 2 दिनों से हल्का बुखार और खांसी है। आप मुझे क्या सलाह और देखभाल देंगे?';
    if (isBengali) return 'আমার গত ২ দিন ধরে মৃদু জ্বর এবং কাশি রয়েছে। আপনি আমাকে কী পরামর্শ দেবেন?';
    if (isTamil) return 'எனக்கு 2 நாட்களாக லேசான காய்ச்சல் மற்றும் இருமல் உள்ளது. எனக்கு என்ன ஆலோசனை தருவீர்கள்?';
    return 'I have had a mild fever and persistent cough for 2 days. What consultation advice can you give?';
  };

  const getTipsText = () => {
    if (isHindi) return 'स्वास्थ्य टिप्स';
    if (isBengali) return 'স্বাস্থ্য টিপস';
    if (isTamil) return 'சுகாதார குறிப்புகள்';
    return 'Daily Med Talk';
  };

  const getTipsQuery = () => {
    if (isHindi) return 'दैनिक स्वास्थ्य आदतें, अच्छा भोजन और आराम की सलाह दें।';
    if (isBengali) return 'দৈনন্দিন স্বাস্থ্য অভ্যাস, পুষ্টিকর খাবার এবং বিশ্রামের পরামর্শ দিন।';
    if (isTamil) return 'தினசரி சுகாதார பழக்கவழக்கங்கள், நல்ல உணவு மற்றும் ஓய்வு பற்றிய குறிப்புகளைத் தரவும்.';
    return 'What are key daily health habits, food, rest and lifestyle tips?';
  };

  return (
    <div className="quick-actions-bar">
      <button
        type="button"
        className="action-chip direction"
        onClick={() => onSelectAction(getDirQuery())}
      >
        <MapPin size={18} />
        <span>{getDirText()}</span>
      </button>
      <button
        type="button"
        className="action-chip emergency"
        onClick={() => onSelectAction(getEmergQuery())}
      >
        <span>{getEmergText()}</span>
      </button>
      <button
        type="button"
        className="action-chip consultation"
        onClick={() => onSelectAction(getConsultQuery())}
      >
        <FilePlus2 size={18} />
        <span>{getConsultText()}</span>
      </button>
      <button
        type="button"
        className="action-chip medtalk"
        onClick={() => onSelectAction(getTipsQuery())}
      >
        <Cross size={18} />
        <span>{getTipsText()}</span>
      </button>
    </div>
  );
};

export default QuickActions;
