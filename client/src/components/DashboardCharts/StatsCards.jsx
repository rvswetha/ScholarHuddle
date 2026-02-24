import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import './statsCards.css';

const StatsCards = () => {
  const [stats, setStats] = useState({ totalDone: 0, completionRate: 0 });
  const { user } = useAuth();

  useEffect(() => {
    if(!user) return;

    const getStats = async () => {
      const { data: allTasks } = await supabase
        .from('tasks')
        .select('status')
        .eq('user_id', user.id);
      
      if (allTasks && allTasks.length > 0) {
        const completed = allTasks.filter(t => t.status === 'completed').length;
        const total = allTasks.length;
        const rate = Math.round((completed / total) * 100);
        
        setStats({ totalDone: completed, completionRate: rate });
      }
    };

    getStats();
  }, [user]);

  return (
    <div className="stats-grid">
      {/* Card 1: Tasks Finished */}
      <div className="stat-card">
        <span className="stat-label">Tasks Finished</span>
        <span className="stat-value">{stats.totalDone}</span>
        <span className="stat-desc">Lifetime total</span>
      </div>
      
      {/* Card 2: Completion Rate */}
      <div className="stat-card highlight">
        <span className="stat-label">Completion Rate</span>
        <span className="stat-value">{stats.completionRate}%</span>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${stats.completionRate}%` }}></div>
        </div>
      </div>
      
    </div>
  );
};

export default StatsCards;