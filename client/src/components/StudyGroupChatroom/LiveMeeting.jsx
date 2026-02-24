import React from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { useAuth } from '../../context/AuthContext';

const LiveMeeting = ({ roomName, onLeave }) => {
  const { user } = useAuth();
  
  const uniqueRoomName = `ScholarHuddle-${roomName.replace(/\s+/g, '-')}`;

  return (
    <div className="live-meeting-container" style={{ height: '600px', width: '100%', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
      <JitsiMeeting
        domain="meet.jit.si"
        roomName={uniqueRoomName}
        configOverwrite={{
          startWithAudioMuted: true,
          startWithVideoMuted: false,
          disableModeratorIndicator: true,
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          SHOW_JITSI_WATERMARK: false,
        }}
        userInfo={{
          displayName: user?.email?.split('@')[0] || 'Guest Scholar'
        }}
        onApiReady={(externalApi) => {
          // This fires when the meeting is fully loaded
          console.log('Jitsi API loaded successfully');
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = '100%';
          iframeRef.style.width = '100%';
        }}
        onReadyToClose={onLeave} // Triggers when the user clicks the red "Hang up" button
      />
    </div>
  );
};

export default LiveMeeting;