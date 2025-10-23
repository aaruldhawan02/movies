import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loadMovieData, formatReleaseDate, getImageFilename, getImagePath, getBeltColor } from './karate-kid-data';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const allMovies = await loadMovieData();
        setMovies(allMovies);
      } catch (err) {
        console.error('Error fetching movie data:', err);
        setError('Failed to load movie data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getDisplayMovies = () => {
    // Filter by search term if provided
    if (searchTerm.trim()) {
      return movies.filter(movie =>
        movie.Name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return movies;
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

  const MovieCard = ({ movie }) => {
    const imageFilename = getImageFilename(movie.Name);
    const imagePath = getImagePath(imageFilename);
    const beltColor = getBeltColor(movie['My Rating']);
    
    // Function to render star rating
    const renderStarRating = (rating) => {
      if (!rating || rating === 'N/A') return null;
      
      // Extract the numeric value from the rating (e.g., "4.5/5" -> 4.5)
      const numericRating = parseFloat(rating.split('/')[0]);
      const maxRating = parseInt(rating.split('/')[1]) || 5;
      
      const stars = [];
      
      // Create an array of stars
      for (let i = 1; i <= maxRating; i++) {
        if (i <= Math.floor(numericRating)) {
          // Full star
          stars.push(
            <span key={i} style={{ color: '#FFD700', fontSize: '16px', marginRight: '2px' }}>★</span>
          );
        } else if (i - 0.5 <= numericRating) {
          // Half star
          stars.push(
            <span key={i} style={{ color: '#FFD700', fontSize: '16px', marginRight: '2px' }}>✭</span>
          );
        } else {
          // Empty star
          stars.push(
            <span key={i} style={{ color: '#FFD700', fontSize: '16px', marginRight: '2px', opacity: 0.3 }}>☆</span>
          );
        }
      }
      
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {stars}
        </div>
      );
    };
    
    return (
      <Link 
        to={`movie/${encodeURIComponent(movie.Name)}`} 
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <div className="karate-card" style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Poster Image - Standard movie poster aspect ratio (2:3) */}
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
              background: 'linear-gradient(135deg, #5D1A1A 0%, #8B2635 100%)',
              padding: '20px',
              textAlign: 'center',
              fontWeight: 'bold',
              color: 'white',
            }}>
              {movie.Name}
            </div>
            
            {/* Belt rank indicator */}
            <div className={`${beltColor}`} style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '20px',
              height: '6px',
              borderRadius: '3px',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}></div>
          </div>
          
          {/* Movie Info */}
          <div style={{ padding: '15px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ 
              margin: '0 0 8px 0', 
              fontSize: '16px', 
              lineHeight: '1.3', 
              color: '#5D1A1A',
              fontWeight: 'bold'
            }}>
              {movie.Name}
            </h3>
            
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
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
                        color: '#fff', 
                        backgroundColor: '#8B2635', 
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
                        color: '#fff', 
                        backgroundColor: '#A0404D', 
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
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        fontSize: '1.2rem',
        color: '#5D1A1A'
      }}>
        <div className="sensei-text">
          Loading the way of the warrior...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        fontSize: '1.2rem',
        color: '#8B2635'
      }}>
        <div className="sensei-text">
          {error}
        </div>
      </div>
    );
  }

  const displayMovies = getDisplayMovies();
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
        background: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), linear-gradient(135deg, #5D1A1A 0%, #8B2635 50%, #A0404D 100%)',
        position: 'relative',
        boxShadow: 'inset 0 0 100px rgba(139, 38, 53, 0.3)',
      }}>
        <style>{`
          @keyframes title-glow {
            0%, 100% { text-shadow: 0 0 20px rgba(139, 38, 53, 0.5); }
            50% { text-shadow: 0 0 40px rgba(139, 38, 53, 0.8); }
          }
        `}</style>
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: 'bold',
          marginBottom: '16px',
          color: 'white',
          animation: 'title-glow 3s ease-in-out infinite',
          letterSpacing: '2px'
        }}>
          🥋 KARATE KID UNIVERSE
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
          Explore all {totalMovies} entries from the Karate Kid saga - movies and series
        </p>
        
        {/* Search box */}
        <div style={{ maxWidth: '600px', margin: '40px auto 0' }}>
          <div style={{ position: 'relative' }}>
            <style>{`
              @keyframes search-glow {
                0%, 100% { box-shadow: 0 0 10px rgba(139, 38, 53, 0.3); }
                50% { box-shadow: 0 0 20px rgba(139, 38, 53, 0.5); }
              }
              .search-input:focus {
                animation: search-glow 2s ease-in-out infinite;
                border: 1px solid rgba(139, 38, 53, 0.5);
              }
            `}</style>
            <input
              type="text"
              placeholder="Search the dojo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{
                width: '100%',
                padding: '15px 20px',
                paddingLeft: '50px',
                borderRadius: '30px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(5px)',
                color: 'white',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
              onBlur={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            />
            <svg 
              style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                fill: 'rgba(255, 255, 255, 0.7)'
              }}
              viewBox="0 0 24 24"
            >
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Belt Ranking Legend */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
        border: '2px solid #8B2635'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#5D1A1A',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          🥋 Belt Ranking System
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <div className="belt-black" style={{
              width: '24px',
              height: '8px',
              borderRadius: '4px',
              border: '1px solid rgba(0, 0, 0, 0.2)'
            }}></div>
            <span style={{ fontWeight: 'bold', color: '#5D1A1A' }}>Black Belt</span>
            <span style={{ color: '#666' }}>(4.5+)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <div className="belt-brown" style={{
              width: '24px',
              height: '8px',
              borderRadius: '4px',
              border: '1px solid rgba(0, 0, 0, 0.2)'
            }}></div>
            <span style={{ fontWeight: 'bold', color: '#5D1A1A' }}>Brown Belt</span>
            <span style={{ color: '#666' }}>(4.0+)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <div className="belt-blue" style={{
              width: '24px',
              height: '8px',
              borderRadius: '4px',
              border: '1px solid rgba(0, 0, 0, 0.2)'
            }}></div>
            <span style={{ fontWeight: 'bold', color: '#5D1A1A' }}>Blue Belt</span>
            <span style={{ color: '#666' }}>(3.5+)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <div className="belt-green" style={{
              width: '24px',
              height: '8px',
              borderRadius: '4px',
              border: '1px solid rgba(0, 0, 0, 0.2)'
            }}></div>
            <span style={{ fontWeight: 'bold', color: '#5D1A1A' }}>Green Belt</span>
            <span style={{ color: '#666' }}>(3.0+)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <div className="belt-orange" style={{
              width: '24px',
              height: '8px',
              borderRadius: '4px',
              border: '1px solid rgba(0, 0, 0, 0.2)'
            }}></div>
            <span style={{ fontWeight: 'bold', color: '#5D1A1A' }}>Orange Belt</span>
            <span style={{ color: '#666' }}>(2.5+)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <div className="belt-yellow" style={{
              width: '24px',
              height: '8px',
              borderRadius: '4px',
              border: '1px solid rgba(0, 0, 0, 0.2)'
            }}></div>
            <span style={{ fontWeight: 'bold', color: '#5D1A1A' }}>Yellow Belt</span>
            <span style={{ color: '#666' }}>(2.0+)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <div className="belt-white" style={{
              width: '24px',
              height: '8px',
              borderRadius: '4px',
              border: '1px solid rgba(0, 0, 0, 0.2)'
            }}></div>
            <span style={{ fontWeight: 'bold', color: '#5D1A1A' }}>White Belt</span>
            <span style={{ color: '#666' }}>(Below 2.0)</span>
          </div>
        </div>
        <p style={{
          textAlign: 'center',
          fontSize: '13px',
          color: '#666',
          marginTop: '16px',
          fontStyle: 'italic'
        }}>
          Belt colors in the top-right corner of each poster indicate my personal rating
        </p>
      </div>

      {/* Movies Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '24px',
        marginBottom: '48px'
      }}>
        {displayMovies.map((movie, index) => (
          <MovieCard key={index} movie={movie} />
        ))}
      </div>

      {displayMovies.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          color: '#666'
        }}>
          <div className="sensei-text">
            {searchTerm ? `No results found for "${searchTerm}", Daniel-san.` : 'No movies found, Daniel-san.'}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
