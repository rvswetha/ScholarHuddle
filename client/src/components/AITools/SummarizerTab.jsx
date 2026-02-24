import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function SummarizerTab() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Logic for PDF & PPT Upload ---
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setError('Invalid file type. Please upload a PDF or PowerPoint (.ppt, .pptx).');
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', 'summary');

    setIsLoading(true);
    setError('');
    setResult('');

    fetch('/api/ai/process-file', {
      method: 'POST',
      body: formData,
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) throw new Error(data.error);
      setResult(data.data);
    })
    .catch(err => {
      setError('Failed to summarize document: ' + err.message);
    })
    .finally(() => {
      setIsLoading(false);
    });
  }, []);

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    setError('');
    setResult('');

    fetch('/api/ai/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text, mode: 'summary' }), 
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) throw new Error(data.error);
      setResult(data.data);
    })
    .catch(err => {
      setError('Failed to summarize text: ' + err.message);
    })
    .finally(() => {
      setIsLoading(false);
    });
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
      {/* Updated Dropzone UI */}
      <div 
        {...getRootProps()} 
        className="dropzone" 
        style={{
          border: `2px dashed ${isDragActive ? '#3b82f6' : '#ccc'}`, 
          backgroundColor: isDragActive ? '#eff6ff' : 'transparent',
          padding: '40px 20px', 
          textAlign: 'center', 
          cursor: 'pointer',
          borderRadius: '12px',
          transition: 'all 0.2s ease'
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p style={{ color: '#3b82f6', fontWeight: 'bold' }}>Drop the document here ...</p>
        ) : (
          <div>
            <span style={{ fontSize: '24px' }}>📄</span>
            <p style={{ margin: '10px 0 0 0', fontWeight: '500' }}>Drag 'n' drop a PDF or PowerPoint here</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>Supports .pdf, .ppt, and .pptx</p>
          </div>
        )}
      </div>

      <div className="divider-or" style={{textAlign: 'center', margin: '20px 0', color: '#888'}}>
        <p>— OR —</p>
      </div>

      <form onSubmit={handleTextSubmit} className="text-summarizer">
        <textarea
          rows="10"
          style={{width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', fontFamily: 'inherit'}}
          placeholder="Paste your long text here to get an instant summary..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={isLoading || !text.trim()} 
          style={{
            marginTop: '10px', 
            padding: '12px 24px', 
            cursor: (isLoading || !text.trim()) ? 'not-allowed' : 'pointer',
            background: (isLoading || !text.trim()) ? '#94a3b8' : '#1e293b',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold'
          }}
        >
          {isLoading ? 'Summarizing...' : 'Summarize Text'}
        </button>
      </form>

      <div className="ai-result">
        {error && <div className="error-message" style={{color: '#ef4444', background: '#fef2f2', padding: '10px', borderRadius: '6px', marginTop: '15px'}}>{error}</div>}
        {result && (
          <div className="summary-output" style={{background: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px', marginTop: '20px', borderRadius: '8px', whiteSpace: 'pre-wrap', lineHeight: '1.6'}}>
            <h3 style={{ marginTop: 0, color: '#0f172a' }}>Summary Result:</h3>
            {result}
          </div>
        )}
      </div>
    </div>
  );
}

export default SummarizerTab;