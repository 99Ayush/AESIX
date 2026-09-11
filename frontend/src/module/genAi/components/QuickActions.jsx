import React from 'react';

export const QuickActions = ({ onSelectAction, language = 'en' }) => {
  const isHindi = language === 'hi';

  return (
    <div className="quick-actions-bar">
      <button
        className="action-chip emergency"
        onClick={() =>
          onSelectAction(
            isHindi
              ? 'मुझे आपातकालीन समस्या है: बहुत तेज़ सीने में दर्द और चक्कर आ रहे हैं। मुझे क्या करना चाहिए?'
              : 'I have a medical emergency: severe chest pain and dizziness. What should I do?'
          )
        }
      >
        🚨 {isHindi ? 'आपातकालीन चिकित्सा (Emergency)' : 'Medical Emergency'}
      </button>
      <button
        className="action-chip consultation"
        onClick={() =>
          onSelectAction(
            isHindi
              ? 'मुझे पिछले 2 दिनों से हल्का बुखार और खांसी है। आप मुझे क्या सलाह और देखभाल देंगे?'
              : 'I have had a mild fever and persistent cough for 2 days. What consultation advice can you give?'
          )
        }
      >
        🩺 {isHindi ? 'लक्षण परामर्श (Symptom Check)' : 'Symptom Consultation'}
      </button>
      <button
        className="action-chip medtalk"
        onClick={() =>
          onSelectAction(
            isHindi
              ? 'दैनिक स्वास्थ्य आदतें, अच्छा भोजन और आराम की सलाह दें।'
              : 'What are key daily health habits, food, rest and lifestyle tips?'
          )
        }
      >
        💊 {isHindi ? 'दैनिक स्वास्थ्य एवं जीवनशैली' : 'Daily Med Talk'}
      </button>
    </div>
  );
};

export default QuickActions;
