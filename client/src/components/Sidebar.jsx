import React from 'react';
import { NavLink } from 'react-router-dom';
import './Dashboard.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-logo">LUSS</h1>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className="sidebar-link">
          <span className="sidebar-icon">🏠</span> Home
        </NavLink>
        <NavLink to="/my-urls" className="sidebar-link">
          <span className="sidebar-icon">🔗</span> Links
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
