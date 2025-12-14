import React from 'react';

const MainMovieCard = ({ movie, onClick, showRating = true, showFranchise = true, customDateLabel, customDateValue }) => {
  const getFranchiseColor = (franchise) => {
    const colors = {
      'Marvel': '#d23b3b',
      'DC': '#0078d4',
      'Star Wars': '#FFE81F',
      'Fast & Furious': '#ff6b35',
      'Mission Impossible': '#2c3e50',
      'Pixar': '#00a8cc',
      'Harry Potter': '#740001',
      'Transformers': '#1e3a8a',
      'Monsterverse': '#16a085',
      'Rocky': '#e74c3c',
      'Karate Kid': '#f39c12',
      'The Boys': '#000000',
      'Despicable Me': '#f1c40f',
      'Men in Black': '#2c3e50',
      'Chipmunks': '#e67e22',
      'YRF Spy Universe': '#8e44ad',
      'Back To The Future': '#ff9500',
      'Now You See Me': '#9b59b6',
      'Sonic': '#3498db',
      'Bollywood': '#e91e63',
      'Housefull': '#ff6b6b',
      'Stranger Things': '#c0392b'
    };
    return colors[franchise] || '#667eea';
  };

  const formatRating = (rating) => {
    if (!rating || rating === 'N/A' || rating === 'Not Ranked') return 'Not Rated';
    return rating;
  };

  const getPosterSrc = () => {
    // Use Google Sheets URL if available
    if (movie['Poster Url'] && movie['Poster Url'].trim()) {
      return movie['Poster Url'];
    }
    
    // Fallback to existing logic
    if (movie.franchise === 'Marvel') {
      return `${process.env.PUBLIC_URL || '.'}/posters/${movie.Name?.trim().replace(/[:.?!]/g, '').replace(/\.\.\./g, '').replace(/\s+/g, '_')}.png`;
    } else if (movie.franchise === 'DC') {
      return `${process.env.PUBLIC_URL || '.'}/posters/${movie.Name?.trim().replace(/[:.?!()]/g, '').replace(/\.\.\./g, '').replace(/\s+/g, '_')}.png`;
    } else {
      return `${process.env.PUBLIC_URL || '.'}/posters/${movie.Name?.trim().replace(/[\/:.?!'()-]/g, '').replace(/\.\.\./g, '').replace(/\s+/g, '_')}.png`;
    }
  };

  return (
    <div className="main-movie-card" onClick={() => onClick && onClick(movie)}>
      <div className="main-movie-poster">
        <img 
          src={getPosterSrc()}
          alt={`${movie.Name} poster`}
          loading="lazy"
          style={{ backgroundColor: '#2a2a2a' }}
          onError={(e) => {e.target.style.display = 'none'}}
        />
        
        {showFranchise && movie.franchise && movie.franchise !== 'Non-Franchise' && movie.franchise !== 'N/A' && (
          <span style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            backgroundColor: getFranchiseColor(movie.franchise),
            color: movie.franchise === 'Star Wars' ? '#000' : 'white',
            padding: '6px 10px',
            borderRadius: '16px',
            fontSize: '10px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            border: movie.franchise === 'Star Wars' ? '1px solid rgba(0,0,0,0.2)' : 'none',
            backdropFilter: 'blur(4px)'
          }}>
            {movie.franchise === 'Fast & Furious' ? 'F&F' : 
             movie.franchise === 'Mission Impossible' ? 'MI' :
             movie.franchise}
          </span>
        )}
        
        {showRating && (movie['My Tier'] || movie['My Rating']) && (
          <span style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 'bold',
            padding: '5px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            zIndex: 3,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}>
            {movie['My Tier'] || movie['My Rating']}
          </span>
        )}
      </div>
      
      <div className="main-movie-info">
        <h3 className="main-movie-title">{movie.Name}</h3>
        <div className="main-movie-release-date">
          {customDateLabel && customDateValue ? `${customDateLabel}: ${customDateValue}` : movie['Release Date']}
        </div>
      </div>
    </div>
  );
};

export default MainMovieCard;
