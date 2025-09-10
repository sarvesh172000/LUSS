

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Auth from './Auth';
import Home from './components/Home';
import MyUrls from './components/MyUrls';
import DashboardLayout from './components/DashboardLayout';
import Settings from './components/Settings';
import './App.css';
import './components/Dashboard.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await fetch('http://localhost:5001/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            // Token might be invalid, so log out
            handleLogout();
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      }
    };
    fetchUser();
  }, [token]);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleLogin = (data) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    navigate('/');
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };


  if (!token) {
    return (
      <div className="auth-container">
        <Routes>
          <Route path="*" element={<Auth onLogin={handleLogin} />} />
        </Routes>
      </div>
    );
  }

  // Profile update and history delete handlers
  const handleProfileUpdate = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
    localStorage.setItem('user', JSON.stringify({ ...user, ...updatedUser }));
  };
  const handleHistoryDelete = () => {
    // Optionally refresh URLs or show a message
  };

  return (
    <DashboardLayout 
      user={user} 
      onLogout={handleLogout} 
      isDarkMode={isDarkMode} 
      setIsDarkMode={setIsDarkMode}
    >
      <Routes>
        <Route path="/" element={<Home token={token} />} />
        <Route path="/my-urls" element={<MyUrls token={token} />} />
        <Route path="/settings" element={<Settings user={user} token={token} onProfileUpdate={handleProfileUpdate} onHistoryDelete={handleHistoryDelete} />} />
      </Routes>
    </DashboardLayout>
  );
}

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;

