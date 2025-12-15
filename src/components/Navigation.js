import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">Movie Collections Hub</Link>
        
        {/* Hamburger button */}
        <button 
          className="hamburger"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`nav-tabs ${isMenuOpen ? 'nav-tabs-open' : ''}`}>
          <Link 
            to="/" 
            className={`nav-tab ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/calendar" 
            className={`nav-tab ${location.pathname === '/calendar' ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Calendar
          </Link>
          <Link 
            to="/watchlist" 
            className={`nav-tab ${location.pathname === '/watchlist' ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Watchlist
          </Link>
          <Link 
            to="/movies" 
            className={`nav-tab ${location.pathname === '/movies' ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Movies
          </Link>
          <Link 
            to="/privacy-policy" 
            className={`nav-tab ${location.pathname === '/privacy-policy' ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Privacy Policy
          </Link>
          <Link 
            to="/support" 
            className={`nav-tab ${location.pathname === '/support' ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Support
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
