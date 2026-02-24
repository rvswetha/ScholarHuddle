import React, { useState } from 'react';
import SummarizerTab from '../components/AITools/SummarizerTab';
import FlashcardsTab from '../components/AITools/FlashcardsTab';
import './AIStudyTools.css'; 

function AIStudyTools() {
  const [activeTab, setActiveTab] = useState('summarizer');

  return (
    <div className="ai-tools-page">
      <h2>AI Study Tools</h2>
      <p>Get summaries, flashcards, and more from your study materials.</p>
      
      {/* --- The Tab Buttons --- */}
      <div className="ai-tab-buttons">
        <button
          className={activeTab === 'summarizer' ? 'active' : ''}
          onClick={() => setActiveTab('summarizer')}
        >
          Summarizer
        </button>
        <button
          className={activeTab === 'flashcards' ? 'active' : ''}
          onClick={() => setActiveTab('flashcards')}
        >
          Flashcards
        </button>
      </div>
      
      {/* --- The Tab Content --- */}
      <div className="ai-tab-container">
        {activeTab === 'summarizer' && <SummarizerTab />}
        {activeTab === 'flashcards' && <FlashcardsTab />}
      </div>
    </div>
  );
}

export default AIStudyTools;