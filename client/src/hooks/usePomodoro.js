import { useState, useEffect, useCallback, useRef } from 'react';

const getSavedState = () => {
  try {
    const saved = localStorage.getItem('pomodoroState');
    if (saved === "undefined") return null; 
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error("Corrupted timer memory cleared:", error);
    localStorage.removeItem('pomodoroState');
    return null;
  }
};

export default function usePomodoro(onWorkComplete) {
  const savedState = getSavedState();

  const [workMinutes, setWorkMinutes] = useState(savedState?.workMinutes || 25);
  const [breakMinutes, setBreakMinutes] = useState(savedState?.breakMinutes || 5);
  const [mode, setMode] = useState(savedState?.mode || 'work');
  const [intervalsCompleted, setIntervalsCompleted] = useState(savedState?.intervalsCompleted || 0);

  const [isRunning, setIsRunning] = useState(() => {
    if (savedState?.isRunning && savedState?.endTime) {
      const timeDiff = Math.floor((savedState.endTime - Date.now()) / 1000);
      return timeDiff > 0;
    }
    return false;
  });

  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    if (savedState?.isRunning && savedState?.endTime) {
      const timeDiff = Math.floor((savedState.endTime - Date.now()) / 1000);
      return timeDiff > 0 ? timeDiff : 0;
    }
    return savedState?.remainingSeconds ?? (25 * 60);
  });

  // Keep a fresh reference to the save function
  const onWorkCompleteRef = useRef(onWorkComplete);
  useEffect(() => {
    onWorkCompleteRef.current = onWorkComplete;
  }, [onWorkComplete]);

  // Save to local storage
  useEffect(() => {
    const stateToSave = {
      workMinutes, breakMinutes, mode, isRunning, remainingSeconds, intervalsCompleted,
      endTime: isRunning ? Date.now() + remainingSeconds * 1000 : null
    };
    localStorage.setItem('pomodoroState', JSON.stringify(stateToSave));
  }, [workMinutes, breakMinutes, mode, isRunning, remainingSeconds, intervalsCompleted]);

  // The Countdown Clock
  useEffect(() => {
    let interval = null;
    
    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds(prev => prev - 1);
      }, 1000);
    } 
    else if (isRunning && remainingSeconds === 0) {
      setIsRunning(false); // Pause clock momentarily

      if (Notification.permission === 'granted') {
        new Notification("Time's up!", {
          body: mode === 'work' ? 'Great job! Take a break.' : 'Break is over. Back to work!',
        });
      }

      if (mode === 'work') {
        // 🚀 FIRE THE POINT SAVER EXACTLY AT ZERO!
        if (onWorkCompleteRef.current) {
          onWorkCompleteRef.current(workMinutes);
        }
        setMode('break');
        setRemainingSeconds(breakMinutes * 60);
        setIntervalsCompleted(prev => prev + 1);
      } else {
        setMode('work');
        setRemainingSeconds(workMinutes * 60);
      }
    }
    
    return () => clearInterval(interval);
  }, [isRunning, remainingSeconds, mode, workMinutes, breakMinutes]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  
  const reset = useCallback((keepMode = true) => {
    setIsRunning(false);
    if (!keepMode) {
      const newMode = mode === 'work' ? 'break' : 'work';
      setMode(newMode);
      setRemainingSeconds(newMode === 'work' ? workMinutes * 60 : breakMinutes * 60);
    } else {
      setRemainingSeconds(mode === 'work' ? workMinutes * 60 : breakMinutes * 60);
    }
  }, [mode, workMinutes, breakMinutes]);

  const setDurations = useCallback((work, brk) => {
    setWorkMinutes(work);
    setBreakMinutes(brk);
    if (!isRunning) {
      setRemainingSeconds(mode === 'work' ? work * 60 : brk * 60);
    }
  }, [mode, isRunning]);

  return { workMinutes, breakMinutes, isRunning, mode, remainingSeconds, intervalsCompleted, start, pause, reset, setDurations };
}