import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import './StudyGroupChatroom.css';
import axios from 'axios';

function StudyGroupChatroom({ groupId, groupName, onClose }) {
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [selectedSharedDeck, setSelectedSharedDeck] = useState(null); // 🚀 For viewing shared decks
  const [flipped, setFlipped] = useState({});
  const messagesRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!groupId) return;

    const fetchRoomData = async () => {
      const { data: memberData } = await supabase
        .from('group_members')
        .select('profiles(id, full_name)')
        .eq('group_id', groupId);

      if (memberData) setMembers(memberData.map(m => m.profiles));

      const { data: msgHistory } = await supabase
        .from('messages')
        .select('*, profiles(full_name)')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (msgHistory) setMessages(msgHistory);
    };

    fetchRoomData();

    const channel = supabase
      .channel(`room-${groupId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `group_id=eq.${groupId}` },
        async (payload) => {
          const { data: sender } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', payload.new.user_id)
            .single();

          const completeMessage = { ...payload.new, profiles: sender };
          setMessages(prev => [...prev, completeMessage]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [groupId]);

  const sendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed || !user) return;
    
    const messageContent = trimmed;
    setText(''); 

    const { data, error } = await supabase
      .from('messages')
      .insert({ group_id: groupId, user_id: user.id, content: messageContent });

    if (error) {
      console.error("Insert Error:", error);
    } else {
      try {
        await axios.post('http://localhost:5000/api/notifications/chat', {
          senderName: user.user_metadata?.full_name || 'A teammate',
          messageText: messageContent,
          studyGroupId: groupId,
          senderId: user.id
        });
        console.log("Push notification trigger sent to backend.");
      } catch (err) {
        console.error("Notification pipeline failed (but message was sent):", err);
      }
    }
  };

  const openSharedDeck = async (deckId) => {
    const { data, error } = await supabase
      .from('saved_materials')
      .select('*')
      .eq('id', deckId)
      .single();

    if (data) setSelectedSharedDeck(data);
    else console.error("Error loading shared deck:", error);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!groupId) return null;

  return (
    <div className="chatbox-root">
      {/* OVERLAY STUDY MODE */}
      {selectedSharedDeck && (
        <div className="study-overlay" style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'white', zIndex: 100, padding: '20px', overflowY: 'auto'
        }}>
          <button onClick={() => setSelectedSharedDeck(null)} style={{marginBottom: '10px'}}>← Back to Chat</button>
          <h3>{selectedSharedDeck.title}</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            {selectedSharedDeck.content.map((card, i) => (
              <div key={i} onClick={() => setFlipped({...flipped, [i]: !flipped[i]})} 
                style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center', cursor: 'pointer' }}>
                <strong>{flipped[i] ? 'Answer' : 'Question'}</strong>
                <p>{flipped[i] ? card.answer : card.question}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <div className="user-list">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h4>Members</h4>
          {onClose && <button onClick={onClose} className="close-btn">✖</button>}
        </div>
        <ul>
          {members.map(m => (
            <li key={m?.id}>{m?.full_name || 'Guest'} {m?.id === user?.id ? '(You)' : ''}</li>
          ))}
        </ul>
      </div>

      {/* CHAT AREA */}
      <div className="chat-area">
        <div style={{ padding: 10, borderBottom: '1px solid #eee', background: '#fff' }}>
          <strong>{groupName || 'Study Group'}</strong>
        </div>

        <div className="messages" ref={messagesRef}>
          {messages.map(m => {
            const isMe = m.user_id === user?.id;
            return (
              <div key={m.id} className={`message${isMe ? ' me' : ''}`}>
                {!isMe && <div className="sender-name">{m.profiles?.full_name || 'Guest Scholar'}</div>}
                <div className="message-content">
                  {m.content}
                  
                  {m.shared_material_id && (
                    <div className="shared-card" style={{
                      marginTop: '8px', background: isMe ? '#ffffff33' : '#f0f0f0', 
                      padding: '10px', borderRadius: '8px', border: '1px solid #8b5cf6'
                    }}>
                      <p style={{margin: 0, fontSize: '13px'}}>Flashcard Deck Shared</p>
                      <button 
                        onClick={() => openSharedDeck(m.shared_material_id)}
                        style={{ marginTop: '5px', width: '100%', cursor: 'pointer', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '4px', padding: '4px' }}
                      >
                        Study Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="input-row">
          <textarea rows={1} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a message..." />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default StudyGroupChatroom;