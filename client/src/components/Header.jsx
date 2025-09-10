
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Header = ({ user, onLogout, isDarkMode, setIsDarkMode }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="dashboard-header">
      <div className="header-search">
        {/* Search bar can be added here later */}
      </div>
      <div className="header-profile" ref={dropdownRef}>
        <button className="profile-button" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <div className="profile-avatar">{getInitials(user?.username)}</div>
        </button>
        {dropdownOpen && (
          <div className="profile-dropdown">
            <div className="dropdown-user-info">
              <div className="profile-avatar large">{getInitials(user?.username)}</div>
              <div className="user-details">
                <p className="user-name">{user?.username}</p>
                <p className="user-email">{user?.email}</p>
              </div>
            </div>
            <div className="dropdown-section">
              <button className="dropdown-item" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
              <button
                className="dropdown-item"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/settings');
                }}
              >
                Settings
              </button>
            </div>
            <div className="dropdown-section">
              <button onClick={onLogout} className="dropdown-item">Sign out</button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
