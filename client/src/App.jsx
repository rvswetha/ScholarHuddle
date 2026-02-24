import React from 'react';
import { Outlet } from "react-router-dom";
import Navbar from './components/Navbar/Navbar';
import PomodoroTimer from './components/PomodoroTimer/PomodoroTimer'; 
import AIAssistant from "./components/AIAssistant/AIAssistant.jsx";

export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Navbar /> 
      
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Main Workspace (Home, Timetable, AI Tools etc.) */}
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
          <Outlet />
        </main>
      </div>
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
        <AIAssistant />
      </div>
    </div>
  );
}