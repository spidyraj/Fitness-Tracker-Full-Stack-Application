import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Flame, Dumbbell, Apple, Clock, TrendingUp, Plus, ChevronRight, Target, Activity } from 'lucide-react';
import { DashboardSkeleton } from '../components/LoadingSkeleton';
import ProgressChart from '../components/ProgressChart';
import api from '../services/api';
import './Dashboard.css';

interface SummaryData {
  totalWorkouts: number;
  totalDurationMinutes: number;
  totalCaloriesBurned: number;
  totalCaloriesConsumed: number;
}

interface Workout {
  id: number;
  title: string;
  type: string;
  durationMinutes: number;
  workoutDate: string;
}

interface NutritionLog {
  id: number;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  logDate: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showError } = useToast();

  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [recentMeals, setRecentMeals] = useState<NutritionLog[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [sumRes, workRes, nutRes] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/workouts'),
          api.get('/nutrition'),
        ]);
        setSummary(sumRes.data);
        setRecentWorkouts((workRes.data as Workout[]).slice(0, 5));
        setRecentMeals((nutRes.data as NutritionLog[]).slice(0, 5));
      } catch (err: any) {
        console.error('Dashboard fetch failed', err);
        const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load dashboard data';
        showError(errorMessage);
      } finally {
        setLoadingSummary(false);
      }
    };
    fetch();
  }, [showError]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const statCards = [
    {
      label: 'Calories Burned',
      value: loadingSummary ? '—' : (summary?.totalCaloriesBurned ?? 0).toLocaleString(),
      unit: 'kcal',
      icon: <Flame size={20} />,
      color: 'stat-orange',
    },
    {
      label: 'Calories Consumed',
      value: loadingSummary ? '—' : (summary?.totalCaloriesConsumed ?? 0).toLocaleString(),
      unit: 'kcal',
      icon: <Apple size={20} />,
      color: 'stat-green',
    },
    {
      label: 'Active Time',
      value: loadingSummary ? '—' : Math.round((summary?.totalDurationMinutes ?? 0)).toString(),
      unit: 'min',
      icon: <Clock size={20} />,
      color: 'stat-blue',
    },
    {
      label: 'Total Workouts',
      value: loadingSummary ? '—' : (summary?.totalWorkouts ?? 0).toString(),
      unit: 'sessions',
      icon: <Dumbbell size={20} />,
      color: 'stat-purple',
    },
  ];

  const workoutTypeColor: Record<string, string> = {
    CARDIO: 'badge-cardio',
    STRENGTH: 'badge-strength',
    FLEXIBILITY: 'badge-flexibility',
    SPORTS: 'badge-sports',
  };

  if (loadingSummary) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      {/* Greeting */}
      <div className="db-greeting-row">
        <div>
          <h1 className="db-greeting-text">
            {greeting()}, <span className="db-name">{user?.firstName}</span> 👋
          </h1>
          <p className="db-greeting-sub">Here's your fitness overview for today.</p>
        </div>
        <button className="db-quick-log" onClick={() => navigate('/workouts')}>
          <Plus size={16} />
          Log Workout
        </button>
      </div>

      {/* Stat Cards */}
      <div className="db-stat-grid">
        {statCards.map(card => (
          <div key={card.label} className={`db-stat-card ${card.color}`}>
            <div className="db-stat-icon">{card.icon}</div>
            <div className="db-stat-body">
              <div className="db-stat-value">
                {card.value}
                <span className="db-stat-unit">{card.unit}</span>
              </div>
              <div className="db-stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Charts Section */}
      <div className="progress-section">
        <h2 className="section-title">Your Progress 📊</h2>
        <div className="progress-grid">
          <ProgressChart
            value={summary?.totalWorkouts || 0}
            max={20} // Monthly goal
            label="Monthly Workouts"
            icon={Target}
            color="#8b5cf6"
            unit="sessions"
          />
          <ProgressChart
            value={summary?.totalCaloriesBurned || 0}
            max={10000} // Monthly goal
            label="Calories Burned"
            icon={Flame}
            color="#ef4444"
            unit="kcal"
          />
          <ProgressChart
            value={Math.round((summary?.totalDurationMinutes || 0) / 60)}
            max={20} // Monthly goal in hours
            label="Active Hours"
            icon={Activity}
            color="#06b6d4"
            unit="hrs"
          />
          <ProgressChart
            value={Math.round((summary?.totalCaloriesConsumed || 0) / 100)}
            max={100} // Percentage of daily goal
            label="Nutrition Score"
            icon={Apple}
            color="#10b981"
            unit="%"
          />
        </div>
      </div>

      {/* Main content two columns */}
      <div className="db-content-grid">
        {/* Recent Workouts */}
        <div className="db-card">
          <div className="db-card-header">
            <h3 className="db-card-title"><Dumbbell size={16} /> Recent Workouts</h3>
            <button className="db-card-action" onClick={() => navigate('/workouts')}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          {recentWorkouts.length === 0 ? (
            <div className="db-empty">
              <p>No workouts logged yet.</p>
              <button className="db-empty-cta" onClick={() => navigate('/workouts')}>Log your first workout</button>
            </div>
          ) : (
            <div className="db-list">
              {recentWorkouts.map(w => (
                <div key={w.id} className="db-list-item">
                  <div className="db-list-icon workout-icon">
                    <Dumbbell size={14} />
                  </div>
                  <div className="db-list-info">
                    <div className="db-list-name">{w.title}</div>
                    <div className="db-list-meta">
                      <span className={`badge ${workoutTypeColor[w.type] ?? 'badge-cardio'}`}>{w.type}</span>
                      <span>{w.durationMinutes} min</span>
                      <span>{new Date(w.workoutDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Nutrition */}
        <div className="db-card">
          <div className="db-card-header">
            <h3 className="db-card-title"><Apple size={16} /> Today's Nutrition</h3>
            <button className="db-card-action" onClick={() => navigate('/nutrition')}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          {recentMeals.length === 0 ? (
            <div className="db-empty">
              <p>No meals logged today.</p>
              <button className="db-empty-cta" onClick={() => navigate('/nutrition')}>Log your first meal</button>
            </div>
          ) : (
            <div className="db-list">
              {recentMeals.map(m => (
                <div key={m.id} className="db-list-item">
                  <div className="db-list-icon nutrition-icon">
                    <Apple size={14} />
                  </div>
                  <div className="db-list-info">
                    <div className="db-list-name">{m.foodName}</div>
                    <div className="db-list-meta">
                      <span className="badge badge-flexibility">{m.calories} kcal</span>
                      <span>P {m.protein}g</span>
                      <span>C {m.carbs}g</span>
                      <span>F {m.fats}g</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Net Calorie Balance */}
      {summary && (
        <div className="db-balance-card">
          <div className="db-balance-info">
            <TrendingUp size={18} />
            <div>
              <div className="db-balance-label">Net Calorie Balance</div>
              <div className="db-balance-sub">Consumed − Burned</div>
            </div>
          </div>
          <div className={`db-balance-value ${(summary.totalCaloriesConsumed - summary.totalCaloriesBurned) < 0 ? 'negative' : 'positive'}`}>
            {(summary.totalCaloriesConsumed - summary.totalCaloriesBurned) >= 0 ? '+' : ''}
            {(summary.totalCaloriesConsumed - summary.totalCaloriesBurned).toLocaleString()} kcal
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
