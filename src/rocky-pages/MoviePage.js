import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { loadMovieData, formatReleaseDate, getImageFilename, getImagePath, getChampionshipBelt, getChampionshipTitle } from '../rocky-data';

const MoviePage = () => {
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
        const decodedTitle = decodeURIComponent(movieTitle);
        const foundMovie = movies.find(m => m.Name === decodedTitle);
        
        if (foundMovie) {
          setMovie(foundMovie);
        } else {
          setError('Movie not found');
        }
      } catch (err) {
        console.error('Error fetching movie:', err);
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
          <span key={i} style={{ color: '#DAA520', fontSize: '24px', marginRight: '4px' }}>★</span>
        );
      } else if (i - 0.5 <= numericRating) {
        // Half star
        stars.push(
          <span key={i} style={{ color: '#DAA520', fontSize: '24px', marginRight: '4px' }}>✭</span>
        );
      } else {
        // Empty star
        stars.push(
          <span key={i} style={{ color: '#DAA520', fontSize: '24px', marginRight: '4px', opacity: 0.3 }}>☆</span>
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

  // Get training wisdom quotes based on the movie
  const getTrainingWisdom = (movieName) => {
    if (movieName.includes('Rocky') && movieName.includes('1976')) {
      return "Going in one more round when you don't think you can - that's what makes all the difference in your life.";
    } else if (movieName.includes('Rocky II')) {
      return "Win! Win!";
    } else if (movieName.includes('Rocky III')) {
      return "Eye of the tiger, man. Eye of the tiger.";
    } else if (movieName.includes('Rocky IV')) {
      return "If I can change, you can change. Everybody can change.";
    } else if (movieName.includes('Rocky V')) {
      return "Nothing is real if you don't believe in who you are.";
    } else if (movieName.includes('Rocky Balboa')) {
      return "It ain't about how hard you hit. It's about how hard you can get hit and keep moving forward.";
    } else if (movieName.includes('Creed')) {
      return "One step at a time. One punch at a time. One round at a time.";
    } else {
      return "Every champion was once a contender who refused to give up.";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ display: 'inline-block', position: 'relative' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid rgba(255,255,255,0.3)',
            borderTop: '5px solid #DAA520',
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
        <p style={{ marginTop: '20px', opacity: 0.7, color: 'white' }}>Training in progress...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '20px', color: 'white' }}>Error</h1>
        <p style={{ marginBottom: '20px', color: '#DAA520' }}>{error}</p>
        <button 
          onClick={() => navigate('/')}
          className="rocky-button"
        >
          Back to Gym
        </button>
      </div>
    );
  }

  if (!movie) return null;

  const imageFilename = getImageFilename(movie.Name);
  const imagePath = getImagePath(imageFilename);
  const championshipBelt = getChampionshipBelt(movie['My Rating']);
  const championshipTitle = getChampionshipTitle(movie['My Rating']);
  const isUpcoming = new Date(movie.parsedReleaseDate) > new Date();
  const youtubeVideoId = getYoutubeVideoId(movie.Trailer);
  
  // Determine if this is original Rocky or Creed series
  const isCreedSeries = movie.Name.toLowerCase().includes('creed');
  const seriesType = isCreedSeries ? 'Creed Series' : 'Rocky Series';

  return (
    <div style={{ color: 'white' }}>
      {/* Back button */}
      <Link 
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'white',
          textDecoration: 'none',
          marginBottom: '24px',
          padding: '8px 16px',
          borderRadius: '30px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          transition: 'all 0.2s ease',
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
      >
        <svg style={{ width: '20px', height: '20px', fill: 'currentColor' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Back to Gym
      </Link>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '40px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(139, 69, 19, 0.3)'
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
              background: 'linear-gradient(135deg, #2C1810 0%, #8B4513 100%)',
              padding: '20px',
              textAlign: 'center',
              fontWeight: 'bold',
              color: 'white',
              fontSize: '24px',
            }}>
              {movie.Name}
            </div>
          </div>
          
          {/* Championship belt indicator */}
          <div className={`${championshipBelt}`} style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '40px',
            height: '12px',
            borderRadius: '6px',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}></div>

          {/* Release badge for upcoming movies */}
          {isUpcoming && (
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '-10px',
              backgroundColor: '#DAA520',
              color: '#2C1810',
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              transform: 'rotate(-5deg)',
              textTransform: 'uppercase'
            }}>
              UPCOMING
            </div>
          )}
        </div>
        
        {/* Movie Details */}
        <div>
          {/* Series type and championship badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <span style={{
              background: '#8B4513',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              {seriesType}
            </span>
            {movie['My Rating'] && movie['My Rating'] !== 'N/A' && (
              <span className={championshipBelt} style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: movie['My Rating'] === 'N/A' ? '#666' : 
                       getChampionshipBelt(movie['My Rating']) === 'belt-champion' ? 'white' : 'black'
              }}>
                {championshipTitle}
              </span>
            )}
          </div>

          <h1 style={{ 
            fontSize: '36px', 
            marginBottom: '16px',
            color: 'white',
            borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
            paddingBottom: '16px',
            lineHeight: '1.2'
          }}>
            {movie.Name}
          </h1>
          
          <div style={{ marginBottom: '24px', fontSize: '18px' }}>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ opacity: 0.7 }}>Release Date: </span>
              <span style={{ fontWeight: '500' }}>{formatReleaseDate(movie.parsedReleaseDate)}</span>
            </div>
            
            {/* Training Wisdom Quote */}
            <div className="training-wisdom" style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderLeft: '4px solid #DAA520',
              padding: '16px',
              margin: '20px 0',
              borderRadius: '4px',
              fontStyle: 'italic',
              color: 'rgba(255, 255, 255, 0.9)'
            }}>
              "{getTrainingWisdom(movie.Name)}"
            </div>
            
            {/* Ratings */}
            <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {movie['Critic Rating'] && movie['Critic Rating'] !== 'N/A' && (
                <div>
                  <div style={{ opacity: 0.7, marginBottom: '4px', fontSize: '14px' }}>Critics Score</div>
                  <div style={{ 
                    display: 'inline-block',
                    backgroundColor: '#8B4513',
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
                  <div style={{ opacity: 0.7, marginBottom: '4px', fontSize: '14px' }}>Audience Score</div>
                  <div style={{ 
                    display: 'inline-block',
                    backgroundColor: '#DAA520',
                    color: '#2C1810',
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
                  <div style={{ opacity: 0.7, marginBottom: '4px', fontSize: '14px' }}>My Rating</div>
                  {/* Star rating display only */}
                  {renderStarRating(movie['My Rating'])}
                </div>
              )}
            </div>
          </div>
          
          {/* Embedded YouTube video */}
          {youtubeVideoId && (
            <div style={{ 
              marginTop: '32px',
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
};

export default MoviePage;
