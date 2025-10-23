import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMoviesByReleaseStatus, formatReleaseDate, getImageFilename, getImagePath } from '../theboys-data';

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
        <div style={{ fontSize: '24px', marginBottom: '20px' }}>The Boys Universe</div>
        <div style={{ display: 'inline-block', position: 'relative' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid rgba(255,255,255,0.3)',
            borderTop: '5px solid #DC2626',
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
        <p style={{ marginTop: '20px', opacity: 0.7 }}>Loading The Boys content...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '20px', color: '#DC2626' }}>Error Loading Data</h1>
        <p style={{ marginBottom: '20px', color: '#ff6b6b' }}>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#DC2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            transition: 'background-color 0.2s ease',
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#B91C1C'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#DC2626'}
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
    <div style={{ 
      position: 'relative', 
      minHeight: '100vh',
    }}>
      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        margin: '-24px -20px 40px -20px',
        padding: '60px 20px',
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(/theboys/assets/boys-background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        boxShadow: 'inset 0 0 100px rgba(220, 38, 38, 0.2)',
      }}>
        <style>{`
          @keyframes title-glow {
            0%, 100% { text-shadow: 0 0 20px rgba(220, 38, 38, 0.5); }
            50% { text-shadow: 0 0 40px rgba(220, 38, 38, 0.8); }
          }
        `}</style>
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: 'bold',
          marginBottom: '16px',
          color: '#DC2626',
          animation: 'title-glow 3s ease-in-out infinite',
          letterSpacing: '2px',
          textTransform: 'uppercase'
        }}>
          THE BOYS
        </h1>
        <p style={{ 
          fontSize: '18px',
          marginBottom: '30px',
          opacity: 0.9,
          maxWidth: '700px',
          margin: '0 auto 30px auto',
          color: '#fff',
          textShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
        }}>
          Explore all {totalMovies} shows from The Boys universe
        </p>
        
        {/* Search box */}
        <div style={{ maxWidth: '600px', margin: '40px auto 0' }}>
          <div style={{ position: 'relative' }}>
            <style>{`
              @keyframes search-glow {
                0%, 100% { box-shadow: 0 0 10px rgba(220, 38, 38, 0.3); }
                50% { box-shadow: 0 0 20px rgba(220, 38, 38, 0.5); }
              }
              .search-input:focus {
                animation: search-glow 2s ease-in-out infinite;
                border: 1px solid rgba(220, 38, 38, 0.5);
              }
            `}</style>
            <input
              type="text"
              placeholder="Search The Boys universe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{
                width: '100%',
                padding: '15px 20px',
                paddingLeft: '50px',
                borderRadius: '30px',
                border: '1px solid rgba(220, 38, 38, 0.2)',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(5px)',
                color: '#DC2626',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'}
              onBlur={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'}
            />
            <svg 
              style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '20px',
                height: '20px',
                fill: 'white',
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
            borderBottom: '2px solid rgba(255,255,255,0.1)', 
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
                  color: '#DC2626',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '14px',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
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
          {/* Upcoming Shows Section */}
          {upcomingMovies.length > 0 && (
            <div style={{ marginBottom: '50px' }}>
              <h2 style={{ 
                fontSize: '24px', 
                color: '#DC2626', 
                marginBottom: '20px', 
                borderBottom: '2px solid rgba(220, 38, 38, 0.3)', 
                paddingBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <svg style={{ width: '24px', height: '24px', fill: 'currentColor' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
                Upcoming Shows
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
          
          {/* Released Shows Section */}
          <div style={{ marginBottom: '50px' }}>
            <h2 style={{ 
              fontSize: '24px', 
              color: '#DC2626', 
              marginBottom: '20px', 
              borderBottom: '2px solid rgba(220, 38, 38, 0.3)', 
              paddingBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <svg style={{ width: '24px', height: '24px', fill: 'currentColor' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
              </svg>
              The Boys Universe
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
  );
}

// Movie Card Component
function MovieCard({ movie, handleImageError }) {
  const imageFilename = getImageFilename(movie.Name);
  const imagePath = getImagePath(imageFilename);
  
  // Function to render star rating
  const renderStarRating = (rating) => {
    if (!rating || rating === 'N/A') return null;
    
    const numericRating = parseFloat(rating.split('/')[0]);
    const stars = [];
    const fullStars = Math.floor(numericRating);
    const hasHalfStar = numericRating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`full-${i}`} style={{ width: '16px', height: '16px', fill: '#DC2626', marginRight: '2px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      );
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <svg key="half" style={{ width: '16px', height: '16px', marginRight: '2px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <defs>
            <linearGradient id={`halfStarGradient-${movie.Name.replace(/\s+/g, '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="50%" stopColor="#DC2626" />
              <stop offset="50%" stopColor="#888888" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path fill={`url(#halfStarGradient-${movie.Name.replace(/\s+/g, '')})`} d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      );
    }
    
    // Add empty stars to make 5 total
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} style={{ width: '16px', height: '16px', fill: '#888888', opacity: 0.3, marginRight: '2px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      );
    }
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {stars}
      </div>
    );
  };
  
  return (
    <Link 
      to={`show/${encodeURIComponent(movie.Name)}`} 
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div style={{
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(220, 38, 38, 0.2)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      }} 
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(220, 38, 38, 0.15), 0 0 20px rgba(220, 38, 38, 0.1)';
        e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.5)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.2)';
      }}
      >
        {/* Poster Image */}
        <div style={{ position: 'relative', paddingTop: '150%' }}>
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
            }}
          />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1a1a2e',
            padding: '20px',
            textAlign: 'center',
            fontWeight: 'bold',
          }}>
            {movie.Name}
          </div>
          
          {/* Release badge for upcoming shows */}
          {new Date(movie.parsedReleaseDate) > new Date() && (
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              backgroundColor: '#DC2626',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              UPCOMING
            </div>
          )}
        </div>
        
        {/* Show Info */}
        <div style={{ padding: '15px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', lineHeight: '1.3' }}>
            {movie.Name}
          </h3>
          
          <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '10px' }}>
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
                fontSize: '13px',
                gap: '8px'
              }}>
                {movie['Critic Rating'] && movie['Critic Rating'] !== 'N/A' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ 
                      color: 'white', 
                      backgroundColor: '#DC2626', 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}>
                      {movie['Critic Rating']}
                    </span>
                  </div>
                )}
                
                {movie['Audience Rating'] && movie['Audience Rating'] !== 'N/A' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ 
                      color: 'white', 
                      backgroundColor: '#333', 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}>
                      {movie['Audience Rating']}
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
