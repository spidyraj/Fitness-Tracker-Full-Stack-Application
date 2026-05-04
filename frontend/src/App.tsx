import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import Nutrition from './pages/Nutrition';
import FitCoach from './pages/FitCoach';
import Navbar from './components/Navbar';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <div className="app-container">
        {isAuthenticated && <Navbar />}
        <main className="main-content">
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
            
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/workouts" element={<ProtectedRoute><Workouts /></ProtectedRoute>} />
            <Route path="/nutrition" element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />
            <Route path="/coach" element={<ProtectedRoute><FitCoach /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
