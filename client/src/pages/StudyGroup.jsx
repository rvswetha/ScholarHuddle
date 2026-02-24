import React from 'react';
import ChatBox from '../components/ChatBox/ChatBox';

export default function StudyGroup() {
  return (
    <div className="study-room-page" style={{ padding: 16 }}>
      <h2>Study Room</h2>
      <ChatBox />
    </div>
  );
}