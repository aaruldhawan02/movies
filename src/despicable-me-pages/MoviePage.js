import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { loadMovieData, formatReleaseDate, getImageFilename, getImagePath } from './despicable-me-data';

function MoviePage() {
  const { movieTitle } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchMovie = async () => {
      setIsLoading(true);
      try {
        const movies = await loadMovieData();
        const foundMovie = movies.find(m => m.Name === decodeURIComponent(movieTitle));
        
        if (foundMovie) {
          setMovie(foundMovie);
        } else {
          setError('Movie not found');
        }
      } catch (err) {
        console.error('Error loading movie:', err);
        setError('Failed to load movie data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMovie();
  }, [movieTitle]);
  
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
        // Half star - using a different character for half star
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
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ display: 'inline-block', position: 'relative' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid rgba(255,215,0,0.3)',
            borderTop: '5px solid #FFD700',
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
        <p style={{ marginTop: '20px', opacity: 0.7, color: '#333' }}>Loading movie details...</p>
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
        className="despicable-button"
      >
        Go Back
      </button>
    </div>
  );
}

  
  if (!movie) return null;
  
  const imageFilename = getImageFilename(movie.Name);
  const imagePath = getImagePath(imageFilename);
  const isUpcoming = new Date(movie.parsedReleaseDate) > new Date();
  const youtubeVideoId = getYoutubeVideoId(movie.Trailer);
  
  return (
    <div style={{ color: '#333' }}>
      <div className="movie-hero" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '40px',
        padding: '30px',
      }}>
        {/* Movie Poster */}
        <div style={{ position: 'relative' }}>
          <div style={{ 
            borderRadius: '12px', 
            overflow: 'hidden',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            aspectRatio: '2/3',
            border: '3px solid #333'
          }}>
            <img 
              src={imagePath}
              alt={movie.Name}
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
              backgroundColor: '#FFD700',
              padding: '20px',
              textAlign: 'center',
              fontWeight: 'bold',
              color: '#333',
              fontSize: '24px',
            }}>
              {movie.Name}
            </div>
          </div>
          
          {/* Release badge for upcoming movies */}
          {isUpcoming && (
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '-10px',
              backgroundColor: '#FF6347',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              transform: 'rotate(5deg)',
              border: '2px solid #333'
            }}>
              UPCOMING
            </div>
          )}
        </div>
        
        {/* Movie Details */}
        <div>
          <h1 style={{ 
            fontSize: '36px', 
            marginBottom: '16px',
            color: '#FFD700',
            borderBottom: '2px solid rgba(255, 215, 0, 0.5)',
            paddingBottom: '16px',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            {movie.Name}
          </h1>
          
          <div style={{ marginBottom: '24px', fontSize: '18px' }}>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ opacity: 0.8, color: '#FFD700' }}>Release Date: </span>
              <span style={{ fontWeight: '500', color: '#FFD700' }}>{formatReleaseDate(movie.parsedReleaseDate)}</span>
            </div>
            
            {/* Ratings */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {movie['Critic Rating'] && movie['Critic Rating'] !== 'N/A' && (
                <div>
                  <div style={{ opacity: 0.8, marginBottom: '4px', fontSize: '14px', color: '#FFD700' }}>Critic Rating</div>
                  <div style={{ 
                    display: 'inline-block',
                    background: 'linear-gradient(135deg, #FF6347, #FF4500)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    border: '2px solid #333',
                    minWidth: '60px',
                    textAlign: 'center'
                  }}>
                    {movie['Critic Rating']}
                  </div>
                </div>
              )}
              
              {movie['Audience Rating'] && movie['Audience Rating'] !== 'N/A' && (
                <div>
                  <div style={{ opacity: 0.8, marginBottom: '4px', fontSize: '14px', color: '#FFD700' }}>Audience Rating</div>
                  <div style={{ 
                    display: 'inline-block',
                    background: 'linear-gradient(135deg, #32CD32, #228B22)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    border: '2px solid #333',
                    minWidth: '60px',
                    textAlign: 'center'
                  }}>
                    {movie['Audience Rating']}
                  </div>
                </div>
              )}
              
              {movie['My Rating'] && movie['My Rating'] !== 'N/A' && (
                <div>
                  <div style={{ opacity: 0.8, marginBottom: '4px', fontSize: '14px', color: '#FFD700' }}>Personal Rating</div>
                  {/* Star rating display only */}
                  {renderStarRating(movie['My Rating'])}
                </div>
              )}
            </div>
          </div>
          
          {/* Trailer button */}
          {movie.Trailer && (
            <div style={{ marginBottom: '24px' }}>
              <a 
                href={movie.Trailer}
                target="_blank"
                rel="noopener noreferrer"
                className="trailer-button"
              >
                🎬 Watch Trailer
              </a>
            </div>
          )}
          
          {/* Embedded YouTube video */}
          {youtubeVideoId && (
            <div style={{ 
              marginTop: '24px',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              paddingTop: '56.25%', // 16:9 aspect ratio
              border: '3px solid #333'
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
                title={`${movie.Name} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MoviePage;
