import React from 'react';
import PriorityList from '../components/Timetable/PriorityList';
import DashboardCharts from '../components/DashboardCharts/DashboardCharts';
import StatsCards from '../components/DashboardCharts/StatsCards';
import StreakCounter from '../components/DashboardCharts/StreakCounter';
import Leaderboard from '../components/LeaderBoard/LeaderBoard';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="welcome-text">
          <h1>Dashboard</h1>
          <p>Track your tasks, stats, and ranking.</p>
        </div>
        {/* You can keep a small profile or date here if you want */}
      </header>

      <div className="dashboard-grid">
        {/* LEFT COLUMN: Action & Stats */}
        <main className="main-content">
          
          {/* 1. Tasks Pending (First Priority) */}
          <section className="dashboard-section">
             <PriorityList title="Tasks Pending" /> 
          </section>

          {/* 2. Stats Numbers */}
          <section className="dashboard-section no-padding-bg">
            <StatsCards />
          </section>

          {/* 3. The Graph */}
          <section className="dashboard-section">
            <DashboardCharts />
          </section>
        </main>

        {/* RIGHT COLUMN: Social & Streaks */}
        <aside className="sidebar">
          
          {/* 1. Streak Counter (Top Right) */}
          <div className="sidebar-section center-content">
             <StreakCounter />
          </div>
          
          {/* 2. Leaderboard */}
          <div className="sidebar-section">
            <Leaderboard />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;