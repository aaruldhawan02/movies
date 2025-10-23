import React, { useEffect, useState } from 'react';
import { loadMoviePrequels, loadMovieInfo } from '../dc-data';
import { Link } from 'react-router-dom';

// Parse release date from string - moved to top to avoid hoisting issues
const parseReleaseDate = (dateStr) => {
  if (!dateStr) return new Date(0);
  
  // Handle partial dates like "3/4" (missing year)
  if (dateStr.split('/').length === 2) {
    return new Date(0);
  }
  
  // Try to parse the date in MM/DD/YY format
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);
    
    // Handle 2-digit years
    if (year < 100) {
      year = year < 50 ? 2000 + year : 1900 + year;
    }
    
    const date = new Date(year, month - 1, day);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  // Default date parsing
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  console.warn(`Could not parse date: ${dateStr}, using epoch`);
  return new Date(0);
};

function Home() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [moviesByPhase, setMoviesByPhase] = useState({});
  const [allPhases, setAllPhases] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Load movie prequel relationships
        const movieToPrequels = await loadMoviePrequels();
        const movieList = Object.keys(movieToPrequels);
        console.log('Loaded movie list:', movieList);
        setMovies(movieList);
        
        // Load movie info for phase grouping
        const movieInfoMap = await loadMovieInfo();
        console.log('Loaded movie info for phase grouping');
        
        // Get current date for upcoming movie comparison
        const currentDate = new Date();
        
        // Separate upcoming movies from released movies
        const upcomingList = [];
        const releasedMovies = [];
        
        Object.entries(movieInfoMap).forEach(([title, info]) => {
          // Skip normalized entries
          if (title.startsWith('__normalized__')) return;
          
          // Check if movie has a future release date
          if (info.releaseDate) {
            const releaseDate = parseReleaseDate(info.releaseDate);
            
            // If release date is in the future, it's upcoming
            if (releaseDate > currentDate) {
              upcomingList.push({
                title,
                releaseDate,
                info
              });
            } else {
              // Only add to released movies if it exists in the prequel data
              if (movieList.includes(title)) {
                releasedMovies.push(title);
              }
            }
          } else {
            // No release date, check if it's in prequel data (assume released)
            if (movieList.includes(title)) {
              releasedMovies.push(title);
            }
          }
        });
        
        // Sort upcoming movies by release date (earliest first)
        upcomingList.sort((a, b) => a.releaseDate - b.releaseDate);
        console.log('Upcoming movies found:', upcomingList.length);
        setUpcomingMovies(upcomingList);
        
        // Group released movies by phase
        const phaseGroups = {};
        const phases = new Set();
        
        // First pass: collect all phases and create empty groups
        releasedMovies.forEach(title => {
          const info = movieInfoMap[title];
          if (!info) return;
          
          const phase = info.phase || 'Unknown';
          phases.add(phase);
          
          if (!phaseGroups[phase]) {
            phaseGroups[phase] = [];
          }
        });
        
        // Convert phases to sorted array
        const sortedPhases = Array.from(phases).sort((a, b) => {
          // Custom DC phase order: DC Universe, DC Extended Universe, Nolan-verse, DC Elseworlds, Arrowverse, Legacy Movies, then DC Animated Universe
          
          const phaseOrder = [
            'DC Universe',
            'DC Extended Universe', 
            'Nolan-verse',
            'DC Elseworlds',
            'Arrowverse',
            'Lego Universe',
            'Superman Legacy Movies',
            'Batman Legacy Movies',
            'DC AMU',
            'Legacy Shows',
            'Legacy Movies',
            'Teen Titans GO',
            'Unknown'
          ];
          
          const indexA = phaseOrder.indexOf(a);
          const indexB = phaseOrder.indexOf(b);
          
          // If both phases are in our custom order, sort by their position
          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
          }
          
          // If only one is in our custom order, prioritize it
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          
          // For phases not in our list, sort alphabetically
          return a.localeCompare(b);
        });
        
        setAllPhases(sortedPhases);
        
        // Second pass: populate each phase with movies and sort by release date
        releasedMovies.forEach(title => {
          const info = movieInfoMap[title];
          if (!info) return; // Skip if no info found
          
          const phase = info.phase || 'Unknown';
          const releaseDate = info.releaseDate ? parseReleaseDate(info.releaseDate) : new Date(0);
          
          phaseGroups[phase].push({
            title,
            releaseDate,
            info
          });
        });
        
        // Sort movies in each phase by release date (newest first)
        Object.keys(phaseGroups).forEach(phase => {
          phaseGroups[phase].sort((a, b) => b.releaseDate - a.releaseDate);
        });
        
        console.log('Grouped movies by phase:', Object.keys(phaseGroups).map(phase => 
          `${phase}: ${phaseGroups[phase].length} projects`
        ));
        
        setMoviesByPhase(phaseGroups);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading movies:', err);
        setError('Failed to load movie data');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Format date for display
  const formatReleaseDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Filter movies based on search term (includes upcoming movies)
  const getFilteredMovies = () => {
    if (!searchTerm) return null; // No search term, use phase grouping
    
    // Collect all movies from all phases
    const allMovies = [];
    Object.values(moviesByPhase).forEach(phaseMovies => {
      allMovies.push(...phaseMovies);
    });
    
    // Add upcoming movies to search
    upcomingMovies.forEach(upcomingMovie => {
      allMovies.push(upcomingMovie);
    });
    
    // Filter by search term
    return allMovies.filter(movie => 
      movie.title.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => b.releaseDate - a.releaseDate); // Sort newest first
  };

  // Convert movie title to image filename
  const getImageFilename = (title) => {
    // Replace spaces with underscores and remove special characters like : , ? ! ( )
    return title.replace(/ /g, '_').replace(/[:,.?!()]/g, '') + '.png';
  };


  // Handle image load error
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };



  // Get phase color
  const getPhaseColor = (phase) => {
    const phaseColors = {
      'DC Universe': '#0078d4', // DC Blue (new DCU)
      'DC Extended Universe': '#003366', // Deep blue (DCEU)
      'Nolan-verse': '#2c2c2c', // Dark charcoal (Dark Knight)
      'DC Elseworlds': '#8b0000', // Dark red (standalone/darker stories)
      'Arrowverse': '#228b22', // Forest green (Arrow theme)
      'Superman Legacy Movies': '#dc143c', // Crimson red (Superman colors)
      'Batman Legacy Movies': '#4b0082', // Indigo (Batman colors)
      'Teen Titans GO': '#ff6347', // Tomato red (fun/colorful)
      'Legacy Shows': '#708090', // Slate gray (older content)
      'DC AMU': '#ff8c00', // Dark orange (animated content)
      'Lego Universe': '#ffcc00', // Bright yellow (Lego brand color)
      'Legacy Movies': '#9370db', // Medium purple (classic/vintage feel)
      'Unknown': '#6D6D6D' // Gray
    };
    
    // Check if it starts with one of the keys (for partial matches)
    for (const key of Object.keys(phaseColors)) {
      if (phase.startsWith(key)) {
        return phaseColors[key];
      }
    }
    
    return phaseColors['Unknown'];
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: '24px', marginBottom: '20px', color: '#0078d4' }}>DC Universe</div>
        <div style={{ display: 'inline-block', position: 'relative' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid rgba(255,255,255,0.1)',
            borderTop: '5px solid #0078d4',
            borderRadius: '50%',
            margin: '0 auto',
            animation: 'spin 1s linear infinite',
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
        <p style={{ marginTop: '20px', opacity: 0.7, color: 'white' }}>Loading DC Universe projects...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '20px', color: '#0078d4' }}>Error Loading Data</h1>
        <p style={{ marginBottom: '20px', color: '#ff6b6b' }}>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="dc-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Get filtered movies if search is active
  const filteredMovies = getFilteredMovies();
  const totalMovies = movies.length + upcomingMovies.length;

  return (
    <div>
      {/* Hero Section */}
      <div className="dc-hero">
        <h1 className="dc-hero-title dc-glow-text">DC Universe</h1>
        <p className="dc-hero-subtitle">
          Explore all {totalMovies} projects from the DC Cinematic Universe and beyond
        </p>
        
        {/* Search box */}
        <div style={{ maxWidth: '600px', margin: '40px auto 0' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search for a DC project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dc-search-input"
              onFocus={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'}
              onBlur={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'}
            />
            <svg 
              style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '20px',
                height: '20px',
                fill: '#0078d4',
                opacity: 0.7
              }}
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24"
            >
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </div>
        </div>
      </div>
      
      {filteredMovies ? (
        // Search results
        <div style={{ marginBottom: '50px', maxWidth: '1200px', margin: '0 auto' }}>
          <h2 className="dc-section-header">
            <svg style={{ width: '24px', height: '24px', fill: 'currentColor' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            Search Results <span style={{ opacity: 0.7, fontWeight: 'normal' }}>({filteredMovies.length} movies)</span>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '14px',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0,120,212,0.2)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Clear Search
                <svg style={{ width: '16px', height: '16px', fill: 'currentColor' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            )}
          </h2>
          <div style={{ 
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '25px',
            padding: '20px 0'
          }}>
            {filteredMovies.map((movie) => {
              const isUpcoming = upcomingMovies.find(up => up.title === movie.title);
              
              // Both upcoming and released movies are now clickable in search
              return (
                <Link
                  key={movie.title}
                  to={`movie/${encodeURIComponent(movie.title)}`}
                  state={{ movieTitle: movie.title }}
                  style={{ 
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block'
                  }}
                >
                  <div className="dc-card" style={{
                    height: '100%',
                    position: 'relative',
                    opacity: isUpcoming ? '0.8' : '1'
                  }}>
                    {/* Movie poster image */}
                    <div style={{ position: 'relative' }}>
                      <img 
                        src={`${process.env.PUBLIC_URL}/posters/${getImageFilename(movie.title)}`}
                        alt={`${movie.title} poster`}
                        onError={handleImageError}
                        style={{
                          width: '100%',
                          aspectRatio: '2/3',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                      
                      {/* Fallback for missing images */}
                      <div 
                        style={{
                          width: '100%',
                          aspectRatio: '2/3',
                          backgroundColor: '#2a2a2a',
                          color: '#0078d4',
                          display: 'none',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: '10px',
                          textAlign: 'center',
                          fontWeight: 'bold'
                        }}
                      >
                        <div style={{ 
                          fontSize: '32px',
                          marginBottom: '10px'
                        }}>
                          {isUpcoming ? '🗓️' : '🎬'}
                        </div>
                        {movie.title}
                      </div>
                      
                      {/* Phase badge */}
                      {movie.info && movie.info.phase && (
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          backgroundColor: getPhaseColor(movie.info.phase),
                          color: 'white',
                          fontWeight: 'bold',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          backdropFilter: 'blur(4px)'
                        }}>
                          {movie.info.phase}
                        </div>
                      )}
                      
                      {/* Upcoming badge */}
                      {isUpcoming && (
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          backgroundColor: '#0078d4',
                          color: 'white',
                          fontWeight: 'bold',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          backdropFilter: 'blur(4px)'
                        }}>
                          UPCOMING
                        </div>
                      )}
                    </div>
                    
                    {/* Movie title caption */}
                    <div style={{
                      padding: '16px',
                      background: isUpcoming ? 
                        'linear-gradient(to top, #0a0a0a, #1a1a1a)' : 
                        'linear-gradient(to top, #000000, #111111)',
                      color: 'white',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '15px',
                      minHeight: '80px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}>
                      {movie.title}
                      {movie.info && movie.info.releaseDate && (
                        <div style={{
                          fontSize: '13px',
                          fontWeight: 'normal',
                          marginTop: '5px',
                          opacity: 0.7
                        }}>
                          {isUpcoming ? formatReleaseDate(movie.releaseDate) : new Date(movie.releaseDate).getFullYear()}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Upcoming Movies Section */}
          {upcomingMovies.length > 0 && (
            <div style={{ marginBottom: '50px', maxWidth: '1200px', margin: '0 auto' }}>
              <h2 className="dc-section-header">
                <svg style={{ width: '24px', height: '24px', fill: '#0078d4' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 19V8h14v11H5z"/>
                  <path d="M7 10h5v5H7z"/>
                </svg>
                Coming Soon <span style={{ opacity: 0.7, fontWeight: 'normal' }}>({upcomingMovies.length} projects)</span>
              </h2>
              <div style={{ 
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '25px',
                padding: '20px 0'
              }}>
                {upcomingMovies.map((movie) => (
                  <Link 
                    key={movie.title}
                    to={`movie/${encodeURIComponent(movie.title)}`}
                    state={{ movieTitle: movie.title }}
                    style={{ 
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'block'
                    }}
                  >
                    <div className="dc-card" style={{
                      height: '100%',
                      position: 'relative',
                      borderColor: 'rgba(0, 183, 255, 0.5)'
                    }}>
                      {/* Movie poster image */}
                      <div style={{ position: 'relative' }}>
                        <img 
                          src={`${process.env.PUBLIC_URL}/posters/${getImageFilename(movie.title)}`}
                          alt={`${movie.title} poster`}
                          onError={handleImageError}
                          style={{
                            width: '100%',
                            aspectRatio: '2/3',
                            objectFit: 'cover',
                            display: 'block',
                            filter: 'brightness(0.9) saturate(1.1)'
                          }}
                        />
                        
                        {/* Fallback for missing images */}
                        <div 
                          style={{
                            width: '100%',
                            aspectRatio: '2/3',
                            backgroundColor: '#0a1f44',
                            color: '#0078d4',
                            display: 'none',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '10px',
                            textAlign: 'center',
                            fontWeight: 'bold'
                          }}
                        >
                          <div style={{ 
                            fontSize: '32px',
                            marginBottom: '10px'
                          }}>
                            🗓️
                          </div>
                          {movie.title}
                        </div>
                        
                        {/* Phase badge */}
                        {movie.info && movie.info.phase && (
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            backgroundColor: getPhaseColor(movie.info.phase),
                            color: 'white',
                            fontWeight: 'bold',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            backdropFilter: 'blur(4px)'
                          }}>
                            {movie.info.phase}
                          </div>
                        )}
                        
                        {/* Upcoming badge */}
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          backgroundColor: '#0078d4',
                          color: 'white',
                          fontWeight: 'bold',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          backdropFilter: 'blur(4px)'
                        }}>
                          UPCOMING
                        </div>
                        
                        {/* Coming soon overlay */}
                        <div style={{
                          position: 'absolute',
                          bottom: '0',
                          left: '0',
                          right: '0',
                          background: 'linear-gradient(transparent, rgba(0, 120, 212, 0.7))',
                          color: 'white',
                          padding: '20px 10px 10px',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          letterSpacing: '1px'
                        }}>
                          COMING SOON
                        </div>
                      </div>
                      
                      {/* Movie title caption */}
                      <div style={{
                        padding: '16px',
                        background: 'linear-gradient(to bottom, #0a1f44, #000000)',
                        color: 'white',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '15px',
                        minHeight: '80px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        {movie.title}
                        {movie.info && movie.info.releaseDate && (
                          <div style={{
                            fontSize: '13px',
                            fontWeight: 'normal',
                            marginTop: '5px',
                            opacity: 0.9,
                            color: '#00b7ff'
                          }}>
                            {formatReleaseDate(movie.releaseDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* Phase groups */}
          <div>
            {allPhases.map(phase => {
              const phaseMovies = moviesByPhase[phase] || [];
              if (phaseMovies.length === 0) return null;
              
              const phaseColor = getPhaseColor(phase);
              
              return (
                <div key={phase} style={{ marginBottom: '50px', maxWidth: '1200px', margin: '0 auto' }}>
                  <h2 style={{ 
                    marginBottom: '25px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div style={{
                      color: 'white', 
                      backgroundColor: phaseColor,
                      padding: '10px 16px',
                      borderRadius: '8px',
                      display: 'inline-block',
                      fontWeight: 'bold',
                      fontSize: '18px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                      {phase}
                    </div>
                    <span style={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      fontSize: '16px',
                      fontWeight: 'normal'
                    }}>
                      {phaseMovies.length} projects
                    </span>
                  </h2>
                  <div style={{ 
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: '25px',
                    padding: '10px 0 30px'
                  }}>
                    {phaseMovies.map((movie) => (
                      <Link 
                        key={movie.title}
                        to={`movie/${encodeURIComponent(movie.title)}`}
                        state={{ movieTitle: movie.title }}
                        style={{ 
                          textDecoration: 'none',
                          color: 'inherit',
                          display: 'block'
                        }}
                      >
                        <div className="dc-card" style={{
                          height: '100%',
                          position: 'relative',
                          borderColor: `rgba(${phaseColor.replace(/[^\d,]/g, '')}, 0.5)`
                        }}>
                          {/* Movie poster image */}
                          <div style={{ position: 'relative' }}>
                            <img 
                              src={`${process.env.PUBLIC_URL}/posters/${getImageFilename(movie.title)}`}
                              alt={`${movie.title} poster`}
                              onError={handleImageError}
                              style={{
                                width: '100%',
                                aspectRatio: '2/3',
                                objectFit: 'cover',
                                display: 'block'
                              }}
                            />
                            
                            {/* Fallback for missing images */}
                            <div 
                              style={{
                                width: '100%',
                                aspectRatio: '2/3',
                                backgroundColor: '#0a1f44',
                                color: '#0078d4',
                                display: 'none',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '10px',
                                textAlign: 'center',
                                fontWeight: 'bold'
                              }}
                            >
                              <div style={{ 
                                fontSize: '32px',
                                marginBottom: '10px'
                              }}>
                                🎬
                              </div>
                              {movie.title}
                            </div>
                            
                            {/* Phase badge */}
                            <div style={{
                              position: 'absolute',
                              top: '10px',
                              right: '10px',
                              backgroundColor: phaseColor,
                              color: 'white',
                              fontWeight: 'bold',
                              padding: '5px 10px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                              backdropFilter: 'blur(4px)'
                            }}>
                              {phase}
                            </div>
                          </div>
                          
                          {/* Movie title caption */}
                          <div style={{
                            padding: '16px',
                            background: 'linear-gradient(to bottom, #0a1f44, #000000)',
                            color: 'white',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontSize: '15px',
                            minHeight: '80px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                          }}>
                            {movie.title}
                            {movie.info && movie.info.releaseDate && (
                              <div style={{
                                fontSize: '13px',
                                fontWeight: 'normal',
                                marginTop: '5px',
                                opacity: 0.7
                              }}>
                                {new Date(movie.releaseDate).getFullYear()}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;