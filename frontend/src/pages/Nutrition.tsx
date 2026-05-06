import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Trash2, Edit2, X, Check, ChefHat, Scale, Calculator } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './Nutrition.css';
 
interface NutritionLog {
  id: number;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  weightGrams?: number;
  servingDescription?: string;
  cuisine?: string;
  mealType: string;
  logDate: string;
}
 
// ─── Food Database (100g reference values) ──────────────────────────────────
// Format: { name, calories, protein, carbs, fat, cuisine }
const FOOD_DB: Record<string, { calories: number; protein: number; carbs: number; fat: number; cuisine: string }> = {
  // Indian
  "Dal Makhani":       { calories: 132, protein: 6.4, carbs: 14.2, fat: 5.8,  cuisine: "Indian" },
  "Paneer Butter Masala": { calories: 186, protein: 8.1, carbs: 9.3,  fat: 13.2, cuisine: "Indian" },
  "Biryani (Chicken)": { calories: 195, protein: 12.4, carbs: 24.8, fat: 5.6, cuisine: "Indian" },
  "Roti (Whole Wheat)":{ calories: 300, protein: 10.8, carbs: 57.2, fat: 3.4, cuisine: "Indian" },
  "Idli":              { calories: 150, protein: 3.9,  carbs: 30.4, fat: 0.4,  cuisine: "Indian" },
  "Dosa":              { calories: 168, protein: 3.7,  carbs: 24.1, fat: 6.0,  cuisine: "Indian" },
  "Chole":             { calories: 164, protein: 8.9,  carbs: 27.4, fat: 2.6, cuisine: "Indian" },
  "Rajma":             { calories: 144, protein: 8.7,  carbs: 24.9, fat: 0.8,  cuisine: "Indian" },
  
  // Italian
  "Pasta (cooked)":    { calories: 158, protein: 5.8,  carbs: 30.9, fat: 0.9,  cuisine: "Italian" },
  "Pizza Margherita":  { calories: 250, protein: 11.0, carbs: 33.0, fat: 8.0,  cuisine: "Italian" },
  "Lasagna":           { calories: 135, protein: 8.0,  carbs: 12.0, fat: 5.0,  cuisine: "Italian" },
  "Risotto":           { calories: 174, protein: 4.2,  carbs: 28.6, fat: 4.8,  cuisine: "Italian" },
  
  // Chinese
  "Fried Rice":        { calories: 163, protein: 3.5,  carbs: 28.0, fat: 4.2, cuisine: "Chinese" },
  "Dim Sum (steamed)": { calories: 147, protein: 8.0,  carbs: 14.0, fat: 6.0, cuisine: "Chinese" },
  "Spring Roll":       { calories: 160, protein: 4.0,  carbs: 20.0, fat: 7.0, cuisine: "Chinese" },
  
  // Mexican
  "Chicken Tacos":     { calories: 183, protein: 12.0, carbs: 18.0, fat: 6.5, cuisine: "Mexican" },
  "Burrito (beef)":    { calories: 217, protein: 13.0, carbs: 20.0, fat: 8.8, cuisine: "Mexican" },
  "Guacamole":         { calories: 160, protein: 2.0,  carbs: 8.5,  fat: 14.7, cuisine: "Mexican" },
  
  // Fast Food
  "Burger (beef)":     { calories: 295, protein: 17.0, carbs: 24.0, fat: 14.0, cuisine: "Fast Food" },
  "French Fries":      { calories: 312, protein: 3.4,  carbs: 41.4, fat: 15.0, cuisine: "Fast Food" },
  "Fried Chicken":     { calories: 280, protein: 23.0, carbs: 12.0, fat: 16.0, cuisine: "Fast Food" },
  
  // High-Protein
  "Chicken Breast (grilled)": { calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6, cuisine: "Healthy" },
  "Boiled Eggs":       { calories: 155, protein: 13.0, carbs: 1.1,  fat: 11.0, cuisine: "Healthy" },
  "Greek Yogurt":      { calories: 59,  protein: 10.0, carbs: 3.6,  fat: 0.4,  cuisine: "Healthy" },
  "Protein Shake":     { calories: 120, protein: 24.0, carbs: 4.0,  fat: 1.5, cuisine: "Supplements" },
  "Whey Protein":      { calories: 400, protein: 80.0, carbs: 8.0,  fat: 8.0, cuisine: "Supplements" },
  "Salmon":            { calories: 208, protein: 20.0, carbs: 0.0,  fat: 13.0, cuisine: "Healthy" },
  "Tuna (canned)":     { calories: 116, protein: 25.5, carbs: 0.0,  fat: 1.0,  cuisine: "Healthy" },
  
  // Grains / Carbs
  "Brown Rice (cooked)": { calories: 123, protein: 2.6, carbs: 25.6, fat: 0.9, cuisine: "Grains" },
  "White Rice (cooked)": { calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, cuisine: "Grains" },
  "Oats (cooked)":     { calories: 71,  protein: 2.5,  carbs: 12.0, fat: 1.5, cuisine: "Grains" },
  "Whole Wheat Bread": { calories: 247, protein: 13.0, carbs: 43.0, fat: 3.4, cuisine: "Grains" },
  
  // Fruits
  "Banana":            { calories: 89,  protein: 1.1,  carbs: 22.8, fat: 0.3,  cuisine: "Fruits" },
  "Apple":             { calories: 52,  protein: 0.3,  carbs: 13.8, fat: 0.2,  cuisine: "Fruits" },
  "Mango":             { calories: 60,  protein: 0.8,  carbs: 15.0, fat: 0.4,  cuisine: "Fruits" },
};
 
