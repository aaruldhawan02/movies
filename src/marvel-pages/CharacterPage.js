import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { loadMovieInfo } from './marvel-data';

function CharacterPage() {
  const { characterName } = useParams();
  const location = useLocation();
  const characterNameFromState = location.state?.characterName;
  const [character, setCharacter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posterError, setPosterError] = useState(false);

  useEffect(() => {
    const loadCharacterDetails = async () => {
      setIsLoading(true);
      setPosterError(false);
      
      try {
        // Use the name from router params or from location state as fallback
        let nameToUse = characterName;
        
        if (!nameToUse && characterNameFromState) {
          console.log('Using character name from state:', characterNameFromState);
          nameToUse = characterNameFromState;
        }
        
        if (!nameToUse) {
          console.error('No character name found in URL or state');
          throw new Error('No character name provided');
        }
        
        const decodedName = decodeURIComponent(nameToUse);
        console.log('Loading details for character:', decodedName);
        
        // Load character mapping CSV
        const response = await fetch(`${process.env.PUBLIC_URL}/marvel-movies/characterMap.csv`);
        if (!response.ok) {
          throw new Error('Failed to load character data');
        }
        
        const csvText = await response.text();
        const lines = csvText.trim().split('\n');
        
        if (lines.length < 2) {
          throw new Error('Invalid character data format');
        }
        
        // Parse header row (movie/project names)
        const headers = lines[0].split(',');
        const projects = headers.slice(1); // Remove "Characters" column
        
        // Find the character in the CSV
        let characterData = null;
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          const currentName = values[0];
          
          if (currentName.toLowerCase() === decodedName.toLowerCase()) {
            const appearances = values.slice(1);
            
            // Count appearances and get project list
            const projectAppearances = [];
            let totalAppearances = 0;
            
            appearances.forEach((value, index) => {
              if (value === '1') {
                projectAppearances.push(projects[index]);
                totalAppearances++;
              }
            });
            
            characterData = {
              name: currentName,
              projects: projectAppearances,
              totalAppearances: totalAppearances
            };
            
            break;
          }
        }
        
        if (!characterData) {
          throw new Error(`Character "${decodedName}" not found`);
        }
        
        console.log('Character data loaded:', characterData);
        setCharacter(characterData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading character details:', err);
        setError(err.message || 'Failed to load character details');
        setIsLoading(false);
      }
    };
    
    loadCharacterDetails();
  }, [characterName, characterNameFromState]);

  // Convert character name to image filename
  const getCharacterImageFilename = (characterName) => {
    // Replace spaces with underscores and remove special characters
    return characterName.replace(/ /g, '_').replace(/[():.?!,]/g, '') + '.png';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="marvel-loader-container">
        <div className="marvel-shield-loader"></div>
        <div className="marvel-loader-text">
          Loading details for {characterName ? decodeURIComponent(characterName) : 'character'}...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h1 className="comic-title">Error Loading Data</h1>
        <div className="speech-bubble">
          <p>{error}</p>
        </div>
        <Link to="/characters">
          <button className="marvel-button">
            Back to Characters
          </button>
        </Link>
      </div>
    );
  }

  // No character found state
  if (!character) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h1 className="comic-title">Character Not Found</h1>
        <div className="speech-bubble">
          <p>We couldn't find this character in our database.</p>
        </div>
        <Link to="/characters">
          <button className="marvel-button">
            Back to Characters
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Character Hero Section */}
      <div className="marvel-hero" style={{
        backgroundImage: !posterError ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url(${process.env.PUBLIC_URL}/marvel-movies/characterpictures/${getCharacterImageFilename(character.name)})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        textAlign: 'left',
      }}>
        <div className="marvel-hero-title-container">
          <h1 className="marvel-hero-title">{character.name}</h1>
        </div>
      </div>
      
      {/* Character details */}
      <div style={{ 
        display: 'flex',
        flexWrap: 'wrap',
        gap: '30px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Character image column */}
        <div style={{ 
          flex: '0 0 300px',
          marginBottom: '30px'
        }}>
          {!posterError ? (
            <div className="poster-3d-container">
              <div className="poster-3d">
                <img 
                  src={`${process.env.PUBLIC_URL}/marvel-movies/characterpictures/${getCharacterImageFilename(character.name)}`}
                  alt={character.name}
                  onError={() => setPosterError(true)}
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    display: 'block',
                    backgroundColor: '#2a2a2a'
                  }}
                />
                <div className="poster-3d-edge"></div>
              </div>
              <div className="poster-3d-shadow"></div>
            </div>
          ) : (
            <div className="comic-panel" style={{
              width: '100%',
              aspectRatio: '3/4',
              backgroundColor: '#2a2a2a',
              color: 'var(--marvel-red)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '20px',
              textAlign: 'center',
              fontWeight: 'bold',
              borderRadius: '12px',
            }}>
              <div style={{ 
                fontSize: '60px',
                marginBottom: '15px'
              }}>
                👤
              </div>
              <div style={{ fontSize: '18px' }}>{character.name}</div>
            </div>
          )}
          
          {/* Appearances count */}
          <div className="marvel-card" style={{ marginTop: '20px', padding: '15px', textAlign: 'center' }}>
            <h3 className="marvel-section-header" style={{ marginBottom: '10px', borderBottom: 'none', justifyContent: 'center' }}>
              Appearances
            </h3>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--marvel-red)' }}>
              {character.totalAppearances}
            </div>
            <div style={{ fontSize: '14px', opacity: '0.7' }}>
              {character.totalAppearances === 1 ? 'Project' : 'Projects'}
            </div>
          </div>
        </div>
        
        {/* Character details column */}
        <div className="movie-details-info">
          {/* Appearances list */}
          <h2 className="marvel-section-header">
            <svg style={{ width: '24px', height: '24px', fill: 'currentColor' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M7,10L12,15L17,10H7Z" />
            </svg>
            Appearances
          </h2>
          
          <div className="movie-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
            {character.projects.map((project, index) => {
              const getImageFilename = (title) => {
                return title.replace(/ /g, '_').replace(/[:,.?!]/g, '') + '.png';
              };
              
              return (
                <Link 
                  key={index}
                  to={`../movie/${encodeURIComponent(project)}`}
                  style={{ 
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block'
                  }}
                >
                  <div className="movie-card">
                    {/* Movie poster image */}
                    <div style={{ position: 'relative' }}>
                      <img 
                        src={`${process.env.PUBLIC_URL}/posters/${getImageFilename(project)}`}
                        alt={`${project} poster`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                        className="movie-card-image"
                      />
                      
                      {/* Fallback for missing images */}
                      <div 
                        style={{
                          width: '100%',
                          aspectRatio: '2/3',
                          backgroundColor: '#2a2a2a',
                          color: 'var(--marvel-red)',
                          display: 'none', // Initially hidden, shown on image error
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: '10px',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}
                      >
                        <div style={{ 
                          fontSize: '24px',
                          marginBottom: '8px'
                        }}>
                          🎬
                        </div>
                        {project}
                      </div>
                    </div>
                    
                    {/* Movie title caption */}
                    <div className="movie-card-content">
                      <div className="movie-card-title">{project}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CharacterPage;
