import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import './priorityList.css';

const PriorityList = ({ title }) => { 
  const [tasks, setTasks] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('reminder_time', { ascending: true }); 
      
      if (error) {
        console.error("Error fetching tasks:", error);
      } else if (data) {
        const pendingTasks = data.filter(task => task.status !== 'completed');
        setTasks(pendingTasks);
      }
    };

    fetchTasks();
    const interval = setInterval(fetchTasks, 60000); 
    return () => clearInterval(interval);
  }, [user]);

  const getTimeLeft = (deadline) => {
    const diff = new Date(deadline) - new Date();
    if (diff <= 0) return "Overdue"; 
    
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${mins}m remaining`;
  };

  const getTimeStatus = (deadline) => {
    const diff = new Date(deadline) - new Date();
    const hours = diff / 3600000;
    
    if (diff <= 0) return "overdue"; 
    if (hours <= 2) return "urgent";
    return "normal";
  };

  const handleComplete = async (taskId) => {
    if (!user) return;

    // 1. Mark as completed in DB
    const { error: taskError } = await supabase
      .from('tasks')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString() 
      })
      .eq('id', taskId);

    if (!taskError) {
      // 2. Award Points
      await supabase.rpc('award_points', { user_id_param: user.id, points_to_add: 10 });
      
      // 3. Update Streak
      await supabase.rpc('update_streak', { user_id_param: user.id });

      // 4. Remove from UI instantly
      setTasks(prev => prev.filter(t => t.id !== taskId));
      alert("Task Done! +10 Points & Streak Updated!");
    }
  };

  return (
    <div className="daily-agenda">
      <h3 className="agenda-title">{title || "Tasks Pending"}</h3>
      
      {tasks.length === 0 ? (
        <div className="empty-state">
          <p>No pending tasks. You're all caught up! </p>
        </div>
      ) : (
        <div className="priority-stack">
          {tasks.map((task, index) => {
            const status = getTimeStatus(task.reminder_time);
            return (
              <div key={task.id} className={`priority-item rank-${index} ${status}`}>
                <div className="rank-badge">{index === 0 ? "1st" : `#${index + 1}`}</div>
                <div className="task-info">
                  <span className="task-name">{task.title}</span>
                  <span className="task-timer">{getTimeLeft(task.reminder_time)}</span>
                </div>
                <button 
                  className="complete-check" 
                  onClick={() => handleComplete(task.id)}
                  title="Mark as Done"
                >
                  ✓
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PriorityList;