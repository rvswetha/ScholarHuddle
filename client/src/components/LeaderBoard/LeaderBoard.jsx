import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import './leaderboard.css';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      // 🏆 Fetch top 10 users by points
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, study_points')
        .order('study_points', { ascending: false })
        .limit(10);

      if (data) setLeaders(data);
      setLoading(false);
    };

    fetchLeaders();
    
    // 🔄 Real-time update: Refresh when someone earns points
    const channel = supabase
      .channel('leaderboard-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, fetchLeaders)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  if (loading) return <div className="loader">Calculating ranks...</div>;

  return (
    <div className="leaderboard-card">
      <div className="leaderboard-header">
        <h3>🏆 Hall of Fame</h3>
        <span>Top Scholars</span>
      </div>
      <div className="leaderboard-list">
        {leaders.map((student, index) => (
          <div key={index} className={`leader-item rank-${index + 1}`}>
            <div className="rank-num">{index + 1}</div>
            <img 
              src={student.avatar_url || `https://ui-avatars.com/api/?name=${student.full_name}`} 
              alt="avatar" 
              className="leader-avatar" 
            />
            <div className="leader-info">
              <span className="leader-name">{student.full_name}</span>
              <span className="leader-points">{student.study_points || 0} pts</span>
            </div>
            {index === 0 && <span className="crown">👑</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;