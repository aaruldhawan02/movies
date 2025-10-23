import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getMovieByTitle } from '../chipmunks-data';

const MoviePage = () => {
  const { movieTitle } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      try {
        const movieData = await getMovieByTitle(movieTitle);
        if (movieData) {
          setMovie(movieData);
        } else {
          setError('Movie not found');
        }
      } catch (err) {
        console.error('Error loading movie:', err);
        setError('Failed to load movie data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovie();
  }, [movieTitle]);

  // Convert movie title to image filename
  const getImageFilename = (title) => {
    if (!title) return 'default.png';
    return title.replace(/ /g, '_').replace(/[:,.?!]/g, '') + '.png';
  };

  // Get full image path
  const getImagePath = (filename) => {
    return `${process.env.PUBLIC_URL || '.'}/chipmunks/movieposters/${filename}`;
  };

  // Handle image load error
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

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
          <span key={i} style={{ color: '#FFD700', fontSize: '24px', marginRight: '4px' }}>★</span>
        );
      } else if (i - 0.5 <= numericRating) {
        // Half star
        stars.push(
          <span key={i} style={{ color: '#FFD700', fontSize: '24px', marginRight: '4px' }}>✭</span>
        );
      } else {
        // Empty star
        stars.push(
          <span key={i} style={{ color: '#FFD700', fontSize: '24px', marginRight: '4px', opacity: 0.3 }}>☆</span>
        );
      }
    }
    
    return (
      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center' }}>
        {stars}
      </div>
    );
  };

  // Extract YouTube video ID from URL
  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ display: 'inline-block', position: 'relative' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid rgba(255,255,255,0.3)',
            borderTop: '5px solid #FF6B6B',
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
        <p style={{ marginTop: '20px', opacity: 0.7, color: '#2C3E50' }}>Loading movie details...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '20px', color: '#2C3E50' }}>Error</h1>
        <p style={{ marginBottom: '20px', color: '#ff6b6b' }}>{error}</p>
        <button 
          onClick={() => navigate('/')}
          className="chipmunk-button"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!movie) return null;

  const imageFilename = getImageFilename(movie['Name']);
  const imagePath = getImagePath(imageFilename);
  const youtubeVideoId = getYoutubeVideoId(movie['Trailer']);

  return (
    <div style={{ color: '#2C3E50' }}>
      {/* Back button */}
      <Link 
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: '#2C3E50',
          textDecoration: 'none',
          marginBottom: '24px',
          padding: '8px 16px',
          borderRadius: '30px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'}
      >
        <svg style={{ width: '20px', height: '20px', fill: 'currentColor' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Back to All Films
      </Link>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '40px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(10px)',
      }}>
        {/* Movie Poster */}
        <div style={{ position: 'relative' }}>
          <div style={{ 
            borderRadius: '12px', 
            overflow: 'hidden',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            aspectRatio: '2/3',
          }}>
            <img 
              src={imagePath}
              alt={movie['Name'] || 'Movie poster'}
              onError={handleImageError}
              style={{
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
              fontSize: '24px',
            }}>
              {movie['Name'] || 'Chipmunks Movie'}
            </div>
          </div>
        </div>
        
        {/* Movie Details */}
        <div>
          <h1 className="chipmunk-title" style={{ 
            fontSize: '36px', 
            marginBottom: '16px',
            color: '#2C3E50',
            borderBottom: '2px solid rgba(44, 62, 80, 0.2)',
            paddingBottom: '16px',
          }}>
            {movie['Name']?.trim()}
          </h1>
          
          <div style={{ marginBottom: '24px', fontSize: '18px' }}>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ opacity: 0.7 }}>Release Date: </span>
              <span style={{ fontWeight: '500' }}>{movie['Release Date'] || 'Unknown'}</span>
            </div>
            
            {/* Ratings */}
            <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {movie['Critic Rating'] && movie['Critic Rating'] !== 'N/A' && (
                <div>
                  <div style={{ opacity: 0.7, marginBottom: '4px', fontSize: '14px' }}>Critic Rating</div>
                  <div style={{ 
                    display: 'inline-block',
                    backgroundColor: '#FF6B6B',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '16px',
                  }}>
                    {movie['Critic Rating']}
                  </div>
                </div>
              )}
              
              {movie['Audience Rating'] && movie['Audience Rating'] !== 'N/A' && (
                <div>
                  <div style={{ opacity: 0.7, marginBottom: '4px', fontSize: '14px' }}>Audience Rating</div>
                  <div style={{ 
                    display: 'inline-block',
                    backgroundColor: '#4ECDC4',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '16px',
                  }}>
                    {movie['Audience Rating']}
                  </div>
                </div>
              )}
              
              {movie['My Rating'] && movie['My Rating'] !== 'N/A' && (
                <div>
                  <div style={{ opacity: 0.7, marginBottom: '4px', fontSize: '14px' }}>Personal Rating</div>
                  {/* Star rating display only */}
                  {renderStarRating(movie['My Rating'])}
                </div>
              )}
            </div>
          </div>
          
          {/* Embedded YouTube video */}
          {youtubeVideoId && (
            <div style={{ 
              marginTop: '24px',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              paddingTop: '56.25%', // 16:9 aspect ratio
            }}>
              <iframe
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                title={`${movie['Name']} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoviePage;
