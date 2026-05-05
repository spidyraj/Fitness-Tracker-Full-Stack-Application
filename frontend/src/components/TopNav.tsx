import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Dumbbell, Apple, Bot, User, LogOut, ChevronDown } from 'lucide-react';
import './TopNav.css';

const TopNav: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="top-nav">
      <div className="top-nav-inner">
        <div className="top-nav-logo">
          FIT<span>AI</span>
        </div>

        <nav className="top-nav-links">
          <NavLink to="/dashboard" className={({ isActive }) => `tn-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={16} />
            Dashboard
          </NavLink>
          <NavLink to="/workouts" className={({ isActive }) => `tn-link ${isActive ? 'active' : ''}`}>
            <Dumbbell size={16} />
            Workouts
          </NavLink>
          <NavLink to="/nutrition" className={({ isActive }) => `tn-link ${isActive ? 'active' : ''}`}>
            <Apple size={16} />
            Nutrition
          </NavLink>
          <NavLink to="/coach" className={({ isActive }) => `tn-link ${isActive ? 'active' : ''}`}>
            <Bot size={16} />
            AI Coach
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `tn-link ${isActive ? 'active' : ''}`}>
            <User size={16} />
            Profile
          </NavLink>
        </nav>

        <div className="top-nav-user" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <div className="user-avatar">{user?.firstName?.charAt(0)?.toUpperCase() || 'U'}</div>
          <span className="user-name">{user?.firstName}</span>
          <ChevronDown size={14} className={`chevron ${dropdownOpen ? 'open' : ''}`} />

          {dropdownOpen && (
            <div className="user-dropdown">
              <div className="dropdown-email">{user?.email}</div>
              <button className="dropdown-item logout" onClick={handleLogout}>
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
