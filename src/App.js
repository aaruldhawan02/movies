import './App.css';

function App() {
  const movieCollections = [
    {
      title: 'Marvel Movies',
      description: 'Explore the Marvel Cinematic Universe and beyond',
      url: 'https://aaruldhawan02.github.io/marvel-movies',
      available: true,
      color: '#d23b3b',
      logo: `${process.env.PUBLIC_URL || '.'}/logos/marvel-logo.svg`,
      count: '100+ projects'
    },
    {
      title: 'DC Movies',
      description: 'Explore the DC Universe and beyond',
      url: 'https://aaruldhawan02.github.io/dc-movies',
      available: true,
      color: '#0078d4',
      logo: `${process.env.PUBLIC_URL || '.'}/logos/dc-logo.png`,
      count: '50+ projects'
    },
    {
      title: 'Mission Impossible',
      description: 'Explore the thrilling world of Ethan Hunt and the IMF',
      url: 'https://aaruldhawan02.github.io/mission-impossible/',
      available: true,
      color: '#ff4500',
      logo: `${process.env.PUBLIC_URL || '.'}/logos/mission-impossible-logo.png`,
      count: '8 movies'
    },
    {
      title: 'Star Wars',
      description: 'Experience the epic saga from a galaxy far, far away',
      url: 'https://aaruldhawan02.github.io/star-wars/',
      available: true,
      color: '#ffd700',
      logo: `${process.env.PUBLIC_URL || '.'}/logos/Star_Wars_logo.png`,
      count: '15+ projects'
    },
    {
      title: 'Pixar Movies',
      description: 'Discover the magic of Pixar Animation Studios',
      url: '#',
      available: false,
      color: '#0099ff',
      logo: `${process.env.PUBLIC_URL || '.'}/logos/Pixar-logo.png`,
      count: '25+ films'
    },
    {
      title: 'Fast and Furious',
      description: 'Join the family for high-octane action and adventure',
      url: '#',
      available: false,
      color: '#ff6600',
      logo: `${process.env.PUBLIC_URL || '.'}/logos/Fast_and_Furious.png`,
      count: '10+ films'
    }
  ];

  return (
    <div className="App">
      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="hero-title">Movie Collections Hub</h1>
        <p className="hero-subtitle">Your gateway into the movie opinions of Aarul Dhawan</p>
      </div>
      
      {/* Collections Grid */}
      <main className="collections-container">
        <div className="collections-grid">
          {movieCollections.map((collection, index) => (
            <div 
              key={index} 
              className={`collection-card ${!collection.available ? 'coming-soon' : ''}`}
              style={{ '--accent-color': collection.color }}
            >
              <div className="card-content">
                <div className="card-icon">
                  {collection.logo ? (
                    <img 
                      src={collection.logo} 
                      alt={`${collection.title} logo`}
                      className="card-logo"
                    />
                  ) : (
                    collection.icon
                  )}
                </div>
                <h2 className="card-title">{collection.title}</h2>
                <p className="card-description">{collection.description}</p>
                <div className="card-count">{collection.count}</div>
                
                <div className="card-actions">
                  {collection.available ? (
                    <a 
                      href={collection.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="explore-btn"
                    >
                      Explore Collection
                    </a>
                  ) : (
                    <button className="coming-soon-btn" disabled>
                      Coming Soon
                    </button>
                  )}
                </div>
              </div>
              
              {/* Background gradient overlay */}
              <div className="card-overlay"></div>
            </div>
          ))}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2025 Movie Collections Hub. Built with React.</p>
      </footer>
    </div>
  );
}

export default App;
