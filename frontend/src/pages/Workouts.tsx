import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Trash2, Edit2, X, Check, Dumbbell, Bell, BellOff, Flame, Clock, ChevronDown, ChevronUp, Sparkles, Target } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './Workouts.css';

interface Workout {
  id: number;
  title: string;
  type: string;
  description?: string;
  durationMinutes: number;
  caloriesBurned?: number;
  workoutDate: string;
}

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  tip: string;
}

interface Plan {
  day: string;
  type: string;
  title: string;
  duration: number;
  exercises: Exercise[];
}

interface Suggestions {
  level: string;
  description: string;
  weeklyGoal: number;
  plans: Plan[];
}

type FitnessLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

const WORKOUT_TYPES = ['CARDIO', 'STRENGTH', 'FLEXIBILITY', 'HIIT', 'SPORTS', 'YOGA', 'OTHER'];

const TYPE_COLORS: Record<string, string> = {
  CARDIO: '#06b6d4', STRENGTH: '#8b5cf6', FLEXIBILITY: '#10b981',
  HIIT: '#ef4444', SPORTS: '#f59e0b', YOGA: '#ec4899', OTHER: '#6b7280',
};

const emptyForm = { title: '', type: 'CARDIO', durationMinutes: 30, description: '' };

const Workouts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>('BEGINNER');
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState<number | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderMsg, setReminderMsg] = useState<string | null>(null);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    fetchWorkouts();
    checkReminders();
  }, []);

  useEffect(() => {
    if (showSuggestions) fetchSuggestions();
  }, [fitnessLevel, showSuggestions]);

  const fetchWorkouts = async () => {
    try {
      const res = await api.get('/workouts');
      setWorkouts(res.data);
    } catch (e: any) {
      showError(e?.response?.data?.message || 'Failed to fetch workouts');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const res = await api.get(`/workouts/suggestions?level=${fitnessLevel}`);
      setSuggestions(res.data);
    } catch {
      showError('Could not load suggestions');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const checkReminders = async () => {
    try {
      const res = await api.get('/workouts/reminders');
      setReminderEnabled(res.data.enabled);
      if (res.data.hasReminder) setReminderMsg(res.data.message);
    } catch {}
  };

  const toggleReminder = async () => {
    try {
      const res = await api.post('/workouts/reminders', { enabled: !reminderEnabled });
      setReminderEnabled(res.data.enabled);
      showSuccess(res.data.message);
    } catch { showError('Failed to update reminder'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        await api.put(`/workouts/${editingId}`, formData);
        showSuccess('Workout updated! 💪');
      } else {
        await api.post('/workouts', formData);
        showSuccess('Workout logged! 🔥');
      }
      resetForm();
      fetchWorkouts();
    } catch (e: any) {
      showError(e?.response?.data?.message || 'Failed to save workout');
    }
  };

  const startEdit = (w: Workout) => {
    setFormData({ title: w.title, type: w.type, durationMinutes: w.durationMinutes, description: w.description || '' });
    setEditingId(w.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/workouts/${id}`);
      showSuccess('Workout deleted');
      fetchWorkouts();
    } catch { showError('Failed to delete workout'); }
  };

  const resetForm = () => {
    setFormData({ ...emptyForm });
    setEditingId(null);
    setShowForm(false);
  };

  const totalCalories = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
  const totalMinutes = workouts.reduce((sum, w) => sum + w.durationMinutes, 0);

  return (
    <div className="workouts-page animate-fade-in">
      {/* Header */}
      <div className="db-greeting-row">
        <div>
          <h1 className="db-greeting-text">Workouts</h1>
          <p className="db-greeting-sub">Track sessions, burn calories, stay consistent.</p>
        </div>
        <div className="workout-header-actions">
          <button className={`wk-reminder-btn ${reminderEnabled ? 'active' : ''}`} onClick={toggleReminder} title={reminderEnabled ? 'Reminders ON' : 'Reminders OFF'}>
            {reminderEnabled ? <Bell size={16} /> : <BellOff size={16} />}
            {reminderEnabled ? 'Reminders On' : 'Reminders Off'}
          </button>
          <button className="db-quick-log" onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}>
            <Plus size={16} /> {showForm ? 'Cancel' : 'Log Workout'}
          </button>
        </div>
      </div>

      {/* Reminder Banner */}
      {reminderMsg && (
        <div className="wk-reminder-banner">
          <Bell size={16} />
          <span>{reminderMsg}</span>
          <button onClick={() => setReminderMsg(null)}><X size={14} /></button>
        </div>
      )}

      {/* Stats Row */}
      {workouts.length > 0 && (
        <div className="wk-stats-row">
          <div className="wk-stat"><Flame size={18} style={{ color: '#ef4444' }} /><div><div className="wk-stat-val">{totalCalories.toLocaleString()}</div><div className="wk-stat-lbl">kcal burned</div></div></div>
          <div className="wk-stat"><Clock size={18} style={{ color: '#06b6d4' }} /><div><div className="wk-stat-val">{totalMinutes}</div><div className="wk-stat-lbl">total min</div></div></div>
          <div className="wk-stat"><Dumbbell size={18} style={{ color: '#8b5cf6' }} /><div><div className="wk-stat-val">{workouts.length}</div><div className="wk-stat-lbl">sessions</div></div></div>
          <div className="wk-stat"><Target size={18} style={{ color: '#10b981' }} /><div><div className="wk-stat-val">{Math.round(totalMinutes / 60 * 10) / 10}h</div><div className="wk-stat-lbl">active time</div></div></div>
        </div>
      )}

      {/* Log Form */}
      {showForm && (
        <div className="glass-panel wk-form-panel animate-fade-in">
          <h3>{editingId ? '✏️ Edit Workout' : '💪 Log New Workout'}</h3>
          <form onSubmit={handleSubmit} className="wk-form">
            <div className="wk-form-row">
              <div className="input-group" style={{ flex: 2 }}>
                <label className="input-label">Workout Title *</label>
                <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required placeholder="e.g. Morning Run, Leg Day..." />
              </div>
              <div className="input-group">
                <label className="input-label">Type</label>
                <select className="form-control" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                  {WORKOUT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Duration (min) *</label>
                <input type="number" className="form-control" value={formData.durationMinutes} onChange={e => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 30 })} required min={1} max={480} />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Notes (optional)</label>
              <input type="text" className="form-control" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="How did it feel?" />
            </div>
            <div className="wk-form-actions">
              <button type="button" className="nut-btn-cancel" onClick={resetForm}><X size={16} /> Cancel</button>
              <button type="submit" className="nut-btn-save"><Check size={16} /> {editingId ? 'Update' : 'Save Workout'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Fitness Level + Suggestions */}
      <div className="glass-panel wk-suggestions-panel">
        <div className="wk-suggestions-header" onClick={() => setShowSuggestions(!showSuggestions)}>
          <div className="wk-suggestions-title"><Sparkles size={18} style={{ color: '#f59e0b' }} />AI Workout Suggestions</div>
          <div className="wk-level-chips">
            {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as FitnessLevel[]).map(lvl => (
              <button key={lvl} type="button" className={`wk-level-chip ${fitnessLevel === lvl ? 'active' : ''}`}
                onClick={e => { e.stopPropagation(); setFitnessLevel(lvl); setShowSuggestions(true); }}>
                {lvl === 'BEGINNER' ? '🌱' : lvl === 'INTERMEDIATE' ? '🔥' : '⚡'} {lvl}
              </button>
            ))}
          </div>
          {showSuggestions ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>

        {showSuggestions && (
          <div className="wk-suggestions-body animate-fade-in">
            {loadingSuggestions ? (
              <div className="wk-loading">Loading your personalized plan...</div>
            ) : suggestions ? (
              <>
                <p className="wk-suggestions-desc">{suggestions.description} <strong>Goal: {suggestions.weeklyGoal} days/week</strong></p>
                <div className="wk-plans-grid">
                  {suggestions.plans.map((plan, i) => (
                    <div key={i} className="wk-plan-card">
                      <div className="wk-plan-header" onClick={() => setExpandedPlan(expandedPlan === i ? null : i)}>
                        <div>
                          <span className="wk-plan-day">{plan.day}</span>
                          <span className="wk-plan-title">{plan.title}</span>
                        </div>
                        <div className="wk-plan-meta">
                          <span className="wk-badge" style={{ background: `${TYPE_COLORS[plan.type] || '#888'}22`, color: TYPE_COLORS[plan.type] }}>{plan.type}</span>
                          <span className="wk-plan-dur"><Clock size={12} />{plan.duration}min</span>
                          {expandedPlan === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>
                      {expandedPlan === i && (
                        <div className="wk-exercises animate-fade-in">
                          {plan.exercises.map((ex, j) => (
                            <div key={j} className="wk-exercise-row">
                              <div className="wk-exercise-name">{ex.name}</div>
                              <div className="wk-exercise-meta">
                                <span>{ex.sets} × {ex.reps}</span>
                                <span>Rest: {ex.rest}</span>
                              </div>
                              <div className="wk-exercise-tip">💡 {ex.tip}</div>
                            </div>
                          ))}
                          <button className="wk-log-plan-btn" onClick={() => {
                            setFormData({ title: plan.title, type: plan.type, durationMinutes: plan.duration, description: `${plan.day} - ${suggestions.level} plan` });
                            setShowForm(true);
                            setShowSuggestions(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}>
                            <Plus size={14} /> Log This Workout
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* Workout List */}
      <div className="wk-list">
        {loading ? (
          <div className="glass-panel wk-empty">Loading workouts...</div>
        ) : workouts.length === 0 ? (
          <div className="glass-panel wk-empty">
            <Dumbbell size={48} style={{ opacity: 0.3 }} />
            <p>No workouts yet. Log your first session!</p>
            <button className="db-empty-cta" onClick={() => setShowForm(true)}>Log Workout</button>
          </div>
        ) : (
          workouts.map(w => (
            <div key={w.id} className="glass-panel wk-item">
              <div className="wk-item-type-bar" style={{ background: TYPE_COLORS[w.type] || '#888' }} />
              <div className="wk-item-content">
                <div className="wk-item-left">
                  <div className="wk-item-title">{w.title}</div>
                  <div className="wk-item-meta">
                    <span className="wk-badge" style={{ background: `${TYPE_COLORS[w.type]}22`, color: TYPE_COLORS[w.type] }}>{w.type}</span>
                    <span><Clock size={12} /> {w.durationMinutes} min</span>
                    {w.caloriesBurned && <span className="wk-calories"><Flame size={12} /> {w.caloriesBurned} kcal</span>}
                    <span>{new Date(w.workoutDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  {w.description && <div className="wk-item-desc">{w.description}</div>}
                </div>
                <div className="wk-item-actions">
                  <button className="btn-icon" onClick={() => startEdit(w)} title="Edit"><Edit2 size={16} /></button>
                  <button className="btn-icon danger" onClick={() => handleDelete(w.id)} title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Workouts;
