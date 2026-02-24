import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './AIAssistant.css';

function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hi! How can I help you study today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }) 
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'AI server error');

      const aiMessage = { sender: 'ai', text: result.data };
      setMessages(prev => [...prev, aiMessage]);

    } catch (err) {
      console.error("Chat Error:", err);
      const errorMessage = { 
        sender: 'ai', 
        text: `**Error:** ${err.message}. Please check your server terminal.` 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-assistant-container">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>AI Assistant</h3>
            <button onClick={toggleChat} className="chat-close-btn">X</button>
          </div>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {/* 5. Wrap text in Markdown for better readability */}
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            ))}
            {isLoading && <div className="message ai">Thinking...</div>}
          </div>
          <form onSubmit={handleSend} className="chat-input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
            />
            <button type="submit" disabled={isLoading}>Send</button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button onClick={toggleChat} className="chat-popup-button">
          AI
        </button>
      )}
    </div>
  );
}

export default AIAssistant;