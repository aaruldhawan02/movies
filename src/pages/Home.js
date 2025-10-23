import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const movieCollections = [
    {
      title: 'Marvel Movies',
      description: 'Explore the Marvel Cinematic Universe and beyond',
      path: '/marvel-movies',
      available: true,
      color: '#d23b3b',
      logo: `${process.env.PUBLIC_URL || '.'}/logos/marvel-logo.svg`,
      count: '100+ projects'
    },
    {
      title: 'DC Movies',
      description: 'Explore the DC Universe and beyond',
      path: '/dc-movies',
      available: true,
      color: '#0078d4',
      logo: `${process.env.PUBLIC_URL || '.'}/logos/dc-logo.png`,
      count: '50+ projects'
    },
    {
      title: 'Mission Impossible',
      description: 'Explore the thrilling world of Ethan Hunt and the IMF',
      path: '/mission-impossible',
      available: true,
      color: '#ff4500',
      logo: `${process.env.PUBLIC_URL || '.'}/logos/mission-impossible-logo.png`,
      count: '8 movies'
    },
    {
      title: 'Star Wars',
      description: 'Experience the epic saga from a galaxy far, far away',
      path: '/star-wars',
      available: true,
      color: '#ffd700',
      logo: `${process.env.PUBLIC_URL || '.'}/logos/Star_Wars_logo.png`,
      count: '15+ projects'
    },
    {
      title: 'The Boys',
      description: 'Explore the dark and gritty superhero satire universe',
      path: '/theboys',
      available: true,
      color: '#DC2626',
      logo: `${process.env.PUBLIC_URL || '.'}/logos/the-boys-logo.png`,
      count: '8 shows'
    },
    {
      title: 'Pixar Movies',
      description: 'Discover the magic of Pixar Animation Studios',
      path: '/pixar',
      available: true,
      color: '#0099ff',
      logo: `${process.env.PUBLIC_URL || '.'}/logos/Pixar-logo.png`,
      count: '25+ films'
    },
    {
      title: 'Fast and Furious',
      description: 'Join the family for high-octane action and adventure',
      path: '/fast-saga',
      available: true,
      color: '#ff3838',
      logo: `${process.env.PUBLIC_URL || '.'}/logos/Fast_and_Furious.png`,
      count: '10+ films'
    },
    {
      title: 'Despicable Me',
      description: 'Join Gru and the Minions for hilarious adventures',
      path: '/despicable-me',
      available: true,
      color: '#FFD700',
      logo: `${process.env.PUBLIC_URL || '.'}/logos/Despicable_Me.png`,
      count: '6 films'
    },
    {
      title: 'Karate Kid',
      description: 'Master the art of karate and life lessons with Daniel-san and Mr. Miyagi',
      path: '/karate-kid',
      available: true,
      color: '#8B2635',
      logo: `${process.env.PUBLIC_URL || '.'}/logos/karate-kid-logo.png`,
      count: '12 entries'
    },
    {
      title: 'Rocky',
      description: 'Follow the Italian Stallion from Philadelphia streets to championship glory',
      path: '/rocky',
      available: true,
      color: '#8B4513',
      logo: `${process.env.PUBLIC_URL || '.'}/logos/rocky-logo.png`,
      count: '9 films'
    },
    {
      title: 'Transformers',
      description: 'More than meets the eye - Robots in disguise battle for the fate of Earth',
      path: '/transformers',
      available: true,
      color: '#00d4ff',
      logo: `${process.env.PUBLIC_URL || '.'}/logos/transformers-logo.png`,
      count: '8 films'
    },
    {
      title: 'Godzilla',
      description: 'Witness the king of monsters in epic kaiju battles',
      path: '/godzilla',
      available: true,
      color: '#ff6500',
      logo: `${process.env.PUBLIC_URL || '.'}/logos/godzilla-logo.png`,
      count: '6+ films'
    },
    {
      title: 'Harry Potter',
      description: 'Enter the magical world of wizards and witches at Hogwarts',
      path: '/harrypotter',
      available: true,
      color: '#ffd700',
      logo: `${process.env.PUBLIC_URL || '.'}/logos/harry-potter-logo.png`,
      count: '9+ films'
    },
    {
      title: 'Alvin and the Chipmunks',
      description: 'Join Alvin, Simon, and Theodore for mischievous musical adventures',
      path: '/chipmunks',
      available: true,
      color: '#FF6B6B',
      logo: `${process.env.PUBLIC_URL || '.'}/logos/chipmunks-logo.png`,
      count: '4 films'
    },
    {
      title: 'Men in Black',
      description: 'Protect Earth from alien threats with the MIB',
      path: '/meninblack',
      available: true,
      color: '#000000',
      logo: `${process.env.PUBLIC_URL || '.'}/logos/men-in-black-logo.png`,
      count: '4 films'
    },
    {
      title: 'YRF Spy Universe',
      description: 'Enter the world of Indian espionage with Tiger, Pathaan, and War',
      path: '/yrf-spy-universe',
      available: true,
      color: '#FF8C00',
      logo: `${process.env.PUBLIC_URL || '.'}/logos/YRF_Spy_Universe_Logo.png`,
      count: '7 films'
    }
  ];

  return (
    <div className="App" style={{ fontFamily: "'Arial', sans-serif" }}>
      <div className="hero-section">
        <h1 className="hero-title">Movie Collections Hub</h1>
        <p className="hero-subtitle">Your gateway into the movie opinions of Aarul Dhawan</p>
      </div>
      
      <main className="collections-container">
        <div className="collections-grid">
          {movieCollections.map((collection, index) => (
            <Link 
              key={index} 
              to={collection.path}
              className="collection-card"
              style={{ 
                '--accent-color': collection.color,
                '--accent-color-rgb': collection.color.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', '),
                textDecoration: 'none', 
                color: 'inherit' 
              }}
            >
              <div className="card-content">
                <div className="card-icon">
                  <img 
                    src={collection.logo} 
                    alt={`${collection.title} logo`}
                    className="card-logo"
                  />
                </div>
                <h2 className="card-title">{collection.title}</h2>
                <p className="card-description">{collection.description}</p>
                <div className="card-count">{collection.count}</div>
              </div>
              
              <div className="card-overlay"></div>
            </Link>
          ))}
        </div>
      </main>
      
      <footer className="footer">
        <p>&copy; 2025 Movie Collections Hub. Built with React.</p>
      </footer>
    </div>
  );
}

export default Home;
