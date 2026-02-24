import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import usePomodoro from '../../hooks/usePomodoro';
import './PomodoroTimer.css';

function formatTime(totalSec = 0) {
  const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function PomodoroTimer() {
  
  const saveStudySession = async (minutes) => {
    try {
      console.log(`EXACT ZERO HIT! Attempting to save ${minutes} minutes...`);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 🚀 FIXED: Removed 'points' from the select query
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('total_study_minutes, study_points')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const newMins = (profile.total_study_minutes || 0) + Number(minutes);
      const newPts = (profile.study_points || 0) + (Number(minutes) * 10);

      // 🚀 FIXED: Removed 'points' from the update payload
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ total_study_minutes: newMins, study_points: newPts })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      console.log(`DATABASE UPDATED: +${minutes} mins, +${minutes * 10} pts`);
      alert(`Session Complete! You earned ${minutes * 10} points!`);
    } catch (err) {
      console.error("Save Failed:", err.message);
    }
  };

  const {
    workMinutes = 25, breakMinutes = 5, isRunning = false, mode = 'work',
    remainingSeconds = 0, intervalsCompleted = 0,
    start, pause, reset, setDurations,
  } = usePomodoro(saveStudySession) || {};

  const [workInput, setWorkInput] = useState(workMinutes);
  const [breakInput, setBreakInput] = useState(breakMinutes);

  const handleReset = (e) => {
    e.preventDefault();
    if (reset) reset(true);
  };

  const applySettings = (e) => {
    e.preventDefault(); // Stop page reload
    const safeWork = Math.max(1, parseInt(workInput, 10) || 25);
    const safeBreak = Math.max(1, parseInt(breakInput, 10) || 5);
    
    if (setDurations) setDurations(safeWork, safeBreak);
    setWorkInput(safeWork);
    setBreakInput(safeBreak);
  };

  return (
    <div className="pomodoro-root">
      <div className={`timer-card ${mode}`}>
        <div className="mode">{mode === 'work' ? 'Deep Work' : 'Break Time'}</div>
        <div className="time-display">{formatTime(remainingSeconds)}</div>
        <div className="meta">Sessions Completed: {intervalsCompleted}</div>

        <div className="controls">
          {!isRunning ? (
            <button type="button" onClick={() => start && start()} className="btn start">Start</button>
          ) : (
            <button type="button" onClick={() => pause && pause()} className="btn pause">Pause</button>
          )}
          <button type="button" onClick={handleReset} className="btn reset">Reset</button>
        </div>

        <form className="settings" onSubmit={applySettings}>
          <label>
            Work: 
            <input type="number" min="1" value={workInput} onChange={e => setWorkInput(e.target.value)} />
          </label>
          <label>
            Break: 
            <input type="number" min="1" value={breakInput} onChange={e => setBreakInput(e.target.value)} />
          </label>
          <button type="submit" className="btn apply">Apply Times</button>
        </form>
      </div>
    </div>
  );
}