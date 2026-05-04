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
import ChatbotWidget from './components/ChatbotWidget';

// Protected Route wrapper — redirects to /login if not authenticated
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Inner pages (Workouts, Nutrition, FitCoach) use the existing sidebar + chatbot
const InnerLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="app-container">
    <Navbar />
    <main className="main-content">
      {children}
    </main>
    <ChatbotWidget />
  </div>
);

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />} />

        {/* Dashboard — full-page with its own TopNav + Chatbot inside */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Inner app pages — sidebar layout */}
        <Route
          path="/workouts"
          element={
            <ProtectedRoute>
              <InnerLayout><Workouts /></InnerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/nutrition"
          element={
            <ProtectedRoute>
              <InnerLayout><Nutrition /></InnerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach"
          element={
            <ProtectedRoute>
              <InnerLayout><FitCoach /></InnerLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