const CUISINES = ["All", ...Array.from(new Set(Object.values(FOOD_DB).map(f => f.cuisine)))].sort();
const MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER", "SNACK", "PRE_WORKOUT", "POST_WORKOUT"];
 
const emptyForm = {
  foodName: '',
  mealType: 'SNACK',
  calories: '',
  protein: '',
  carbs: '',
  fats: '',
  weightGrams: '100',
  servingDescription: '',
  cuisine: '',
};
 
const NutritionPage: React.FC = () => {
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [searchCuisine, setSearchCuisine] = useState('All');
  const [foodSearch, setFoodSearch] = useState('');
  const [showFoodPicker, setShowFoodPicker] = useState(false);
  const [autoCalc, setAutoCalc] = useState(true);
  const { showError, showSuccess } = useToast();

  useEffect(() => { fetchLogs(); }, []);
 
  const fetchLogs = async () => {
    try {
      const res = await api.get('/nutrition');
      setLogs(res.data);
    } catch (e: any) {
      showError(e?.response?.data?.detail || 'Failed to load nutrition logs');
    } finally {
      setLoading(false);
    }
  };
 
  // Auto-calculate calories when macros/weight change
  const recalcCalories = (data: typeof formData) => {
    if (!autoCalc) return data;
    const p = parseFloat(data.protein) || 0;
    const c = parseFloat(data.carbs) || 0;
    const f = parseFloat(data.fats) || 0;
    if (p + c + f > 0) {
      return { ...data, calories: Math.round(p * 4 + c * 4 + f * 9).toString() };
    }
    return data;
  };
 
  // Select food from database
  const selectFood = (name: string) => {
    const food = FOOD_DB[name];
    if (!food) return;
    const weight = parseFloat(formData.weightGrams) || 100;
    const scale = weight / 100;
    const updated = {
      ...formData,
      foodName: name,
      cuisine: food.cuisine,
      protein: (food.protein * scale).toFixed(1),
      carbs: (food.carbs * scale).toFixed(1),
      fats: (food.fat * scale).toFixed(1),
      calories: Math.round(food.calories * scale).toString(),
    };
    setFormData(updated);
    setShowFoodPicker(false);
    setFoodSearch('');
  };
 
  // Recalc when weight changes (for selected foods)
  const handleWeightChange = (w: string) => {
    const weight = parseFloat(w) || 100;
    const scale = weight / 100;
    const food = FOOD_DB[formData.foodName];
    if (food) {
      const updated = {
        ...formData,
        weightGrams: w,
        protein: (food.protein * scale).toFixed(1),
        carbs: (food.carbs * scale).toFixed(1),
        fats: (food.fat * scale).toFixed(1),
        calories: Math.round(food.calories * scale).toString(),
      };
      setFormData(updated);
    } else {
      setFormData(prev => recalcCalories({ ...prev, weightGrams: w }));
    }
  };
 
  const handleMacroChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(recalcCalories(updated));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      foodName: formData.foodName,
      mealType: formData.mealType,
      calories: parseInt(formData.calories) || 0,
      protein: parseFloat(formData.protein) || 0,
      carbs: parseFloat(formData.carbs) || 0,
      fats: parseFloat(formData.fats) || 0,
      weightGrams: parseFloat(formData.weightGrams) || null,
      servingDescription: formData.servingDescription || null,
      cuisine: formData.cuisine || null,
    };
 
    try {
      if (editingId !== null) {
        await api.put(`/nutrition/${editingId}`, payload);
        showSuccess('Nutrition log updated!');
      } else {
        await api.post('/nutrition', payload);
        showSuccess('Food logged successfully! 🥗');
      }
      resetForm();
      fetchLogs();
    } catch (e: any) {
      showError(e?.response?.data?.detail || 'Failed to save nutrition log');
    }
  };
 
  const startEdit = (log: NutritionLog) => {
    setFormData({
      foodName: log.foodName,
      mealType: log.mealType,
      calories: log.calories?.toString() || '',
      protein: log.protein?.toString() || '',
      carbs: log.carbs?.toString() || '',
      fats: log.fats?.toString() || '',
      weightGrams: log.weightGrams?.toString() || '100',
      servingDescription: log.servingDescription || '',
      cuisine: log.cuisine || '',
    });
    setEditingId(log.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
 
  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/nutrition/${id}`);
      showSuccess('Log deleted');
      fetchLogs();
    } catch (e: any) {
      showError('Failed to delete log');
    }
  };
 
  const resetForm = () => {
    setFormData({ ...emptyForm });
    setEditingId(null);
    setShowForm(false);
  };
 
  const filteredFoods = Object.keys(FOOD_DB).filter(name => {
    const food = FOOD_DB[name];
    const matchesCuisine = searchCuisine === 'All' || food.cuisine === searchCuisine;
    const matchesSearch = name.toLowerCase().includes(foodSearch.toLowerCase());
    return matchesCuisine && matchesSearch;
  });
 
  const mealTypeColors: Record<string, string> = {
    BREAKFAST: '#f59e0b',
    LUNCH: '#10b981',
    DINNER: '#6366f1',
    SNACK: '#06b6d4',
    PRE_WORKOUT: '#ef4444',
    POST_WORKOUT: '#8b5cf6',
  };

  return (
    <div className="nutrition-page animate-fade-in">
      <div className="db-greeting-row">
        <div>
          <h1 className="db-greeting-text">Nutrition</h1>
          <p className="db-greeting-sub">Track meals, macros, and calories for peak performance.</p>
        </div>
        <button className="db-quick-log" onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}>
          <Plus size={16} /> {showForm ? 'Cancel' : 'Log Food'}
        </button>
      </div>
 
      {/* ─── Daily Summary Bar ─────────────────────────────────────────────── */}
      {logs.length > 0 && (
        <div className="nut-summary-bar">
          {['calories', 'protein', 'carbs', 'fats'].map(macro => {
            const sum = logs.reduce((acc, l) => acc + ((l as any)[macro] || 0), 0);
            const labels: Record<string, string> = { calories: 'kcal', protein: 'g protein', carbs: 'g carbs', fats: 'g fat' };
            const colors: Record<string, string> = { calories: '#f59e0b', protein: '#10b981', carbs: '#6366f1', fats: '#ef4444' };
            return (
              <div key={macro} className="nut-summary-item">
                <div className="nut-summary-value" style={{ color: colors[macro] }}>{Math.round(sum)}</div>
                <div className="nut-summary-label">{labels[macro]}</div>
              </div>
            );
          })}
        </div>
      )}
 
      {/* ─── Log Form ─────────────────────────────────────────────────────── */}
      {showForm && (
        <div className="glass-panel nut-form-panel animate-fade-in">
          <h3>{editingId ? '✏️ Edit Food Log' : '🥗 Log Food'}</h3>
 
          {/* Food Picker */}
          <div className="nut-picker-section">
            <div className="nut-picker-header">
              <ChefHat size={16} />
              <span>Quick-pick from food database</span>
            </div>
            <div className="nut-picker-filters">
              <div className="nut-search-wrap">
                <input
                  type="text"
                  className="form-control nut-search"
                  placeholder="Search foods..."
                  value={foodSearch}
                  onChange={e => { setFoodSearch(e.target.value); setShowFoodPicker(true); }}
                  onFocus={() => setShowFoodPicker(true)}
                />
              </div>
              <div className="nut-cuisine-chips">
                {CUISINES.slice(0, 8).map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`nut-chip ${searchCuisine === c ? 'active' : ''}`}
                    onClick={() => { setSearchCuisine(c); setShowFoodPicker(true); }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
 
            {showFoodPicker && filteredFoods.length > 0 && (
              <div className="nut-food-grid">
                {filteredFoods.slice(0, 12).map(name => {
                  const food = FOOD_DB[name];
                  return (
                    <button key={name} type="button" className="nut-food-card" onClick={() => selectFood(name)}>
                      <div className="nut-food-name">{name}</div>
                      <div className="nut-food-meta">
                        <span>{food.calories} kcal</span>
                        <span className="nut-food-cuisine">{food.cuisine}</span>
                      </div>
                      <div className="nut-food-macros">
                        <span>P:{food.protein}g</span>
                        <span>C:{food.carbs}g</span>
                        <span>F:{food.fat}g</span>
                      </div>
                      <div className="nut-food-note">per 100g</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
 
          {/* Manual Entry Form */}
          <form onSubmit={handleSubmit} className="nut-form">
            <div className="nut-form-row">
              <div className="input-group" style={{ flex: 2 }}>
                <label className="input-label">Food Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.foodName}
                  onChange={e => setFormData({ ...formData, foodName: e.target.value })}
                  placeholder="e.g. Chicken Breast"
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label">Meal Type</label>
                <select
                  className="form-control"
                  value={formData.mealType}
                  onChange={e => setFormData({ ...formData, mealType: e.target.value })}
                >
                  {MEAL_TYPES.map(m => (
                    <option key={m} value={m}>{m.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Cuisine</label>
                <select
                  className="form-control"
                  value={formData.cuisine}
                  onChange={e => setFormData({ ...formData, cuisine: e.target.value })}
                >
                  <option value="">Select...</option>
                  {CUISINES.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
 
            {/* Weight + Macros Row */}
            <div className="nut-form-row nut-macros-row">
              <div className="input-group">
                <label className="input-label">
                  <Scale size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Weight (grams)
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.weightGrams}
                  onChange={e => handleWeightChange(e.target.value)}
                  min="1"
                  placeholder="100"
                />
              </div>
 
              <div className="input-group">
                <label className="input-label">Protein (g)</label>
                <input
                  type="number"
                  className="form-control nut-macro-protein"
                  value={formData.protein}
                  onChange={e => handleMacroChange('protein', e.target.value)}
                  step="0.1"
                  min="0"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Carbs (g)</label>
                <input
                  type="number"
                  className="form-control nut-macro-carbs"
                  value={formData.carbs}
                  onChange={e => handleMacroChange('carbs', e.target.value)}
                  step="0.1"
                  min="0"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Fat (g)</label>
                <input
                  type="number"
                  className="form-control nut-macro-fat"
                  value={formData.fats}
                  onChange={e => handleMacroChange('fats', e.target.value)}
                  step="0.1"
                  min="0"
                />
              </div>
 
              <div className="input-group nut-calories-group">
                <label className="input-label">
                  <Calculator size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Calories
                  <button
                    type="button"
                    className={`nut-auto-btn ${autoCalc ? 'active' : ''}`}
                    onClick={() => setAutoCalc(!autoCalc)}
                    title={autoCalc ? 'Auto-calculated from macros' : 'Manual entry'}
                  >
                    {autoCalc ? 'Auto' : 'Manual'}
                  </button>
                </label>
                <input
                  type="number"
                  className="form-control nut-calories-input"
                  value={formData.calories}
                  onChange={e => setFormData({ ...formData, calories: e.target.value })}
                  readOnly={autoCalc}
                  required
                />
              </div>
            </div>
 
            <div className="nut-form-actions">
              <button type="button" className="nut-btn-cancel" onClick={resetForm}>
                <X size={16} /> Cancel
              </button>
              <button type="submit" className="nut-btn-save">
                <Check size={16} /> {editingId ? 'Update Log' : 'Save Log'}
              </button>
            </div>
          </form>
        </div>
      )}
 
      {/* ─── Logs List ─────────────────────────────────────────────────────── */}
      <div className="nut-logs">
        {loading ? (
          <div className="glass-panel nut-empty">Loading nutrition logs...</div>
        ) : logs.length === 0 ? (
          <div className="glass-panel nut-empty">
            <p>No meals logged yet.</p>
            <button className="db-empty-cta" onClick={() => setShowForm(true)}>
              Log your first meal
            </button>
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="glass-panel nut-log-item">
              <div className="nut-log-left">
                <div className="nut-log-meal-badge" style={{ background: `${mealTypeColors[log.mealType] || '#888'}22`, color: mealTypeColors[log.mealType] || '#888' }}>
                  {log.mealType.replace('_', ' ')}
                </div>
                <div>
                  <div className="nut-log-name">
                    {log.foodName}
                    {log.cuisine && <span className="nut-log-cuisine">{log.cuisine}</span>}
                  </div>
                  <div className="nut-log-macros">
                    <span className="nut-cal">{log.calories} kcal</span>
                    <span className="nut-prot">P: {log.protein || 0}g</span>
                    <span className="nut-carb">C: {log.carbs || 0}g</span>
                    <span className="nut-fat">F: {log.fats || 0}g</span>
                    {log.weightGrams && <span className="nut-weight">⚖ {log.weightGrams}g</span>}
                  </div>
                </div>
              </div>
              <div className="nut-log-actions">
                <span className="nut-log-time">
                  {new Date(log.logDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <button className="btn-icon" onClick={() => startEdit(log)} title="Edit">
                  <Edit2 size={16} />
                </button>
                <button className="btn-icon danger" onClick={() => handleDelete(log.id)} title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NutritionPage;
