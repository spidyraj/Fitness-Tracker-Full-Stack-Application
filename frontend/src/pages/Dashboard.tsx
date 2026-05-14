import React, { useEffect, useState, useRef } from 'react';
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

// Custom Hook for JS Counter Animation
const AnimatedCounter = ({ value, duration = 1500 }: { value: number, duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrame: number;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing out quint
      const easeOut = 1 - Math.pow(1 - progress, 5);
      setCount(Math.floor(easeOut * value));
      
      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      }
    };
    
    animationFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <>{count.toLocaleString()}</>;
};

// 3D Tilt Card Wrapper Component
const TiltCard = ({ children, className }: { children: React.ReactNode, className: string }) => {
  const [style, setStyle] = useState<React.CSSProperties>({});
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -12; // Max 12 deg tilt
    const rotateY = ((x - centerX) / centerX) * 12;
    
    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'none'
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: 'transform 0.5s ease-out'
    });
  };

  return (
    <div 
      ref={cardRef}
      className={`${className} tilt-enabled`} 
      style={style} 
      onMouseMove={handleMouseMove} 
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

// Mini Weekly Chart Component connected to real workout data
const WeeklyChart = ({ workouts }: { workouts: Workout[] }) => {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const [data, setData] = useState([0, 0, 0, 0, 0, 0, 0]);
  
  useEffect(() => {
    const weeklyTotals = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    // Get start of current week (Monday)
    const dayOfWeek = now.getDay() || 7; 
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    workouts.forEach(w => {
      const wDate = new Date(w.workoutDate);
      if (wDate >= startOfWeek) {
        let idx = wDate.getDay() - 1;
        if (idx === -1) idx = 6; // Sunday is 6
        weeklyTotals[idx] += w.durationMinutes;
      }
    });

    // Animate bars in on load
    setTimeout(() => {
      setData(weeklyTotals);
    }, 300);
  }, [workouts]);

  return (
    <div className="weekly-chart-container">
      <div className="weekly-bars">
        {data.map((val, i) => {
          // Max height caps at 120 minutes = 100%, min height is 5% so bar is visible
          const heightPercent = Math.max(Math.min((val / 120) * 100, 100), 5);
          const isHigh = val >= 45;
          return (
            <div key={i} className="bar-wrapper" title={`${val} min active`}>
              <div className={`chart-bar ${isHigh ? 'high-intensity' : 'low-intensity'}`} style={{ height: `${heightPercent}%` }}>
                <div className="bar-tooltip">{val}m</div>
              </div>
              <span className="bar-label">{days[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showError } = useToast();

  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [recentMeals, setRecentMeals] = useState<NutritionLog[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [timeShiftClass, setTimeShiftClass] = useState('greeting-morning');
  const [greetingText, setGreetingText] = useState('Good morning');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) {
      setGreetingText('Good morning');
      setTimeShiftClass('greeting-morning');
    } else if (h < 17) {
      setGreetingText('Good afternoon');
      setTimeShiftClass('greeting-afternoon');
    } else {
      setGreetingText('Good evening');
      setTimeShiftClass('greeting-evening');
    }

    const fetch = async () => {
      try {
        const [sumRes, workRes, nutRes] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/workouts'),
          api.get('/nutrition'),
        ]);
        setSummary(sumRes.data);
        const workoutsData = workRes.data as Workout[];
        setAllWorkouts(workoutsData);
        setRecentWorkouts(workoutsData.slice(0, 5));
        setRecentMeals((nutRes.data as NutritionLog[]).slice(0, 5));
      } catch (err: any) {
        showError('Failed to load dashboard data');
      } finally {
        setLoadingSummary(false);
      }
    };
    fetch();
  }, [showError]);

  const statCards = [
    {
      label: 'Calories Burned',
      value: summary?.totalCaloriesBurned ?? 0,
      unit: 'kcal',
      icon: <Flame size={20} />,
      color: 'stat-orange',
    },
    {
      label: 'Calories Consumed',
      value: summary?.totalCaloriesConsumed ?? 0,
      unit: 'kcal',
      icon: <Apple size={20} />,
      color: 'stat-green',
    },
    {
      label: 'Active Time',
      value: Math.round(summary?.totalDurationMinutes ?? 0),
      unit: 'min',
      icon: <Clock size={20} />,
      color: 'stat-blue',
    },
    {
      label: 'Total Workouts',
      value: summary?.totalWorkouts ?? 0,
      unit: 'sessions',
      icon: <Dumbbell size={20} />,
      color: 'stat-purple',
    },
  ];

  if (loadingSummary) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      {/* Time-Aware Greeting with Background Glow */}
      <div className={`db-greeting-row relative z-10 ${timeShiftClass}`}>
        <div className="greeting-bg-glow"></div>
        <div>
          <h1 className="db-greeting-text dynamic-greeting">
            {greetingText}, <span className="db-name">{user?.firstName}</span> 👋
          </h1>
          <p className="db-greeting-sub mt-1">Here's your fitness overview for today.</p>
        </div>
        <button className="db-quick-log hover:scale-105 transition-transform" onClick={() => navigate('/workouts')}>
          <Plus size={16} />
          Log Workout
        </button>
      </div>

      {/* 3D Animated Stat Cards */}
      <div className="db-stat-grid perspective-wrapper">
        {statCards.map(card => (
          <TiltCard key={card.label} className={`db-stat-card 3d-card ${card.color}`}>
            <div className="db-stat-icon">{card.icon}</div>
            <div className="db-stat-body">
              <div className="db-stat-value count-up-text">
                <AnimatedCounter value={card.value} />
                <span className="db-stat-unit">{card.unit}</span>
              </div>
              <div className="db-stat-label">{card.label}</div>
            </div>
            {/* Glossy overlay effect for 3D realism */}
            <div className="card-glossy-overlay"></div>
          </TiltCard>
        ))}
      </div>

      {/* Progress Charts & Weekly Mini Chart */}
      <div className="progress-section premium-glass">
        <div className="flex justify-between items-center mb-4">
          <h2 className="section-title text-xl font-bold flex items-center gap-2">
            Your Progress <Activity className="text-violet-400" size={20}/>
          </h2>
          <button className="text-sm text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1">
            <Target size={14}/> Set Goals
          </button>
        </div>
        
        <div className="progress-grid">
          <ProgressChart value={summary?.totalWorkouts || 0} max={20} label="Monthly Workouts" icon={Target} color="#8b5cf6" unit="sessions" />
          <ProgressChart value={summary?.totalCaloriesBurned || 0} max={10000} label="Calories Burned" icon={Flame} color="#ef4444" unit="kcal" />
          <ProgressChart value={Math.round((summary?.totalDurationMinutes || 0) / 60)} max={20} label="Active Hours" icon={Activity} color="#06b6d4" unit="hrs" />
          <ProgressChart value={Math.round((summary?.totalCaloriesConsumed || 0) / 100)} max={100} label="Nutrition Score" icon={Apple} color="#10b981" unit="%" />
        </div>

        {/* User Request 3: Weekly Bar Chart */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
            <Clock size={14}/> Weekly Activity Pulse
          </h3>
          <WeeklyChart workouts={allWorkouts} />
        </div>
      </div>

      {/* Main content two columns */}
      <div className="db-content-grid">
        {/* Recent Workouts */}
        <div className="db-card premium-glass">
          <div className="db-card-header">
            <h3 className="db-card-title"><Dumbbell size={16} className="text-purple-400" /> Recent Workouts</h3>
            <button className="db-card-action hover:text-white" onClick={() => navigate('/workouts')}>
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
                <div key={w.id} className="db-list-item hover:bg-white/5 transition-colors rounded-lg p-2">
                  <div className="db-list-icon workout-icon">
                    <Dumbbell size={14} />
                  </div>
                  <div className="db-list-info">
                    <div className="db-list-name text-white/90">{w.title}</div>
                    <div className="db-list-meta">
                      <span className={`badge badge-strength`}>{w.type}</span>
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
        <div className="db-card premium-glass">
          <div className="db-card-header">
            <h3 className="db-card-title"><Apple size={16} className="text-green-400" /> Today's Nutrition</h3>
            <button className="db-card-action hover:text-white" onClick={() => navigate('/nutrition')}>
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
                <div key={m.id} className="db-list-item hover:bg-white/5 transition-colors rounded-lg p-2">
                  <div className="db-list-icon nutrition-icon">
                    <Apple size={14} />
                  </div>
                  <div className="db-list-info">
                    <div className="db-list-name text-white/90">{m.foodName}</div>
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
        <div className="db-balance-card premium-balance-card">
          <div className="db-balance-info">
            <div className="balance-icon-bg"><TrendingUp size={20} className="text-cyan-300" /></div>
            <div>
              <div className="db-balance-label font-bold text-white">Net Calorie Balance</div>
              <div className="db-balance-sub">Consumed − Burned</div>
            </div>
          </div>
          <div className={`db-balance-value font-black text-2xl ${(summary.totalCaloriesConsumed - summary.totalCaloriesBurned) < 0 ? 'text-green-400' : 'text-orange-400'}`}>
            {(summary.totalCaloriesConsumed - summary.totalCaloriesBurned) >= 0 ? '+' : ''}
            {(summary.totalCaloriesConsumed - summary.totalCaloriesBurned).toLocaleString()} kcal
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
