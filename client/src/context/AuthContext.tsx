import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../api';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  interestedTopics?: number[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  login: (username: string, password?: string) => Promise<void>;
  register: (username: string, email: string, password?: string) => Promise<void>;
  logout: () => void;
  restoreSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const restoreSession = () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  };

  useEffect(() => {
    restoreSession();
  }, []);

  const login = async (username: string, password?: string) => {
    const data = await loginUser(username, password || 'password');
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const register = async (username: string, email: string, password?: string) => {
    const data = await registerUser(username, email, password || 'password');
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAdmin: user?.role === 'admin', login, register, logout, restoreSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
