import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './Dashboard.css';

const DashboardLayout = ({ children, user, onLogout, isDarkMode, setIsDarkMode }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Header 
          user={user} 
          onLogout={onLogout} 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode} 
        />
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
