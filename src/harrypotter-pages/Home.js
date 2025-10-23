import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllMovies, formatReleaseDate, getImageFilename, getImagePath } from '../harrypotter-data';

function Home() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Load all movie data
        const allMovies = await getAllMovies();
        setMovies(allMovies);
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

  // Loading state with magical theme
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: '20px'
      }}>
        <div className="golden-snitch"></div>
        <div style={{
          fontSize: '1.2rem',
          color: '#ffd700',
          textAlign: 'center',
          textShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
        }}>
          Loading magical movie data...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: '20px'
      }}>
        <div style={{
          fontSize: '1.2rem',
          color: '#ff6b6b',
          textAlign: 'center'
        }}>
          ⚠️ {error}
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="magical-button"
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  const filteredMovies = getFilteredMovies();

  return (
    <div>
      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        marginBottom: '48px',
        padding: '40px 20px',
        background: 'rgba(0, 0, 0, 0.6)',
        borderRadius: '16px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 215, 0, 0.2)'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          marginBottom: '16px',
          background: 'linear-gradient(45deg, #ffd700, #c9b037)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 30px rgba(255, 215, 0, 0.5)'
        }}>
          ⚡ The Wizarding World ⚡
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#ccc',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Explore the magical journey of Harry Potter through all the films. 
          From Hogwarts to the final battle, discover the complete wizarding saga.
        </p>
      </div>

      {/* Search Bar */}
      <div style={{
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
          <input
            type="text"
            placeholder="🔍 Search for Harry Potter movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 20px',
              fontSize: '1rem',
              border: '2px solid #ffd700',
              borderRadius: '12px',
              background: 'rgba(0, 0, 0, 0.7)',
              color: '#fff',
              backdropFilter: 'blur(10px)',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.3)';
              e.target.style.borderColor = '#c9b037';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = '#ffd700';
            }}
          />
        </div>
      </div>

      {/* Movies Display */}
      {filteredMovies ? (
        // Search results
        <div>
          <h2 style={{
            fontSize: '2rem',
            marginBottom: '24px',
            color: '#ffd700',
            textAlign: 'center',
            textShadow: '0 0 15px rgba(255, 215, 0, 0.5)'
          }}>
            🔍 Search Results ({filteredMovies.length})
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '48px'
          }}>
            {filteredMovies.map((movie, index) => (
              <MovieCard key={index} movie={movie} />
            ))}
          </div>
          {filteredMovies.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#999',
              fontSize: '1.1rem'
            }}>
              🪄 No magical movies found matching "{searchTerm}"
            </div>
          )}
        </div>
      ) : (
        // All movies
        <div>
          <h2 style={{
            fontSize: '2rem',
            marginBottom: '24px',
            color: '#ffd700',
            textAlign: 'center',
            textShadow: '0 0 15px rgba(255, 215, 0, 0.5)'
          }}>
            🏰 The Complete Harry Potter Saga ({movies.length} Films)
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {movies.map((movie, index) => (
              <MovieCard key={index} movie={movie} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Movie Card Component
function MovieCard({ movie }) {
  const imagePath = getImagePath(movie.Name);
  
  return (
    <Link 
      to={`movie/${encodeURIComponent(movie.Name)}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div 
        className="movie-card"
        style={{
          borderRadius: '16px',
          overflow: 'hidden',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Movie Image */}
        <div style={{
          position: 'relative',
          paddingBottom: '150%', // 2:3 aspect ratio
          overflow: 'hidden'
        }}>
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
              transition: 'transform 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          />
          {/* Fallback for missing images */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #740001, #ae0001, #d3a625)',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem'
          }}>
            ⚡
          </div>
        </div>

        {/* Movie Info */}
        <div style={{
          padding: '20px',
          flex: '1',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '8px',
            color: '#ffd700',
            lineHeight: '1.3',
            textShadow: '0 0 10px rgba(255, 215, 0, 0.3)'
          }}>
            {movie.Name}
          </h3>
          
          <p style={{
            color: '#ccc',
            fontSize: '0.9rem',
            marginBottom: '12px'
          }}>
            📅 {formatReleaseDate(movie['Release Date'])}
          </p>

          {/* Ratings */}
          <div style={{ marginTop: 'auto' }}>
            {movie['My Rating'] && movie['My Rating'] !== 'N/A' && movie['My Rating'].trim() !== '' ? (
              // Show personal rating with stars
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {renderStars(movie['My Rating'])}
              </div>
            ) : (
              // Show critic and audience ratings if no personal rating
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
                      border: '1px solid rgba(255, 215, 0, 0.3)',
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
                      background: 'linear-gradient(45deg, #c9b037, #ffd700)', 
                      padding: '4px 8px', 
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '11px',
                      border: '1px solid rgba(255, 215, 0, 0.4)',
                      boxShadow: '0 2px 4px rgba(255, 215, 0, 0.3)'
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

// Handle image load error function (needs to be outside component for reuse)
const handleImageError = (e) => {
  e.target.style.display = 'none';
  e.target.nextSibling.style.display = 'flex';
};

// Function to render stars based on rating (Godzilla style)
const renderStars = (rating) => {
  if (!rating || rating === 'N/A' || rating.trim() === '') return null;
  
  // Extract numeric rating (e.g., "4.5/5" -> 4.5)
  const numericRating = parseFloat(rating.split('/')[0]);
  
  // If parsing failed, return empty
  if (isNaN(numericRating)) return null;
  
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
            top: 0,
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

export default Home;
