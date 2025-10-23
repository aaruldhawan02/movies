import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMoviesByReleaseStatus, formatReleaseDate, getImageFilename, getImagePath } from '../transformers-data';

function Home() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [releasedMovies, setReleasedMovies] = useState([]);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Load movie data from data.js
        const { upcoming, released } = await getMoviesByReleaseStatus();
        
        setUpcomingMovies(upcoming);
        setReleasedMovies(released);
        setMovies([...upcoming, ...released]);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading movie data:', error);
        setError('Failed to load movie data');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filter movies based on search term
  const getFilteredMovies = () => {
    if (!searchTerm) return null; // No search term, use regular grouping
    
    // Filter by search term
    return movies.filter(movie => 
      movie.Name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Handle image load error
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: '24px', marginBottom: '20px', color: '#00d4ff' }}>Transformers Films</div>
        <div style={{ display: 'inline-block', position: 'relative' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid rgba(255,255,255,0.1)',
            borderTop: '5px solid #00d4ff',
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
        <p style={{ marginTop: '20px', opacity: 0.7, color: 'white' }}>Loading Transformers movies...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '20px', color: '#00d4ff' }}>Error Loading Data</h1>
        <p style={{ marginBottom: '20px', color: '#ff6b00' }}>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="transformers-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Get filtered movies if search is active
  const filteredMovies = getFilteredMovies();
  const totalMovies = movies.length;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
      <div style={{ 
        position: 'relative', 
        minHeight: '100vh',
    }}>
      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        margin: '-32px -20px 40px -20px',
        padding: '60px 20px',
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/transformers/assets/transformers-background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        boxShadow: 'inset 0 0 100px rgba(0, 212, 255, 0.3)',
      }}>
        <style>{`
          @keyframes title-glow {
            0%, 100% { text-shadow: 0 0 20px rgba(0, 212, 255, 0.5); }
            50% { text-shadow: 0 0 40px rgba(0, 212, 255, 0.8); }
          }
        `}</style>
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: 'bold',
          marginBottom: '16px',
          color: 'white',
          animation: 'title-glow 3s ease-in-out infinite',
          letterSpacing: '2px',
          textTransform: 'uppercase'
        }}>
          TRANSFORMERS SAGA
        </h1>
        <p style={{ 
          fontSize: '18px',
          marginBottom: '30px',
          opacity: 0.9,
          maxWidth: '700px',
          margin: '0 auto 30px auto',
          color: '#fff',
          textShadow: '0 0 10px rgba(0, 0, 0, 0.5)'
        }}>
          Explore all {totalMovies} epic films from the Transformers franchise - More than meets the eye
        </p>
        
        {/* Search box */}
        <div style={{ maxWidth: '600px', margin: '40px auto 0' }}>
          <div style={{ position: 'relative' }}>
            <style>{`
              @keyframes search-glow {
                0%, 100% { box-shadow: 0 0 10px rgba(0, 212, 255, 0.3); }
                50% { box-shadow: 0 0 20px rgba(0, 212, 255, 0.5); }
              }
              .search-input:focus {
                animation: search-glow 2s ease-in-out infinite;
                border: 1px solid rgba(0, 212, 255, 0.5);
              }
            `}</style>
            <input
              type="text"
              placeholder="Search for a Transformers film..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{
                width: '100%',
                padding: '15px 20px',
                paddingLeft: '50px',
                borderRadius: '4px',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
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
                fill: '#00d4ff',
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
          <h2 style={{ 
            fontSize: '24px', 
            color: 'white', 
            marginBottom: '20px', 
            borderBottom: '2px solid rgba(0,212,255,0.3)', 
            paddingBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <svg style={{ width: '24px', height: '24px', fill: 'currentColor' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            Search Results ({filteredMovies.length})
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
                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0,212,255,0.2)'}
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
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '25px',
          }}>
            {filteredMovies.map(movie => (
              <MovieCard key={movie.Name} movie={movie} handleImageError={handleImageError} />
            ))}
          </div>
        </div>
      ) : (
        // Regular view with upcoming and released sections
        <>
          {/* Upcoming Movies Section */}
          {upcomingMovies.length > 0 && (
            <div style={{ marginBottom: '50px' }}>
              <h2 style={{ 
                fontSize: '24px', 
                color: 'white', 
                marginBottom: '20px', 
                borderBottom: '2px solid rgba(0,212,255,0.3)', 
                paddingBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textTransform: 'uppercase'
              }}>
                <svg style={{ width: '24px', height: '24px', fill: 'currentColor' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
                Upcoming Films
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '25px',
              }}>
                {upcomingMovies.map(movie => (
                  <MovieCard key={movie.Name} movie={movie} handleImageError={handleImageError} />
                ))}
              </div>
            </div>
          )}
          
          {/* Released Movies Section */}
          <div style={{ marginBottom: '50px' }}>
            <h2 style={{ 
              fontSize: '24px', 
              color: 'white', 
              marginBottom: '20px', 
              borderBottom: '2px solid rgba(0,212,255,0.3)', 
              paddingBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textTransform: 'uppercase'
            }}>
              <svg style={{ width: '24px', height: '24px', fill: 'currentColor' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
              </svg>
              Released Films
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '25px',
            }}>
              {releasedMovies.map(movie => (
                <MovieCard key={movie.Name} movie={movie} handleImageError={handleImageError} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
    </div>
  );
}

// Movie Card Component
function MovieCard({ movie, handleImageError }) {
  const imageFilename = getImageFilename(movie.Name);
  const imagePath = getImagePath(imageFilename);
  
  // Function to render star rating
  const renderStarRating = (rating) => {
    if (!rating || rating === 'N/A') return null;
    
    // Extract numeric rating (e.g., "4.5/5" -> 4.5)
    const numericRating = parseFloat(rating.split('/')[0]);
    const maxStars = 5;
    const stars = [];
    
    for (let i = 1; i <= maxStars; i++) {
      if (i <= numericRating) {
        // Full star
        stars.push(
          <span key={i} style={{ color: '#ffd700', fontSize: '16px', marginRight: '2px' }}>★</span>
        );
      } else if (i - 0.5 <= numericRating) {
        // Half star (approximation)
        stars.push(
          <span key={i} style={{ color: '#ffd700', fontSize: '16px', marginRight: '2px', position: 'relative' }}>
            <span style={{ color: '#444' }}>★</span>
            <span style={{ 
              position: 'absolute', 
              left: 0, 
              width: '50%', 
              overflow: 'hidden',
              color: '#ffd700'
            }}>★</span>
          </span>
        );
      } else {
        // Empty star
        stars.push(
          <span key={i} style={{ color: '#444', fontSize: '16px', marginRight: '2px' }}>★</span>
        );
      }
    }
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>{stars}</div>
      </div>
    );
  };
  
  return (
    <Link 
      to={`movie/${encodeURIComponent(movie.Name)}`} 
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div className="movie-card" style={{
        backgroundColor: 'rgba(34, 34, 34, 0.95)',
        borderRadius: '8px',
        overflow: 'hidden',
        transition: 'all 0.4s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
        e.currentTarget.style.borderColor = '#00d4ff';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 212, 255, 0.4), 0 0 20px rgba(0, 212, 255, 0.2)';
        e.currentTarget.style.backgroundColor = 'rgba(0, 212, 255, 0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.2)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
        e.currentTarget.style.backgroundColor = 'rgba(34, 34, 34, 0.95)';
      }}
      >
        {/* Poster Image */}
        <div style={{ position: 'relative', paddingTop: '150%', overflow: 'hidden' }}>
          <img 
            src={imagePath}
            alt={movie.Name}
            onError={handleImageError}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          />
          
          {/* Gradient overlay for better text readability */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '40%',
            background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
            pointerEvents: 'none'
          }} />
          
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 212, 255, 0.9)',
            padding: '20px',
            textAlign: 'center',
            fontWeight: 'bold',
            color: 'white',
            fontSize: '14px',
            lineHeight: '1.3'
          }}>
            {movie.Name}
          </div>
          
          {/* Release badge for upcoming movies */}
          {new Date(movie.parsedReleaseDate) > new Date() && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'linear-gradient(45deg, #00d4ff, #0099cc)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 'bold',
              boxShadow: '0 3px 10px rgba(0, 212, 255, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              Coming Soon
            </div>
          )}
        </div>
        
        {/* Movie Info */}
        <div style={{ 
          padding: '18px', 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.3))'
        }}>
          <h3 style={{ 
            margin: '0 0 10px 0', 
            fontSize: '16px', 
            lineHeight: '1.4', 
            color: '#ffffff',
            fontWeight: '600',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
            minHeight: '44px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {movie.Name}
          </h3>
          
          <div style={{ 
            fontSize: '13px', 
            color: '#00d4ff', 
            marginBottom: '12px',
            fontWeight: '500',
            textShadow: '0 0 5px rgba(0, 212, 255, 0.3)'
          }}>
            {formatReleaseDate(movie.parsedReleaseDate)}
          </div>
          
          {/* Rating section - prioritize personal rating, fallback to critic/audience */}
          <div style={{ marginTop: 'auto' }}>
            {movie['My Rating'] && movie['My Rating'] !== 'N/A' ? (
              // Show personal rating stars only
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {renderStarRating(movie['My Rating'])}
              </div>
            ) : (
              // Fallback to critic and audience ratings
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                fontSize: '12px',
                gap: '8px'
              }}>
                {movie['Critic Rating'] && movie['Critic Rating'] !== 'N/A' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ 
                      color: '#ffffff', 
                      backgroundColor: 'rgba(68, 68, 68, 0.9)', 
                      padding: '4px 8px', 
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '11px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                    }}>
                      Critics {movie['Critic Rating']}
                    </span>
                  </div>
                )}
                
                {movie['Audience Rating'] && movie['Audience Rating'] !== 'N/A' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ 
                      color: '#ffffff', 
                      background: 'linear-gradient(45deg, #00d4ff, #0099cc)', 
                      padding: '4px 8px', 
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '11px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 2px 4px rgba(0, 212, 255, 0.3)'
                    }}>
                      Audience {movie['Audience Rating']}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default Home;
