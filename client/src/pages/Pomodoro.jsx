import React, { useState, useEffect, useRef } from 'react';
import { usePomodoroContext } from '../context/PomodoroContext';
import { supabase } from '../services/supabaseClient';
import './Pomodoro.css'; 
import ScreenBreak from '../components/ScreenBreak/ScreenBreak';

function formatTime(totalSec = 0) {
  const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function Pomodoro() {
  const {
    workMinutes = 25,
    breakMinutes = 5,
    isRunning = false,
    mode = 'work',
    remainingSeconds = 0,
    intervalsCompleted = 0,
    start,
    pause,
    reset,
    setDurations,
  } = usePomodoroContext() || {};

  const [workInput, setWorkInput] = useState(workMinutes);
  const [breakInput, setBreakInput] = useState(breakMinutes);

  const hasSavedThisSession = useRef(false);

  useEffect(() => {
    if (remainingSeconds === 0 && mode === 'work' && !hasSavedThisSession.current) {
      saveStudySession(workMinutes);
      hasSavedThisSession.current = true; 
    }
    
    if (remainingSeconds > 0) {
      hasSavedThisSession.current = false;
    }
  }, [remainingSeconds, mode, workMinutes]);

  const saveStudySession = async (minutes) => {
    try {
      console.log(`Timer finished! Saving ${minutes} minutes...`);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('total_study_minutes, study_points')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const newMins = (profile.total_study_minutes || 0) + Number(minutes);
      const newPts = (profile.study_points || 0) + (Number(minutes) * 10);

      await supabase
        .from('profiles')
        .update({ total_study_minutes: newMins, study_points: newPts })
        .eq('id', user.id);

      console.log(`DATABASE UPDATED: +${minutes} mins, +${minutes * 10} pts`);
      alert(`Session Complete! You earned ${minutes * 10} points!`);
    } catch (err) {
      console.error("Save Failed:", err.message);
    }
  };

  const applySettings = (e) => {
    e.preventDefault();
    const w = Math.max(1, Math.floor(workInput === '' ? 25 : Number(workInput)));
    const b = Math.max(0, Math.floor(breakInput === '' ? 5 : Number(breakInput)));
    setDurations && setDurations(w, b);
  };

  const totalSeconds = mode === 'work' ? workMinutes * 60 : breakMinutes * 60;
  const progressPercent = totalSeconds === 0 ? 100 : ((totalSeconds - remainingSeconds) / totalSeconds) * 100;

  return (
    <div className="pomodoro-page-wrapper">
      <div className={`pomodoro-widget ${mode}`}>
        
        {/* Header */}
        <div className="widget-header">
          <h2>Focus Flow</h2>
          <span className="mode-pill">{mode === 'work' ? 'Deep Work' : 'Quick Break'}</span>
        </div>

        {/* The Clock Display */}
        <div className="clock-container">
          <div className="progress-ring" style={{ background: `conic-gradient(var(--pomo-color) ${progressPercent}%, transparent 0)` }}>
            <div className="clock-face">
              <h1 className="time-huge">{formatTime(remainingSeconds)}</h1>
              {remainingSeconds === 0 ? (
                <p className="session-complete-msg">Session Complete!</p>
              ) : (
                <p className="time-subtext">remaining</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="main-controls">
          {remainingSeconds === 0 ? (
            <button className="btn-massive next" onClick={() => reset(false)}>
              Start {mode === 'work' ? 'Break' : 'Work'}
            </button>
          ) : !isRunning ? (
            <button className="btn-massive start" onClick={start}>Start Session</button>
          ) : (
            <button className="btn-massive pause" onClick={pause}>Pause</button>
          )}
          
          <button className="btn-subtle" onClick={() => reset(true)}>Reset Current</button>
        </div>

        <div className="stats-row">
          <span>Completed Sessions: <strong>{intervalsCompleted}</strong></span>
        </div>

        {/* Settings Form */}
        <form className="settings-panel" onSubmit={applySettings}>
          <div className="settings-inputs">
            <div className="input-group">
              <label>Work (min)</label>
              <input type="number" min="1" value={workInput} onChange={(e) => setWorkInput(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Break (min)</label>
              <input type="number" min="0" value={breakInput} onChange={(e) => setBreakInput(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn-apply">Update Times</button>
        </form>

        {/* Screen Break */}
        <div style={{ width: '100%', marginTop: '10px' }}>
          <ScreenBreak />
        </div>

      </div>
    </div>
  );
}