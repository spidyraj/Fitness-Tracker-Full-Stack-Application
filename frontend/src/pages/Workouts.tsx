import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './Workouts.css';

interface Workout {
  id: number;
  title: string;
  type: string;
  durationMinutes: number;
  workoutDate: string;
}

const Workouts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', type: 'CARDIO', durationMinutes: 30 });
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const response = await api.get('/workouts');
      setWorkouts(response.data);
    } catch (error: any) {
      console.error("Failed to fetch workouts", error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch workouts';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/workouts', formData);
      setShowForm(false);
      setFormData({ title: '', type: 'CARDIO', durationMinutes: 30 });
      showSuccess('Workout added successfully!');
      fetchWorkouts();
    } catch (error: any) {
      console.error("Failed to add workout", error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to add workout';
      showError(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/workouts/${id}`);
      showSuccess('Workout deleted successfully!');
      fetchWorkouts();
    } catch (error: any) {
      console.error("Failed to delete workout", error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete workout';
      showError(errorMessage);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="db-greeting-row">
        <div>
          <h1 className="db-greeting-text">Workouts</h1>
          <p className="db-greeting-sub">Track your training sessions and progress.</p>
        </div>
        <button className="db-quick-log" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> {showForm ? 'Cancel' : 'Log Workout'}
        </button>
      </div>

      {showForm && (
        <div className="glass-panel form-panel animate-fade-in">
          <h3>Log New Workout</h3>
          <form onSubmit={handleAddWorkout} className="workout-form">
            <div className="input-group">
              <label className="input-label">Title</label>
              <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="e.g. Morning Run" />
            </div>
            <div className="input-group">
              <label className="input-label">Type</label>
              <select className="form-control" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="CARDIO">Cardio</option>
                <option value="STRENGTH">Strength</option>
                <option value="FLEXIBILITY">Flexibility</option>
                <option value="SPORTS">Sports</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Duration (minutes)</label>
              <input type="number" className="form-control" value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value)})} required min={1} />
            </div>
            <button type="submit" className="btn-primary">Save Workout</button>
          </form>
        </div>
      )}

      <div className="workout-list">
        {loading ? <div className="loading">Loading workouts...</div> : 
         workouts.length === 0 ? (
          <div className="glass-panel empty-state">
            <p>No workouts logged yet. Start training!</p>
          </div>
        ) : (
          workouts.map(workout => (
            <div key={workout.id} className="glass-panel workout-item">
              <div className="workout-info">
                <h4>{workout.title}</h4>
                <div className="workout-meta">
                  <span className={`badge badge-${workout.type.toLowerCase()}`}>{workout.type}</span>
                  <span>{workout.durationMinutes} min</span>
                  <span>{new Date(workout.workoutDate).toLocaleDateString()}</span>
                </div>
              </div>
              <button className="btn-icon danger" onClick={() => handleDelete(workout.id)}>
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Workouts;
