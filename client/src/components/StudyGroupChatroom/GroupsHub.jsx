import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import StudyGroupChatroom from './StudyGroupChatroom';
import './groupsHub.css';

const GroupsHub = () => {
  const [myGroups, setMyGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const { user } = useAuth();

  // 1. Fetch groups the user is a part of
  const fetchMyGroups = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('group_members')
      .select('study_groups(id, name, invite_code)')
      .eq('user_id', user.id);

    if (data) setMyGroups(data.map(item => item.study_groups));
    if (error) console.error("Error fetching groups:", error);
  };

  useEffect(() => {
    fetchMyGroups();
  }, [user]);

  // 2. Create a new Group
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim() || !user) return;

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data: newGroup, error: groupError } = await supabase
      .from('study_groups')
      .insert({ name: newGroupName, invite_code: code, created_by: user.id })
      .select()
      .single();

    if (groupError) return alert("Error creating group.");

    await supabase.from('group_members').insert({ group_id: newGroup.id, user_id: user.id });

    setNewGroupName('');
    fetchMyGroups();
    alert(`Group Created! Your invite code is: ${code}`);
  };

  // 3. Join an existing Group
  const handleJoinGroup = async (e) => {
    e.preventDefault();
    
    if (!joinCode.trim()) return alert("Please enter a 6-digit code first!");
    if (!user) return alert("Auth Error: You are not logged in! Please log in first.");

    console.log("Attempting to join with code:", joinCode.toUpperCase());

    const { data: groupToJoin, error: searchError } = await supabase
      .from('study_groups')
      .select('id, name')
      .eq('invite_code', joinCode.toUpperCase())
      .single();

    if (searchError || !groupToJoin) {
      console.error("Search Error:", searchError);
      return alert("Invalid Code! Could not find a group with that code.");
    }

    const { data: existingMember } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupToJoin.id)
      .eq('user_id', user.id)
      .single();

    if (existingMember) return alert("You are already in this group!");

    const { error: joinError } = await supabase
      .from('group_members')
      .insert({ group_id: groupToJoin.id, user_id: user.id });

    if (joinError) return alert("Error joining group: " + joinError.message);

    setJoinCode('');
    fetchMyGroups();
    alert(`Successfully joined ${groupToJoin.name}!`);
  };

  return (
    <div className="groups-hub-container">
      <div className="groups-dashboard">
        <h3>👥 My Study Guilds</h3>
        
        {/* List of active groups */}
        <div className="groups-list">
          {myGroups.length === 0 ? <p className="empty-msg">You aren't in any groups yet.</p> : null}
          {myGroups.map(group => (
            <div key={group.id} className="group-card" onClick={() => setActiveGroup(group)}>
              <div className="group-info">
                <h4>{group.name}</h4>
                <span className="code-badge">Code: {group.invite_code}</span>
              </div>
              <button className="join-chat-btn">Enter Chat</button>
            </div>
          ))}
        </div>

        {/* Action Forms */}
        <div className="group-actions">
          <form onSubmit={handleCreateGroup} className="action-form">
            <h4>Create a Group</h4>
            <div className="input-group">
              <input 
                type="text" 
                placeholder="Group Name (e.g. Physics 101)" 
                value={newGroupName} 
                onChange={e => setNewGroupName(e.target.value)} 
              />
              <button type="submit">Create</button>
            </div>
          </form>

          <form onSubmit={handleJoinGroup} className="action-form join-form">
            <h4>Join a Group</h4>
            <div className="input-group">
              <input 
                type="text" 
                placeholder="Enter 6-digit Code" 
                value={joinCode} 
                onChange={e => setJoinCode(e.target.value)} 
              />
              <button type="submit">Join</button>
            </div>
          </form>
        </div>
      </div>

      {activeGroup && (
        <StudyGroupChatroom 
          groupId={activeGroup.id} 
          groupName={activeGroup.name} 
          onClose={() => setActiveGroup(null)} 
        />
      )}
    </div>
  );
};

export default GroupsHub;