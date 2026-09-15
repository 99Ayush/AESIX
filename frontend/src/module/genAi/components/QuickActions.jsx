import React from 'react';
import { Pill, FilePlus2, Cross, MapPin } from "lucide-react";

export const QuickActions = ({ onSelectAction, language = 'en' }) => {
  const isHindi = language === 'hi';

  return (
    <div className="quick-actions-bar">
      <button
        type="button"
        className="action-chip direction"
        onClick={() =>
          onSelectAction(
            isHindi
              ? 'मुझे प्लेटफ़ॉर्म नेविगेशन और दिशा सहायता चाहिए: दस्तावेज़ अपलोड, सुकरात फॉर्म, आभा आईडी और कोड सर्च कहाँ मिलेंगे?'
              : 'Where can I find Document Upload, Socrates Form, ABHA ID, and Code Search pages on this platform?'
          )
        }
      >
        <MapPin size={18} />
        <span>{isHindi ? 'दिशा सहायता (Directions)' : 'App Direction Help'}</span>
      </button>
      <button
        type="button"
        className="action-chip emergency"
        onClick={() =>
          onSelectAction(
            isHindi
              ? 'मुझे आपातकालीन समस्या है: बहुत तेज़ सीने में दर्द और चक्कर आ रहे हैं। मुझे क्या करना चाहिए?'
              : 'I have a medical emergency: severe chest pain and dizziness. What should I do?'
          )
        }
      >
        <span>{isHindi ? 'आपातकालीन (Emergency)' : 'Medical Emergency'}</span>
      </button>
      <button
        type="button"
        className="action-chip consultation"
        onClick={() =>
          onSelectAction(
            isHindi
              ? 'मुझे पिछले 2 दिनों से हल्का बुखार और खांसी है। आप मुझे क्या सलाह और देखभाल देंगे?'
              : 'I have had a mild fever and persistent cough for 2 days. What consultation advice can you give?'
          )
        }
      >
        <FilePlus2 size={18} />
        <span>{isHindi ? 'लक्षण परामर्श' : 'Symptom Consultation'}</span>
      </button>
      <button
        type="button"
        className="action-chip medtalk"
        onClick={() =>
          onSelectAction(
            isHindi
              ? 'दैनिक स्वास्थ्य आदतें, अच्छा भोजन और आराम की सलाह दें।'
              : 'What are key daily health habits, food, rest and lifestyle tips?'
          )
        }
      >
        <Cross size={18} />
        <span>{isHindi ? 'स्वास्थ्य टिप्स' : 'Daily Med Talk'}</span>
      </button>
    </div>
  );
};

export default QuickActions;
