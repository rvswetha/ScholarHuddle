import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../../services/supabaseClient';
function FlashcardsTab() {
  const [text, setText] = useState('');
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [error, setError] = useState('');
  
  const [flipped, setFlipped] = useState({});

  const toggleFlip = (index) => {
    setFlipped(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const processAIResponse = (rawData) => {
    try {
      const cleanJson = rawData.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedCards = JSON.parse(cleanJson);
      setCards(parsedCards);
      setSaveMessage(''); // Clear any previous save messages
    } catch (err) {
      console.error(err);
      setError("Failed to generate flashcards. The AI formatting was slightly off.");
    }
  };

  const handleSaveDeck = async () => {
    setIsSaving(true);
    setError('');
    setSaveMessage('');

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("You must be logged in to save decks!");

      const deckTitle = window.prompt("Give this study deck a title:", "My Flashcards");
      if (!deckTitle) {
        setIsSaving(false);
        return; 
      }

      const { error: dbError } = await supabase
        .from('saved_materials')
        .insert([
          {
            user_id: user.id,
            title: deckTitle,
            material_type: 'flashcards',
            content: cards 
          }
        ]);

      if (dbError) throw dbError;
      
      setSaveMessage('Deck saved successfully! You can view it on your Dashboard.');
    } catch (err) {
      setError('Failed to save: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setError('Invalid file type. Please upload a PDF or PowerPoint.');
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', 'flashcards');

    setIsLoading(true); setError(''); setCards([]); setFlipped({}); setSaveMessage('');

    fetch('/api/ai/process-file', {
      method: 'POST',
      body: formData,
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) throw new Error(data.error);
      processAIResponse(data.data);
    })
    .catch(err => setError('Failed to process document: ' + err.message))
    .finally(() => setIsLoading(false));
  }, []);

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true); setError(''); setCards([]); setFlipped({}); setSaveMessage('');

    fetch('/api/ai/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text, mode: 'flashcards' }), 
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) throw new Error(data.error);
      processAIResponse(data.data);
    })
    .catch(err => setError('Failed to generate from text: ' + err.message))
    .finally(() => setIsLoading(false));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
    },
    multiple: false,
  });

  return (
    <div className="ai-tab-content">
      <div 
        {...getRootProps()} 
        className="dropzone" 
        style={{
          border: `2px dashed ${isDragActive ? '#8b5cf6' : '#ccc'}`, 
          backgroundColor: isDragActive ? '#f5f3ff' : 'transparent',
          padding: '40px 20px', textAlign: 'center', cursor: 'pointer', borderRadius: '12px',
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p style={{ color: '#8b5cf6', fontWeight: 'bold' }}>Drop the document here ...</p>
        ) : (
          <div>
            <span style={{ fontSize: '24px' }}>🃏</span>
            <p style={{ margin: '10px 0 0 0', fontWeight: '500' }}>Drag 'n' drop a PDF or PowerPoint here</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>We'll extract the text and build a study deck!</p>
          </div>
        )}
      </div>

      <div className="divider-or" style={{textAlign: 'center', margin: '20px 0', color: '#888'}}><p>— OR —</p></div>

      <form onSubmit={handleTextSubmit}>
        <textarea
          rows="6"
          style={{width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', fontFamily: 'inherit'}}
          placeholder="Paste notes here to generate instant flashcards..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={isLoading || !text.trim()} 
          style={{
            marginTop: '10px', padding: '12px 24px', 
            cursor: (isLoading || !text.trim()) ? 'not-allowed' : 'pointer',
            background: (isLoading || !text.trim()) ? '#94a3b8' : '#8b5cf6',
            color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold'
          }}
        >
          {isLoading ? 'Building Deck...' : 'Generate Flashcards'}
        </button>
      </form>

      {error && <div style={{color: '#ef4444', background: '#fef2f2', padding: '10px', borderRadius: '6px', marginTop: '15px'}}>{error}</div>}
      {saveMessage && <div style={{color: '#16a34a', background: '#f0fdf4', padding: '10px', borderRadius: '6px', marginTop: '15px'}}>{saveMessage}</div>}

      {cards.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: '#0f172a', margin: 0 }}>Your Study Deck ({cards.length} Cards)</h3>
            
            {/* THE SAVE BUTTON */}
            <button 
              onClick={handleSaveDeck}
              disabled={isSaving}
              style={{
                padding: '8px 16px', backgroundColor: '#10b981', color: 'white', 
                border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: isSaving ? 'not-allowed' : 'pointer'
              }}
            >
              {isSaving ? 'Saving...' : 'Save Deck'}
            </button>
          </div>

          <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
            {cards.map((card, index) => (
              <div 
                key={index} 
                onClick={() => toggleFlip(index)}
                style={{
                  background: flipped[index] ? '#f8fafc' : '#ffffff',
                  border: flipped[index] ? '2px solid #8b5cf6' : '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  padding: '20px', borderRadius: '12px', cursor: 'pointer',
                  minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  {flipped[index] ? 'Answer' : 'Question'}
                </span>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: flipped[index] ? 'normal' : '500', color: '#1e293b' }}>
                  {flipped[index] ? card.answer : card.question}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FlashcardsTab;