import React, { useEffect, useState, useMemo } from 'react';
import { loadMoviePrequels, loadMovieInfo } from './marvel-data';
import { Link } from 'react-router-dom';

function Home() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [moviesByPhase, setMoviesByPhase] = useState({});
  const [allPhases, setAllPhases] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);

  // Detect mobile for performance optimizations
  const isMobile = useMemo(() => {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Add timeout for mobile devices
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Loading timeout')), isMobile ? 10000 : 15000);
        });

        const dataPromise = (async () => {
          // Load movie prequel relationships
          const movieToPrequels = await loadMoviePrequels();
          const movieList = Object.keys(movieToPrequels);
          console.log('Loaded movie list:', movieList);
          setMovies(movieList);
          
          // Load movie info for phase grouping
          const movieInfoMap = await loadMovieInfo();
          console.log('Loaded movie info for phase grouping');
          
          return { movieList, movieInfoMap };
        })();

        const { movieList, movieInfoMap } = await Promise.race([dataPromise, timeoutPromise]);
        
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
          // Custom phase order: Phase 5, Phase 4, Phase 3, Phase 2, Phase 1, then others
          
          // Handle unknown phase
          if (a === 'Unknown') return 1;
          if (b === 'Unknown') return -1;
          
          // Phase numbers (for "Phase X" format)
          const isPhaseA = a.startsWith('Phase ');
          const isPhaseB = b.startsWith('Phase ');
          const phaseNumA = isPhaseA ? parseInt(a.replace(/\D/g, ''), 10) : 0;
          const phaseNumB = isPhaseB ? parseInt(b.replace(/\D/g, ''), 10) : 0;
          
          // If both are standard phases, sort in reverse numeric order (newest first)
          if (isPhaseA && isPhaseB) {
            return phaseNumB - phaseNumA; // Reverse order for phases (5,4,3,2,1)
          }
          
          // If only one is a standard phase, prioritize it
          if (isPhaseA) return -1;
          if (isPhaseB) return 1;
          
          // For non-standard phases, sort alphabetically
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
        setError(err.message === 'Loading timeout' ? 'Loading took too long. Please check your connection.' : 'Failed to load movie data');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [isMobile]);

  // Parse release date from string
  const parseReleaseDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    
    // Handle partial dates like "3/4" (missing year)
    if (dateStr.split('/').length === 2) {
      return new Date(0); // Default to epoch for incomplete dates
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
    // Replace spaces with underscores and remove special characters like : and ,
    return title.replace(/ /g, '_').replace(/[:,.?!]/g, '') + '.png';
  };

  // Handle image load error
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

  // Get phase color
  const getPhaseColor = (phase) => {
    const phaseColors = {
      'Phase 1': '#EB343D', // Marvel red
      'Phase 2': '#F78E2A', // Orange
      'Phase 3': '#FDD940', // Yellow
      'Phase 4': '#97CA4F', // Light green
      'Phase 5': '#4EB4E2', // Light blue
      'Phase 6': '#6A52A3', // Purple
      'X-Men Universe': '#CE3D7A', // Pink
      'Sony-Verse Ext.': '#8E45AC', // Dark purple
      'Defenders Saga': '#9C2F2F', // Dark red
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
        <div className="marvel-title" style={{ fontSize: '24px', marginBottom: '20px' }}>Marvel Cinematic Universe</div>
        <div className="marvel-loader-container">
          <div className="marvel-loader"></div>
          <p style={{ marginTop: '20px', opacity: 0.7, color: 'white' }}>Loading Marvel Universe projects...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h1 className="marvel-title" style={{ fontSize: '28px', marginBottom: '20px' }}>Error Loading Data</h1>
        <p style={{ marginBottom: '20px', color: '#ff6b6b' }}>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="marvel-button"
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
      {/* Hero Section */}
      <div className="marvel-hero">
        <div className="marvel-hero-title-container">
          <h1 className="marvel-hero-title">Marvel Timeline</h1>
        </div>
        <p className="marvel-hero-subtitle">
          Explore all {totalMovies} projects from the Marvel Cinematic Universe and beyond
        </p>
        
        {/* Search box */}
        <div style={{ maxWidth: '600px', margin: '40px auto 0' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search for a Marvel project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="marvel-search-input"
            />
            <svg 
              style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '20px',
                height: '20px',
                fill: 'var(--marvel-red)',
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
        <div style={{ marginBottom: '50px' }}>
          <h2 className="marvel-section-header">
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
                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(237, 29, 36, 0.2)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Clear Search
                <svg style={{ width: '16px', height: '16px', fill: 'currentColor' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            )}
          </h2>
          <div className="movie-grid">
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
                  <div className="movie-card">
                    {/* Movie poster image */}
                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                      <img 
                        src={`${process.env.PUBLIC_URL}/posters/${getImageFilename(movie.title)}`}
                        alt={`${movie.title} poster`}
                        onError={handleImageError}
                        className="movie-card-image"
                      />
                      
                      {/* Fallback for missing images */}
                      <div 
                        style={{
                          width: '100%',
                          aspectRatio: '2/3',
                          backgroundColor: '#1a1a1a',
                          color: 'var(--marvel-red)',
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
                        <div className="marvel-phase-badge" style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          backgroundColor: getPhaseColor(movie.info.phase),
                        }}>
                          {movie.info.phase}
                        </div>
                      )}
                      
                      {/* Upcoming badge */}
                      {isUpcoming && (
                        <div className="upcoming-badge">
                          UPCOMING
                        </div>
                      )}
                    </div>
                    
                    {/* Movie title caption */}
                    <div className="movie-card-content">
                      <h3 className="movie-card-title">{movie.title}</h3>
                      {movie.info && movie.info.releaseDate && (
                        <div className="movie-card-year">
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
        <div>
          {/* Upcoming Movies Section */}
          {upcomingMovies.length > 0 && (
            <div style={{ marginBottom: '50px' }}>
              <h2 className="marvel-section-header">
                <svg style={{ width: '24px', height: '24px', fill: 'var(--marvel-red)' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 19V8h14v11H5z"/>
                  <path d="M7 10h5v5H7z"/>
                </svg>
                Coming Soon <span style={{ opacity: 0.7, fontWeight: 'normal' }}>({upcomingMovies.length} projects)</span>
              </h2>
              <div className="movie-grid">
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
                    <div className="movie-card">
                      {/* Movie poster image */}
                      <div style={{ position: 'relative', overflow: 'hidden' }}>
                        <img 
                          src={`${process.env.PUBLIC_URL}/posters/${getImageFilename(movie.title)}`}
                          alt={`${movie.title} poster`}
                          onError={handleImageError}
                          className="movie-card-image"
                          style={{ filter: 'brightness(0.8)' }}
                        />
                        
                        {/* Fallback for missing images */}
                        <div 
                          style={{
                            width: '100%',
                            aspectRatio: '2/3',
                            backgroundColor: '#1a1a1a',
                            color: 'var(--marvel-red)',
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
                          <div className="marvel-phase-badge" style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            backgroundColor: getPhaseColor(movie.info.phase),
                          }}>
                            {movie.info.phase}
                          </div>
                        )}
                        
                        {/* Upcoming badge */}
                        <div className="upcoming-badge">
                          UPCOMING
                        </div>
                        
                        {/* Coming soon overlay */}
                        <div style={{
                          position: 'absolute',
                          bottom: '0',
                          left: '0',
                          right: '0',
                          background: 'linear-gradient(transparent, rgba(237, 29, 36, 0.7))',
                          color: 'white',
                          padding: '20px 10px 10px',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '1px'
                        }}>
                          COMING SOON
                        </div>
                      </div>
                      
                      {/* Movie title caption */}
                      <div className="movie-card-content">
                        <h3 className="movie-card-title">{movie.title}</h3>
                        {movie.info && movie.info.releaseDate && (
                          <div className="movie-card-year" style={{ color: 'var(--marvel-red)' }}>
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
                <div key={phase} className="phase-section">
                  <div className="phase-header">
                    <div className="phase-title" style={{ backgroundColor: phaseColor }}>
                      {phase}
                    </div>
                    <span className="phase-count">
                      {phaseMovies.length} projects
                    </span>
                  </div>
                  <div className="movie-grid">
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
                        <div className="movie-card">
                          {/* Movie poster image */}
                          <div style={{ position: 'relative', overflow: 'hidden' }}>
                            <img 
                              src={`${process.env.PUBLIC_URL}/posters/${getImageFilename(movie.title)}`}
                              alt={`${movie.title} poster`}
                              onError={handleImageError}
                              className="movie-card-image"
                            />
                            
                            {/* Fallback for missing images */}
                            <div 
                              style={{
                                width: '100%',
                                aspectRatio: '2/3',
                                backgroundColor: '#1a1a1a',
                                color: 'var(--marvel-red)',
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
                            <div className="marvel-phase-badge" style={{
                              position: 'absolute',
                              top: '10px',
                              right: '10px',
                              backgroundColor: phaseColor,
                            }}>
                              {phase}
                            </div>
                          </div>
                          
                          {/* Movie title caption */}
                          <div className="movie-card-content">
                            <h3 className="movie-card-title">{movie.title}</h3>
                            {movie.info && movie.info.releaseDate && (
                              <div className="movie-card-year">
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
