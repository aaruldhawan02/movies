import './App.css';

function App() {
  const movieCollections = [
    {
      title: 'Marvel Movies',
      description: 'Explore the Marvel Cinematic Universe and beyond',
      url: 'https://aaruldhawan02.github.io/marvel-movies',
      available: true,
      color: '#d23b3b',
      logo: '/logos/marvel-logo.svg', // Update extension if needed
      count: '100+ projects'
    },
    {
      title: 'DC Movies',
      description: 'Coming Soon - DC Universe Collection',
      url: '#',
      available: false,
      color: '#0078d4',
      logo: '/logos/dc-logos.png', // Update extension if needed
      count: 'Coming Soon'
    }
  ];

  return (
    <div className="App">
      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="hero-title">Movie Collections Hub</h1>
        <p className="hero-subtitle">Your gateway to curated movie experiences across all genres</p>
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
