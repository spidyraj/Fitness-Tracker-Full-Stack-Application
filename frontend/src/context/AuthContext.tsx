/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check local storage on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        // Basic token validation - check if it's a valid JWT format
        const tokenParts = storedToken.split('.');
        if (tokenParts.length !== 3) {
          console.error('Invalid token format');
          logout();
          return;
        }

        // Check if token is expired (basic check)
        try {
          const payload = JSON.parse(atob(tokenParts[1]));
          const currentTime = Date.now() / 1000;
          if (payload.exp && payload.exp < currentTime) {
            console.error('Token expired');
            logout();
            return;
          }
        } catch (e) {
          console.error('Failed to parse token payload', e);
          logout();
          return;
        }

        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user', e);
        logout();
      }
    }
  }, []);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
