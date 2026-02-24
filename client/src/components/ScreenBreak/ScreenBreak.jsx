import React, { useState, useEffect, useRef } from 'react';

export default function ScreenBreak() {
  const [isActive, setIsActive] = useState(() => {
    return localStorage.getItem('eyeCareMode') === 'true';
  });
  
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
  }, []);

  useEffect(() => {
    localStorage.setItem('eyeCareMode', isActive);
    let interval = null;
    
    if (isActive) {
      interval = setInterval(() => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(err => console.log(err));
        }
        
        if (Notification.permission === 'granted') {
          new Notification("Screen Break!", {
            body: "Look at something 20 feet away for 20 seconds to rest your eyes.",
            icon: "https://cdn-icons-png.flaticon.com/512/751/751463.png" 
          });
        }
      }, 1200000); 
    }
    
    return () => clearInterval(interval);
  }, [isActive]);

  const handleToggle = (e) => {
    const isChecked = e.target.checked;
    setIsActive(isChecked);
    
    if (isChecked) {
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }).catch(err => console.log(err));
      }

      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  };

  return (
    <div style={{ 
      padding: '16px', 
      background: '#f0fdf4', 
      borderRadius: '12px', 
      width: '100%', 
      boxSizing: 'border-box', 
      border: '1px solid #bbf7d0',
      marginTop: '10px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ margin: 0, color: '#166534', fontSize: '16px' }}>Eye Care Mode</h4>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#15803d' }}>Gentle reminder every 20m</p>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={isActive} 
            onChange={handleToggle} 
            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#166534' }}
          />
        </label>
      </div>
    </div>
  );
}