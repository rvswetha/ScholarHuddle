import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const StreakCounter = () => {
  const [streak, setStreak] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchStreak = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('current_streak')
        .eq('id', user.id)
        .single();
      
      if (data) setStreak(data.current_streak);
    };

    fetchStreak();
  }, [user]);

  return (
    <div className="streak-badge">
      <span className="fire-icon">🔥</span>
      <div className="streak-info">
        <span className="streak-num">{streak}</span>
        <span className="streak-label">Day Streak</span>
      </div>
    </div>
  );
};

export default StreakCounter;