import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Flame, Activity, Apple, TrendingUp } from 'lucide-react';
import './Dashboard.css';

interface SummaryData {
  totalWorkouts: number;
  totalDurationMinutes: number;
  totalCaloriesBurned: number;
  totalCaloriesConsumed: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get('/analytics/summary');
        setSummary(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard summary", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="animate-fade-in">
      <header className="dashboard-header">
        <h1>Welcome back, <span className="accent-text">{user?.firstName}</span>!</h1>
        <p>Here is your fitness summary for today.</p>
      </header>

      {loading ? (
        <div className="loading">Loading your stats...</div>
      ) : (
        <div className="grid-cards">
          <div className="glass-panel stat-card">
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
              <Flame size={24} />
            </div>
            <div className="stat-details">
              <h3>{summary?.totalCaloriesBurned || 0} kcal</h3>
              <p>Burned Today</p>
            </div>
          </div>

          <div className="glass-panel stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
              <Apple size={24} />
            </div>
            <div className="stat-details">
              <h3>{summary?.totalCaloriesConsumed || 0} kcal</h3>
              <p>Consumed Today</p>
            </div>
          </div>

          <div className="glass-panel stat-card">
            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>
              <Activity size={24} />
            </div>
            <div className="stat-details">
              <h3>{summary?.totalDurationMinutes || 0} min</h3>
              <p>Active Time</p>
            </div>
          </div>

          <div className="glass-panel stat-card">
            <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' }}>
              <TrendingUp size={24} />
            </div>
            <div className="stat-details">
              <h3>{summary?.totalWorkouts || 0}</h3>
              <p>Workouts Today</p>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        <div className="glass-panel main-chart-area">
          <h3>Weekly Progress</h3>
          <div className="placeholder-chart">
            <p>Connect more data to see your weekly trends.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
