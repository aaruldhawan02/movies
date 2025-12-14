import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Navigation from '../components/Navigation';
import MainMovieCard from '../components/MainMovieCard';
import { loadAllMovies } from '../services/dataService';

function Calendar() {
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWatchedMovies = async () => {
      try {
        // Load from Google Sheets or CSV
        const data = await loadAllMovies();
        
        const movies = data
          .filter(movie => {
            const name = movie['Name '] || movie.Name || movie.name || movie.Movie || movie.Title;
            const watchDate = movie['Watch Date'] || movie['Watched Date'] || movie.WatchedDate;
            return name && name.trim() && watchDate && watchDate !== 'N/A' && watchDate.trim();
          })
          .map(movie => ({
            ...movie,
            Name: movie['Name '] || movie.Name || movie.name || movie.Movie || movie.Title,
            WatchDate: movie['Watch Date'] || movie['Watched Date'] || movie.WatchedDate,
            franchise: movie.Franchise || movie.franchise || 'Other'
          }));
        
        setWatchedMovies(movies);
        setLoading(false);
      } catch (error) {
        console.error('Error loading watched movies:', error);
        setLoading(false);
      }
    };

    loadWatchedMovies();
  }, []);

  const getMoviesForDate = (date) => {
    const dateStr = date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    });
    
    return watchedMovies.filter(movie => {
      const movieDate = new Date(movie.WatchDate);
      const movieDateStr = movieDate.toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric' 
      });
      return movieDateStr === dateStr;
    });
  };

  const getPosterFilename = (title, franchise) => {
    if (franchise === 'Marvel') {
      return title?.trim().replace(/[:.?!]/g, '').replace(/\.\.\./g, '').replace(/\s+/g, '_');
    } else if (franchise === 'DC') {
      return title?.trim().replace(/[:.?!()]/g, '').replace(/\.\.\./g, '').replace(/\s+/g, '_');
    } else {
      return title?.trim().replace(/[\/:.?!'()-]/g, '').replace(/\.\.\./g, '').replace(/\s+/g, '_');
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const handleMovieClick = (movie) => {
    const movieName = encodeURIComponent(movie.Name);
    
    if (movie.franchise === 'Marvel') {
      window.location.href = `/movies/${movie.franchisePath}/movie/${movieName}`;
    } else if (movie.franchise === 'DC') {
      window.location.href = `/movies/${movie.franchisePath}/movie/${movieName}`;
    } else {
      window.location.href = `/movies/non-franchise/movie/${movieName}`;
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const moviesOnDate = getMoviesForDate(date);
      const hasMovies = moviesOnDate.length > 0;
      
      days.push(
        <div 
          key={day} 
          className={`calendar-day ${hasMovies ? 'has-movies' : 'no-movies'} ${selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth() ? 'selected' : ''}`}
          onClick={() => setSelectedDate(hasMovies ? date : null)}
          style={{
            cursor: hasMovies ? 'pointer' : 'default',
            backgroundImage: hasMovies ? `url(${process.env.PUBLIC_URL || '.'}/posters/${getPosterFilename(moviesOnDate[0].Name, moviesOnDate[0].franchise)}.png)` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {!hasMovies && <span className="day-number">{day}</span>}
          {hasMovies && (
            <>
              <div className="date-bubble">{day}</div>
              {moviesOnDate.length > 1 && (
                <div className="movie-count">{moviesOnDate.length}</div>
              )}
            </>
          )}
        </div>
      );
    }
    
    return days;
  };

  if (loading) {
    return (
      <div className="App">
        <Navigation />
        <div className="loading-container">
          <h2>Loading calendar...</h2>
        </div>
      </div>
    );
  }

  const selectedMovies = selectedDate ? getMoviesForDate(selectedDate) : [];

  return (
    <div className="App" style={{ fontFamily: "'Arial', sans-serif" }}>
      <Navigation />
      <div className="hero-section">
        <h1 className="hero-title">Movie Calendar</h1>
        <p className="hero-subtitle">Track when I watched my movies</p>
      </div>
      
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        {/* Calendar Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '15px 20px',
          borderRadius: '10px'
        }}>
          <button 
            onClick={() => changeMonth(-1)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '5px 10px'
            }}
          >
            ←
          </button>
          <h2 style={{ 
            color: 'white', 
            margin: 0,
            fontSize: '24px'
          }}>
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button 
            onClick={() => changeMonth(1)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '5px 10px'
            }}
          >
            →
          </button>
        </div>

        {/* Calendar Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: window.innerWidth <= 480 ? '2px' : window.innerWidth <= 768 ? '6px' : '12px',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15))',
          padding: window.innerWidth <= 480 ? '10px' : window.innerWidth <= 768 ? '15px' : '25px',
          borderRadius: '24px',
          marginBottom: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{
              padding: '10px',
              textAlign: 'center',
              fontWeight: 'bold',
              color: 'rgba(255,255,255,0.8)',
              fontSize: '14px'
            }}>
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {renderCalendar()}
        </div>

        {/* Selected Date Movies */}
        {selectedDate && selectedMovies.length > 0 && (
          <div style={{
            margin: '20px 0'
          }}>
            <h3 style={{ 
              color: 'white', 
              marginBottom: '25px',
              fontSize: '24px',
              fontWeight: '600',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Movies watched on {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <div className="movies-page-grid">
              {selectedMovies.map((movie, index) => (
                <MainMovieCard 
                  key={index} 
                  movie={movie} 
                  onClick={handleMovieClick}
                />
              ))}
            </div>
          </div>
        )}

        <style jsx>{`
          .calendar-day {
            aspect-ratio: 3/4;
            min-height: 160px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            background: linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
            border-radius: 20px;
            position: relative;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            padding: 6px 4px;
            border: 1px solid rgba(255,255,255,0.15);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1);
            overflow: hidden;
          }
          
          @media (max-width: 768px) {
            .calendar-day {
              min-height: 100px;
              padding: 4px 2px;
              border-radius: 12px;
              font-size: 12px;
            }
          }
          
          @media (max-width: 480px) {
            .calendar-day {
              min-height: 70px;
              padding: 2px 1px;
              border-radius: 8px;
              font-size: 10px;
            }
          }
          
          .calendar-day.no-movies {
            justify-content: center;
          }
          
          .calendar-day.empty {
            background-color: transparent;
          }
          
          .calendar-day.has-movies {
            background: linear-gradient(145deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.2));
            border: 1px solid rgba(102, 126, 234, 0.5);
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1);
          }
          
          .calendar-day.has-movies:hover {
            background: linear-gradient(145deg, rgba(102, 126, 234, 0.4), rgba(118, 75, 162, 0.3));
            transform: translateY(-6px) scale(1.02);
            box-shadow: 0 20px 60px rgba(102, 126, 234, 0.4), 0 0 30px rgba(102, 126, 234, 0.2);
          }
          
          .calendar-day:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 16px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
          }
          
          .calendar-day.selected {
            background-color: rgba(102, 126, 234, 0.7) !important;
            border: 2px solid #667eea !important;
          }
          
          .day-number {
            color: white;
            font-weight: bold;
            font-size: 16px;
          }
          
          .movie-indicator {
            position: absolute;
            bottom: 4px;
            right: 4px;
            background-color: #667eea;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
          }
        `}</style>
      </main>
    </div>
  );
}

export default Calendar;
