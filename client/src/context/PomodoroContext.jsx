import React, { createContext, useContext, useEffect, useRef } from 'react';
import usePomodoro from '../hooks/usePomodoro';

const PomodoroContext = createContext();

export const PomodoroProvider = ({ children }) => {
  const pomodoroState = usePomodoro();
  const { remainingSeconds, isRunning } = pomodoroState;
  
  // Hold the audio globally
  const audioRef = useRef(new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg'));

  useEffect(() => {
    if (remainingSeconds === 0 && !isRunning) {
      audioRef.current.play().catch(err => console.log("Audio play failed:", err));
    }
  }, [remainingSeconds, isRunning]);

  return (
    <PomodoroContext.Provider value={pomodoroState}>
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoroContext = () => useContext(PomodoroContext);