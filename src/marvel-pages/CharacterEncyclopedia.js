import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function CharacterEncyclopedia() {
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadCharacterData = async () => {
      setIsLoading(true);
      
      try {
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
        
        // Parse character data
        const characterData = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          const characterName = values[0];
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
          
          if (totalAppearances >= 0) {
            characterData.push({
              name: characterName,
              projects: projectAppearances,
              totalAppearances: totalAppearances
            });
          }
        }
        
        // Sort characters alphabetically by name
        characterData.sort((a, b) => a.name.localeCompare(b.name));
        
        console.log('Loaded character data:', characterData.length, 'characters');
        setCharacters(characterData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading character data:', err);
        setError('Failed to load character data');
        setIsLoading(false);
      }
    };
    
    loadCharacterData();
  }, []);

  // Convert character name to image filename
  const getCharacterImageFilename = (characterName) => {
    // Replace spaces with underscores and remove special characters
    return characterName.replace(/ /g, '_').replace(/[():.?!,]/g, '') + '.png';
  };

  // Handle image load error
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

  // Filter characters based on search term
  const getFilteredCharacters = () => {
    if (!searchTerm) return characters;
    
    return characters.filter(character => 
      character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      character.projects.some(project => 
        project.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="marvel-loader-container">
        <div className="marvel-shield-loader"></div>
        <div className="marvel-loader-text">Loading Character Data...</div>
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
        <button 
          className="comic-button"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  const filteredCharacters = getFilteredCharacters();

  return (
    <div>
      {/* Hero Section */}
      <div className="marvel-hero">
        <div className="marvel-hero-title-container">
          <h1 className="marvel-hero-title">Character Encyclopedia</h1>
        </div>
        <p className="marvel-hero-subtitle">
          Explore {characters.length} Marvel characters and their appearances across the multiverse
        </p>
        
        {/* Search box */}
        <div style={{ maxWidth: '600px', margin: '40px auto 0' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search for a character or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="marvel-search-input"
            />
            <svg 
              style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '20px',
                height: '20px',
                fill: 'var(--marvel-red)',
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

      {/* Characters Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 50px' }}>
        <h2 className="marvel-section-header">
          <svg style={{ width: '24px', height: '24px', fill: 'currentColor' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9M15 11.5V9.5L21 9V11L15 11.5ZM11 12C12.1 12 13 12.9 13 14S12.1 16 11 16 9 15.1 9 14 9.9 12 11 12ZM14.5 17.5C14.5 16.4 15.4 15.5 16.5 15.5S18.5 16.4 18.5 17.5 17.6 19.5 16.5 19.5 14.5 18.6 14.5 17.5ZM6 13.5L1 14L3 12L1 10L6 10.5V13.5ZM6 7.5L1 7V9L3 11L1 13L6 12.5V7.5Z"/>
          </svg>
          All Characters 
          <span style={{ opacity: 0.7, fontWeight: 'normal' }}>
            ({filteredCharacters.length} {searchTerm ? 'found' : 'total'})
          </span>
        </h2>
        
        <div className="movie-grid">
          {filteredCharacters.map((character) => (
            <Link
              key={character.name}
              to={`../character/${encodeURIComponent(character.name)}`}
              state={{ characterName: character.name }}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'block'
              }}
            >
              <div className="character-card">
                <div style={{ position: 'relative' }}>
                  <img 
                    src={`${process.env.PUBLIC_URL}/marvel-movies/characterpictures/${getCharacterImageFilename(character.name)}`}
                    alt={`${character.name}`}
                    onError={handleImageError}
                    className="character-card-image"
                  />
                  
                  <div 
                    style={{
                      width: '100%',
                      aspectRatio: '2/3',
                      backgroundColor: '#2a2a2a',
                      color: 'var(--marvel-red)',
                      display: 'none',
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
                      👤
                    </div>
                    {character.name}
                  </div>
                  
                  <div className="marvel-phase-badge" style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                  }}>
                    {character.totalAppearances} {character.totalAppearances === 1 ? 'appearance' : 'appearances'}
                  </div>
                </div>
                
                <div className="character-card-content">
                  <h3 className="character-card-name">{character.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CharacterEncyclopedia;
