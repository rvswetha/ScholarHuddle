import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

function Home() {
  const [userName, setUserName] = useState('');
  const [studyMinutes, setStudyMinutes] = useState(0);
  const [points, setPoints] = useState(0);
  const [savedDecks, setSavedDecks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [flipped, setFlipped] = useState({});

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, total_study_minutes, study_points')
        .eq('id', user.id)
        .single();
        
      if (profileData) {
        setUserName(profileData.full_name || 'Student');
        setStudyMinutes(profileData.total_study_minutes || 0);
        setPoints(profileData.study_points || 0);
      }

      const { data: decksData, error: decksError } = await supabase
        .from('saved_materials')
        .select('*')
        .eq('user_id', user.id)
        .eq('material_type', 'flashcards')
        .order('created_at', { ascending: false });

      if (decksError) throw decksError;
      setSavedDecks(decksData || []);

      const { data: joinedGroups, error: groupError } = await supabase
        .from('group_members')
        .select(`
          group_id,
          study_groups (
            id,
            name
          )
        `)
        .eq('user_id', user.id);

      if (groupError) throw groupError;

      const formattedGroups = joinedGroups.map(item => item.study_groups);
      setGroups(formattedGroups || []);

    } catch (error) {
      console.error("Error fetching groups:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFlip = (index) => {
    setFlipped(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const closeDeck = () => {
    setSelectedDeck(null);
    setFlipped({}); 
  };

  const deleteDeck = async (deckId, e) => {
    e.stopPropagation(); // Stops the card from opening when you click the trash can
    
    const confirmDelete = window.confirm("Are you sure you want to delete this deck?");
    if (!confirmDelete) return;

    const { error } = await supabase.from('saved_materials').delete().eq('id', deckId);
    
    if (error) {
      alert("Error deleting deck: " + error.message);
    } else {
      setSavedDecks(prevDecks => prevDecks.filter(deck => deck.id !== deckId));
    }
  };

  const shareDeck = async (deckId, groupId) => {
    if (!groupId) return;
  
    const { data: { user } } = await supabase.auth.getUser();
  
    const { error } = await supabase.from('messages').insert([{
      group_id: groupId,
      user_id: user.id,
      content: "Shared a Flashcard Deck",
      shared_material_id: deckId 
    }]);
  
    if (error) {
      alert("Error sharing: " + error.message);
    } else {
      alert("Successfully shared to the huddle!");
      setSelectedGroupId(""); 
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading your StudyHuddle...</div>;

  if (!userName && savedDecks.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Welcome to StudyHuddle!</h2>
        <p>Please log in or create an account to view your dashboard.</p>
      </div>
    );
  }

  if (selectedDeck) {
    return (
      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
        <button 
          onClick={closeDeck}
          style={{ marginBottom: '20px', padding: '8px 16px', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ← Back to Home
        </button>
        <h2 style={{ marginTop: 0 }}>{selectedDeck.title}</h2>
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', marginTop: '30px' }}>
          {selectedDeck.content.map((card, index) => (
            <div 
              key={index} onClick={() => toggleFlip(index)}
              style={{
                background: flipped[index] ? '#f8fafc' : '#ffffff', border: flipped[index] ? '2px solid #8b5cf6' : '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '30px 20px', borderRadius: '12px', cursor: 'pointer',
                minHeight: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '12px', color: '#64748b', marginBottom: '15px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                {flipped[index] ? 'Answer' : 'Question'}
              </span>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: flipped[index] ? 'normal' : '500', color: '#1e293b' }}>
                {flipped[index] ? card.answer : card.question}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', color: '#0f172a', marginBottom: '5px' }}>Welcome back, {userName}! 👋</h1>
      <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '30px' }}>Ready to crush your study goals today?</p>

      {/* STATS ROW */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <div style={{ flex: 1, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', opacity: 0.9 }}>Total Study Time</h3>
          <p style={{ margin: 0, fontSize: '36px', fontWeight: 'bold' }}>
            {Math.floor(studyMinutes / 60)}<span style={{ fontSize: '20px', fontWeight: 'normal', opacity: 0.9 }}>h</span> {studyMinutes % 60}<span style={{ fontSize: '20px', fontWeight: 'normal', opacity: 0.9 }}>m</span>
          </p>
        </div>
        <div style={{ flex: 1, background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', color: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', opacity: 0.9 }}>Study Score</h3>
          <p style={{ margin: 0, fontSize: '36px', fontWeight: 'bold' }}>
            {points.toLocaleString()} <span style={{ fontSize: '20px', fontWeight: 'normal', opacity: 0.9 }}>pts</span>
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '22px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>Your Saved Flashcards</h2>
        {savedDecks.length === 0 ? (
          <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '40px', textAlign: 'center', borderRadius: '12px' }}>
            <span style={{ fontSize: '30px' }}>📭</span>
            <p style={{ color: '#64748b', marginTop: '10px' }}>You haven't saved any decks yet. Head over to the AI Tools to generate some!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
            {savedDecks.map((deck) => (
              <div key={deck.id} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px', position: 'relative' }}>
                
                {/* 🚀 THE TRASH CAN BUTTON */}
                <button 
                  onClick={(e) => deleteDeck(deck.id, e)}
                  style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', opacity: 0.6 }}
                  title="Delete Deck"
                >
                  🗑️
                </button>

                <div onClick={() => setSelectedDeck(deck)} style={{ cursor: 'pointer' }}>
                  <span style={{ fontSize: '24px' }}>📚</span>
                  <h3 style={{ margin: '5px 0 10px 0', paddingRight: '20px' }}>{deck.title}</h3>
                </div>
                
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>
                    Share to Huddle
                  </label>
                  <select 
                    value={selectedGroupId} 
                    onChange={(e) => {
                      const gId = e.target.value;
                      setSelectedGroupId(gId); 
                      if (gId) shareDeck(deck.id, gId); 
                    }}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#f8fafc', cursor: 'pointer' }}
                  >
                    <option value="">Select a Group...</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;