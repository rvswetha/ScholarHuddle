import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

const RealtimeContext = createContext();

export const RealtimeProvider = ({ children }) => {
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const taskSubscription = supabase
      .channel('table-db-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tasks' },
        (payload) => {
          console.log('Real-time task update:', payload);
          setLastUpdate({ type: 'TASK_UPDATE', data: payload.new });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(taskSubscription);
    };
  }, []);

  return (
    <RealtimeContext.Provider value={{ lastUpdate }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => useContext(RealtimeContext);