import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; 
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { deleteTask } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { saveFcmToken } from '../services/fcmService';
import { supabase } from '../services/supabaseClient'; 
import './Timetable.css';

function Timetable() {
  const [events, setEvents] = useState([]);
  const { user, session, signOut } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const [showCompleted, setShowCompleted] = useState(true); // Toggle state

  // 1. Fetching logic wrapped in useCallback to avoid unnecessary re-renders
  const fetchAndSetEvents = useCallback(async () => {
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id);

      if (!showCompleted) {
        query = query.eq('status', 'pending');
      }

      const { data: tasks, error } = await query;
      if (error) throw error;

      const formattedEvents = tasks.map(task => ({
        id: task.id,
        title: task.title,
        start: task.start,
        end: task.end,
        extendedProps: {
          status: task.status
        },
        // FullCalendar built-in color properties
        backgroundColor: task.status === 'completed' ? '#10b981' : '#3b82f6', // Green if done, Blue if pending
        borderColor: task.status === 'completed' ? '#059669' : '#2563eb',
        textColor: '#ffffff'
      }));
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching tasks:", error.message);
    }
  }, [user?.id, showCompleted]);

  // 2. Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // 3. Security Redirect: Bounce to login if no session
  useEffect(() => {
    if (!session) {
      navigate('/login');
    }
  }, [session, navigate]);

  // 4. Initial Load: Fetch data and setup notifications
  useEffect(() => {
    if (user && session) {
      fetchAndSetEvents();
      
      // Request permission and save token
      const setupNotifications = async () => {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          try {
            await saveFcmToken(user.id);
          } catch (err) {
            console.error("Failed to save FCM token:", err);
          }
        }
      };
      setupNotifications();
    }
  }, [user, session, fetchAndSetEvents]);

  // Helper: Calculate time remaining
  const getTimeRemaining = (startTime) => {
    const diff = new Date(startTime) - currentTime;
    if (diff <= 0) return "Started or Passed";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m remaining`;
  };

  const handleDateSelect = async (selectInfo) => {
    const title = prompt('Enter title for study session/event:');
    if (!title) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: title,
          start: selectInfo.startStr,
          end: selectInfo.endStr,
          priority: 'medium',
          reminder_time: selectInfo.startStr, 
          user_id: user.id,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => [...prev, { ...data, start: new Date(data.start) }]);
      alert("Task created successfully!");
      
    } catch (error) {
      console.error('Failed to create task:', error);
      alert("Error: " + error.message);
    }
  };

  if (!session) return null;

  return (
    <div className="timetable-page-container" style={{ display: 'flex', padding: '20px', gap: '20px', fontFamily: 'sans-serif' }}>
      
      {/* LEFT: MAIN CALENDAR */}
      <div style={{ flex: 3, background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h2 style={{ margin: 0 }}>Academic Timetable</h2>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px' }}>
              <input 
                type="checkbox" 
                checked={showCompleted} 
                onChange={() => setShowCompleted(!showCompleted)} 
              />
              Show Completed
            </label>
          </div>

          <button onClick={signOut} style={{ background: '#ff4d4d', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer' }}>
            Sign Out
          </button>
        </div>
        
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' }}
          events={events}
          eventDisplay="block"
          eventClassNames={(arg) => {
            if (arg.event.extendedProps.status === 'completed') {
              return ['completed-task-event'];
            }
            return [];
          }}
          editable={true}
          selectable={true}
          select={handleDateSelect}
          eventClick={async (info) => {
            if (confirm('Delete this event?')) {
              try {
                await deleteTask(info.event.id);
                info.event.remove();
              } catch (err) {
                console.error("Delete failed:", err);
              }
            }
          }}
        />
      </div>

      {/* RIGHT: REMINDERS & COUNTDOWN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={{ background: '#f0f7ff', padding: '20px', borderRadius: '12px', border: '1px solid #cce3ff' }}>
          <h3 style={{ marginTop: 0 }}>Quick Reminder</h3>
          <input id="quickTitle" type="text" placeholder="Task Name" style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
          <input id="quickDate" type="datetime-local" style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
          <button 
            onClick={async () => {
              const titleInput = document.getElementById('quickTitle');
              const dateInput = document.getElementById('quickDate');
              if (!titleInput.value || !dateInput.value) {
                alert("Please enter both a title and a date!");
                return;
              }
              try {
                const newTask = {
                  title: titleInput.value,
                  start: new Date(dateInput.value).toISOString(),
                  reminder_time: new Date(dateInput.value).toISOString(),
                  priority: 'high',
                  user_id: user.id,
                  status: 'pending'
                };
                
                const { data, error } = await supabase
                  .from('tasks')
                  .insert([newTask])
                  .select()
                  .single();

                if (error) throw error;

                setEvents(prev => [...prev, { ...data, start: new Date(data.start) }]);
                titleInput.value = '';
                dateInput.value = '';
                alert("Reminder Set Successfully!");
              } catch (error) {
                console.error("Creation failed:", error);
                alert("Error: " + error.message);
              }
            }}
            style={{ width: '100%', background: '#007bff', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}
          >
            Create Alert
          </button>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxHeight: '500px', overflowY: 'auto' }}>
          <h3 style={{ marginTop: 0 }}>Upcoming Reminders</h3>
          {events
            .filter(e => new Date(e.start) > currentTime && e.extendedProps?.status !== 'completed')
            .sort((a, b) => new Date(a.start) - new Date(b.start))
            .map(event => (
              <div key={event.id} style={{ padding: '10px', borderBottom: '1px solid #eee', marginBottom: '10px' }}>
                <div style={{ fontWeight: 'bold', color: '#333' }}>{event.title}</div>
                <div style={{ fontSize: '11px', color: '#ff8c00', fontWeight: 'bold', marginTop: '4px' }}>
                  ⏳ {getTimeRemaining(event.start)}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Timetable;