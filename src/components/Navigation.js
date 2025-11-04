import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">Movie Collections Hub</Link>
        <div className="nav-tabs">
          <Link 
            to="/" 
            className={`nav-tab ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/franchises" 
            className={`nav-tab ${location.pathname === '/franchises' ? 'active' : ''}`}
          >
            Franchises
          </Link>
          <Link 
            to="/movies" 
            className={`nav-tab ${location.pathname === '/movies' ? 'active' : ''}`}
          >
            Movies
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
