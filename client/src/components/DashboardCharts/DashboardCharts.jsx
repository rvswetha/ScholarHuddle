import React, { useEffect, useState } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import "./dashboardcharts.css";

export default function DashboardCharts() {
  const [chartData, setChartData] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchRealStats = async () => {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('completed_at')
        .eq('status', 'completed')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null);

      if (error) {
        console.error("Error fetching stats:", error);
        return;
      }

      // 1. Define the days of the week
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      
      // 2. Count actual completions per day
      const counts = tasks.reduce((acc, t) => {
        const d = new Date(t.completed_at).toLocaleDateString('en-US', { weekday: 'short' });
        acc[d] = (acc[d] || 0) + 1;
        return acc;
      }, {});

      // 3. Format data (Removing the random Pomodoro placeholder)
      const formatted = days.map(day => ({
        day,
        tasks: counts[day] || 0
      }));
      
      setChartData(formatted);
    };

    fetchRealStats();
  }, [user]);

  return (
    <div className="dashboard-charts-container">
      <div className="chart-header">
        <h2>Weekly Activity</h2>
        <p>Your task completion trend for the current week.</p>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }}
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="tasks" 
              stroke="#e76f51" 
              strokeWidth={4} 
              dot={{ r: 4, fill: '#e76f51', strokeWidth: 2, stroke: '#fff' }} 
              activeDot={{ r: 6, strokeWidth: 0 }} 
              name="Tasks Completed" 
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}