import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Trash2 } from 'lucide-react';
import './Workouts.css'; // Reusing styles

interface NutritionLog {
  id: number;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  logDate: string;
}

const Nutrition = () => {
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ foodName: '', calories: '', protein: '', carbs: '', fats: '' });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/nutrition');
      setLogs(response.data);
    } catch (error) {
      console.error("Failed to fetch nutrition logs", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/nutrition', {
        foodName: formData.foodName,
        calories: parseInt(formData.calories) || 0,
        protein: parseInt(formData.protein) || 0,
        carbs: parseInt(formData.carbs) || 0,
        fats: parseInt(formData.fats) || 0,
      });
      setShowForm(false);
      setFormData({ foodName: '', calories: '', protein: '', carbs: '', fats: '' });
      fetchLogs();
    } catch (error) {
      console.error("Failed to add nutrition log", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/nutrition/${id}`);
      fetchLogs();
    } catch (error) {
      console.error("Failed to delete log", error);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Nutrition</h1>
          <p className="subtitle">Track your meals and macros</p>
        </div>
        <button className="btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> {showForm ? 'Cancel' : 'Log Food'}
        </button>
      </div>

      {showForm && (
        <div className="glass-panel form-panel animate-fade-in">
          <h3>Log Food</h3>
          <form onSubmit={handleAddLog} className="workout-form" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto' }}>
            <div className="input-group">
              <label className="input-label">Food Name</label>
              <input type="text" className="form-control" value={formData.foodName} onChange={e => setFormData({...formData, foodName: e.target.value})} required placeholder="e.g. Chicken breast" />
            </div>
            <div className="input-group">
              <label className="input-label">Calories</label>
              <input type="number" className="form-control" value={formData.calories} onChange={e => setFormData({...formData, calories: e.target.value})} required />
            </div>
            <div className="input-group">
              <label className="input-label">Protein (g)</label>
              <input type="number" className="form-control" value={formData.protein} onChange={e => setFormData({...formData, protein: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Carbs (g)</label>
              <input type="number" className="form-control" value={formData.carbs} onChange={e => setFormData({...formData, carbs: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Fats (g)</label>
              <input type="number" className="form-control" value={formData.fats} onChange={e => setFormData({...formData, fats: e.target.value})} />
            </div>
            <button type="submit" className="btn-primary">Save</button>
          </form>
        </div>
      )}

      <div className="workout-list">
        {loading ? <div className="loading">Loading nutrition logs...</div> : 
         logs.length === 0 ? (
          <div className="glass-panel empty-state">
            <p>No meals logged yet. Keep your nutrition in check!</p>
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="glass-panel workout-item">
              <div className="workout-info">
                <h4>{log.foodName}</h4>
                <div className="workout-meta">
                  <span className="badge badge-flexibility">{log.calories} kcal</span>
                  <span>P: {log.protein}g</span>
                  <span>C: {log.carbs}g</span>
                  <span>F: {log.fats}g</span>
                  <span>{new Date(log.logDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
              <button className="btn-icon danger" onClick={() => handleDelete(log.id)}>
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Nutrition;
