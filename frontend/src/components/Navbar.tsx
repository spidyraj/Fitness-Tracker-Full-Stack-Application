import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LayoutDashboard, Apple, Bot, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { logout, user } = useAuth();

  return (
    <nav className="glass-panel sidebar">
      <div className="sidebar-header">
        <h2>Fit<span className="accent-text">AI</span></h2>
      </div>
      
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/workouts" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Activity size={20} />
          <span>Workouts</span>
        </NavLink>
        <NavLink to="/nutrition" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Apple size={20} />
          <span>Nutrition</span>
        </NavLink>
        <NavLink to="/coach" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Bot size={20} />
          <span>FitCoach AI</span>
        </NavLink>
      </div>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="avatar">{user?.firstName?.charAt(0) || 'U'}</div>
          <span>{user?.firstName}</span>
        </div>
        <button onClick={logout} className="btn-logout">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
