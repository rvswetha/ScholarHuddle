import React, { useState } from 'react';
import GroupsHub from '../components/StudyGroupChatroom/GroupsHub';
import LiveMeeting from '../components/StudyGroupChatroom/LiveMeeting';
import './StudyRoom.css';

const Studyroom = () => {
  const [isMeetingLive, setIsMeetingLive] = useState(false);
  const [meetingRoomName, setMeetingRoomName] = useState('Focus-Room');

  const handleStartMeeting = () => {
    const room = prompt("Enter a name for this study session:", "Late-Night-Grind");
    if (room) {
      setMeetingRoomName(room);
      setIsMeetingLive(true);
    }
  };

  return (
    <div className="studyroom-page">
      <header className="studyroom-header">
        <div className="header-text">
          <h1>Co-Working Studyroom</h1>
          <p>Collaborate, chat, and focus together with your peers.</p>
        </div>
      </header>

      {/* CONDITIONAL RENDERING: Show either the Meeting OR the Dashboard */}
      {isMeetingLive ? (
        <div className="active-meeting-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <h2 style={{ margin: 0 }}>🎥 Live Session: {meetingRoomName}</h2>
            <button 
              onClick={() => setIsMeetingLive(false)} 
              style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              Force Exit
            </button>
          </div>
          
          <LiveMeeting 
            roomName={meetingRoomName} 
            onLeave={() => setIsMeetingLive(false)} 
          />
        </div>
      ) : (
        <div className="studyroom-grid">
          {/* LEFT COLUMN: Groups & Text Chat */}
          <section className="groups-section">
            <GroupsHub />
          </section>

          {/* RIGHT COLUMN: Start Meeting Controls */}
          <aside className="meetings-sidebar">
            <div className="meetings-card">
              <h3>🎥 Live Sessions</h3>
              <p className="meetings-desc">
                Ready to focus? Start a live Pomodoro session or video call with your active study group.
              </p>
              
              <div className="meeting-actions">
                <button 
                  className="start-meeting-btn"
                  onClick={handleStartMeeting}
                >
                  Start Video Call
                </button>
                <button className="schedule-meeting-btn" onClick={() => alert("Scheduling integration coming soon!")}>
                  Schedule for Later
                </button>
              </div>

              <div className="meeting-status">
                <span className="status-dot"></span>
                <p>No active meetings in your groups right now.</p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Studyroom;