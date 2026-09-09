import React from 'react';

export const QuickActions = ({ onSelectAction }) => {
  return (
    <div className="quick-actions-bar">
      <button
        className="action-chip emergency"
        onClick={() => onSelectAction('I have a medical emergency: severe chest pain and dizziness. What should I do?')}
      >
        🚨 Medical Emergency
      </button>
      <button
        className="action-chip consultation"
        onClick={() => onSelectAction('I have had a mild fever and persistent cough for 2 days. What consultation advice can you give?')}
      >
        🩺 Symptom Consultation
      </button>
      <button
        className="action-chip medtalk"
        onClick={() => onSelectAction('What are key daily health habits and medication safety tips?')}
      >
        💊 Daily Med Talk
      </button>
    </div>
  );
};

export default QuickActions;
