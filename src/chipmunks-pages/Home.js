import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loadMovieData, formatTitleForUrl, parseRating } from './chipmunks-data';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      const movieData = await loadMovieData();
      setMovies(movieData);
      setLoading(false);
    };
    
    fetchMovies();
  }, []);

  // Handle image load error
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <div className="chipmunk-text" style={{ fontSize: '1.25rem' }}>
          Loading Alvin and the Chipmunks movies...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '48px',
        padding: '32px 0'
      }}>
        <h1 className="chipmunk-title" style={{ 
          fontSize: '3rem', 
          marginBottom: '16px',
          background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🐿️ Alvin and the Chipmunks 🐿️
        </h1>
        <p className="chipmunk-text" style={{ 
          fontSize: '1.25rem', 
          maxWidth: '600px', 
          margin: '0 auto',
          color: '#34495E'
        }}>
          Explore the mischievous adventures of Alvin, Simon, and Theodore through their movie franchise!
        </p>
      </div>

      {/* Movies Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '25px',
        marginBottom: '48px'
      }}>
        {movies.map((movie, index) => (
          <MovieCard key={movie['Name'] || index} movie={movie} handleImageError={handleImageError} />
        ))}
      </div>

      {/* Fun Facts Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        padding: '32px',
        marginTop: '48px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 className="chipmunk-title" style={{ 
          fontSize: '2rem', 
          marginBottom: '24px',
          color: '#2C3E50'
        }}>
          🎬 Franchise Facts
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginTop: '24px'
        }}>
          <div>
            <h3 className="chipmunk-subtitle" style={{ color: '#FF6B6B', marginBottom: '8px' }}>
              Total Movies
            </h3>
            <p className="chipmunk-text" style={{ fontSize: '2rem', fontWeight: '700' }}>
              {movies.length}
            </p>
          </div>
          <div>
            <h3 className="chipmunk-subtitle" style={{ color: '#4ECDC4', marginBottom: '8px' }}>
              Years Active
            </h3>
            <p className="chipmunk-text" style={{ fontSize: '2rem', fontWeight: '700' }}>
              2007-2015
            </p>
          </div>
          <div>
            <h3 className="chipmunk-subtitle" style={{ color: '#45B7D1', marginBottom: '8px' }}>
              Average Rating
            </h3>
            <p className="chipmunk-text" style={{ fontSize: '2rem', fontWeight: '700' }}>
              {movies.length > 0 ? 
                (movies.reduce((sum, movie) => sum + parseRating(movie['My Rating'] || '0'), 0) / movies.length / 20).toFixed(1) 
                : '0'}/5
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Movie Card Component (same logic as Pixar)
function MovieCard({ movie, handleImageError }) {
  const imageFilename = getImageFilename(movie['Name']);
  const imagePath = getImagePath(imageFilename);
  
  // Convert movie title to image filename (same logic as Pixar)
  function getImageFilename(title) {
    if (!title) return 'default.png';
    // Replace spaces with underscores and remove special characters like : and ,
    return title.replace(/ /g, '_').replace(/[:,.?!]/g, '') + '.png';
  }

  // Get full image path with basePath
  function getImagePath(filename) {
    return `${process.env.PUBLIC_URL || '.'}/posters/${filename}`;
  }
  
  // Function to render star rating (same logic as Pixar)
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
        // Half star - using a different character for half star
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
      to={`movie/${formatTitleForUrl(movie['Name'] || '')}`} 
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div className="movie-card" style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Poster Image */}
        <div style={{ position: 'relative', paddingTop: '150%' }}>
          <img 
            src={imagePath}
            alt={movie['Name'] || 'Movie poster'}
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
            backgroundColor: '#FF6B6B',
            padding: '20px',
            textAlign: 'center',
            fontWeight: 'bold',
            color: 'white',
          }}>
            {movie['Name'] || 'Chipmunks Movie'}
          </div>
        </div>
        
        {/* Movie Info */}
        <div style={{ padding: '15px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', lineHeight: '1.3', color: '#2C3E50' }}>
            {movie['Name'] || 'Unknown Movie'}
          </h3>
          
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
            {movie['Release Date'] || 'Unknown'}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                {movie['Critic Rating'] && movie['Critic Rating'] !== 'N/A' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ 
                      color: '#fff', 
                      backgroundColor: '#FF6B6B', 
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
                      backgroundColor: '#4ECDC4', 
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
